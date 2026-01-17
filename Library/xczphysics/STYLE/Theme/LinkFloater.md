---
author: Chenzhu-Xie
name: Library/xczphysics/STYLE/Theme/LinkFloater
tags: meta/library
files:
- LinkFloater.js
pageDecoration.prefix: "🔗 "
---

# LinkFloater - Realtime Link Navigator

这个插件，说实话有点像 [[PKM/Apps/Tana|]] 中的 Related Content
- 写了这么多 JS 代码，不如 Tana 的 Related Content 中一个 Query ?

## 1. JS Logic

本插件可能会用到：JS 与 Lua 通信
1. [task explorer](https://community.silverbullet.md/t/task-explorer/3747/2?u=chenzhu-xie) #community #silverbullet

## 2. Lua Logic (Bridge)
This part queries the index and pushes data to the JS view.i

```space-lua
js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").enable()

local function pushBacklinks()
    local currentPage = editor.getCurrentPage()
    
    local results = query[[
      from index.tag "link"
      where _.toPage == currentPage and _.page != currentPage
      select { ref=_.ref, page=_.page, pos=_.pos }
    ]]
    js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").updateBacklinks(results)
end

local function pushForwardlinks()
    local currentPage = editor.getCurrentPage()
    
    local results = query[[
      from index.tag "link"
      where _.page == currentPage and not _.toFile
      select { ref=_.ref, toPage=_.toPage, pos=_.pos }
      order by _.pos
    ]]
    js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").updateForwardlinks(results)
end

event.listen {
  name = "editor:pageLoaded",
  run = function()
    pushBacklinks()
    pushForwardlinks()
  end
}

event.listen {
  name = "editor:pageSaved",
  run = function()
    pushBacklinks()
    pushForwardlinks()
  end
}
```

## 3. CSS Style

```space-style
/* =========================================
   LinkFloater 样式 - 右上/右下悬浮链接
   借鉴 HHH.js 的半透明 + 边框高亮效果
   ========================================= */

/* 悬浮窗容器定位 */
.sb-floater-container {
  position: fixed;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
  font-family: inherit;
  font-size: 12px;
}

/* 列布局 */
.sb-floater-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  pointer-events: auto;
}

/* 标题头 */
.sb-floater-header {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--secondary-text-color, #888);
  opacity: 0.5;
  margin-bottom: 2px;
  margin-right: 2px;
  font-weight: bold;
  pointer-events: none;
}

/* =========================================
   按钮样式 - 借鉴 sb-frozen-item 效果
   ========================================= */
.sb-floater-btn {
  display: inline-block;
  width: auto;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: auto;
  cursor: pointer;

  margin: 0;
  padding: 0.2em 0.6em;
  border-radius: 4px;
  box-sizing: border-box;

  /* 半透明效果 */
  opacity: 0.8;
  background-color: var(--bg-color, #ffffff);
  
  border: 1px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  font-family: inherit;
  color: var(--text-color, #333);
  transition: all 0.15s ease-out;
}

/* 悬浮效果 - 边框高亮 + 展开 */
.sb-floater-btn:hover {
  opacity: 1;
  z-index: 1001;
  max-width: none; /* 展开显示完整内容 */
  filter: brightness(0.95) contrast(0.95);
  transform: translateX(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: currentColor; /* 使用当前颜色作为边框 */
}

/* =========================================
   不同类型的特定样式
   ========================================= */
.sb-floater-local {
  border-left: 3px solid #4caf50; /* Green - 当前页面锚点 */
  color: #4caf50;
}

.sb-floater-remote {
  border-left: 3px solid #2196f3; /* Blue - 跳转按钮 */
  color: #2196f3;
  font-weight: bold;
}

.sb-floater-backlink {
  border-right: 3px solid #ff9800; /* Orange - 反向链接 */
  border-left: 1px solid transparent;
  color: #ff9800;
}

/* =========================================
   Dark Mode 适配
   ========================================= */
html[data-theme="dark"] .sb-floater-btn {
  background-color: var(--bg-color-dark, #252629);
  border-bottom-color: rgba(255, 255, 255, 0.06);
  color: #ccc;
}

html[data-theme="dark"] .sb-floater-btn:hover {
  background-color: #333;
  filter: brightness(1.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

html[data-theme="dark"] .sb-floater-local {
  color: #81c784;
}

html[data-theme="dark"] .sb-floater-remote {
  color: #64b5f6;
}

html[data-theme="dark"] .sb-floater-backlink {
  color: #ffb74d;
}

@media (prefers-color-scheme: dark) {
  .sb-floater-btn {
    background-color: var(--bg-color-dark, #252629);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }
  .sb-floater-btn:hover {
    background-color: #333;
    filter: brightness(1.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  }
}
```
