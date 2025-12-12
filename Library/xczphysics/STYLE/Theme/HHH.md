---
author: Chenzhu-Xie
name: Library/xczphysics/STYLE/Theme/HHH
tags: meta/library
pageDecoration.prefix: "🎇 "
---

# HierarchyHighlightHeadings - HHH Theme

## JS Part

### Step 1. Reload your space to load the space-lua from this page: ${widgets.commandButton("System: Reload")}

### Step 2. Save Library/PanelDragResize.js using this button: ${widgets.commandButton("Save: HierarchyHighlightHeadings.js")}

### Step 3. System Reload: ${widgets.commandButton("System: Reload")}

### Step 4. Reload UI: ${widgets.commandButton("Client: Reload UI")}

1. borrowed `JS inject` from [[CONFIG/View/Tree/Float]]
2. https://community.silverbullet.md/t/hhh-hierarchyhighlightheadings-theme/3467

> **danger** Danger
> for test: ${widgets.commandButton("Delete: HierarchyHighlightHeadings.js")}



```space-lua
local jsCode = [[
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
]]

command.define {
  name = "Save: HierarchyHighlightHeadings.js",
  hide = true,
  run = function()
    local jsFile = space.writeDocument("Library/HierarchyHighlightHeadings.js", jsCode)
    editor.flashNotification("HierarchyHighlightHeadings JS saved with size: " .. jsFile.size .. " bytes")
  end
}

command.define {
  name = "Delete: HierarchyHighlightHeadings.js",
  hide = true,
  run = function()
    local jsFile = space.deleteDocument("Library/HierarchyHighlightHeadings.js")
    editor.flashNotification("JS-File deleted")
  end
}
```


```space-lua
command.define {
  name = "Enable: HierarchyHighlightHeadings",
  run = function()
    js.import("/.fs/Library/HierarchyHighlightHeadings.js").enableHighlight()
  end
}

command.define {
  name = "Disable HierarchyHighlightHeadings",
  hide = true,
  run = function()
    js.import("/.fs/Library/HierarchyHighlightHeadings.js").disableHighlight()
  end
}
```

1. borrowed `event.listen` from [[CONFIG/Edit/Read_Only_Toggle]]

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    js.import("/.fs/Library/HierarchyHighlightHeadings.js").enableHighlight()
  end
}
```

## CSS part

### split

```space-style
/* 冻结栏容器：左上角窄列，鼠标可穿透 */
#sb-frozen-container {
  position: fixed;
  top: 4px;
  left: 0;                    /* 真正的 left 由 JS 用编辑区 rect.left 覆盖 */
  z-index: 1000;
  pointer-events: none;       /* 整个容器鼠标穿透 */
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

/* 冻结项：按内容自适应宽度的一小块 */
.sb-frozen-item {
  display: inline-block;
  width: auto;
  max-width: 40vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: none;       /* 单个标题也不截获鼠标事件 */

  margin: 0 !important;
  padding: 0.1em 0.5em;
  border-radius: 4px;
  box-sizing: border-box;

  opacity: 1 !important;
  background-color: var(--bg-color, #ffffff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  font-family: inherit;
}

/* 暗色模式：只调背景 / 边线 */
@media (prefers-color-scheme: dark) {
  .sb-frozen-item {
    background-color: var(--bg-color-dark, #1f2023);
    border-bottom-color: rgba(255,255,255,0.06);
  }
}

/* 不同级别的颜色，复用 H1–H6 的变量 */
html[data-theme="dark"] .sb-frozen-l1 { color: var(--h1-color-dark); }
html[data-theme="dark"] .sb-frozen-l2 { color: var(--h2-color-dark); }
html[data-theme="dark"] .sb-frozen-l3 { color: var(--h3-color-dark); }
html[data-theme="dark"] .sb-frozen-l4 { color: var(--h4-color-dark); }
html[data-theme="dark"] .sb-frozen-l5 { color: var(--h5-color-dark); }
html[data-theme="dark"] .sb-frozen-l6 { color: var(--h6-color-dark); }

html[data-theme="light"] .sb-frozen-l1 { color: var(--h1-color-light); }
html[data-theme="light"] .sb-frozen-l2 { color: var(--h2-color-light); }
html[data-theme="light"] .sb-frozen-l3 { color: var(--h3-color-light); }
html[data-theme="light"] .sb-frozen-l4 { color: var(--h4-color-light); }
html[data-theme="light"] .sb-frozen-l5 { color: var(--h5-color-light); }
html[data-theme="light"] .sb-frozen-l6 { color: var(--h6-color-light); }
```

```space-style
:root {
  /* Dark theme 颜色变量 */
  --h1-color-dark: #e6c8ff;
  --h2-color-dark: #a0d8ff;
  --h3-color-dark: #98ffb3;
  --h4-color-dark: #fff3a8;
  --h5-color-dark: #ffb48c;
  --h6-color-dark: #ffa8ff;

  /* Light theme 颜色变量 */
  --h1-color-light: #6b2e8c;
  --h2-color-light: #1c4e8b;
  --h3-color-light: #1a6644;
  --h4-color-light: #a67c00;
  --h5-color-light: #b84c1c;
  --h6-color-light: #993399;

  --title-opacity: 0.7;
}

/* 公共 H1–H6 行样式（编辑区内） */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  position: relative;
  opacity: var(--title-opacity);
  border-bottom-style: solid;
  border-bottom-width: 2px;
}

/* Dark Theme */
html[data-theme="dark"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; }
  .sb-line-h5 { font-size:1em !important;  color:var(--h5-color-dark)!important; }
  .sb-line-h6 { font-size:1em !important;  color:var(--h6-color-dark)!important; }
}

/* Light Theme */
html[data-theme="light"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; }
  .sb-line-h5 { font-size:1em !important;  color:var(--h5-color-light)!important; }
  .sb-line-h6 { font-size:1em !important;  color:var(--h6-color-light)!important; }
}

/* 高亮类：让激活的标题不透明 */
.sb-active {
  opacity: 1 !important;
}
```

### unified

```style
/* HHH v6 主题 CSS：标题配色 + hover 高亮 + 左上角冻结 branch */

/* 颜色变量 */
:root {
  /* Dark */
  --h1-color-dark: #e6c8ff;
  --h2-color-dark: #a0d8ff;
  --h3-color-dark: #98ffb3;
  --h4-color-dark: #fff3a8;
  --h5-color-dark: #ffb48c;
  --h6-color-dark: #ffa8ff;

  --h1-underline-dark: rgba(230,200,255,0.3);
  --h2-underline-dark: rgba(160,216,255,0.3);
  --h3-underline-dark: rgba(152,255,179,0.3);
  --h4-underline-dark: rgba(255,243,168,0.3);
  --h5-underline-dark: rgba(255,180,140,0.3);
  --h6-underline-dark: rgba(255,168,255,0.3);

  /* Light */
  --h1-color-light: #6b2e8c;
  --h2-color-light: #1c4e8b;
  --h3-color-light: #1a6644;
  --h4-color-light: #a67c00;
  --h5-color-light: #b84c1c;
  --h6-color-light: #993399;

  --h1-underline-light: rgba(107,46,140,0.3);
  --h2-underline-light: rgba(28,78,139,0.3);
  --h3-underline-light: rgba(26,102,68,0.3);
  --h4-underline-light: rgba(166,124,0,0.3);
  --h5-underline-light: rgba(184,76,28,0.3);
  --h6-underline-light: rgba(153,51,153,0.3);

  --title-opacity: 0.7;

  --h-bg-alpha-dark: 6%;   /* 深色 hover 背景透明度 */
  --h-bg-alpha-light: 8%;  /* 浅色 hover 背景透明度 */
}

/* 公共 H1–H6 行样式（编辑器内） */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  position: relative;
  opacity: var(--title-opacity);
  border-bottom-style: solid;
  border-bottom-width: 2px;
}

/* Dark Theme 标题色 + 下划线 */
html[data-theme="dark"] {
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: var(--h1-color-dark) !important;
    border-bottom-color: var(--h1-underline-dark);
  }
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: var(--h2-color-dark) !important;
    border-bottom-color: var(--h2-underline-dark);
  }
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: var(--h3-color-dark) !important;
    border-bottom-color: var(--h3-underline-dark);
  }
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: var(--h4-color-dark) !important;
    border-bottom-color: var(--h4-underline-dark);
  }
  .sb-line-h5 {
    font-size: 1em !important;
    color: var(--h5-color-dark) !important;
    border-bottom-color: var(--h5-underline-dark);
  }
  .sb-line-h6 {
    font-size: 1em !important;
    color: var(--h6-color-dark) !important;
    border-bottom-color: var(--h6-underline-dark);
  }
}

/* Light Theme 标题色 + 下划线 */
html[data-theme="light"] {
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: var(--h1-color-light) !important;
    border-bottom-color: var(--h1-underline-light);
  }
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: var(--h2-color-light) !important;
    border-bottom-color: var(--h2-underline-light);
  }
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: var(--h3-color-light) !important;
    border-bottom-color: var(--h3-underline-light);
  }
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: var(--h4-color-light) !important;
    border-bottom-color: var(--h4-underline-light);
  }
  .sb-line-h5 {
    font-size: 1em !important;
    color: var(--h5-color-light) !important;
    border-bottom-color: var(--h5-underline-light);
  }
  .sb-line-h6 {
    font-size: 1em !important;
    color: var(--h6-color-light) !important;
    border-bottom-color: var(--h6-underline-light);
  }
}

/* 激活高亮：标题变为不透明 */
.sb-active {
  opacity: 1 !important;
}

/* hover / .sb-active 背景微亮 */
html[data-theme="dark"] :is(.sb-line-h1,.sb-line-h2,.sb-line-h3,.sb-line-h4,.sb-line-h5,.sb-line-h6):is(:hover,.sb-active) {
  background-color: color-mix(in srgb, currentColor var(--h-bg-alpha-dark), transparent);
}

html[data-theme="light"] :is(.sb-line-h1,.sb-line-h2,.sb-line-h3,.sb-line-h4,.sb-line-h5,.sb-line-h6):is(:hover,.sb-active) {
  background-color: color-mix(in srgb, currentColor var(--h-bg-alpha-light), transparent);
}

/* ========== 冻结栏（左上角窄列，鼠标可穿透） ========== */

#sb-frozen-container {
  position: fixed;
  top: 4px;
  left: 0;              /* 实际 left 由 JS 用编辑区 rect.left 覆盖 */
  z-index: 1000;
  pointer-events: none; /* 整个容器鼠标穿透 */
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

/* 冻结项：自适应宽度的一小块标题牌 */
.sb-frozen-item {
  display: inline-block;
  width: auto;
  max-width: 40vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: none; /* 单个标题也不截获事件 */

  margin: 0 !important;
  padding: 0.1em 0.5em;
  border-radius: 4px;
  box-sizing: border-box;

  opacity: 1 !important;
  background-color: var(--bg-color, #ffffff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  font-family: inherit;
}

/* 暗色模式：背景和边线略调暗 */
@media (prefers-color-scheme: dark) {
  .sb-frozen-item {
    background-color: var(--bg-color-dark, #1f2023);
    border-bottom-color: rgba(255,255,255,0.06);
  }
}

/* 不同级别的颜色，复用 H1–H6 变量 */
html[data-theme="dark"] .sb-frozen-l1 { color: var(--h1-color-dark); }
html[data-theme="dark"] .sb-frozen-l2 { color: var(--h2-color-dark); }
html[data-theme="dark"] .sb-frozen-l3 { color: var(--h3-color-dark); }
html[data-theme="dark"] .sb-frozen-l4 { color: var(--h4-color-dark); }
html[data-theme="dark"] .sb-frozen-l5 { color: var(--h5-color-dark); }
html[data-theme="dark"] .sb-frozen-l6 { color: var(--h6-color-dark); }

html[data-theme="light"] .sb-frozen-l1 { color: var(--h1-color-light); }
html[data-theme="light"] .sb-frozen-l2 { color: var(--h2-color-light); }
html[data-theme="light"] .sb-frozen-l3 { color: var(--h3-color-light); }
html[data-theme="light"] .sb-frozen-l4 { color: var(--h4-color-light); }
html[data-theme="light"] .sb-frozen-l5 { color: var(--h5-color-light); }
html[data-theme="light"] .sb-frozen-l6 { color: var(--h6-color-light); }
```

### Previous

1. Remember to Cancel the `1st space-style block` from [[STYLE/Theme/HHH-css]]

```style
/* --- 基础变量 --- */
:root {
  --frozen-z-index: 1000;
  --frozen-bg-light: rgba(255, 255, 255, 0.98);
  --frozen-bg-dark: rgba(30, 30, 30, 0.98);
  --frozen-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --title-opacity: 0.4; /* 默认让标题淡一点，凸显高亮 */
}

/* 冻结容器：悬浮在编辑器顶部左侧的一列小牌子 */
#sb-frozen-container {
  position: fixed;
  top: 4px;          /* 距离顶部留一点空 */
  left: 0;           /* 实际 left 由 JS 用编辑区 rect.left 覆盖 */
  z-index: 1000;
  pointer-events: none;     /* 整个容器鼠标可穿透 */
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

/* 克隆出来的标题样式：窄、贴左、自适应宽度 */
.sb-frozen-clone {
  display: inline-block;
  width: auto;
  max-width: 40vw;          /* 最多占 40% 视口宽度，防止太长 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: none;     /* 单个标题也不截获鼠标事件 */

  margin: 0 !important;
  padding: 0.1em 0.5em;

  opacity: 1 !important;
  background-color: var(--bg-color, #ffffff);
  /* 修改：去掉圆角，使下划线平直 */
  border-radius: 0; 
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  font-family: inherit;
  box-sizing: border-box;
}

/* 暗色模式：只调背景颜色即可 */
@media (prefers-color-scheme: dark) {
  .sb-frozen-clone {
    background-color: var(--bg-color-dark, #1f2023);
    border-bottom-color: rgba(255,255,255,0.06);
  }
}

/* 隐藏克隆体内部的光标辅助元素，只保留文字 */
.sb-frozen-clone .cm-widgetBuffer, 
.sb-frozen-clone img {
  display: none;
}

html[data-theme="dark"] .sb-frozen-clone {
  background-color: var(--frozen-bg-dark);
}

/* --- 3. 原地标题的样式 --- */
/* 默认半透明 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  opacity: var(--title-opacity);
  transition: opacity 0.2s, background-color 0.2s;
}

/* 高亮状态 (JS 控制) */
.sb-active {
  opacity: 1 !important;
}

/* 鼠标 Hover 高亮 (CSS 辅助) */
.sb-line-h1:hover, .sb-line-h2:hover, .sb-line-h3:hover,
.sb-line-h4:hover, .sb-line-h5:hover, .sb-line-h6:hover {
  opacity: 1 !important;
}
```


1. https://chatgpt.com/share/68fd0e6f-19d8-8010-95b8-c0f80a829e9b

```style
:root {
  /* Dark theme 颜色变量 */
  --h1-color-dark: #e6c8ff;
  --h2-color-dark: #a0d8ff;
  --h3-color-dark: #98ffb3;
  --h4-color-dark: #fff3a8;
  --h5-color-dark: #ffb48c;
  --h6-color-dark: #ffa8ff;

  --h1-underline-dark: rgba(230,200,255,0.3);
  --h2-underline-dark: rgba(160,216,255,0.3);
  --h3-underline-dark: rgba(152,255,179,0.3);
  --h4-underline-dark: rgba(255,243,168,0.3);
  --h5-underline-dark: rgba(255,180,140,0.3);
  --h6-underline-dark: rgba(255,168,255,0.3);

  /* Light theme 颜色变量 */
  --h1-color-light: #6b2e8c;
  --h2-color-light: #1c4e8b;
  --h3-color-light: #1a6644;
  --h4-color-light: #a67c00;
  --h5-color-light: #b84c1c;
  --h6-color-light: #993399;

  --h1-underline-light: rgba(107,46,140,0.3);
  --h2-underline-light: rgba(28,78,139,0.3);
  --h3-underline-light: rgba(26,102,68,0.3);
  --h4-underline-light: rgba(166,124,0,0.3);
  --h5-underline-light: rgba(184,76,28,0.3);
  --h6-underline-light: rgba(153,51,153,0.3);

  --title-opacity: 0.7;
}

/* 公共 H1–H6 样式 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  position: relative;
  opacity: var(--title-opacity);
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-image-slice: 1;
}

/* Dark Theme */
html[data-theme="dark"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; border-bottom: 2px solid var(--h1-underline-dark); }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; border-bottom: 2px solid var(--h2-underline-dark); }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; border-bottom: 2px solid var(--h3-underline-dark); }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; border-bottom: 2px solid var(--h4-underline-dark); }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-dark)!important; border-bottom: 2px solid var(--h5-underline-dark); }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-dark)!important; border-bottom: 2px solid var(--h6-underline-dark); }
}

/* Light Theme */
html[data-theme="light"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; border-bottom: 2px solid var(--h1-underline-light); }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; border-bottom: 2px solid var(--h2-underline-light); }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; border-bottom: 2px solid var(--h3-underline-light); }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; border-bottom: 2px solid var(--h4-underline-light); }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-light)!important; border-bottom: 2px solid var(--h5-underline-light); }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-light)!important; border-bottom: 2px solid var(--h6-underline-light); }
}

/* 高亮类 */
.sb-active {
  opacity: 1 !important;
}
```

```space-style

:root {
  --h-bg-alpha-dark: 6%;   /* 深色主题 */
  --h-bg-alpha-light: 8%;  /* 浅色主题 */
}

/* 深色主题：hover 或 .sb-active 才上很淡背景 */
html[data-theme="dark"] .sb-line-h1:hover,
html[data-theme="dark"] .sb-line-h2:hover,
html[data-theme="dark"] .sb-line-h3:hover,
html[data-theme="dark"] .sb-line-h4:hover,
html[data-theme="dark"] .sb-line-h5:hover,
html[data-theme="dark"] .sb-line-h6:hover,
html[data-theme="dark"] .sb-active {
  background-color: color-mix(in srgb, currentColor var(--h-bg-alpha-dark), transparent);
}

/* 浅色主题：hover 或 .sb-active 才上很淡背景 */
html[data-theme="light"] .sb-line-h1:hover,
html[data-theme="light"] .sb-line-h2:hover,
html[data-theme="light"] .sb-line-h3:hover,
html[data-theme="light"] .sb-line-h4:hover,
html[data-theme="light"] .sb-line-h5:hover,
html[data-theme="light"] .sb-line-h6:hover,
html[data-theme="light"] .sb-active {
  background-color: color-mix(in srgb, currentColor var(--h-bg-alpha-light), transparent);
}

/* 深色：只在 hover 或 sb-active 时给标题行一个很淡的同色背景 */
html[data-theme="dark"] :is(.sb-line-h1,.sb-line-h2,.sb-line-h3,.sb-line-h4,.sb-line-h5,.sb-line-h6):is(:hover,.sb-active) {
  background-color: color-mix(in srgb, currentColor var(--h-bg-alpha-dark), transparent);
}

/* 浅色：同理 */
html[data-theme="light"] :is(.sb-line-h1,.sb-line-h2,.sb-line-h3,.sb-line-h4,.sb-line-h5,.sb-line-h6):is(:hover,.sb-active) {
  background-color: color-mix(in srgb, currentColor var(--h-bg-alpha-light), transparent);
}
```