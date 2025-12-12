// Library/HierarchyHighlightHeadings.js
// HHH v8 - Fix: Widget Support via Index Mapping & Clean Display

const STATE_KEY = "__xhHighlightState_v8_HHH_WidgetFix";

// ---------- 1. 获取全文 ----------

function getFullTextFromCodeMirror() {
  try {
    if (window.client && client.editorView && client.editorView.state) {
      return client.editorView.state.sliceDoc();
    }
  } catch (e) {
    console.warn("[HHH] getFullText failed:", e);
  }
  return "";
}

// ---------- 2. 基于正则构建 FULL_HEADINGS ----------

let FULL_HEADINGS = [];

function rebuildHeadingsSync() {
  const text = getFullTextFromCodeMirror();
  if (!text) {
    FULL_HEADINGS = [];
    return;
  }

  const list = [];
  // 匹配行首标题
  const regex = /^(#{1,6})\s+([^\n]*)$/gm;
  
  // 匹配 Widget 语法的正则，用于生成干净的显示文本
  // 例如：Step 3: ${widgets.btn()} -> Step 3:
  const widgetRegex = /\$\{.*?\}/g; 
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    let rawText = match[2].trim();
    let displayText = rawText;

    list.push({
      level: match[1].length,
      text: rawText,        // 源码文本
      displayText: displayText // 冻结栏显示的干净文本
    });
  }

  FULL_HEADINGS = list;
}

// 核心修复：使用索引映射而不是文本匹配
// domIndex: 该元素在 DOM 标题列表中的索引
function findFullIndexForDomHeading(domH, domIndex) {
  // 1. 确保数据同步
  if (FULL_HEADINGS.length === 0) rebuildHeadingsSync();

  // 2. 优先使用索引匹配 (假设 DOM 渲染顺序与源码一致)
  // 只有当 DOM 标题数量与源码标题数量一致时，索引才绝对可靠
  // SilverBullet 通常是一致的，只要 selector 准确
  if (domIndex >= 0 && domIndex < FULL_HEADINGS.length) {
    const candidate = FULL_HEADINGS[domIndex];
    const domLevel = getLevel(domH);
    // 双重检查：层级必须一致。如果不一致，说明 DOM 和 源码 没对齐（极其罕见）
    if (candidate.level === domLevel) {
      return domIndex;
    }
  }

  // 3. 降级方案：如果索引对不上，回退到模糊文本匹配
  // (这是旧逻辑，作为 fallback)
  const text = domH.innerText.trim(); 
  const level = getLevel(domH);
  
  for (let i = FULL_HEADINGS.length - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
    // 检查源码文本是否包含 DOM 文本（处理 widget 收缩情况）
    // 或者 DOM 文本包含源码文本
    if (h.level === level) {
        if (h.text.includes(text) || text.includes(h.text)) return i;
    }
  }
  return -1;
}

function getBranchFromFullHeadings(idx) {
  if (idx < 0 || idx >= FULL_HEADINGS.length) return null;
  const leaf = FULL_HEADINGS[idx];
  const ancestors = [];
  let currentLevel = leaf.level;

  for (let i = idx - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
    if (h.level < currentLevel) {
      ancestors.unshift(h);
      currentLevel = h.level;
      if (currentLevel === 1) break;
    }
  }
  return { ancestors, leaf };
}

// ---------- 3. DOM 工具函数 ----------

function getLevel(el) {
  for (let i = 1; i <= 6; i++) {
    if (el.classList && el.classList.contains(`sb-line-h${i}`)) return i;
  }
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (/^h[1-6]$/.test(tag)) return Number(tag[1]);
  return 0;
}

function listHeadings(root, selector) {
  return Array.from(root.querySelectorAll(selector));
}

function collectAncestors(startIndex, headings, startLevel) {
  const res = [];
  let minLevel = startLevel;
  for (let i = startIndex - 1; i >= 0; i--) {
    const lvl = getLevel(headings[i]);
    if (lvl < minLevel) {
      res.unshift(headings[i]);
      minLevel = lvl;
      if (minLevel === 1) break;
    }
  }
  return res;
}

function collectDescendants(startIndex, headings, startLevel) {
  const res = [];
  for (let i = startIndex + 1; i < headings.length; i++) {
    const lvl = getLevel(headings[i]);
    if (lvl <= startLevel) break;
    res.push(headings[i]);
  }
  return res;
}

function findHeadingForElement(el, headings) {
  if (!el) return null;
  if (headings.includes(el)) return el;
  
  let current = el;
  while(current && current !== document.body) {
      for(let h of headings) {
          if (h === current) return h;
      }
      if (current.previousElementSibling) {
          current = current.previousElementSibling;
          for(let h of headings) {
              if (h === current) return h;
          }
      } else {
          current = current.parentElement;
      }
  }
  
  // 备用位置查找
  for (let i = headings.length - 1; i >= 0; i--) {
    const h = headings[i];
    if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
      return h;
    }
  }
  return null;
}

// ---------- 4. 界面渲染 ----------

function clearClasses(root) {
  const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
  root.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));
}

function getFrozenContainer() {
  let fc = document.getElementById("sb-frozen-container");
  if (!fc) {
    fc = document.createElement("div");
    fc.id = "sb-frozen-container";
    // 初始样式，具体由 CSS 控制
    fc.style.display = "none";
    document.body.appendChild(fc);
  }
  return fc;
}

// 核心修复：接受 domIndex 参数
function updateFrozenBar(domHeading, domIndex) {
  const fc = getFrozenContainer();
  
  rebuildHeadingsSync(); 
  
  // 传入 domIndex 进行精确查找
  const idx = findFullIndexForDomHeading(domHeading, domIndex);

  if (idx === -1) {
    fc.style.display = "none";
    return;
  }

  const branch = getBranchFromFullHeadings(idx);
  if (!branch) {
    fc.style.display = "none";
    return;
  }

  fc.innerHTML = "";
  fc.style.display = "flex";
  
  // 渲染逻辑：使用 clean 的 displayText
  [...branch.ancestors, branch.leaf].forEach(h => {
    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;
    // 这里使用 displayText (去除 ${...} 后的文本)
    div.textContent = h.displayText || h.text; 
    fc.appendChild(div);
  });
  
  // 定位
  const container = document.querySelector("#sb-main");
  if(container) {
      const cRect = container.getBoundingClientRect();
      fc.style.left = (cRect.left + 10) + "px";
  }
}

// ---------- 5. 主逻辑 ----------

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  
  // 修改选择器：更严格，只选 SB 原生标题行，避免 Widget 内部的 h1-h6 干扰索引计数
  const headingSelector = opts.headingSelector || ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      requestAnimationFrame(bind);
      return;
    }

    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    function render(targetHeading) {
      if (!targetHeading) {
        clearClasses(container);
        const fc = document.getElementById("sb-frozen-container");
        if(fc) fc.style.display = "none";
        return;
      }

      const headings = listHeadings(container, headingSelector);
      const idx = headings.indexOf(targetHeading);
      if (idx === -1) return;

      const level = getLevel(targetHeading);
      const ancestors = collectAncestors(idx, headings, level);
      const descendants = collectDescendants(idx, headings, level);

      clearClasses(container);
      targetHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach(el => el.classList.add("sb-active", "sb-active-anc"));
      descendants.forEach(el => el.classList.add("sb-active", "sb-active-desc"));

      // 传入 idx (DOM 列表中的位置)
      updateFrozenBar(targetHeading, idx);
    }

    // --- 事件监听 ---

    function onPointerOver(e) {
      if (!e.target) return;
      const headings = listHeadings(container, headingSelector);
      const h = findHeadingForElement(e.target, headings);
      if (h) {
        render(h);
      }
    }
    
    let isScrolling = false;
    function onScroll() {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          const headings = listHeadings(container, headingSelector);
          const triggerY = 120; // 稍微增加一点判定区域
          let current = null;
          
          // 查找策略：找到最后一个“头部已经滚出屏幕”或者“在屏幕顶部”的标题
          for (let h of headings) {
            const rect = h.getBoundingClientRect();
            // 如果标题在触发线之上，它就是当前的“上下文”标题
            if (rect.top < triggerY) {
               current = h; 
            } else {
               break; 
            }
          }
          
          if (current) {
             render(current);
          }
          isScrolling = false;
        });
        isScrolling = true;
      }
    }

    container.addEventListener("pointerover", onPointerOver);
    window.addEventListener("scroll", onScroll, { passive: true });

    window[STATE_KEY] = {
      cleanup() {
        container.removeEventListener("pointerover", onPointerOver);
        window.removeEventListener("scroll", onScroll);
        clearClasses(container);
        const fc = document.getElementById("sb-frozen-container");
        if (fc) fc.remove();
      }
    };
    
    console.log("[HHH] v8 Enabled: Widget Fix + Clean Display");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
