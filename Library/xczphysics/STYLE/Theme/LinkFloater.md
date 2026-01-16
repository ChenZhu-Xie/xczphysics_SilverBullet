---
author: Chenzhu-Xie
name: Library/xczphysics/STYLE/Theme/LinkFloater
tags: meta/library
files:
- LinkFloater.js
pageDecoration.prefix: "🔗 "
---

# LinkFloater - Realtime Link Navigator

## 1. JS Logic

本插件可能会用到：JS 与 Lua 通信
1. [task explorer](https://community.silverbullet.md/t/task-explorer/3747/2?u=chenzhu-xie) #community #silverbullet

[[SB Basics]]

## 2. Lua Logic (Bridge)
This part queries the index and pushes data to the JS view.

```space-lua
-- 监听系统就绪和页面加载事件
js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").enable()

-- 定义一个函数来获取反链并推送到前端
local function pushBacklinks()
    if not editor.isClient() then return end
    
    local currentPage = editor.getCurrentPage()
    
    -- 查询反向链接
    -- 注意：这里使用 index.tag "link" 并筛选 toPage
    local results = query[[
      from index.tag "link"
      where _.toPage == currentPage and _.page != currentPage
      select { page=_.page, pos=_.pos }
    ]]
    
    -- 将结果传递给 JS
    -- JS 模块导出了 updateBacklinks 函数
    js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").updateBacklinks(results)
end

-- 监听页面加载完成
event.listen {
  name = "editor:pageLoaded",
  run = function()
    -- 延迟一点执行，确保 JS 环境已加载
    -- 也可以重新 enable 确保 View 存在
    js.import("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").enable()
    pushBacklinks()
  end
}

-- 监听页面保存 (反链可能发生变化，虽然通常是其他页面保存影响本页，但刷新一下无妨)
event.listen {
  name = "editor:pageSaved",
  run = function()
    pushBacklinks()
  end
}
```

## 3. CSS Style

```space-style
/* 悬浮窗容器定位 */
.sb-floater-container {
  position: fixed;
  right: 20px;
  z-index: 1000;
  pointer-events: none; /* 容器本身不阻挡点击，只有按钮阻挡 */
  font-family: sans-serif;
  font-size: 12px;
}

/* 列布局 */
.sb-floater-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 靠右对齐 */
  gap: 4px;
  pointer-events: auto;
}

/* 标题头 */
.sb-floater-header {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--secondary-text-color, #888);
  margin-bottom: 2px;
  margin-right: 2px;
  font-weight: bold;
}

/* 按钮样式 */
.sb-floater-btn {
  background: var(--bg-color, white);
  border: 1px solid var(--border-color, #ddd);
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color, #333);
}

.sb-floater-btn:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  border-color: var(--action-color, #007bff);
}

/* 不同类型的特定样式 */
.sb-floater-local {
  border-left: 3px solid #4caf50; /* Green for local anchors */
}

.sb-floater-remote {
  border-left: 3px solid #2196f3; /* Blue for outgoing */
}

.sb-floater-backlink {
  border-right: 3px solid #ff9800; /* Orange for backlinks (right side border) */
  border-left: 1px solid var(--border-color, #ddd); /* reset left */
}

/* Dark mode 适配 */
html[data-theme="dark"] .sb-floater-btn {
  background: #2d2d2d;
  border-color: #444;
  color: #ccc;
}
```
