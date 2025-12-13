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
// HHH v9-Positional Refactored
// Core: CodeMirror Position Mapping (No Fuzzy Matching)
// Solves: Inconsistent highlighting due to virtual scrolling

const STATE_KEY = "__xhHighlightState_v9_Pos";

// ==========================================
// 1. Model: 全量数据与层级计算
// ==========================================

const DataModel = {
  headings: [], // { level, start, end, text }
  lastText: null,

  // 获取全文
  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) { console.warn(e); }
    return "";
  },

  // 解析 Markdown，记录每个标题的起始位置 (pos)
  rebuildSync() {
    const text = this.getFullText();
    if (text === this.lastText && this.headings.length > 0) return; // 缓存命中

    this.lastText = text;
    this.headings = [];
    
    if (!text) return;

    // 使用带有 'd' (indices) 标志的正则需要较新浏览器，这里用通用方法
    const regex = /^(#{1,6})\s+([^\n]*)$/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      this.headings.push({
        index: this.headings.length,
        level: match[1].length,
        text: match[2].trim(),
        start: match.index, // 关键：记录在文档中的绝对偏移量
        end: match.index + match[0].length
      });
    }
  },

  // 根据文档位置 (pos) 查找对应的标题索引
  // 算法：找到 start <= pos 的最后一个标题
  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    // 二分查找优化 (或者简单的反向遍历，因为标题通常不多)
    for (let i = this.headings.length - 1; i >= 0; i--) {
      if (this.headings[i].start <= pos) {
        // 简单的容错：如果 pos 离得太远（比如在正文中），需确认是否属于该标题段落
        // 这里简化逻辑：只要在该标题下方，且未遇到下一个标题，就算该标题的范围
        // 但为了高亮准确性，我们通常只匹配标题行本身
        // 如果 pos > end，说明是在正文里。
        // *本功能需求*：Hover 标题行触发。所以 pos 应该在 start 和 end 之间 (或附近)
        if (pos <= this.headings[i].end + 1) { 
            return i; 
        }
        return -1; // 在正文中，不触发
      }
    }
    return -1;
  },

  // 核心逻辑：计算需要高亮的所有索引 (Self + Ancestors + Descendants)
  getFamilyIndices(targetIndex) {
    const indices = new Set();
    if (targetIndex < 0 || targetIndex >= this.headings.length) return indices;

    const target = this.headings[targetIndex];
    indices.add(targetIndex);

    // 1. 找祖先 (向前找 level 更小的)
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        indices.add(i);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }

    // 2. 找后代 (向后找，直到遇到 level <= target.level)
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break;
      indices.add(i);
    }

    return indices;
  },
  
  // 获取面包屑数据
  getBreadcrumbs(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const crumbs = [target];
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        crumbs.unshift(h);
        currentLevel = h.level;
      }
    }
    return crumbs;
  }
};

// ==========================================
// 2. View: 渲染与 DOM 操作
// ==========================================

const View = {
  containerId: "sb-frozen-container",

  getFrozenContainer() {
    let fc = document.getElementById(this.containerId);
    if (!fc) {
      fc = document.createElement("div");
      fc.id = this.containerId;
      fc.style.display = "none";
      document.body.appendChild(fc);
    }
    return fc;
  },

  // 渲染面包屑
  renderFrozenBar(targetIndex, container) {
    const fc = this.getFrozenContainer();
    if (targetIndex === -1) {
      fc.style.display = "none";
      return;
    }

    const crumbs = DataModel.getBreadcrumbs(targetIndex);
    if (crumbs.length === 0) {
      fc.style.display = "none";
      return;
    }

    fc.innerHTML = "";
    fc.style.display = "flex";
    
    crumbs.forEach(h => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      fc.appendChild(div);
    });

    if (container) {
      const rect = container.getBoundingClientRect();
      fc.style.left = (rect.left + 10) + "px";
    }
  },

  // 应用高亮样式
  applyHighlights(container, activeIndices) {
    // 1. 清除旧样式
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    // 2. 遍历当前可见的 DOM 标题
    // 关键：利用 CodeMirror API 获取每个 DOM 对应的 pos，再反查 Index
    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    visibleHeadings.forEach(el => {
      try {
        // 获取 DOM 元素在文档中的位置
        const pos = view.posAtDOM(el);
        // 查找其对应的 Model Index
        const idx = DataModel.findHeadingIndexByPos(pos);

        if (activeIndices.has(idx)) {
          el.classList.add("sb-active");
          
          // 区分类型
          if (idx === window[STATE_KEY].currentIndex) {
            el.classList.add("sb-active-current");
          } else {
             // 简单的逻辑判断是祖先还是后代
             const currentLevel = DataModel.headings[window[STATE_KEY].currentIndex].level;
             const thisLevel = DataModel.headings[idx].level;
             const thisIdx = idx;
             const mainIdx = window[STATE_KEY].currentIndex;
             
             if (thisIdx < mainIdx && thisLevel < currentLevel) el.classList.add("sb-active-anc");
             else el.classList.add("sb-active-desc");
          }
        }
      } catch (e) {
        // posAtDOM 可能会失败，忽略
      }
    });
  }
};

// ==========================================
// 3. Controller: 事件与状态
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

    // 状态
    window[STATE_KEY] = {
      currentIndex: -1,
      cleanup: null
    };

    // 核心更新函数
    function updateState(targetIndex) {
      // 性能优化：索引未变则不重绘
      if (targetIndex === window[STATE_KEY].currentIndex) return;
      
      window[STATE_KEY].currentIndex = targetIndex;

      if (targetIndex === -1) {
        View.applyHighlights(container, null);
        View.renderFrozenBar(-1);
        return;
      }

      // 计算全量关系 (Model)
      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      
      // 应用到局部 DOM (View)
      View.applyHighlights(container, familyIndices);
      View.renderFrozenBar(targetIndex, container);
    }

    // --- Event Handlers ---

    // 1. Hover Logic
    function onPointerOver(e) {
      // 必须是标题元素
      const target = e.target.closest(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
      if (!target || !container.contains(target)) return;

      try {
        const pos = client.editorView.posAtDOM(target);
        const idx = DataModel.findHeadingIndexByPos(pos);
        if (idx !== -1) {
          updateState(idx);
        }
      } catch (err) { console.warn(err); }
    }

    function onPointerOut(e) {
      const to = e.relatedTarget;
      if (!to || !container.contains(to)) {
        // 移出容器，清除高亮 (可选：也可以选择保持最后状态)
        updateState(-1);
      }
    }

    // 2. Scroll Logic (Sticky Header)
    let isScrolling = false;
    function handleScroll() {
      // 滚动时，我们基于视口顶部的 DOM 元素来判断
      // 找到第一个在视口内的标题
      // 也可以直接用 editorView.viewport.from 获取当前视口起始位置
      
      const viewportTopPos = client.editorView.viewport.from;
      
      // 找到距离 viewportTopPos 最近的上方标题
      // 在 Model 中找：start <= viewportTopPos 的最大索引
      DataModel.rebuildSync();
      
      let bestIdx = -1;
      // 简单的线性查找，因为是 Sticky 效果，找的是视口最上方的那个上下文
      // 注意：这里逻辑稍微不同，我们想高亮的是"当前正文所属的标题"
      for (let i = 0; i < DataModel.headings.length; i++) {
        if (DataModel.headings[i].start <= viewportTopPos + 100) { // +100 容差
          bestIdx = i;
        } else {
          break;
        }
      }

      // 如果鼠标正在 hover，不要让滚动覆盖 hover 的效果 (可选，看个人喜好)
      // 这里设定：如果鼠标不在 container 内，则响应滚动；否则响应 hover
      if (!container.matches(":hover")) {
          updateState(bestIdx);
      }
      
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }
    
    // 3. Mutation (CodeMirror 重新渲染 DOM 时保持高亮)
    const mo = new MutationObserver(() => {
        // DOM 结构变化（如滚动加载新行），需要重新应用当前状态的高亮
        if (window[STATE_KEY].currentIndex !== -1) {
           const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
           View.applyHighlights(container, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true });

    // Bind
    container.addEventListener("mouseover", onPointerOver); // mouseover 冒泡，pointerover 也行
    container.addEventListener("mouseout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("mouseover", onPointerOver);
      container.removeEventListener("mouseout", onPointerOut);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      View.applyHighlights(container, null);
      const fc = document.getElementById(View.containerId);
      if (fc) fc.remove();
      DataModel.headings = [];
    };

    console.log("[HHH] v9-Positional Enabled");
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
  name = "Save: HierarchyHighlightHeadings.js",
  hide = true,
  run = function()
    local jsFile = space.writeDocument("Library/HierarchyHighlightHeadings.js", jsCode)
    editor.flashNotification("HierarchyHighlightHeadings JS saved (" .. jsFile.size .. " bytes)")
  end
}

command.define {
  name = "Delete: HierarchyHighlightHeadings.js",
  hide = true,
  run = function()
    space.deleteDocument("Library/HierarchyHighlightHeadings.js")
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