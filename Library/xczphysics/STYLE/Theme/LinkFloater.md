---
author: Chenzhu-Xie
name: Library/xczphysics/STYLE/Theme/LinkFloater
tags: meta/library
files:
- LinkFloater.js
pageDecoration.prefix: "🖇 "
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
-- 启用插件
js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").enable()
js.import("/.fs/Library/xczphysics/STYLE/Theme/HHH.js").enableHighlight()

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

-- 页面加载时
event.listen {
  -- name = "hooks:renderTopWidgets", -- https://community.silverbullet.md/t/permanent-dark-mode/370/9?u=chenzhu-xie
  -- name = "system:ready", -- https://deepwiki.com/search/js-syscall-silverbullet-lua_ba58d949-b824-46ca-8063-6e7b42989389?mode=fast
  name = "editor:pageLoaded",
  run = function()
    js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").refresh()
    pushBacklinks()
    pushForwardlinks()
  end
}

-- -- 页面修改时（更实时）
-- event.listen {
--   name = "editor:pageModified",
--   run = function()
--     pushForwardlinks()
--   end
-- }

-- 页面保存时
event.listen {
  name = "editor:pageSaving",
  run = function()
    pushForwardlinks()
    pushBacklinks()
  end
}
```

## 3. CSS Style

```space-style
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
