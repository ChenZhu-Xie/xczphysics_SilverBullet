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
// HHH v10-FullScope Refactored
// Features: 
// 1. Works on any text block (paragraph/list/etc), not just headings.
// 2. Top-Left: Ancestors (Breadcrumbs).
// 3. Bottom-Left: Descendants (Subtree).
// 4. Supports Hover, Click, and Typing (Cursor position).

const STATE_KEY = "__xhHighlightState_v10";

// ==========================================
// 1. Model: 数据与层级计算
// ==========================================

const DataModel = {
  headings: [], // { index, level, start, end, text }
  lastText: null,

  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) { console.warn(e); }
    return "";
  },

  // 解析 Markdown，记录标题位置
  rebuildSync() {
    const text = this.getFullText();
    if (text === this.lastText && this.headings.length > 0) return; 

    this.lastText = text;
    this.headings = [];
    
    if (!text) return;

    const regex = /^(#{1,6})\s+([^\n]*)$/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      this.headings.push({
        index: this.headings.length,
        level: match[1].length,
        text: match[2].trim(),
        start: match.index, 
        end: match.index + match[0].length
      });
    }
  },

  // 核心修改：查找 pos 所属的标题范围（包含正文）
  // 逻辑：找到 start <= pos 的最后一个标题
  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    // 倒序查找，找到第一个在该位置之前的标题
    for (let i = this.headings.length - 1; i >= 0; i--) {
      if (this.headings[i].start <= pos) {
        return i;
      }
    }
    return -1; // 文档开头，无标题
  },

  // 获取高亮索引集合 (Self + Ancestors + Descendants)
  getFamilyIndices(targetIndex) {
    const indices = new Set();
    if (targetIndex < 0 || targetIndex >= this.headings.length) return indices;

    const target = this.headings[targetIndex];
    indices.add(targetIndex);

    // 1. 祖先
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        indices.add(i);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }

    // 2. 后代 (仅当前子树)
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break; // 遇到同级或更高级，停止
      indices.add(i);
    }

    return indices;
  },
  
  // 获取祖先链 (用于左上角)
  getAncestors(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [target];
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        list.unshift(h); // 放在前面
        currentLevel = h.level;
      }
    }
    return list;
  },

  // 获取子孙树 (用于左下角)
  getDescendants(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [];
    
    // 向下遍历，直到遇到 level <= target.level
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
        const h = this.headings[i];
        if (h.level <= target.level) break;
        list.push(h);
    }
    return list;
  }
};

// ==========================================
// 2. View: 渲染与 DOM 操作
// ==========================================

const View = {
  topContainerId: "sb-frozen-container",
  bottomContainerId: "sb-toc-container",

  // 创建或获取容器
  getContainer(id, isBottom) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.display = "none";
      el.style.position = "fixed";
      el.style.zIndex = "999";
      el.style.flexDirection = "column";
      el.style.alignItems = "flex-start";
      
      if (isBottom) {
          el.style.bottom = "10px";
          el.style.left = "10px";
          // 限制最大高度，防止挡住太多，允许滚动
          el.style.maxHeight = "40vh";
          el.style.overflowY = "auto";
          // 稍微透明一点背景，防止文字重叠看不清
          el.style.backgroundColor = "rgba(var(--bg-color), 0.8)";
          el.style.padding = "5px";
          el.style.borderRadius = "5px";
          el.style.pointerEvents = "none"; // 让鼠标穿透，不影响点击底部内容
      } else {
          // Top container logic is usually handled relative to parent in original script, 
          // but fixed is safer for "Left Top" requirement.
          el.style.top = "10px"; 
          el.style.left = "10px"; // 默认位置，会被 render 覆盖
      }
      
      document.body.appendChild(el);
    }
    return el;
  },

  // 渲染列表项
  renderItems(container, items) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
        container.style.display = "none";
        return;
    }
    container.style.display = "flex";
    
    items.forEach(h => {
      const div = document.createElement("div");
      // 复用原有样式
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      container.appendChild(div);
    });
  },

  // 主渲染入口
  renderPanels(targetIndex, mainContainer) {
    const topC = this.getContainer(this.topContainerId, false);
    const botC = this.getContainer(this.bottomContainerId, true);

    if (targetIndex === -1) {
      topC.style.display = "none";
      botC.style.display = "none";
      return;
    }

    // 1. 左上角：祖先
    const ancestors = DataModel.getAncestors(targetIndex);
    this.renderItems(topC, ancestors);
    
    // 定位左上角 (如果需要跟随容器)
    if (mainContainer) {
       const rect = mainContainer.getBoundingClientRect();
       topC.style.left = (rect.left + 10) + "px";
       topC.style.top = (rect.top + 10) + "px";
    }

    // 2. 左下角：子孙
    const descendants = DataModel.getDescendants(targetIndex);
    this.renderItems(botC, descendants);
    if (mainContainer) {
       const rect = mainContainer.getBoundingClientRect();
       botC.style.left = (rect.left + 10) + "px";
    }
  },

  // 应用高亮样式到编辑器正文
  applyHighlights(container, activeIndices) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    // 查找所有可能的行 (包括标题和普通文本，如果需要高亮普通文本所属块，逻辑会更复杂)
    // 这里保持原逻辑：只高亮标题行本身，但触发机制改为“在块内即触发”
    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    visibleHeadings.forEach(el => {
      try {
        const pos = view.posAtDOM(el);
        // 这里必须精确匹配标题的 Index
        // 因为 findHeadingIndexByPos 是模糊匹配，这里我们需要反向确认：
        // 这个 DOM 元素是不是那个标题
        
        // 简单做法：利用 pos 再查一次，看是不是刚好落在标题行范围内
        // 或者更简单：DataModel.headings 里找 start 接近 pos 的
        const idx = DataModel.findHeadingIndexByPos(pos);
        
        // 注意：findHeadingIndexByPos 返回的是该 pos *所属* 的标题。
        // 对于标题行本身，它所属的标题就是它自己。
        
        if (idx !== -1 && activeIndices.has(idx)) {
          // 只有当这个 DOM 确实是该标题本身时才高亮 (避免误伤)
          // 检查: DOM 的 pos 是否与 heading[idx].start 大致匹配
          const h = DataModel.headings[idx];
          if (Math.abs(h.start - pos) < 10) { // 容差
              el.classList.add("sb-active");
              
              if (idx === window[STATE_KEY].currentIndex) {
                el.classList.add("sb-active-current");
              } else {
                 const currentLevel = DataModel.headings[window[STATE_KEY].currentIndex].level;
                 const thisLevel = h.level;
                 if (idx < window[STATE_KEY].currentIndex && thisLevel < currentLevel) el.classList.add("sb-active-anc");
                 else el.classList.add("sb-active-desc");
              }
          }
        }
      } catch (e) {}
    });
  }
};

// ==========================================
// 3. Controller: 事件与状态
// ==========================================

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || ".cm-scroller"; // CodeMirror 滚动容器

  const bind = () => {
    // 尝试获取编辑器容器
    const container = document.querySelector(containerSelector) || document.querySelector("#sb-main");
    
    if (!container || !window.client || !client.editorView) {
      requestAnimationFrame(bind);
      return;
    }

    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    window[STATE_KEY] = {
      currentIndex: -1,
      cleanup: null
    };

    function updateState(targetIndex) {
      if (targetIndex === window[STATE_KEY].currentIndex) return;
      window[STATE_KEY].currentIndex = targetIndex;

      const contentEl = document.querySelector(".cm-content"); // 实际内容区域

      if (targetIndex === -1) {
        View.applyHighlights(contentEl, null);
        View.renderPanels(-1, container);
        return;
      }

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      View.applyHighlights(contentEl, familyIndices);
      View.renderPanels(targetIndex, container);
    }

    // --- Action Handlers ---

    // 1. 通用位置处理器 (根据 Pos 更新)
    function handlePos(pos) {
        const idx = DataModel.findHeadingIndexByPos(pos);
        updateState(idx);
    }

    // 2. 鼠标悬浮 (Hover)
    function onPointerOver(e) {
      // 修改：不仅仅是标题，任何内容行 (.cm-line) 都可以触发
      const target = e.target.closest(".cm-line"); 
      if (!target) return;

      try {
        const pos = client.editorView.posAtDOM(target);
        handlePos(pos);
      } catch (err) { }
    }

    // 3. 鼠标/键盘交互 (Click & Edit)
    // 监听鼠标抬起(点击完成) 和 键盘抬起(输入完成/光标移动)
    function onInteraction(e) {
        try {
            // 获取当前光标位置
            const state = client.editorView.state;
            const pos = state.selection.main.head;
            handlePos(pos);
        } catch(err) {}
    }

    // 4. 滚动逻辑 (保持 Sticky 效果)
    let isScrolling = false;
    function handleScroll() {
      // 如果鼠标在编辑器内，优先响应鼠标 Hover/Selection
      // 如果不在，则根据视口顶部显示
      if (container.matches(":hover")) return;

      const viewportTop = client.editorView.viewport.from;
      const idx = DataModel.findHeadingIndexByPos(viewportTop + 50);
      updateState(idx);
      isScrolling = false;
    }
    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // Bind Events
    // 使用 capture 确保尽早捕获
    container.addEventListener("mouseover", onPointerOver); 
    container.addEventListener("mouseup", onInteraction); // 点击定位
    container.addEventListener("keyup", onInteraction);   // 打字/光标移动定位
    
    // 监听全局滚动 (通常在 window 或 scroller 上)
    window.addEventListener("scroll", onScroll, { passive: true, capture: true }); 

    // MutationObserver: 当文档结构剧烈变化时重绘
    const mo = new MutationObserver(() => {
        if (window[STATE_KEY].currentIndex !== -1) {
           const contentEl = document.querySelector(".cm-content");
           const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
           View.applyHighlights(contentEl, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true });

    // Cleanup
    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("mouseover", onPointerOver);
      container.removeEventListener("mouseup", onInteraction);
      container.removeEventListener("keyup", onInteraction);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      
      const topC = document.getElementById(View.topContainerId);
      const botC = document.getElementById(View.bottomContainerId);
      if (topC) topC.remove();
      if (botC) botC.remove();
      
      View.applyHighlights(document.querySelector(".cm-content"), null);
      DataModel.headings = [];
    };

    console.log("[HHH] v10-FullScope Enabled");
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