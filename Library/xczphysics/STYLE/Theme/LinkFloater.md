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

```
