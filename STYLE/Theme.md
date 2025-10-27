---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/STYLE/Theme.md"
udpateDate: 2025-10-27
---

# XczPhysics Theme

## JS (Experimental): Don't have to Install

### Step 1. Reload your space to load the space-lua from this page: ${widgets.commandButton("System: Reload")}

### Step 2. Save Library/PanelDragResize.js using this button: ${widgets.commandButton("Save HighlightHeadings.js")}

### Step 3. System Reload: ${widgets.commandButton("System: Reload")}

### Step 4. Reload UI: ${widgets.commandButton("Client: Reload UI")}

### Step 5. Enable HighlightHeadings: ${widgets.commandButton("Enable HighlightHeadings")}

1. borrowed some tech from [[CONFIG/View/Tree/Float]]

```space-lua
local jsCode = [[
const STATE_KEY = "__xhHighlightState";

function getLevelFromClass(el) {
  for (let i = 1; i <= 6; i++) {
    if (el.classList.contains(`sb-line-h${i}`)) return i;
  }
  return 0;
}

function pickGroupRoot(startHeading, containerRoot, groupSelector) {
  if (!groupSelector) return containerRoot;
  const g = startHeading.closest(groupSelector);
  return g || containerRoot;
}

function computeHighlightsByIndex(startHeading, groupRoot, headingSelector) {
  const list = Array.from(groupRoot.querySelectorAll(headingSelector));
  const startIdx = list.indexOf(startHeading);
  if (startIdx === -1) return [];

  const res = [startHeading];
  const startLevel = getLevelFromClass(startHeading);
  for (let i = startIdx + 1; i < list.length; i++) {
    const h = list[i];
    const lvl = getLevelFromClass(h);
    if (lvl <= startLevel) break; // 在同组内：遇到同级或更高级标题就停止
    res.push(h);
  }
  return res;
}

function clearAllActive(root) {
  root.querySelectorAll(".sb-active").forEach(el => el.classList.remove("sb-active"));
}

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector =
    opts.headingSelector ||
    ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";
  const groupSelector = opts.groupSelector || ".sb-title-group";
  const debug = !!opts.debug;

  const bind = () => {
    const containerRoot = document.querySelector(containerSelector);
    if (!containerRoot) {
      requestAnimationFrame(bind);
      return;
    }

    // Idempotent cleanup
    const prev = window[STATE_KEY];
    if (prev && prev.cleanup) prev.cleanup();

    let lastHeading = null;

    function onPointerOver(e) {
      const h = e.target && e.target.closest && e.target.closest(headingSelector);
      if (!h || !containerRoot.contains(h)) return;
      if (h === lastHeading) return;
      lastHeading = h;

      const groupRoot = pickGroupRoot(h, containerRoot, groupSelector);
      clearAllActive(containerRoot);

      const highs = computeHighlightsByIndex(h, groupRoot, headingSelector);
      highs.forEach(el => el.classList.add("sb-active"));

      if (debug) {
        const txt = (h.textContent || "").trim().slice(0, 80);
        console.log("[Highlight] heading:", txt, "level:", getLevelFromClass(h), "count:", highs.length);
      }
    }

    function onPointerOut(e) {
      const from = e.target && e.target.closest && e.target.closest(headingSelector);
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(headingSelector);
      if (from && (!to || !containerRoot.contains(to))) {
        lastHeading = null;
        clearAllActive(containerRoot);
      }
    }

    function onContainerLeave() {
      lastHeading = null;
      clearAllActive(containerRoot);
    }

    containerRoot.addEventListener("pointerover", onPointerOver);
    containerRoot.addEventListener("pointerout", onPointerOut);
    containerRoot.addEventListener("pointerleave", onContainerLeave);

    const mo = new MutationObserver(() => { lastHeading = null; });
    mo.observe(containerRoot, { childList: true, subtree: true });

    window[STATE_KEY] = {
      root: containerRoot,
      cleanup() {
        try {
          containerRoot.removeEventListener("pointerover", onPointerOver);
          containerRoot.removeEventListener("pointerout", onPointerOut);
          containerRoot.removeEventListener("pointerleave", onContainerLeave);
        } catch (e) {}
        try { mo.disconnect(); } catch (e) {}
        clearAllActive(containerRoot);
      }
    };

    if (debug) console.log("[Highlight] enabled");
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) {
    st.cleanup();
    window[STATE_KEY] = null;
    console.log("[Highlight] disabled");
  }
}
]]

command.define {
  name = "Save HighlightHeadings.js",
  hide = true,
  run = function()
    local jsFile = space.writeDocument("Library/HighlightHeadings.js", jsCode)
    editor.flashNotification("HighlightHeadings JS saved with size: " .. jsFile.size .. " bytes")
  end
}

command.define {
  name = "Enable HighlightHeadings",
  run = function()
    js.import("/.fs/Library/HighlightHeadings.js").enableHighlight()
  end
}

command.define {
  name = "Disable HighlightHeadings",
  hide = true,
  run = function()
    js.import("/.fs/Library/HighlightHeadings.js").disableHighlight()
  end
}
```

## CSS part

1. https://chatgpt.com/share/68fd2061-4ba0-8010-bf3a-842e67fb243e

```space-style
/* 默认半透明 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  opacity: var(--title-opacity);
  transition: opacity 0.2s;
}

/* 标题自身 hover 可高亮该标题 */
.sb-line-h1:hover,
.sb-line-h2:hover,
.sb-line-h3:hover,
.sb-line-h4:hover,
.sb-line-h5:hover,
.sb-line-h6:hover {
  opacity: 1 !important;
}

/* 仅保留 JS 驱动的高亮 */
.sb-active {
  opacity: 1 !important;
}
```

```
/* 默认半透明 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  opacity: var(--title-opacity);
  transition: opacity 0.2s;
}

/* 鼠标悬停在标题自身，高亮该标题 */
.sb-line-h1:hover,
.sb-line-h2:hover,
.sb-line-h3:hover,
.sb-line-h4:hover,
.sb-line-h5:hover,
.sb-line-h6:hover {
  opacity: 1 !important;
}

/* h1 hover → 高亮后续 h2–h6 */
.sb-line-h1:hover ~ .sb-line-h2,
.sb-line-h1:hover ~ .sb-line-h3,
.sb-line-h1:hover ~ .sb-line-h4,
.sb-line-h1:hover ~ .sb-line-h5,
.sb-line-h1:hover ~ .sb-line-h6 { opacity: 1 !important; }

/* h2 hover → 高亮后续 h3–h6 */
.sb-line-h2:hover ~ .sb-line-h3,
.sb-line-h2:hover ~ .sb-line-h4,
.sb-line-h2:hover ~ .sb-line-h5,
.sb-line-h2:hover ~ .sb-line-h6 { opacity: 1 !important; }

/* h3 hover → 高亮后续 h4–h6 */
.sb-line-h3:hover ~ .sb-line-h4,
.sb-line-h3:hover ~ .sb-line-h5,
.sb-line-h3:hover ~ .sb-line-h6 { opacity: 1 !important; }

/* h4 hover → 高亮后续 h5–h6 */
.sb-line-h4:hover ~ .sb-line-h5,
.sb-line-h4:hover ~ .sb-line-h6 { opacity: 1 !important; }

/* h5 hover → 高亮后续 h6 */
.sb-line-h5:hover ~ .sb-line-h6 { opacity: 1 !important; }

/* 可选：鼠标悬停整个内容区域（包裹标题+内容的容器），高亮该标题及所有子标题 */
.sb-title-group:hover .sb-line-h1,
.sb-title-group:hover .sb-line-h2,
.sb-title-group:hover .sb-line-h3,
.sb-title-group:hover .sb-line-h4,
.sb-title-group:hover .sb-line-h5,
.sb-title-group:hover .sb-line-h6 {
  opacity: 1 !important;
}
```

1. https://chatgpt.com/share/68fd0e6f-19d8-8010-95b8-c0f80a829e9b

```space-style
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
