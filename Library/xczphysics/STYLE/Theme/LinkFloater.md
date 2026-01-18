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

-- 页面修改时（更实时）
event.listen {
  name = "editor:pageModified",
  run = function()
    pushForwardlinks()
  end
}

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

```space
/* =========================================
   LinkFloater 样式 v3
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

/* 按钮样式 */
.sb-floater-btn {
  display: inline-block;
  width: auto;
  max-width: 120px;
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
  
  border: 1px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  font-family: inherit;
  color: var(--text-color, #333);
  transition: all 0.15s ease-out;
}

/* 悬浮展开效果 */
.sb-floater-btn:hover,
.sb-floater-btn.sb-floater-expanded {
  opacity: 1;
  z-index: 1001;
  max-width: none;
  filter: brightness(0.95) contrast(0.95);
  transform: translateX(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: currentColor;
}

/* 类型样式 */
.sb-floater-local {
  border-left: 3px solid #4caf50;
  color: #4caf50;
}

.sb-floater-remote {
  border-left: 3px solid #2196f3;
  color: #2196f3;
  font-weight: bold;
}

.sb-floater-backlink {
  border-right: 3px solid #ff9800;
  border-left: 1px solid transparent;
  color: #ff9800;
}

/* Dark Mode */
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

html[data-theme="dark"] .sb-floater-local { color: #81c784; }
html[data-theme="dark"] .sb-floater-remote { color: #64b5f6; }
html[data-theme="dark"] .sb-floater-backlink { color: #ffb74d; }

/* =========================================
   HHH 样式 v12
   ========================================= */

.sb-frozen-container {
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

/* 标题项 */
.sb-frozen-item {
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

  opacity: 0.8;
  background-color: var(--bg-color, #ffffff);
  
  border: 1px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  font-family: inherit;
  transition: all 0.15s ease-out;
}

/* 悬浮展开 */
.sb-frozen-item:hover,
.sb-frozen-item.sb-frozen-expanded {
  opacity: 1;
  z-index: 1001;
  max-width: none;
  filter: brightness(0.95) contrast(0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: currentColor;
}

@media (prefers-color-scheme: dark) {
  .sb-frozen-item {
    background-color: var(--bg-color-dark, #252629);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }
  .sb-frozen-item:hover {
    background-color: #333;
    filter: brightness(1.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  }
}

/* 标题颜色 (保持原有) */
html[data-theme="dark"] .sb-frozen-l1 { color: var(--h1-color-dark, #e6c8ff); }
html[data-theme="dark"] .sb-frozen-l2 { color: var(--h2-color-dark, #a0d8ff); }
html[data-theme="dark"] .sb-frozen-l3 { color: var(--h3-color-dark, #98ffb3); }
html[data-theme="dark"] .sb-frozen-l4 { color: var(--h4-color-dark, #fff3a8); }
html[data-theme="dark"] .sb-frozen-l5 { color: var(--h5-color-dark, #ffb48c); }
html[data-theme="dark"] .sb-frozen-l6 { color: var(--h6-color-dark, #ffa8ff); }

html[data-theme="light"] .sb-frozen-l1 { color: var(--h1-color-light, #6b2e8c); }
html[data-theme="light"] .sb-frozen-l2 { color: var(--h2-color-light, #1c4e8b); }
html[data-theme="light"] .sb-frozen-l3 { color: var(--h3-color-light, #1a6644); }
html[data-theme="light"] .sb-frozen-l4 { color: var(--h4-color-light, #a67c00); }
html[data-theme="light"] .sb-frozen-l5 { color: var(--h5-color-light, #b84c1c); }
html[data-theme="light"] .sb-frozen-l6 { color: var(--h6-color-light, #993399); }

/* 编辑器标题高亮样式保持原有 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  position: relative;
  opacity: var(--title-opacity, 0.5);
  border-bottom: none !important;
  background-image: linear-gradient(90deg, currentColor, transparent);
  background-size: 100% 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: opacity 0.15s;
}

.sb-active { opacity: 1 !important; }

.sb-active::before {
  content: "";
  position: absolute;
  top: -2px; left: -4px; right: -4px; bottom: 0;
  background-color: currentColor;
  opacity: 0.15;
  z-index: -1;
  pointer-events: none;
  border-radius: 4px;
}
```
