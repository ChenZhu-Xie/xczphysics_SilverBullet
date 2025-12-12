// Library/HierarchyHighlightHeadings.js
// HHH v8-Mixed - Core: v8 (Clean Text/Widget Fix) + Triggers: v4 (Sticky/MutationObserver)

const STATE_KEY = "__xhHighlightState_v8_Mixed";

// ==========================================
// 核心逻辑 (保留 v8 的数据处理与渲染)
// ==========================================

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
function findFullIndexForDomHeading(domH, domIndex) {
  // 1. 确保数据同步
  if (FULL_HEADINGS.length === 0) rebuildHeadingsSync();

  // 2. 优先使用索引匹配 (假设 DOM 渲染顺序与源码一致)
  if (domIndex >= 0 && domIndex < FULL_HEADINGS.length) {
    const candidate = FULL_HEADINGS[domIndex];
    const domLevel = getLevel(domH);
    if (candidate.level === domLevel) {
      return domIndex;
    }
  }

  // 3. 降级方案：模糊匹配
  const text = domH.innerText.trim(); 
  const level = getLevel(domH);
  
  for (let i = FULL_HEADINGS.length - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
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
  // 过滤掉 Widget 内部的标题 (参考 v4 的逻辑，避免干扰索引)
  const all = Array.from(root.querySelectorAll(selector));
  return all.filter(el => !el.closest(".sb-widget-array"));
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
  
  // v4 的查找逻辑：从后往前找最近的上方标题
  for (let i = headings.length - 1; i >= 0; i--) {
    const h = headings[i];
    const pos = h.compareDocumentPosition(el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos === 0) {
      return h;
    }
  }
  return null;
}

// ---------- 4. 界面渲染 (v8 风格：Clean Text) ----------

function clearClasses(root) {
  const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
  root.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));
}

function getFrozenContainer() {
  let fc = document.getElementById("sb-frozen-container");
  if (!fc) {
    fc = document.createElement("div");
    fc.id = "sb-frozen-container";
    fc.style.display = "none";
    document.body.appendChild(fc);
  }
  return fc;
}

function clearFrozen() {
  const fc = document.getElementById("sb-frozen-container");
  if (fc) {
    fc.innerHTML = "";
    fc.style.display = "none";
  }
}

// 核心渲染：使用 v8 的逻辑 (基于源码文本渲染，而非 DOM 克隆)
function updateFrozenBar(domHeading, domIndex, container) {
  const fc = getFrozenContainer();
  
  rebuildHeadingsSync(); 
  
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
  
  [...branch.ancestors, branch.leaf].forEach(h => {
    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;
    // 使用 v8 的 clean text
    div.textContent = h.displayText || h.text; 
    fc.appendChild(div);
  });
  
  // 定位
  if(container) {
      const cRect = container.getBoundingClientRect();
      fc.style.left = (cRect.left + 10) + "px";
  }
}

// ==========================================
// 5. 主逻辑 (触发时机：替换为 v4 逻辑)
// ==========================================

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  // 使用更严格的选择器
  const headingSelector = opts.headingSelector || ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      requestAnimationFrame(bind);
      return;
    }

    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    // 状态保持 (来自 v4)
    let currentBranchInfo = null; // { headings, startIndex }

    // 统一渲染入口：结合 v4 的状态管理和 v8 的渲染逻辑
    function setActiveBranch(headings, startIndex) {
      if (!headings || startIndex == null || startIndex < 0 || startIndex >= headings.length) {
        currentBranchInfo = null;
        clearClasses(container);
        clearFrozen();
        return;
      }

      const targetHeading = headings[startIndex];
      currentBranchInfo = { headings, startIndex };

      // 1. 计算 DOM 层级关系 (v8 逻辑)
      const level = getLevel(targetHeading);
      const ancestors = collectAncestors(startIndex, headings, level);
      const descendants = collectDescendants(startIndex, headings, level);

      // 2. 应用 CSS 类 (v8 逻辑)
      clearClasses(container);
      targetHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach(el => el.classList.add("sb-active", "sb-active-anc"));
      descendants.forEach(el => el.classList.add("sb-active", "sb-active-desc"));

      // 3. 更新冻结栏 (v8 逻辑：传入 Index 进行源码映射)
      updateFrozenBar(targetHeading, startIndex, container);
    }

    // --- 事件监听 (完全替换为 v4 逻辑) ---

    // 1. 鼠标悬停
    function onPointerOver(e) {
      if (!e.target || !container.contains(e.target)) return;

      const headings = listHeadings(container, headingSelector);
      const h = findHeadingForElement(e.target, headings);
      
      if (!h) return;

      const startIndex = headings.indexOf(h);
      if (startIndex === -1) return;

      setActiveBranch(headings, startIndex);
    }

    // 2. 鼠标移出
    function onPointerOut(e) {
      const to = e.relatedTarget;
      if (!to || !container.contains(to)) {
        clearClasses(container);
        // 保持冻结栏显示，或者也可以 clearFrozen()，取决于偏好
        // 这里保留 v4 行为：只清空高亮，不强制清空 currentBranchInfo
      }
    }

    // 3. 滚动 (v4 逻辑：Sticky Top)
    let isScrolling = false;
    function handleScroll() {
      const headings = listHeadings(container, headingSelector);
      if (!headings.length) {
        clearFrozen();
        clearClasses(container);
        currentBranchInfo = null;
        isScrolling = false;
        return;
      }
    
      const triggerY = 40; // v4 的判定线
      let currentIndex = -1;
    
      // 找到最后一个在 triggerY 之上的标题
      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= triggerY) {
          currentIndex = i;
        } else {
          if (currentIndex !== -1) break;
        }
      }
    
      if (currentIndex === -1) {
        clearFrozen();
        clearClasses(container);
        currentBranchInfo = null;
        isScrolling = false;
        return;
      }
    
      setActiveBranch(headings, currentIndex);
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // 4. MutationObserver (v4 逻辑：防止编辑时高亮丢失)
    const mo = new MutationObserver(() => {
      if (currentBranchInfo && currentBranchInfo.headings) {
        // 尝试恢复状态，但 DOM 列表可能变了，重新获取一次比较安全
        const headings = listHeadings(container, headingSelector);
        // 这里简单处理：如果有滚动状态，优先响应滚动；否则保持原位
        // 为简化，直接调用 handleScroll 重新计算最准确
        handleScroll();
      } else {
        handleScroll();
      }
    });
    mo.observe(container, { childList: true, subtree: true });

    // 绑定
    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    // 初始运行
    handleScroll();

    window[STATE_KEY] = {
      cleanup() {
        container.removeEventListener("pointerover", onPointerOver);
        container.removeEventListener("pointerout", onPointerOut);
        window.removeEventListener("scroll", onScroll);
        mo.disconnect();
        clearClasses(container);
        const fc = document.getElementById("sb-frozen-container");
        if (fc) fc.remove();
      }
    };
    
    console.log("[HHH] v8-Mixed Enabled: Clean Text + Sticky Trigger");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
