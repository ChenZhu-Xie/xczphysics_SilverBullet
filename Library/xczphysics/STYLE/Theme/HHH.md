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

### Step 1. Reload your space to load the space-lua from this page: ${widgets.commandButton("System: Reload")}

### Step 2. Click ${widgets.commandButton("Save: HHH.js")}

### Step 3. System Reload: ${widgets.commandButton("System: Reload")}

### Step 4. Reload UI: ${widgets.commandButton("Client: Reload UI")}

1. borrowed `JS inject` from [[CONFIG/View/Tree/Float]]
2. https://community.silverbullet.md/t/hhh-hierarchyhighlightheadings-theme/3467
3. 这个 以及 Mr.Red 的 JS plug 像 [[PKM/Apps/Orca Note|]] 和 [[PKM/Apps/SiYuan|]] 的 JS plug
   - 速度和大小上 应该会输于 [[PKM/Apps/SilverBullet|]] 的 编译后的 TS .plug.js

> **danger** Danger
> for test: ${widgets.commandButton("Delete: HHH.js")}

```space-lua
local jsCode = [[
// Library/xczphysics/STYLE/Theme/HHH.js
// HHH v11-FixAndFeatures
// 1. Fix: Robust highlighting on hover/edit (added delays for DOM updates)
// 2. Feature: Background highlight with transparency
// 3. Feature: Gradient underline

const STATE_KEY = "__xhHighlightState_v11";

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
    // 即使文本没变，如果 headings 为空也需要重建（初始化情况）
    if (text === this.lastText && this.headings.length > 0) return;

    this.lastText = text;
    this.headings = [];
    
    if (!text) return;

    // 1. 预先扫描所有代码块的范围，用于后续排除
    const codeBlockRanges = [];
    // 匹配 ``` ... ``` 包裹的内容 (非贪婪模式)
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
      
      // 3. 检查当前匹配到的 # 是否在代码块范围内
      const isInsideCodeBlock = codeBlockRanges.some(range => 
        matchIndex >= range.start && matchIndex < range.end
      );

      // 如果在代码块内，则跳过，不将其视为标题
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
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.display = "none";
      el.style.flexDirection = "column";
      el.style.alignItems = "flex-start";
      el.style.pointerEvents = "auto";
      document.body.appendChild(el);
    }
    return el;
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
    
    const label = document.createElement("div");
    label.textContent = "Context:";
    label.style.fontSize = "10px";
    label.style.opacity = "0.5";
    label.style.marginBottom = "2px";
    label.style.pointerEvents = "none";
    el.appendChild(label);

    list.forEach(h => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      div.style.margin = "1px 0";
      div.style.cursor = "pointer";
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
      el.appendChild(div);
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

    const label = document.createElement("div");
    label.textContent = "Sub-sections:";
    label.style.fontSize = "10px";
    label.style.opacity = "0.5";
    label.style.marginBottom = "2px";
    label.style.pointerEvents = "none";
    el.appendChild(label);

    list.forEach(h => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      div.style.margin = "1px 0";
      const indent = (h.level - DataModel.headings[targetIndex].level) * 10;
      div.style.marginLeft = `${indent}px`;
      div.style.cursor = "pointer";
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
      el.appendChild(div);
    });
  },

  // DOM 高亮逻辑
  applyHighlights(container, activeIndices) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    // 先清除旧的高亮，防止状态残留
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    // 扩大查找范围，确保能找到所有标题行
    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    visibleHeadings.forEach(el => {
      try {
        const pos = view.posAtDOM(el);
        // 使用 posAtDOM 有时会偏差，增加一定容错
        const idx = DataModel.findHeadingIndexByPos(pos + 1);
        
        if (idx !== -1 && activeIndices.has(idx)) {
            // 再次确认位置是否匹配（防止误判）
            const h = DataModel.headings[idx];
            // 只要 DOM 元素位置在标题范围内即可
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
      // 即使 index 没变，也要重新 applyHighlights，因为 DOM 可能重绘了（例如打字时）
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

    // --- Event Handlers ---

    function onPointerOver(e) {
      if (!container.contains(e.target)) return;

      try {
        // 优先使用 posAtCoords，这比 target.closest 更准确，尤其是对于复杂的 CodeMirror 结构
        const pos = client.editorView.posAtCoords({x: e.clientX, y: e.clientY});
        if (pos != null) {
          const idx = DataModel.findHeadingIndexByPos(pos);
          // 只有当索引变化时才触发，避免高频闪烁，但要确保高亮存在
          if (idx !== window[STATE_KEY].currentIndex || !document.querySelector(".sb-active")) {
             updateState(idx);
          }
        }
      } catch (err) { }
    }

    // 编辑或点击时的处理
    function onCursorActivity(e) {
      // 使用 setTimeout 是关键修复：
      // 当用户打字（keyup）时，CodeMirror 需要几毫秒来更新 DOM（添加 .sb-line-hX 类）。
      // 如果立即执行，querySelectorAll 找不到新生成的标题元素，导致高亮失败。
      if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
      
      window[STATE_KEY].updateTimeout = setTimeout(() => {
        try {
            // 两种策略：如果有鼠标位置用鼠标，否则用光标
            // 这里主要处理编辑，所以优先用光标位置
            const state = client.editorView.state;
            const pos = state.selection.main.head;
            const idx = DataModel.findHeadingIndexByPos(pos);
            updateState(idx);
        } catch (e) {}
      }, 50); // 50ms 延迟通常足够等待 DOM 更新
    }

    let isScrolling = false;
    function handleScroll() {
      // 滚动时如果鼠标在悬停，不强制改变（防止冲突），除非需要跟随视口
      // 但为了持续高亮，我们允许滚动更新顶部索引
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
    
    // 监听 DOM 变化，防止 CodeMirror 重绘导致高亮丢失
    const mo = new MutationObserver((mutations) => {
        // 只有当实际上有高亮需求时才重绘
        if (window[STATE_KEY].currentIndex !== -1) {
           // 检查是否丢失了高亮类
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
    container.addEventListener("keyup", onCursorActivity); // 确保键盘编辑时触发
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

    console.log("[HHH] v11-FixAndFeatures Enabled");
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


```space-lua
command.define {
  name = "Enable: HierarchyHighlightHeadings",
  run = function()
    js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").enableHighlight()
  end
}

command.define {
  name = "Disable HierarchyHighlightHeadings",
  hide = true,
  run = function()
    js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").disableHighlight()
  end
}
```

1. borrowed `event.listen` from [[CONFIG/Edit/Read_Only_Toggle]]

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").enableHighlight()
  end
}
```

## CSS part

### split


```space-style
/* =========================================
   1. 容器样式 (Navigation Bars)
   ========================================= */
#sb-frozen-container-top,
#sb-frozen-container-bottom {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
  pointer-events: none;
}

/* =========================================
   2. 导航胶囊样式 (Pills)
   ========================================= */
.sb-frozen-item {
  display: inline-block;
  width: auto;
  max-width: 40vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: auto;
  cursor: pointer;

  margin: 0 !important;
  padding: 0.2em 0.6em;
  border-radius: 4px;
  box-sizing: border-box;

  opacity: 0.8 !important; 
  background-color: var(--bg-color, #ffffff);
  
  border: 1px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  font-family: inherit;
  transition: all 0.15s ease-out;
}

.sb-frozen-item:hover {
  opacity: 1 !important; 
  z-index: 1001;
  filter: brightness(0.95) contrast(0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  border-color: currentColor; 
}

@media (prefers-color-scheme: dark) {
  .sb-frozen-item {
    background-color: var(--bg-color-dark, #252629);
    border-bottom-color: rgba(255,255,255,0.06);
  }
  .sb-frozen-item:hover {
    background-color: #333;
    filter: brightness(1.2);
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  }
}

/* =========================================
   3. 颜色定义 (Colors)
   ========================================= */
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
}

/* =========================================
   4. 编辑器内标题样式 (Editor Headings)
   ========================================= */

/* 基础样式：渐变下划线 (Feature 2) */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  position: relative; /* 为伪元素定位做准备 */
  opacity: var(--title-opacity);
  
  /* 移除原本的实线边框 */
  border-bottom: none !important;
  
  /* 新增：从左往右渐暗的下划线 */
  /* 使用 currentColor 自动匹配标题颜色 */
  background-image: linear-gradient(90deg, currentColor, transparent);
  background-size: 100% 2px; /* 宽度100%，高度2px */
  background-position: 0 100%; /* 位于底部 */
  background-repeat: no-repeat;
  
  transition: opacity 0.15s;
}

/* 字体大小与颜色映射 (保持不变) */
html[data-theme="dark"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; }
  .sb-line-h5 { font-size:1em !important;  color:var(--h5-color-dark)!important; }
  .sb-line-h6 { font-size:1em !important;  color:var(--h6-color-dark)!important; }
}

html[data-theme="light"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; }
  .sb-line-h5 { font-size:1em !important;  color:var(--h5-color-light)!important; }
  .sb-line-h6 { font-size:1em !important;  color:var(--h6-color-light)!important; }
}

/* =========================================
   5. 高亮状态 (Active State)
   ========================================= */

/* 激活时增加不透明度 */
.sb-active {
  opacity: 1 !important;
}

/* 新增：高亮时的背景色块 (Feature 1) */
/* 使用 ::before 伪元素来实现背景色，并应用透明度 */
.sb-active::before {
  content: "";
  position: absolute;
  top: -2px; 
  left: -4px; 
  right: -4px; 
  bottom: 0;
  
  /* 关键：使用标题自身的颜色作为背景色 */
  background-color: currentColor;
  
  /* 设置透明度，使其不完全遮挡 */
  opacity: 0.15; 
  
  /* 放置在文字下方 */
  z-index: -1;
  pointer-events: none;
  border-radius: 4px;
}
```
