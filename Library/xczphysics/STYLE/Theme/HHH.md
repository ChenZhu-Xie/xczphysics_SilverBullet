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
/* 默认半透明 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  opacity: var(--title-opacity);
  /* transition: opacity 0.2s; */
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