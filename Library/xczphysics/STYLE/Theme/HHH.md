---
author: Chenzhu-Xie
name: Library/xczphysics/STYLE/Theme/HHH
tags: meta/library
files: 
- HHH.js
pageDecoration.prefix: "🎇 "
---

# HierarchyHighlightHeadings - HHH Theme

## JS Part

> **note** Note
> JS file now should be automatically downloaded and loaded.
> So, no need to carry out below 4 steps.

### Step 1. Reload your space to load the space-lua from this page: ${widgets.commandButton("System: Reload")}

### Step 2. Click ${widgets.commandButton("Save: HHH.js")}

### Step 3. System Reload: ${widgets.commandButton("System: Reload")}

### Step 4. Reload UI: ${widgets.commandButton("Client: Reload UI")}

1. borrowed `JS inject` from [[CONFIG/View/Tree/Float]]
2. https://community.silverbullet.md/t/hhh-hierarchyhighlightheadings-theme/3467
3. 这个 以及 Mr.Red 的 JS plug 像 [[PKM/Apps/Orca Note|]] 和 [[PKM/Apps/SiYuan|]] 的 JS plug
   - 速度和大小上 应该会输于 [[PKM/Apps/SilverBullet|]] 的 编译后的 TS .plug.js

> **danger** Danger
> when remove this plug, better first: ${widgets.commandButton("Delete: HHH.js")}

```space-lua
local jsCode = [[
// Library/xczphysics/STYLE/Theme/HHH.js
// HHH v12 - 分列 + 悬浮展开
// 1. Feature: 超过半屏高度时自动分列
// 2. Feature: 标题初始宽度限制，悬浮展开

const STATE_KEY = "__xhHighlightState_v12";

// ==========================================
// 1. Model: 数据模型
// ==========================================

const DataModel = {
  headings: [], 
  lastText: null,

  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) { console.warn(e); }
    return "";
  },

  rebuildSync() {
    const text = this.getFullText();
    if (text === this.lastText && this.headings.length > 0) return;

    this.lastText = text;
    this.headings = [];
    
    if (!text) return;

    // 1. 预先扫描所有代码块的范围
    const codeBlockRanges = [];
    const codeBlockRegex = /```[\s\S]*?```/gm;
    let blockMatch;
    while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
      codeBlockRanges.push({
        start: blockMatch.index,
        end: blockMatch.index + blockMatch[0].length
      });
    }

    // 2. 扫描标题
    const regex = /^(#{1,6})\s+([^\n]*)$/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      const isInsideCodeBlock = codeBlockRanges.some(range => 
        matchIndex >= range.start && matchIndex < range.end
      );

      if (isInsideCodeBlock) continue;

      this.headings.push({
        index: this.headings.length,
        level: match[1].length,
        text: match[2].trim(),
        start: matchIndex,
        end: matchIndex + match[0].length
      });
    }
  },

  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    let bestIndex = -1;
    for (let i = 0; i < this.headings.length; i++) {
      if (this.headings[i].start <= pos) {
        bestIndex = i;
      } else {
        break;
      }
    }
    return bestIndex;
  },

  getFamilyIndices(targetIndex) {
    const indices = new Set();
    if (targetIndex < 0 || targetIndex >= this.headings.length) return indices;

    const target = this.headings[targetIndex];
    indices.add(targetIndex);

    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        indices.add(i);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }

    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break;
      indices.add(i);
    }

    return indices;
  },
  
  getAncestors(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [target];
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        list.unshift(h);
        currentLevel = h.level;
      }
    }
    return list;
  },

  getDescendants(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [];
    
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break;
      list.push(h);
    }
    return list;
  }
};

// ==========================================
// 2. View: 视图渲染
// ==========================================

const View = {
  topContainerId: "sb-frozen-container-top",
  bottomContainerId: "sb-frozen-container-bottom",

  getContainer(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = "sb-frozen-container";
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.display = "none";
      el.style.pointerEvents = "auto";
      document.body.appendChild(el);
    }
    return el;
  },

  /**
   * 将项目列表分成多列
   */
  splitIntoColumns(items, itemHeight = 26) {
    const maxHeight = window.innerHeight * 0.45;
    const maxItemsPerCol = Math.max(3, Math.floor(maxHeight / itemHeight));
    
    const columns = [];
    for (let i = 0; i < items.length; i += maxItemsPerCol) {
      columns.push(items.slice(i, i + maxItemsPerCol));
    }
    return columns;
  },

  /**
   * 创建可悬浮展开的标题项
   */
  createHeadingItem(h, baseLevel = 1) {
    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;
    
    // 截断显示文本
    const maxLen = 20;
    const shortText = h.text.length > maxLen ? h.text.substring(0, maxLen) + "…" : h.text;
    const fullText = h.text;
    
    div.textContent = shortText;
    div.title = fullText;
    div.dataset.fullText = fullText;
    div.dataset.shortText = shortText;
    
    div.style.margin = "1px 0";
    div.style.cursor = "pointer";
    
    // 缩进
    if (baseLevel > 0) {
      const indent = (h.level - baseLevel) * 10;
      if (indent > 0) {
        div.style.marginLeft = `${indent}px`;
      }
    }
    
    // 悬浮展开
    div.addEventListener("mouseenter", () => {
      if (fullText !== shortText) {
        div.textContent = fullText;
        div.classList.add("sb-frozen-expanded");
      }
    });
    
    div.addEventListener("mouseleave", () => {
      div.textContent = shortText;
      div.classList.remove("sb-frozen-expanded");
    });
    
    // 点击导航
    div.onclick = (e) => {
      e.stopPropagation();
      if (window.client) {
        const pagePath = client.currentPath();
        client.navigate({
          path: pagePath,
          details: { type: "header", header: h.text }
        });
      }
    };
    
    return div;
  },

  renderTopBar(targetIndex, container) {
    const el = this.getContainer(this.topContainerId);
    if (targetIndex === -1) {
      el.style.display = "none";
      return;
    }

    const list = DataModel.getAncestors(targetIndex);
    if (list.length === 0) {
      el.style.display = "none";
      return;
    }

    if (container) {
      const rect = container.getBoundingClientRect();
      el.style.left = (rect.left + 45) + "px";
      el.style.top = (rect.top + 30) + "px";
    }

    el.innerHTML = "";
    el.style.display = "flex";
    el.style.flexDirection = "row";
    el.style.gap = "8px";
    el.style.alignItems = "flex-start";

    // 分列
    const columns = this.splitIntoColumns(list);

    columns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-frozen-col";
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.alignItems = "flex-start";
      col.style.gap = "2px";

      if (colIndex === 0) {
        const label = document.createElement("div");
        label.textContent = "Context:";
        label.style.fontSize = "10px";
        label.style.opacity = "0.5";
        label.style.marginBottom = "2px";
        label.style.pointerEvents = "none";
        col.appendChild(label);
      } else {
        const spacer = document.createElement("div");
        spacer.textContent = "·";
        spacer.style.fontSize = "10px";
        spacer.style.opacity = "0.3";
        spacer.style.marginBottom = "2px";
        col.appendChild(spacer);
      }

      columnItems.forEach(h => {
        col.appendChild(this.createHeadingItem(h, 1));
      });

      el.appendChild(col);
    });
  },

  renderBottomBar(targetIndex, container) {
    const el = this.getContainer(this.bottomContainerId);
    if (targetIndex === -1) {
      el.style.display = "none";
      return;
    }

    const list = DataModel.getDescendants(targetIndex);
    if (list.length === 0) {
      el.style.display = "none";
      return;
    }

    if (container) {
      const rect = container.getBoundingClientRect();
      el.style.left = (rect.left + 45) + "px";
      el.style.bottom = "30px";
      el.style.top = "auto";
    }

    el.innerHTML = "";
    el.style.display = "flex";
    el.style.flexDirection = "row";
    el.style.gap = "8px";
    el.style.alignItems = "flex-end";

    const baseLevel = DataModel.headings[targetIndex]?.level || 1;

    // 分列
    const columns = this.splitIntoColumns(list);

    columns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-frozen-col";
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.alignItems = "flex-start";
      col.style.gap = "2px";

      if (colIndex === 0) {
        const label = document.createElement("div");
        label.textContent = "Sub-sections:";
        label.style.fontSize = "10px";
        label.style.opacity = "0.5";
        label.style.marginBottom = "2px";
        label.style.pointerEvents = "none";
        col.appendChild(label);
      } else {
        const spacer = document.createElement("div");
        spacer.textContent = "·";
        spacer.style.fontSize = "10px";
        spacer.style.opacity = "0.3";
        spacer.style.marginBottom = "2px";
        col.appendChild(spacer);
      }

      columnItems.forEach(h => {
        col.appendChild(this.createHeadingItem(h, baseLevel));
      });

      el.appendChild(col);
    });
  },

  applyHighlights(container, activeIndices) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    visibleHeadings.forEach(el => {
      try {
        const pos = view.posAtDOM(el);
        const idx = DataModel.findHeadingIndexByPos(pos + 1);
        
        if (idx !== -1 && activeIndices.has(idx)) {
          const h = DataModel.headings[idx];
          if (pos >= h.start - 50 && pos <= h.end + 50) {
            el.classList.add("sb-active");
            if (idx === window[STATE_KEY].currentIndex) {
              el.classList.add("sb-active-current");
            } else {
              const mainIdx = window[STATE_KEY].currentIndex;
              const currentLevel = DataModel.headings[mainIdx].level;
              if (idx < mainIdx && DataModel.headings[idx].level < currentLevel) {
                el.classList.add("sb-active-anc");
              } else {
                el.classList.add("sb-active-desc");
              }
            }
          }
        }
      } catch (e) {}
    });
  }
};

// ==========================================
// 3. Controller: 事件控制
// ==========================================

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container || !window.client || !client.editorView) {
      requestAnimationFrame(bind);
      return;
    }

    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    window[STATE_KEY] = {
      currentIndex: -1,
      cleanup: null,
      updateTimeout: null
    };

    function updateState(targetIndex) {
      window[STATE_KEY].currentIndex = targetIndex;

      if (targetIndex === -1) {
        View.applyHighlights(container, null);
        View.renderTopBar(-1, container);
        View.renderBottomBar(-1, container);
        return;
      }

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      View.applyHighlights(container, familyIndices);
      View.renderTopBar(targetIndex, container);
      View.renderBottomBar(targetIndex, container);
    }

    function onPointerOver(e) {
      if (!container.contains(e.target)) return;

      try {
        const pos = client.editorView.posAtCoords({x: e.clientX, y: e.clientY});
        if (pos != null) {
          const idx = DataModel.findHeadingIndexByPos(pos);
          if (idx !== window[STATE_KEY].currentIndex || !document.querySelector(".sb-active")) {
            updateState(idx);
          }
        }
      } catch (err) { }
    }

    function onCursorActivity(e) {
      if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
      
      window[STATE_KEY].updateTimeout = setTimeout(() => {
        try {
          const state = client.editorView.state;
          const pos = state.selection.main.head;
          const idx = DataModel.findHeadingIndexByPos(pos);
          updateState(idx);
        } catch (e) {}
      }, 50);
    }

    let isScrolling = false;
    function handleScroll() {
      if (container.matches(":hover")) {
        isScrolling = false;
        return;
      }
      
      const viewportTopPos = client.editorView.viewport.from;
      const idx = DataModel.findHeadingIndexByPos(viewportTopPos + 50);
      updateState(idx);
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }
    
    const mo = new MutationObserver((mutations) => {
      if (window[STATE_KEY].currentIndex !== -1) {
        const activeEl = container.querySelector(".sb-active");
        if (!activeEl) {
          const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
          View.applyHighlights(container, familyIndices);
        }
      }
    });
    mo.observe(container, { childList: true, subtree: true, attributes: false });

    container.addEventListener("pointerover", onPointerOver); 
    container.addEventListener("click", onCursorActivity);
    container.addEventListener("keyup", onCursorActivity);
    window.addEventListener("scroll", onScroll, { passive: true });

    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("pointerover", onPointerOver);
      container.removeEventListener("click", onCursorActivity);
      container.removeEventListener("keyup", onCursorActivity);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
      
      View.applyHighlights(container, null);
      const top = document.getElementById(View.topContainerId);
      const bot = document.getElementById(View.bottomContainerId);
      if (top) top.remove();
      if (bot) bot.remove();
      DataModel.headings = [];
    };

    console.log("[HHH] v12 Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
]]

command.define {
  name = "Save: HHH.js",
  hide = true,
  run = function()
    local jsFile = space.writeDocument("Library/xczphysics/STYLE/Theme/HHH.js", jsCode)
    editor.flashNotification("HHH JS saved (" .. jsFile.size .. " bytes)")
  end
}

command.define {
  name = "Delete: HHH.js",
  hide = true,
  run = function()
    space.deleteDocument("Library/xczphysics/STYLE/Theme/HHH.js")
    editor.flashNotification("JS-File deleted")
  end
}

```


```lua
command.define {
  name = "Enable: HierarchyHighlightHeadings",
  run = function()
    js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").enableHighlight()
  end
}

command.define {
  name = "Disable HierarchyHighlightHeadings",
  run = function()
    js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").disableHighlight()
  end
}
```

1. borrowed `event.listen` from [[CONFIG/Edit/Read_Only_Toggle]]

```space-lua
-- event.listen {
--   name = 'system:ready',
--   run = function(e)
--     js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").enableHighlight()
--   end
-- }

js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").enableHighlight()
```

## CSS part

### split

```space-style
/* =========================================
   统一主题样式 - HHH + LinkFloater v4
   ========================================= */

/* =========================================
   1. 共享变量
   ========================================= */
:root {
  /* Dark theme colors */
  --h1-color-dark: #e6c8ff;
  --h2-color-dark: #a0d8ff;
  --h3-color-dark: #98ffb3;
  --h4-color-dark: #fff3a8;
  --h5-color-dark: #ffb48c;
  --h6-color-dark: #ffa8ff;

  /* Light theme colors */
  --h1-color-light: #6b2e8c;
  --h2-color-light: #1c4e8b;
  --h3-color-light: #1a6644;
  --h4-color-light: #a67c00;
  --h5-color-light: #b84c1c;
  --h6-color-light: #993399;

  --title-opacity: 0.5;
  
  /* LinkFloater colors */
  --link-local-color: #4caf50;
  --link-remote-color: #2196f3;
  --link-backlink-color: #ff9800;
}

/* =========================================
   2. 共享基础样式
   ========================================= */
.sb-frozen-item,
.sb-floater-btn {
  display: inline-block;
  width: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: auto;
  cursor: pointer;

  margin: 0;
  padding: 0.2em 0.6em;
  border-radius: 4px;
  box-sizing: border-box;

  opacity: 0.8;
  background-color: var(--bg-color, #ffffff);
  
  /* 完整边框（透明） */
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  font-family: inherit;
  transition: all 0.15s ease-out;
}

/* 悬浮效果 - 包含完整边框（顶边和底边） */
.sb-frozen-item:hover,
.sb-frozen-item.sb-frozen-expanded,
.sb-floater-btn:hover,
.sb-floater-btn.sb-floater-expanded {
  opacity: 1;
  z-index: 1001;
  max-width: none;
  filter: brightness(0.95) contrast(0.95);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  /* 完整边框高亮 */
  border: 1px solid currentColor;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .sb-frozen-item,
  .sb-floater-btn {
    background-color: var(--bg-color-dark, #252629);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .sb-frozen-item:hover,
  .sb-floater-btn:hover {
    background-color: #333;
    filter: brightness(1.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    border: 1px solid currentColor;
  }
}

html[data-theme="dark"] .sb-frozen-item,
html[data-theme="dark"] .sb-floater-btn {
  background-color: var(--bg-color-dark, #252629);
  border-color: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

html[data-theme="dark"] .sb-frozen-item:hover,
html[data-theme="dark"] .sb-floater-btn:hover {
  background-color: #333;
  filter: brightness(1.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  border: 1px solid currentColor;
}

/* =========================================
   3. HHH 专用样式
   ========================================= */

#sb-frozen-container-top,
#sb-frozen-container-bottom {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
  pointer-events: none;
}

.sb-frozen-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  pointer-events: auto;
}

.sb-frozen-header {
  font-size: 10px;
  opacity: 0.5;
  margin-bottom: 2px;
  pointer-events: none;
}

/* 标题项容器（包含树状连接、按钮、层级标识） */
.sb-frozen-item-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

/* HHH 专用：宽度限制 */
.sb-frozen-item {
  max-width: 40vw;
}

.sb-frozen-item:hover {
  transform: translateY(-1px);
}

/* 树状连接线 */
.sb-frozen-tree {
  font-family: monospace;
  font-size: 11px;
  opacity: 0.4;
  color: currentColor;
  white-space: pre;
  line-height: 1.2;
  pointer-events: none;
  user-select: none;
}

.sb-frozen-item-wrapper:hover .sb-frozen-tree {
  opacity: 0.8;
}

/* 层级标识 (H1-H6) */
.sb-frozen-level {
  font-size: 9px;
  font-weight: bold;
  opacity: 0.4;
  padding: 1px 3px;
  border-radius: 2px;
  background-color: currentColor;
  color: var(--bg-color, #fff);
  line-height: 1;
  pointer-events: none;
  user-select: none;
  margin-left: -2px;
  align-self: flex-end;
}

/* 层级标识悬浮高亮 */
.sb-frozen-item-wrapper:hover .sb-frozen-level {
  opacity: 0.7;
}

/* HHH 层级指示器 */
.sb-frozen-level-indicator {
  position: absolute;
  left: 2px;
  bottom: 0px;
  font-size: 8px;
  opacity: 0.4;
  font-family: monospace;
  pointer-events: none;
  transition: opacity 0.15s;
}

.sb-frozen-item:hover .sb-frozen-level-indicator,
.sb-frozen-item.sb-frozen-expanded .sb-frozen-level-indicator {
  opacity: 0.8;
}

/* 树状结构前缀 */
.sb-frozen-tree-prefix {
  color: var(--secondary-text-color, #888);
  user-select: none;
}

.sb-frozen-item-wrapper:hover .sb-frozen-tree-prefix {
  opacity: 0.8;
}

/* 层级标识颜色反转 */
html[data-theme="dark"] .sb-frozen-level {
  color: #1a1a1a;
}

html[data-theme="light"] .sb-frozen-level {
  color: #fff;
}

/* 标题颜色 */
html[data-theme="dark"] .sb-frozen-l1,
html[data-theme="dark"] .sb-frozen-item-wrapper.sb-frozen-l1 { color: var(--h1-color-dark); }
html[data-theme="dark"] .sb-frozen-l2,
html[data-theme="dark"] .sb-frozen-item-wrapper.sb-frozen-l2 { color: var(--h2-color-dark); }
html[data-theme="dark"] .sb-frozen-l3,
html[data-theme="dark"] .sb-frozen-item-wrapper.sb-frozen-l3 { color: var(--h3-color-dark); }
html[data-theme="dark"] .sb-frozen-l4,
html[data-theme="dark"] .sb-frozen-item-wrapper.sb-frozen-l4 { color: var(--h4-color-dark); }
html[data-theme="dark"] .sb-frozen-l5,
html[data-theme="dark"] .sb-frozen-item-wrapper.sb-frozen-l5 { color: var(--h5-color-dark); }
html[data-theme="dark"] .sb-frozen-l6,
html[data-theme="dark"] .sb-frozen-item-wrapper.sb-frozen-l6 { color: var(--h6-color-dark); }

html[data-theme="light"] .sb-frozen-l1,
html[data-theme="light"] .sb-frozen-item-wrapper.sb-frozen-l1 { color: var(--h1-color-light); }
html[data-theme="light"] .sb-frozen-l2,
html[data-theme="light"] .sb-frozen-item-wrapper.sb-frozen-l2 { color: var(--h2-color-light); }
html[data-theme="light"] .sb-frozen-l3,
html[data-theme="light"] .sb-frozen-item-wrapper.sb-frozen-l3 { color: var(--h3-color-light); }
html[data-theme="light"] .sb-frozen-l4,
html[data-theme="light"] .sb-frozen-item-wrapper.sb-frozen-l4 { color: var(--h4-color-light); }
html[data-theme="light"] .sb-frozen-l5,
html[data-theme="light"] .sb-frozen-item-wrapper.sb-frozen-l5 { color: var(--h5-color-light); }
html[data-theme="light"] .sb-frozen-l6,
html[data-theme="light"] .sb-frozen-item-wrapper.sb-frozen-l6 { color: var(--h6-color-light); }

/* 编辑器内标题样式 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  position: relative;
  opacity: var(--title-opacity);
  border-bottom: none !important;
  background-image: linear-gradient(90deg, currentColor, transparent);
  background-size: 100% 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: opacity 0.15s;
}

html[data-theme="dark"] .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; }
html[data-theme="dark"] .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; }
html[data-theme="dark"] .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; }
html[data-theme="dark"] .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; }
html[data-theme="dark"] .sb-line-h5 { font-size:1em !important;  color:var(--h5-color-dark)!important; }
html[data-theme="dark"] .sb-line-h6 { font-size:1em !important;  color:var(--h6-color-dark)!important; }

html[data-theme="light"] .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; }
html[data-theme="light"] .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; }
html[data-theme="light"] .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; }
html[data-theme="light"] .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; }
html[data-theme="light"] .sb-line-h5 { font-size:1em !important;  color:var(--h5-color-light)!important; }
html[data-theme="light"] .sb-line-h6 { font-size:1em !important;  color:var(--h6-color-light)!important; }

/* 高亮状态 */
.sb-active { opacity: 1 !important; }

.sb-active::before {
  content: "";
  position: absolute;
  top: -2px; 
  left: -4px; 
  right: -4px; 
  bottom: 0;
  background-color: currentColor;
  opacity: 0.15; 
  z-index: -1;
  pointer-events: none;
  border-radius: 4px;
}

/* =========================================
   4. LinkFloater 专用样式
   ========================================= */

.sb-floater-container {
  position: fixed;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
  font-family: inherit;
  font-size: 12px;
}

.sb-floater-wrapper {
  display: flex;
  flex-direction: row;
  gap: 6px;
  pointer-events: auto;
}

.sb-floater-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  pointer-events: auto;
}

.sb-floater-header {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--secondary-text-color, #888);
  opacity: 0.6;
  margin-bottom: 2px;
  margin-right: 2px;
  font-weight: bold;
  pointer-events: none;
}

/* LinkFloater 专用：宽度限制 */
.sb-floater-btn {
  max-width: 120px;
}

.sb-floater-btn:hover {
  transform: translateX(-2px);
}

/* 链接类型颜色 + 左侧条 */
.sb-floater-local {
  border-left: 3px solid var(--link-local-color);
  color: var(--link-local-color);
}

.sb-floater-remote {
  border-left: 3px solid var(--link-remote-color);
  color: var(--link-remote-color);
  font-weight: bold;
}

.sb-floater-backlink {
  border-right: 3px solid var(--link-backlink-color);
  border-left-width: 1px;
  color: var(--link-backlink-color);
}

/* 悬浮时保持类型边框 + 完整边框 */
.sb-floater-local:hover {
  border: 1px solid var(--link-local-color);
  border-left: 3px solid var(--link-local-color);
}

.sb-floater-remote:hover {
  border: 1px solid var(--link-remote-color);
  border-left: 3px solid var(--link-remote-color);
}

.sb-floater-backlink:hover {
  border: 1px solid var(--link-backlink-color);
  border-right: 3px solid var(--link-backlink-color);
}

html[data-theme="dark"] .sb-floater-local { 
  color: #81c784; 
  border-left-color: #81c784;
}
html[data-theme="dark"] .sb-floater-remote { 
  color: #64b5f6; 
  border-left-color: #64b5f6;
}
html[data-theme="dark"] .sb-floater-backlink { 
  color: #ffb74d; 
  border-right-color: #ffb74d;
}

html[data-theme="dark"] .sb-floater-local:hover {
  border-color: #81c784;
  border-left: 3px solid #81c784;
}
html[data-theme="dark"] .sb-floater-remote:hover {
  border-color: #64b5f6;
  border-left: 3px solid #64b5f6;
}
html[data-theme="dark"] .sb-floater-backlink:hover {
  border-color: #ffb74d;
  border-right: 3px solid #ffb74d;
}
```
