const STATE_KEY = "__xhHighlightState_v4_HHH";

// ---------- 工具函数 ----------

function getLevel(el) {
  // 优先用 sb-line-hN
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
  return Array.from(root.querySelectorAll(headingSelector));
}

// 所有后代标题（比当前层级更深，直到遇到 <= 当前层级为止）
function collectDescendants(startIndex, headings, startLevel) {
  const res = [];
  for (let i = startIndex + 1; i < headings.length; i++) {
    const lvl = getLevel(headings[i]);
    if (lvl <= startLevel) break;
    res.push(headings[i]);
  }
  return res;
}

// 所有祖先标题（H1 → H2 → …，保持从外到内的顺序）
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

// 给任意元素，找到它「所属的最近上方标题」
// headings 必须是按 DOM 顺序的数组
function findHeadingForElement(el, headings) {
  if (!el) return null;
  if (headings.includes(el)) return el;

  // 从后往前找，找到「在 el 之前」的最后一个标题
  for (let i = headings.length - 1; i >= 0; i--) {
    const h = headings[i];
    const pos = h.compareDocumentPosition(el);
    // h 在 el 之前（h -> el）或就是同一个节点
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos === 0) {
      return h;
    }
  }
  return null;
}

function clearClasses(root) {
  root
    .querySelectorAll(
      ".sb-active, .sb-active-anc, .sb-active-desc, .sb-active-current"
    )
    .forEach((el) =>
      el.classList.remove(
        "sb-active",
        "sb-active-anc",
        "sb-active-desc",
        "sb-active-current"
      )
    );
}

function getFrozenContainer() {
  let fc = document.getElementById("sb-frozen-container");
  if (!fc) {
    fc = document.createElement("div");
    fc.id = "sb-frozen-container";
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

// 根据当前 branch（只包括祖先 + 当前标题，不包括后代）渲染顶部冻结栏
function renderFrozenBranch(container, branchHeadings) {
  const fc = getFrozenContainer();

  if (!branchHeadings || branchHeadings.length === 0) {
    fc.innerHTML = "";
    fc.style.display = "none";
    return;
  }

  fc.style.display = "flex";
  fc.style.flexDirection = "column";
  fc.style.alignItems = "flex-start";
  fc.innerHTML = "";

  for (const h of branchHeadings) {
    const clone = h.cloneNode(true);
    clone.classList.add("sb-frozen-clone");
    clone
      .querySelectorAll(".cm-widgetBuffer, .cm-cursorLayer, .cm-selectionLayer")
      .forEach((n) => n.remove());
    fc.appendChild(clone);
  }

  // 只同步编辑区的左边界，让整个冻结列贴到编辑区左上角
  const rect = container.getBoundingClientRect();
  fc.style.left = rect.left + "px";
  // 不再强行设置宽度，让 CSS 决定自适应宽度
  fc.style.removeProperty("width");
}

// ---------- 主逻辑 ----------

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector =
    opts.headingSelector ||
    "h1, h2, h3, h4, h5, h6, .sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";
  const groupSelector = opts.groupSelector || ".sb-title-group";
  const debug = !!opts.debug;

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      requestAnimationFrame(bind);
      return;
    }

    // 如果之前有旧状态，先清理
    const prev = window[STATE_KEY];
    if (prev && prev.cleanup) prev.cleanup();

    let currentBranchInfo = null; // { headings, startIndex, startHeading, ancestors, descendants }

    // 将「某个标题索引」变成完整 branch，并应用高亮 + 冻结
    function setActiveBranch(headings, startIndex) {
      if (
        !headings ||
        headings.length === 0 ||
        startIndex == null ||
        startIndex < 0 ||
        startIndex >= headings.length
      ) {
        currentBranchInfo = null;
        clearClasses(container);
        clearFrozen();
        return;
      }

      const startHeading = headings[startIndex];
      const level = getLevel(startHeading);
      const ancestors = collectAncestors(startIndex, headings, level);
      const descendants = collectDescendants(startIndex, headings, level);
      const branchHeadings = [...ancestors, startHeading];

      currentBranchInfo = {
        headings,
        startIndex,
        startHeading,
        ancestors,
        descendants,
      };

      // 1. 文本高亮
      clearClasses(container);

      startHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach((el) =>
        el.classList.add("sb-active", "sb-active-anc")
      );
      descendants.forEach((el) =>
        el.classList.add("sb-active", "sb-active-desc")
      );

      // 2. 顶部冻结栏
      renderFrozenBranch(container, branchHeadings);
    }

    // ========== 1. 鼠标悬浮：基于 hover 的层级高亮 ==========

    function onPointerOver(e) {
      if (!e.target || !container.contains(e.target)) return;

      const headings = listHeadings(container, headingSelector);

      const h = findHeadingForElement(e.target, headings);
      if (!h) return;

      const startIndex = headings.indexOf(h);
      if (startIndex === -1) return;

      setActiveBranch(headings, startIndex);
    }

    function onPointerOut(e) {
      // 仅当真的离开整个主容器时，才清除高亮
      const to = e.relatedTarget;
      if (!to || !container.contains(to)) {
        clearClasses(container);
        // 冻结栏可以保留，也可以一起清空，看个人喜好
        // 如果你希望离开编辑器后仍然看到当前 branch，可以删掉下一行：
        // clearFrozen();
      }
    }

    // ========== 2. 滚动：基于视口顶部的粘性标题 ==========

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
    
      const triggerY = 40; // 视口内判定「当前标题」的参考线 (px)
      let currentIndex = -1;
    
      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= triggerY) {
          currentIndex = i;
        } else {
          if (currentIndex !== -1) break;
        }
      }
    
      if (currentIndex === -1) {
        // 还没滚到任何标题
        clearFrozen();
        clearClasses(container);
        currentBranchInfo = null;
        isScrolling = false;
        return;
      }
    
      // 统一走 setActiveBranch：既算出完整祖先链，又更新冻结栏
      setActiveBranch(headings, currentIndex);
    
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // ========== 3. DOM 变化：保持冻结栏和高亮不被编辑动作破坏 ==========

    const mo = new MutationObserver(() => {
      // 原代码这里会 clearClasses，导致一编辑高亮就没了
      // 我们改为：如果当前有 branch，就重新应用一次；顺便刷新冻结栏宽度
      if (currentBranchInfo && currentBranchInfo.headings) {
        const { headings, startIndex } = currentBranchInfo;
        setActiveBranch(headings, startIndex);
      } else {
        // 没有 branch 的情况下，至少要保证冻结栏宽度正确
        handleScroll();
      }
    });
    mo.observe(container, { childList: true, subtree: true });

    // 绑定事件
    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    // 初始执行一次：如果页面一打开就有滚动位置，先算一遍冻结栏
    handleScroll();

    window[STATE_KEY] = {
      cleanup() {
        try {
          container.removeEventListener("pointerover", onPointerOver);
          container.removeEventListener("pointerout", onPointerOut);
          window.removeEventListener("scroll", onScroll);
        } catch {}
        try {
          mo.disconnect();
        } catch {}
        clearClasses(container);
        clearFrozen();
        currentBranchInfo = null;
      },
    };

    if (debug)
      console.log(
        "[HHH] enabled: persistent branch highlight + frozen branch clones"
      );
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) st.cleanup();
  window[STATE_KEY] = null;
}
