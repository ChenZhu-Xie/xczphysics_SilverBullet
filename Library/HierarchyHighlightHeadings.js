// Library/HierarchyHighlightHeadings.js
// HHH v7 - 最终修复版：正则解析 + CodeMirror 全文获取

const STATE_KEY = "__xhHighlightState_v7_HHH_Final";

// ---------- 1. 获取全文 (你的核心发现) ----------

function getFullTextFromCodeMirror() {
  try {
    // 既然确定这个 API 可用，直接使用
    if (window.client && client.editorView && client.editorView.state) {
      return client.editorView.state.sliceDoc();
    }
  } catch (e) {
    console.warn("[HHH] getFullText failed:", e);
  }
  return "";
}

// ---------- 2. 基于正则构建 FULL_HEADINGS (替代 markdown 库) ----------

let FULL_HEADINGS = [];

// 使用正则解析标题，速度极快，无需异步
function rebuildHeadingsSync() {
  const text = getFullTextFromCodeMirror();
  if (!text) {
    FULL_HEADINGS = [];
    return;
  }

  const list = [];
  // 正则含义：匹配行首的 # (1到6个)，然后是空格，然后是标题内容
  const regex = /^(#{1,6})\s+(.*)$/gm;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    let cleanText = match[2].trim();
    list.push({
      level: match[1].length, // '#' 的数量即为层级
      text: cleanText
    });
  }

  FULL_HEADINGS = list;
}

// DOM heading -> FULL_HEADINGS 索引
function findFullIndexForDomHeading(domH) {
  if (!FULL_HEADINGS.length || !domH) return -1;
  
  // DOM 的 innerText 通常也不包含 markdown 符号
  const text = domH.innerText.trim(); 
  const level = getLevel(domH);
  
  if (!text) return -1;

  // 倒序查找，匹配最近的一个同名同级标题
  for (let i = FULL_HEADINGS.length - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
    // 简单的模糊匹配：只要包含文本即可，防止空格差异
    if (h.level === level && (h.text === text || h.text.includes(text) || text.includes(h.text))) {
      return i;
    }
  }
  return -1;
}

// 计算祖先链
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
  // 1. 尝试从 class 获取 (sb-line-h1)
  for (let i = 1; i <= 6; i++) {
    if (el.classList && el.classList.contains(`sb-line-h${i}`)) return i;
  }
  // 2. 尝试从 tagName 获取 (H1)
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

// 查找当前 DOM 元素所属的标题
function findHeadingForElement(el, headings) {
  if (!el) return null;
  if (headings.includes(el)) return el;
  
  // 向上找最近的标题
  let current = el;
  while(current && current !== document.body) {
      // 如果当前元素本身就是标题（但在 includes 检查漏掉的情况）
      // 或者它是标题的子元素
      for(let h of headings) {
          if (h === current) return h;
      }
      // 找不到就找它前面的兄弟
      if (current.previousElementSibling) {
          current = current.previousElementSibling;
          // 如果兄弟本身是标题
           for(let h of headings) {
              if (h === current) return h;
          }
          // 或者继续往兄弟内部找（太复杂，跳过，直接利用文档位置）
      } else {
          // 没有前置兄弟，找父级
          current = current.parentElement;
      }
  }
  
  // 备用方案：按文档位置倒序查找
  for (let i = headings.length - 1; i >= 0; i--) {
    const h = headings[i];
    // 如果 h 在 el 之前
    if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
      return h;
    }
  }
  return null;
}

// ---------- 4. 界面渲染 (高亮 + 冻结栏) ----------

function clearClasses(root) {
  const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
  root.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));
}

function getFrozenContainer() {
  let fc = document.getElementById("sb-frozen-container");
  if (!fc) {
    fc = document.createElement("div");
    fc.id = "sb-frozen-container";
    // 样式直接注入，防止 CSS 文件未加载
    fc.style.cssText = "position: fixed; top: 40px; left: 0; z-index: 999; display: none; pointer-events: none; opacity: 0.8;";
    document.body.appendChild(fc);
  }
  return fc;
}

function updateFrozenBar(domHeading) {
  const fc = getFrozenContainer();
  
  // 1. 确保数据是最新的
  rebuildHeadingsSync(); 
  
  // 2. 找到对应关系
  const idx = findFullIndexForDomHeading(domHeading);
  if (idx === -1) {
    fc.style.display = "none";
    return;
  }

  // 3. 获取树形结构
  const branch = getBranchFromFullHeadings(idx);
  if (!branch) {
    fc.style.display = "none";
    return;
  }

  // 4. 渲染
  fc.innerHTML = "";
  fc.style.display = "flex";
  fc.style.flexDirection = "column";
  fc.style.alignItems = "flex-start";
  
  // 渲染祖先 + 自己
  [...branch.ancestors, branch.leaf].forEach(h => {
    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;
    div.textContent = h.text;
    div.style.cssText = "background: var(--sb-background, white); padding: 2px 8px; margin-bottom: 2px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 0.85em; color: var(--sb-primary-text, #333);";
    fc.appendChild(div);
  });
  
  // 定位到容器左侧
  const rect = domHeading.getBoundingClientRect(); // 只是为了获取大致左边距
  const container = document.querySelector("#sb-main");
  if(container) {
      const cRect = container.getBoundingClientRect();
      fc.style.left = (cRect.left + 10) + "px";
  }
}

// ---------- 5. 主逻辑 ----------

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector = opts.headingSelector || ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6, h1, h2, h3, h4, h5, h6";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      requestAnimationFrame(bind);
      return;
    }

    // 清理旧状态
    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    // 核心渲染函数
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

      // 1. DOM 高亮
      clearClasses(container);
      targetHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach(el => el.classList.add("sb-active", "sb-active-anc"));
      descendants.forEach(el => el.classList.add("sb-active", "sb-active-desc"));

      // 2. 冻结栏更新 (从 CodeMirror 文本获取完整层级)
      updateFrozenBar(targetHeading);
    }

    // --- 事件监听 ---

    // 1. Hover
    function onPointerOver(e) {
      if (!e.target) return;
      const headings = listHeadings(container, headingSelector);
      // 只有当鼠标真的悬停在标题或其内部时才触发
      // 如果你觉得太灵敏，可以只检查 e.target.matches(headingSelector)
      const h = findHeadingForElement(e.target, headings);
      if (h) {
        render(h);
      }
    }
    
    // 2. Scroll (用于更新“我读到哪里了”)
    let isScrolling = false;
    function onScroll() {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          const headings = listHeadings(container, headingSelector);
          // 找到第一个顶部进入视口的标题，或者视口中最靠上的标题
          const triggerY = 100; // 顶部偏移量
          let current = null;
          
          for (let h of headings) {
            const rect = h.getBoundingClientRect();
            if (rect.top < triggerY) {
               current = h; // 记录最后一个在 triggerY 之上的标题
            } else {
               break; // 既然这个已经超过 triggerY，后面的肯定也超过了
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
    // 使用 passive: true 解决 Violation 警告
    window.addEventListener("scroll", onScroll, { passive: true });

    // 保存清理函数
    window[STATE_KEY] = {
      cleanup() {
        container.removeEventListener("pointerover", onPointerOver);
        window.removeEventListener("scroll", onScroll);
        clearClasses(container);
        const fc = document.getElementById("sb-frozen-container");
        if (fc) fc.remove();
      }
    };
    
    console.log("[HHH] v7 Enabled: Regex Mode");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
