const STATE_KEY = "__xhHighlightState_v6_HHH_JSMarkdown";

let FULL_HEADINGS = null; // [{ level, text }]
let FULL_HEADINGS_VERSION = 0;

// ---------------------- 获取全文 markdown ----------------------

function getFullTextFromCodeMirror() {
  // 尝试从 CodeMirror 6 的视图对象拿全文
  // 通常根节点是 .cm-editor 或 .cm-content 所在的 DOM 上挂了 cmView
  const cmRoot =
    document.querySelector(".cm-editor") ||
    document.querySelector(".cm-content");
  const view = cmRoot && cmRoot.cmView;
  if (view && view.state && view.state.doc) {
    return view.state.doc.toString();
  }
  return null;
}

// 用简单正则从 markdown 文本里提取所有 # 开头的标题
function buildFullHeadingsFromMarkdown(text) {
  const lines = text.split(/\r?\n/);
  const res = [];
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    let txt = m[2].trim();
    // 去掉末尾成对的 #（ATX 样式）: "Title ###"
    txt = txt.replace(/\s+#+\s*$/, "").trim();
    if (!txt) continue;
    res.push({ level, text: txt });
  }
  FULL_HEADINGS = res;
  FULL_HEADINGS_VERSION++;
}

// 确保 FULL_HEADINGS 已构建；失败则返回 false
function ensureFullHeadings() {
  if (FULL_HEADINGS) return true;
  const text = getFullTextFromCodeMirror();
  if (!text) {
    console.warn("[HHH] 无法从 CodeMirror 获取全文，FULL_HEADINGS 功能暂时禁用");
    FULL_HEADINGS = null;
    return false;
  }
  buildFullHeadingsFromMarkdown(text);
  return true;
}

// 给一个 DOM heading，去 FULL_HEADINGS 里找对应项，并算出完整祖先链
function getBranchFromFullHeadingsByDomHeading(domH) {
  if (!ensureFullHeadings() || !domH) return null;

  const level = getLevel(domH);
  const text = domH.innerText.trim();
  if (!text) return null;

  // 从后往前找最后一个 level+text 匹配的 heading
  let idx = -1;
  for (let i = FULL_HEADINGS.length - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
    if (h.level === level && h.text === text) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return null;

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

// ---------------------- DOM 工具函数（和之前类似） ----------------------

function getLevel(el) {
  for (let i = 1; i <= 6; i++) {
    if (el.classList && el.classList.contains(`sb-line-h${i}`)) return i;
  }
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (/^h[1-6]$/.test(tag)) return Number(tag[1]);
  return 0;
}

function listHeadings(root, headingSelector) {
  return Array.from(root.querySelectorAll(headingSelector));
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

function findHeadingForElement(el, headings) {
  if (!el) return null;
  if (headings.includes(el)) return el;

  for (let i = headings.length - 1; i >= 0; i--) {
    const h = headings[i];
    const pos = h.compareDocumentPosition(el);
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

// ---------------------- 冻结栏（左上角窄列） ----------------------

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

// 使用 FULL_HEADINGS 信息渲染左上角冻结栏
function renderFrozenBranchFromIndex(container, branch) {
  const fc = getFrozenContainer();

  if (!branch || !branch.leaf) {
    fc.innerHTML = "";
    fc.style.display = "none";
    return;
  }

  const items = [...branch.ancestors, branch.leaf];

  fc.style.display = "flex";
  fc.style.flexDirection = "column";
  fc.style.alignItems = "flex-start";
  fc.innerHTML = "";

  for (const h of items) {
    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;
    div.textContent = h.text;
    fc.appendChild(div);
  }

  const rect = container.getBoundingClientRect();
  fc.style.left = rect.left + "px";
  fc.style.removeProperty("width");
}

// ---------------------- 主入口 ----------------------

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector =
    opts.headingSelector ||
    "h1, h2, h3, h4, h5, h6, .sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";
  const debug = !!opts.debug;

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      requestAnimationFrame(bind);
      return;
    }

    const prev = window[STATE_KEY];
    if (prev && prev.cleanup) prev.cleanup();

    let currentBranchInfo = null;

    async function setActiveBranch(headings, startIndex) {
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

      currentBranchInfo = {
        headings,
        startIndex,
        startHeading,
        ancestors,
        descendants,
      };

      // 1. 正文高亮（只对视口中有 DOM 的标题）
      clearClasses(container);

      startHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach((el) =>
        el.classList.add("sb-active", "sb-active-anc")
      );
      descendants.forEach((el) =>
        el.classList.add("sb-active", "sb-active-desc")
      );

      // 2. 冻结栏：基于 FULL_HEADINGS 计算全局完整链
      const branch = getBranchFromFullHeadingsByDomHeading(startHeading);
      renderFrozenBranchFromIndex(container, branch);
    }

    // ---------- hover ----------
    function onPointerOver(e) {
      if (!e.target || !container.contains(e.target)) return;

      const headings = listHeadings(container, headingSelector);
      if (!headings.length) return;

      const h = findHeadingForElement(e.target, headings);
      if (!h) return;

      const startIndex = headings.indexOf(h);
      if (startIndex === -1) return;

      // 不需要等它完成，高亮 + 冻结晚一帧无所谓
      void setActiveBranch(headings, startIndex);
    }

    function onPointerOut(e) {
      const to = e.relatedTarget;
      if (!to || !container.contains(to)) {
        clearClasses(container);
        // 如果希望移出编辑区也保留冻结栏，可以注释掉下一行
        // clearFrozen();
      }
    }

    // ---------- 滚动 ----------
    let isScrolling = false;

    function handleScroll() {
      const headings = listHeadings(container, headingSelector);
      if (!headings.length) {
        clearFrozen();
        isScrolling = false;
        return;
      }

      const triggerY = 40;
      let currentIndex = -1;

      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= triggerY) {
          currentIndex = i;
        } else if (currentIndex !== -1) {
          break;
        }
      }

      if (currentIndex === -1) {
        clearFrozen();
        isScrolling = false;
        return;
      }

      // 统一用 setActiveBranch：滚动也更新正文高亮 + 冻结栏
      void setActiveBranch(headings, currentIndex);

      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // ---------- DOM 变化 ----------
    const mo = new MutationObserver(() => {
      // 文本可能改了，标题列表也可能变，标记 FULL_HEADINGS 失效
      FULL_HEADINGS = null;
      if (currentBranchInfo && currentBranchInfo.headings) {
        const { headings, startIndex } = currentBranchInfo;
        void setActiveBranch(headings, startIndex);
      } else {
        handleScroll();
      }
    });
    mo.observe(container, { childList: true, subtree: true });

    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    // 初始先构建一次 FULL_HEADINGS（如果拿不到就延后到第一次触发）
    ensureFullHeadings();
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

    if (debug) {
      console.log(
        "[HHH] enabled (v6, JS-side markdown headings via CodeMirror)"
      );
    }
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) st.cleanup();
  window[STATE_KEY] = null;
}
