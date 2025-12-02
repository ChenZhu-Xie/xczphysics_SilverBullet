---
name: CONFIG/Mouse/History_+_Center
tags: meta/library
pageDecoration.prefix: "🖱️ "
---

本来是想做 鼠标穿透 penetration/pass through 的
发现这功能实现不了...                                                                             
- 可能是被 preview:click 拦截了。
现在改为了做 ctrl + click 自动带 Navigate: Center Cursor 的功能

此外，在此基础上再新增了功能：不按 ctrl 的 普通点击 会记录 点击历史。

# Click History

点击任何行末，都不会触发。#Bug 无论是否是空行。

## Employed

| Operation: #hazel | Target | Ctrl | Shift | Alt | letter |
|----------|----------|------|-------|-----|--------|
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Back]] | | Shift | Alt | ← |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Forward]] | | Shift | Alt | → |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|End]] | Ctrl | Shift | Alt | ← |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Start]] | Ctrl | Shift | Alt | → |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Delete]] | Ctrl | Shift | Alt | Delete |

```space-lua
local function getTimes()
  local t = datastore.get({"ClickTimes", "!"}) or {}
  return t.Ctimes or 1
end

local function setTimes(n)
  datastore.set({"ClickTimes", "!"}, { Ctimes = n })
end

local function getBrowse()
  local b = datastore.get({"ClickBrowse", "!"})
  if b then return b end
  local ct = getTimes()
  b = { index = ct, max = ct - 1, active = false }
  datastore.set({"ClickBrowse", "!"}, b)
  return b
end

local function setBrowse(b)
  datastore.set({"ClickBrowse", "!"}, b)
end

local function getRef(idx)
  local rec = datastore.get({"ClickHistory", tostring(idx)}) or {}
  return rec.ref
end

local function setRef(idx, ref)
  datastore.set({"ClickHistory", tostring(idx)}, { ref = ref, ts = os.time() })
end

local function clearAllHistory()
  local Ctimes = getTimes()
  for i = 1, Ctimes do
    datastore.delete({"ClickHistory", tostring(i)})
  end
  setTimes(1)
  setBrowse({ index = 1, max = 0, active = false })
end

local enableTruncateDuringBrowse = false

local function appendHistory(ref)
  local Ctimes = getTimes()
  local lastRef = getRef(Ctimes - 1)
  
  if lastRef and lastRef == ref then
    return
  end

  local browse = getBrowse()

  if enableTruncateDuringBrowse and browse.active and browse.index <= browse.max then
    for i = browse.index + 1, browse.max do
       datastore.delete({"ClickHistory", tostring(i)})
    end
    Ctimes = browse.index + 1
    setTimes(Ctimes)
    browse.index = Ctimes
    browse.max = Ctimes
    setBrowse(browse)
  end

  setRef(Ctimes, ref)
  setTimes(Ctimes + 1)

  local newTimes = Ctimes + 1
  setBrowse({ index = newTimes, max = newTimes - 1, active = false })
end

local function navigateIndex(idx)
  local ref = getRef(idx)
  if not ref then
    return false
  end
  editor.navigate(ref)
  local pos = tonumber(ref:match("@(.*)$"))
  if pos then
      editor.moveCursor(pos, true)
  end
  return true      
end

local function ensureBrowseSession()
  local b = getBrowse()
  if not b.active then
    local Ctimes = getTimes()
    b.max = Ctimes - 1
    b.index = Ctimes
    b.active = true
    setBrowse(b)
  end
  return getBrowse()
end

event.listen {
  name = "page:click",
  run = function(e)
    local d = e.data or {}
    local pageName = editor.getCurrentPage()
    local pos = d.pos
    if not pageName or not pos then return end

    local ref = string.format("%s@%d", pageName, pos)
    appendHistory(ref)

    if d.ctrlKey then
      editor.moveCursor(pos, true)
      editor.flashNotification("pos @ " .. tostring(pos))
      return
    end
  end
}

command.define {
  name = "Click History: Back",
  run = function()
    local b = ensureBrowseSession()

    if b.max < 1 then
      editor.flashNotification("No history", "warning")
      return
    end

    if b.index > b.max + 1 then
      b.index = b.max + 1
    end
    
    b.index = math.max(b.index - 1, 1)

    setBrowse(b)
    if navigateIndex(b.index) then
      editor.flashNotification(string.format("Back: %d / %d", b.index, b.max))
    end
  end,
  key = "Shift-Alt-ArrowLeft",
  mac = "Shift-Alt-ArrowLeft",
  priority = 1,
}

command.define {
  name = "Click History: Forward",
  run = function()
    local b = ensureBrowseSession()

    if b.max < 1 then
      editor.flashNotification("No history", "warning")
      return
    end

    b.index = math.min(b.index + 1, b.max)
    setBrowse(b)

    if navigateIndex(b.index) then
      editor.flashNotification(string.format("Forward: %d / %d", b.index, b.max))
    end
  end,
  key = "Shift-Alt-ArrowRight",
  mac = "Shift-Alt-ArrowRight",
  priority = 1,
}

command.define {
  name = "Click History: End",
  run = function()
    local Ctimes = getTimes()
    local max = Ctimes - 1
    if max < 1 then
      editor.flashNotification("No history", "warning")
      return
    end
    setBrowse({ index = max, max = max, active = false })
    if navigateIndex(max) then
      editor.flashNotification(string.format("End: %d / %d", max, max))
    end
  end,
  key = "Ctrl-Shift-Alt-ArrowRight",
  mac = "Ctrl-Shift-Alt-ArrowRight",
  priority = 1,
}

command.define {
  name = "Click History: Start",
  run = function()
    local b = ensureBrowseSession()

    if b.max < 1 then
      editor.flashNotification("No history", "warning")
      return
    end

    b.index = 1
    setBrowse(b)
    
    if navigateIndex(1) then
      editor.flashNotification(string.format("Start: 1 / %d", b.max))
    end
  end,
  key = "Ctrl-Shift-Alt-ArrowLeft",
  mac = "Ctrl-Shift-Alt-ArrowLeft",
  priority = 1,
}

command.define {
  name = "Click History: Clear",
  run = function()
    clearAllHistory()
    editor.flashNotification("Click History cleared.", "info")
  end,
  key = "Ctrl-Shift-Alt-Delete", 
  mac = "Ctrl-Shift-Alt-Delete",
  priority = 1,
}

local Ctimes = getTimes()
setBrowse({ index = Ctimes, max = Ctimes - 1, active = false })
```

## 1st hand written ver

### Set

```lua
-- priority = -1

event.listen {
  name = 'page:click',
  run = function(e)
    local d = e.data or {}
    -- editor.flashNotification(d.ctrlKey)
    -- editor.flashNotification(d.pos)
    local dataT = datastore.get({"ClickTimes", "!"}) or {}
    local Ctimes = dataT.Ctimes or 0
    datastore.set({"ClickTimes", "!"}, {Ctimes = Ctimes + 1})
    -- editor.flashNotification(Ctimes)
    local pageName = editor.getCurrentPage()
    local pos = d.pos
    local ref = string.format("%s@%d", pageName, pos)
    datastore.set({"ClickHistory", tostring(Ctimes)}, { ref = ref })
    -- editor.flashNotification(Ctimes .. " " .. ref)
    -- =========================================
    if d.ctrlKey then
      editor.flashNotification(pos)
      editor.moveCursor(pos, true)
      return
    end
  end
}
```

### Get

```lua
command.define {
  name = "History: Last Click",
  run = function()
    local dataT = datastore.get({"ClickTimes", "!"}) or {}
    local Ctimes = dataT.Ctimes or 0
    local dataC = datastore.get({"ClickHistory", tostring(Ctimes - 1)}) or {}
    local lastClick = dataC.ref
    if lastClick then editor.navigate(lastClick) end
  end,
  key = "Shift-Alt-ArrowLeft",
  mac = "Shift-Alt-ArrowLeft",
  priority = 1,
}
```
