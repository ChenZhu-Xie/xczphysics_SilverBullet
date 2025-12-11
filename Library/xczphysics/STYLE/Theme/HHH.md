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

```space-lua
local jsCode = [[
const STATE_KEY = "__xhHighlightState_v4_Clone";

// --- 配置 ---
const CONFIG = {
  containerId: "sb-frozen-container",
  // 顶部导航栏的高度偏移，如果被遮挡请调整此值（例如 35）
  topOffset: 0, 
  // 标题选择器（匹配 SB 的渲染类名）
  headingSelector: ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6"
};

// --- 辅助函数 ---

function getLevel(el) {
  if (!el || !el.classList) return 10;
  if (el.classList.contains('sb-line-h1')) return 1;
  if (el.classList.contains('sb-line-h2')) return 2;
  if (el.classList.contains('sb-line-h3')) return 3;
  if (el.classList.contains('sb-line-h4')) return 4;
  if (el.classList.contains('sb-line-h5')) return 5;
  if (el.classList.contains('sb-line-h6')) return 6;
  return 10; // 非标题
}

// 获取或者创建冻结容器
function getFrozenContainer() {
  let div = document.getElementById(CONFIG.containerId);
  if (!div) {
    div = document.createElement('div');
    div.id = CONFIG.containerId;
    document.body.appendChild(div);
  }
  return div;
}

// 查找某个元素之前最近的祖先链 [H1, H2, H3...]
// 这里使用 DOM 倒序遍历，因为 CM6 结构是扁平的
function findAncestors(startNode) {
  const ancestors = [];
  let currentLevel = 10; // Start high
  
  // 如果起始点本身就是标题，先处理它
  const startLvl = getLevel(startNode);
  if (startLvl < 10) {
    currentLevel = startLvl;
    ancestors.unshift(startNode);
  }

  let curr = startNode.previousElementSibling;
  while (curr) {
    const lvl = getLevel(curr);
    // 只有找到更高级别（数字更小）的标题才加入
    if (lvl < currentLevel) {
      ancestors.unshift(curr);
      currentLevel = lvl;
      if (currentLevel === 1) break; // 找到 H1 就结束
    }
    curr = curr.previousElementSibling;
  }
  return ancestors;
}

// --- 主逻辑 ---

export function enableHighlight() {
  const editorContainer = document.querySelector("#sb-main");
  if (!editorContainer) {
    setTimeout(enableHighlight, 500);
    return;
  }

  // 清理旧实例
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
  }

  const frozenContainer = getFrozenContainer();
  let isTicking = false;

  // 核心更新函数
  function update() {
    // 1. 找到当前视口最上方的元素（锚点）
    // 我们取视口顶部往下一点点的位置探测元素
    const checkY = window.scrollY + CONFIG.topOffset + 50; 
    
    // 获取所有行
    const lines = document.querySelectorAll('.cm-line');
    let anchorNode = null;

    // 简单二分或遍历找到第一个在视口内的行
    // 由于 querySelectorAll 是文档顺序，直接找第一个 offsetTop + height > scrollY 的即可
    for (let i = 0; i < lines.length; i++) {
      const rect = lines[i].getBoundingClientRect();
      // 如果元素的底部在视口顶部下方，说明这个元素是当前可见的（或刚被切断的）
      if (rect.bottom > CONFIG.topOffset) {
        anchorNode = lines[i];
        break;
      }
    }

    if (!anchorNode) {
        frozenContainer.innerHTML = '';
        return;
    }

    // 2. 计算祖先链 (Active Branch)
    const activeBranch = findAncestors(anchorNode);

    // 3. 高亮处理 (Highlighting)
    // 移除所有旧高亮
    document.querySelectorAll('.sb-active').forEach(el => el.classList.remove('sb-active'));
    // 给当前链条上的原标题加高亮
    activeBranch.forEach(el => el.classList.add('sb-active'));

    // 4. 冻结处理 (Freezing / Cloning)
    // 清空容器，重新渲染
    frozenContainer.innerHTML = '';
    
    let cumulativeHeight = CONFIG.topOffset;
    
    // 检测顶部导航栏高度（如果有）
    const topBar = document.querySelector("#sb-top");
    if (topBar) {
        cumulativeHeight += topBar.offsetHeight;
    }

    activeBranch.forEach((h) => {
      // 克隆节点
      const clone = h.cloneNode(true);
      clone.classList.add('sb-frozen-clone');
      clone.classList.remove('sb-active'); // 克隆体不需要 active 类，它有专门样式
      
      // 设置样式
      clone.style.position = 'absolute'; // 容器是 fixed，里面用 absolute 堆叠
      clone.style.top = `${cumulativeHeight}px`;
      clone.style.left = `${h.getBoundingClientRect().left}px`; // 对齐左边
      clone.style.width = `${h.getBoundingClientRect().width}px`; // 对齐宽度
      
      frozenContainer.appendChild(clone);
      
      // 累加高度
      cumulativeHeight += clone.getBoundingClientRect().height;
    });

    isTicking = false;
  }

  function onScrollOrInteract() {
    if (!isTicking) {
      window.requestAnimationFrame(update);
      isTicking = true;
    }
  }

  // --- 事件绑定 ---
  
  // 1. 滚动时更新
  window.addEventListener('scroll', onScrollOrInteract, { passive: true });
  
  // 2. 鼠标点击/键盘输入时更新 (解决“点击取消高亮”问题)
  // 因为点击可能导致光标移动，光标移动可能导致编辑器重绘
  editorContainer.addEventListener('click', onScrollOrInteract);
  editorContainer.addEventListener('keyup', onScrollOrInteract);

  // 3. 监听 DOM 变化 (内容加载、折叠展开)
  const observer = new MutationObserver((mutations) => {
    onScrollOrInteract();
  });
  observer.observe(editorContainer, { childList: true, subtree: true, attributes: false });

  // 4. Resize
  window.addEventListener('resize', onScrollOrInteract);

  // 初始化
  onScrollOrInteract();

  // --- 清理 ---
  window[STATE_KEY] = {
    cleanup: () => {
      window.removeEventListener('scroll', onScrollOrInteract);
      window.removeEventListener('resize', onScrollOrInteract);
      editorContainer.removeEventListener('click', onScrollOrInteract);
      editorContainer.removeEventListener('keyup', onScrollOrInteract);
      observer.disconnect();
      if (frozenContainer) frozenContainer.innerHTML = '';
      document.querySelectorAll('.sb-active').forEach(el => el.classList.remove('sb-active'));
    }
  };
  
  console.log("[HHH] Highlight & Freeze enabled (Clone Mode)");
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
  }
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

1. Remember to Cancel the `1st space-style block` from [[STYLE/Theme/HHH-css]]

```space-style
/* --- 基础变量 --- */
:root {
  --frozen-z-index: 1000;
  --frozen-bg-light: rgba(255, 255, 255, 0.98);
  --frozen-bg-dark: rgba(30, 30, 30, 0.98);
  --frozen-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --title-opacity: 0.4; /* 默认让标题淡一点，凸显高亮 */
}

/* --- 1. 冻结容器 (新加) --- */
#sb-frozen-container {
  position: fixed;
  top: 0; /* 如果有顶部顶栏，JS会自动计算偏移，或者这里写 30px */
  left: 0;
  width: 100%;
  pointer-events: none; /* 让鼠标穿透容器，不影响下方操作 */
  z-index: var(--frozen-z-index);
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 靠左对齐 */
}

/* --- 2. 克隆标题的样式 --- */
.sb-frozen-clone {
  /* 恢复鼠标事件，允许点击（如需跳转可扩展） */
  pointer-events: auto; 
  width: 100%;
  margin: 0;
  padding-left: 10px; /* 稍微调整内边距 */
  
  /* 强制样式：不透明、有背景、有阴影 */
  opacity: 1 !important;
  background-color: var(--frozen-bg-light);
  box-shadow: var(--frozen-shadow);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  
  /* 保持字体排版 */
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 隐藏克隆体里的光标辅助元素，只留文字 */
.sb-frozen-clone .cm-widgetBuffer,
.sb-frozen-clone img {
  display: none;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .sb-frozen-clone {
    background-color: var(--frozen-bg-dark);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
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