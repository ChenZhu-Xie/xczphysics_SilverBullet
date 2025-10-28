---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/STYLE/Theme.md"
udpateDate: 2025-10-27
---

# XczPhysics Theme

## JS Part (Experimental)

### Step 1. Reload your space to load the space-lua from this page: ${widgets.commandButton("System: Reload")}

### Step 2. Save Library/PanelDragResize.js using this button: ${widgets.commandButton("Save: HierarchyHighlightHeadings.js")}

### Step 3. System Reload: ${widgets.commandButton("System: Reload")}

### Step 4. Reload UI: ${widgets.commandButton("Client: Reload UI")}

### Step 5. Enable: HierarchyHighlightHeadings: ${widgets.commandButton("Enable: HierarchyHighlightHeadings")}

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
```

```space-lua
command.define {
  name = "Save: HierarchyHighlightHeadings.js",
  hide = true,
  run = function()
    local jsFile = space.writeDocument("Library/HierarchyHighlightHeadings.js", jsCode)
    editor.flashNotification("HierarchyHighlightHeadings JS saved with size: " .. jsFile.size .. " bytes")
  end
}

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

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    js.import("/.fs/Library/HierarchyHighlightHeadings.js").enableHighlight()
  end
}
```

## CSS part

1. Remember to Cancel the `1st space-style block` from [[STYLE/Theme/XczPhysics]]

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


