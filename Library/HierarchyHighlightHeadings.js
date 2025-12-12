const STATE_KEY = "__xhHighlightState_v3_Frozen";

// --- 基础工具函数 ---

function getLevel(el) {
  for (let i = 1; i <= 6; i++) {
    if (el.classList && el.classList.contains(`sb-line-h${i}`)) return i;
  }
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (/^h[1-6]$/.test(tag)) return Number(tag[1]);
  return 0;
}

function pickGroupRoot(start, container, groupSelector) {
  if (!groupSelector) return container;
  const g = start.closest(groupSelector);
  return g || container;
}

function listHeadings(root, headingSelector) {
  // 获取所有标题，按 DOM 顺序排列
  return Array.from(root.querySelectorAll(headingSelector));
}

// --- 核心逻辑：查找祖先和后代 ---

function collectDescendants(startIndex, headings, startLevel) {
  const res = [];
  for (let i = startIndex + 1; i < headings.length; i++) {
    const lvl = getLevel(headings[i]);
    if (lvl <= startLevel) break;
    res.push(headings[i]);
  }
  return res;
}

function collectAncestors(startIndex, headings, startLevel) {
  const res = [];
  let minLevel = startLevel;
  for (let i = startIndex - 1; i >= 0; i--) {
    const lvl = getLevel(headings[i]);
    if (lvl < minLevel) {
      res.unshift(headings[i]); // 注意：这里用 unshift 保持 H1, H2, H3 的顺序
      minLevel = lvl;
      if (minLevel === 1) break;
    }
  }
  return res;
}

// --- 新增逻辑：根据任意元素找到其所属的标题 ---

function findHeadingForElement(el, headings) {
  // 1. 如果自己就是标题，直接返回
  if (headings.includes(el)) return el;

  // 2. 二分查找或遍历，找到 el 之前的最后一个标题
  // 由于 headings 是有序的，我们倒序查找效率较高
  // Node.compareDocumentPosition: 2 (Preceding), 4 (Following)
  // 如果 h 在 el 之前，el 和 h 的关系包含 Following (4)
  
  // 简单遍历策略：找到第一个“在 el 之后”的标题，它的前一个就是目标
  // 或者直接倒序找第一个“在 el 之前”的标题
  for (let i = headings.length - 1; i >= 0; i--) {
    const h = headings[i];
    // 如果 h 在 el 之前 (h.compareDocumentPosition(el) & 4)
    if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
      return h;
    }
  }
  return null;
}

function clearClasses(root) {
  // 清除高亮类
  root.querySelectorAll(".sb-active, .sb-active-anc, .sb-active-desc, .sb-active-current")
      .forEach(el => el.classList.remove("sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"));
}

function clearFrozen(root) {
  // 清除冻结状态
  root.querySelectorAll(".sb-frozen").forEach(el => {
    el.classList.remove("sb-frozen");
    el.style.top = "";
    el.style.zIndex = "";
  });
}

// --- 主入口 ---

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  // 包含标准 H 标签和 SB 特有类名
  const headingSelector = opts.headingSelector ||
    "h1, h2, h3, h4, h5, h6, .sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";
  const groupSelector = opts.groupSelector || ".sb-title-group";
  const debug = !!opts.debug;

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) { requestAnimationFrame(bind); return; }

    const prev = window[STATE_KEY];
    if (prev && prev.cleanup) prev.cleanup();

    // --- 功能 1: 鼠标悬浮高亮 (包含正文查找) ---
    
    function onPointerOver(e) {
      if (!e.target || !container.contains(e.target)) return;

      // 确定搜索范围（处理分栏情况）
      const groupRoot = pickGroupRoot(e.target, container, groupSelector);
      const headings = listHeadings(groupRoot, headingSelector);
      
      // 核心修改：如果 hover 的是文本，找到它上面的标题
      const h = findHeadingForElement(e.target, headings);
      
      if (!h) return; // 没找到对应标题（可能在文档最开头）

      const startIndex = headings.indexOf(h);
      if (startIndex === -1) return;

      // 清除旧的高亮（不清除冻结状态，两者独立）
      clearClasses(container);

      const startLevel = getLevel(h);
      const descendants = collectDescendants(startIndex, headings, startLevel);
      const ancestors = collectAncestors(startIndex, headings, startLevel); // [H1, H2...]

      h.classList.add("sb-active", "sb-active-current");
      descendants.forEach(el => el.classList.add("sb-active", "sb-active-desc"));
      ancestors.forEach(el => el.classList.add("sb-active", "sb-active-anc"));
    }

    function onPointerOut(e) {
        // 简单的防抖或逻辑判断，避免频繁闪烁
        const to = e.relatedTarget;
        if (!to || !container.contains(to)) {
             clearClasses(container);
        }
    }

    // --- 功能 2: 滚动冻结窗格 (Sticky Headers) ---

    let isScrolling = false;
    
    function handleScroll() {
        const headings = listHeadings(container, headingSelector);
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const offsetBuffer = 50; // 偏移缓冲，判定可视区域

        // 1. 找到当前视口最上方的那个标题（或者刚刚滚过去的那个标题）
        // 我们找最后一个 offsetTop <= scrollTop + buffer 的标题
        let currentHeaderIndex = -1;
        for (let i = 0; i < headings.length; i++) {
            if (headings[i].offsetTop > scrollTop + offsetBuffer) {
                break;
            }
            currentHeaderIndex = i;
        }

        // 如果还没滚动到任何标题，清除所有冻结
        if (currentHeaderIndex === -1) {
            clearFrozen(container);
            isScrolling = false;
            return;
        }

        const currentHeader = headings[currentHeaderIndex];
        const currentLevel = getLevel(currentHeader);
        
        // 2. 找到这个标题的祖先链 (H1 -> H2 -> ...)
        // 注意：collectAncestors 返回的是 [H1, H2...] 顺序
        const ancestors = collectAncestors(currentHeaderIndex, headings, currentLevel);
        
        // 当前分支包括祖先 + 自己
        // 如果当前标题已经滚出视口很远被下一个同级标题顶替了怎么办？
        // 其实只需要冻结“祖先”即可，因为“自己”如果还在视口内，自然会显示；如果滚出去了，就不该冻结（除非它是更深层内容的父级）
        // 修正逻辑：冻结的是“当前视口内内容”所属的标题路径。
        // 所以，currentHeader 就是当前内容的直接父级，它和它的祖先都应该被冻结。
        
        const activeBranch = [...ancestors, currentHeader];

        // 3. 应用冻结样式
        // 先清除不在 activeBranch 中的冻结状态
        const allFrozen = container.querySelectorAll(".sb-frozen");
        allFrozen.forEach(el => {
            if (!activeBranch.includes(el)) {
                el.classList.remove("sb-frozen");
                el.style.top = "";
                el.style.zIndex = "";
            }
        });

        // 4. 堆叠计算 top
        let cumulativeHeight = 0; // 这里的 0 可以改成你的顶部导航栏高度
        
        // 如果有顶部导航栏，可能需要获取其高度，例如：
        // const topBar = document.querySelector("#sb-top");
        // if (topBar) cumulativeHeight += topBar.offsetHeight;

        activeBranch.forEach((h, index) => {
            h.classList.add("sb-frozen");
            h.style.top = `${cumulativeHeight}px`;
            h.style.zIndex = 100 + index; // 保证层级正确
            
            // 累加高度，让下一个标题排在下面
            cumulativeHeight += h.getBoundingClientRect().height;
        });

        isScrolling = false;
    }

    function onScroll() {
        if (!isScrolling) {
            window.requestAnimationFrame(handleScroll);
            isScrolling = true;
        }
    }

    // --- 绑定事件 ---

    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerout", onPointerOut);
    // 监听 window 滚动
    window.addEventListener("scroll", onScroll, { passive: true });

    // 监听 DOM 变化（动态加载内容时刷新）
    const mo = new MutationObserver(() => { 
        clearClasses(container);
        handleScroll(); 
    });
    mo.observe(container, { childList: true, subtree: true });

    // --- 清理函数 ---
    window[STATE_KEY] = {
      cleanup() {
        try {
          container.removeEventListener("pointerover", onPointerOver);
          container.removeEventListener("pointerout", onPointerOut);
          window.removeEventListener("scroll", onScroll);
        } catch {}
        try { mo.disconnect(); } catch {}
        clearClasses(container);
        clearFrozen(container);
      }
    };

    if (debug) console.log("[HHH] enabled with Sticky Headers & Text Context");
    
    // 初始化执行一次 scroll 逻辑以设定初始状态
    handleScroll();
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) st.cleanup();
  window[STATE_KEY] = null;
}
