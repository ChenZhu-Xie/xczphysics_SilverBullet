// Library/HierarchyHighlightHeadings.js
// HHH v6 - JS 侧直接从 CodeMirror 获取全文，解析 Markdown 构建 FULL_HEADINGS

const STATE_KEY = "__xhHighlightState_v6_HHH_CMText";

// ---------- 1. 从 CodeMirror 获取全文 ----------

function getFullTextFromCodeMirror() {
  try {
    // SilverBullet 前端 client 对象，底层 editor.getText 就是这么实现的
    if (window.client && client.editorView && client.editorView.state) {
      return client.editorView.state.sliceDoc();
    }
  } catch (e) {
    console.warn("[HHH] getFullTextFromCodeMirror failed:", e);
  }
  return "";
}

// ---------- 2. 基于 Markdown AST 的 FULL_HEADINGS ----------

let FULL_HEADINGS = null;
let BUILDING_FULL_HEADINGS = null;
let FULL_HEADINGS_VERSION = 0;

// 从全文文本构建 FULL_HEADINGS：[{ level, text }]
async function buildFullHeadings() {
  const text = getFullTextFromCodeMirror();
  if (!text) {
    FULL_HEADINGS = [];
    FULL_HEADINGS_VERSION++;
    return;
  }

  // 依赖 SB 全局 markdown 模块：markdown.parseMarkdown + markdown.extractText
  const ast = await markdown.parseMarkdown(text);
  const list = [];

  function walk(node) {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.type === "Heading") {
      const level = node.level || 1;
      const txt = (markdown.extractText
        ? markdown.extractText(node)
        : (node.text || "")).trim();
      if (txt) {
        list.push({ level, text: txt });
      }
    }
    if (node.children) walk(node.children);
    if (node.content) walk(node.content);
  }

  walk(ast);

  FULL_HEADINGS = list;
  FULL_HEADINGS_VERSION++;
}

// 确保 FULL_HEADINGS 构建完成（带简单并发保护）
async function ensureFullHeadings() {
  if (FULL_HEADINGS && !BUILDING_FULL_HEADINGS) {
    return FULL_HEADINGS;
  }
  if (!BUILDING_FULL_HEADINGS) {
    BUILDING_FULL_HEADINGS = buildFullHeadings().finally(() => {
      BUILDING_FULL_HEADINGS = null;
    });
  }
  await BUILDING_FULL_HEADINGS;
  return FULL_HEADINGS;
}

// DOM heading -> FULL_HEADINGS 索引（用 level + 文本匹配）
function findFullIndexForDomHeading(domH) {
  if (!FULL_HEADINGS || !domH) return -1;
  const level = getLevel(domH);
  const text = domH.innerText.trim();
  if (!text) return -1;

  // 从后往前找，处理重复标题时尽量匹配最近的
  for (let i = FULL_HEADINGS.length - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
    if (h.level === level && h.text === text) {
      return i;
    }
  }
  return -1;
}

// 从 FULL_HEADINGS 索引算出完整祖先链
function getBranchFromFullHeadings(idx) {
  if (!FULL_HEADINGS || idx < 0 || idx >= FULL_HEADINGS.length) return null;
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

// 从 DOM heading 更新左上角冻结栏（基于 FULL_HEADINGS）
async function updateFrozenFromDomHeading(container, domHeading) {
  await ensureFullHeadings();
  const idx = findFullIndexForDomHeading(domHeading);
  if (idx === -1) {
    clearFrozen();
    return;
  }
  const branch = getBranchFromFullHeadings(idx);
  renderFrozenBranchFromAst(container, branch);
}

// ---------- 3. DOM 工具函数（沿用你之前的逻辑） ----------

function getLevel(el) {
  // 优先用 sb-line-hN
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

// 基于 FULL_HEADINGS（AST）渲染左上角冻结栏
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

// ---------- 4. 主逻辑 ----------

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

    // 先尝试构建一次 FULL_HEADINGS（懒加载里也会再触发，不必强求）
    ensureFullHeadings().catch((e) =>
      console.warn("[HHH] ensureFullHeadings on bind failed:", e)
    );

    const prev = window[STATE_KEY];
    if (prev && prev.cleanup) prev.cleanup();

    let currentBranchInfo = null; // { headings, startIndex, ... }

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

      currentBranchInfo = {
        headings,
        startIndex,
        startHeading,
        ancestors,
        descendants,
      };

      // 1. 文本高亮（只对当前视口的 DOM heading）
      clearClasses(container);

      startHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach((el) =>
        el.classList.add("sb-active", "sb-active-anc")
      );
      descendants.forEach((el) =>
        el.classList.add("sb-active", "sb-active-desc")
      );

      // 2. 冻结栏：用 FULL_HEADINGS + AST 得到完整祖先链
      //    异步执行，不阻塞高亮
      updateFrozenFromDomHeading(container, startHeading).catch((e) =>
        console.warn("[HHH] updateFrozenFromDomHeading failed:", e)
      );
    }

    // ---------- hover 逻辑 ----------
    function onPointerOver(e) {
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
        // 如果希望移出编辑器后仍保留冻结栏，可注释下一行
        // clearFrozen();
      }
    }

    // ---------- 滚动逻辑：以视口顶部为基准决定当前 section ----------
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
        // 不一定要清高亮，看个人喜好；这里保持与 hover 一致，清掉：
        clearClasses(container);
        currentBranchInfo = null;
        isScrolling = false;
        return;
      }

      // 滚动也统一用 setActiveBranch，这样高亮和冻结栏一致
      setActiveBranch(headings, currentIndex);

      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // ---------- DOM 变化：尽量恢复当前 branch ----------
    const mo = new MutationObserver(() => {
      // CodeMirror 编辑会频繁触发这里
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

    // 初始化一次滚动逻辑（页面加载后立即计算当前 section）
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
        "[HHH] enabled (v6, CodeMirror sliceDoc + JS Markdown AST FULL_HEADINGS)"
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
