// Library/HierarchyHighlightHeadings.js
// HHH v6 — JS 侧解析全文标题 + 左上角冻结 branch

const STATE_KEY = "__xhHighlightState_v6_HHH_JSParse";

let FULL_HEADINGS = null;

// ========== 1. 全文标题解析（不依赖 index.query，直接解析 Markdown 文本） ==========

async function buildFullHeadings() {
  try {
    const ed = window.editor;
    if (!ed || typeof ed.getText !== "function") {
      console.warn("[HHH] editor.getText() 不可用，FULL_HEADINGS 功能禁用");
      FULL_HEADINGS = null;
      return;
    }
    const text = String(await ed.getText());
    const lines = text.split(/\r?\n/);
    const list = [];

    for (const line of lines) {
      // 只处理 ATX 标题：# .. ###### ..
      const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (!m) continue;
      const level = m[1].length;
      const titleText = m[2].trim();
      if (!titleText) continue;
      list.push({ level, text: titleText });
    }

    FULL_HEADINGS = list;
  } catch (e) {
    console.error("[HHH] buildFullHeadings 出错", e);
    FULL_HEADINGS = null;
  }
}

async function ensureFullHeadings() {
  if (!FULL_HEADINGS) {
    await buildFullHeadings();
  }
  return FULL_HEADINGS;
}

async function getBranchFromFullHeadingsByDomHeading(domH) {
  if (!domH) return null;
  await ensureFullHeadings();
  if (!FULL_HEADINGS || !FULL_HEADINGS.length) return null;

  const level = getLevel(domH);
  const text = domH.innerText.trim();
  if (!text) return null;

  // 从后往前找：匹配 level + text
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
  let currLevel = leaf.level;
  for (let i = idx - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
    if (h.level < currLevel) {
      ancestors.unshift(h);
      currLevel = h.level;
      if (currLevel === 1) break;
    }
  }
  return { ancestors, leaf };
}

// ========== 2. DOM 工具函数 ==========

function getLevel(el) {
  // 优先 SilverBullet 的 sb-line-hN
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

  // 从后往前找「在 el 之前」的最后一个标题
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

// 基于 FULL_HEADINGS 的 branch 渲染左上角冻结栏
function renderFrozenBranchFromAst(container, branch) {
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

// ========== 3. 主入口 ==========

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
    let isScrolling = false;

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

      // 1. 正文高亮（仅对视口内 DOM 起作用）
      clearClasses(container);

      startHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach((el) =>
        el.classList.add("sb-active", "sb-active-anc")
      );
      descendants.forEach((el) =>
        el.classList.add("sb-active", "sb-active-desc")
      );

      // 2. 冻结栏（用 FULL_HEADINGS 计算完整链）
      const branch = await getBranchFromFullHeadingsByDomHeading(startHeading);
      renderFrozenBranchFromAst(container, branch);
    }

    // ---------- hover ----------
    async function onPointerOver(e) {
      if (!e.target || !container.contains(e.target)) return;

      const headings = listHeadings(container, headingSelector);
      if (!headings.length) return;

      const h = findHeadingForElement(e.target, headings);
      if (!h) return;

      const startIndex = headings.indexOf(h);
      if (startIndex === -1) return;

      setActiveBranch(headings, startIndex);
    }

    function onPointerOut(e) {
      const to = e.relatedTarget;
      if (!to || !container.contains(to)) {
        clearClasses(container);
        // 冻结栏可以保留（不调用 clearFrozen）
      }
    }

    // ---------- scroll ----------
    async function handleScroll() {
      const headings = listHeadings(container, headingSelector);
      if (!headings.length) {
        clearFrozen();
        clearClasses(container);
        currentBranchInfo = null;
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
        clearClasses(container);
        currentBranchInfo = null;
        isScrolling = false;
        return;
      }

      // 滚动也走统一的 setActiveBranch 逻辑
      setActiveBranch(headings, currentIndex);
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        isScrolling = true;
        window.requestAnimationFrame(handleScroll);
      }
    }

    // ---------- DOM 变更：失效 FULL_HEADINGS 并恢复当前 branch ----------
    const mo = new MutationObserver(() => {
      // 文本可能发生变化，标记 FULL_HEADINGS 失效
      FULL_HEADINGS = null;
      if (currentBranchInfo && currentBranchInfo.headings) {
        const { headings, startIndex } = currentBranchInfo;
        setActiveBranch(headings, startIndex);
      } else {
        handleScroll();
      }
    });
    mo.observe(container, { childList: true, subtree: true });

    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    // 初始试一次：如果打开时已经有滚动/内容
    handleScroll();
    // 同时预构建一次 FULL_HEADINGS（不阻塞）
    ensureFullHeadings();

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
      console.log("[HHH] enabled (v6, JS-parse FULL_HEADINGS)");
    }
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) st.cleanup();
  window[STATE_KEY] = null;
}
