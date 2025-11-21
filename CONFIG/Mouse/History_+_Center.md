
本来是想做 鼠标穿透 penetration/pass through 的
发现这功能实现不了...
- 可能是被 preview:click 拦截了。
现在改为了做 ctrl + click 自动带 Navigate: Center Cursor 的功能

此外，在此基础上再新增了功能：不按 ctrl 的 普通点击 会记录 点击历史。

# Click History

点击任何行末，都不会触发。#Bug 无论是否是空行。

## Employed

```space-lua
local function getTimes()
  local t = datastore.get({"ClickTimes", "!"}) or {}
  return t.Ctimes or 0
end

local function setTimes(n)
  datastore.set({"ClickTimes", "!"}, { Ctimes = n })
end

local function getBrowse()
  local b = datastore.get({"ClickBrowse", "!"})
  if b then return b end
  local ct = getTimes()
  b = { index = ct, max = math.max(ct - 1, -1), active = false }
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

local enableTruncateDuringBrowse = true

local function appendHistory(ref)
  local Ctimes = getTimes()

  local lastRef = getRef(Ctimes - 1)
  if lastRef and lastRef == ref then
    return
  end

  local browse = getBrowse()

  if enableTruncateDuringBrowse and browse.active and browse.index <= browse.max then
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
    editor.flashNotification("History does not exist (" .. tostring(idx) .. ")", "warning")
    return false
  end
  editor.navigate(ref)
  editor.flashNotification(ref)
  editor.moveCursor(tonumber(ref:match("@(.*)")), true)
  return true      
end

local function ensureBrowseSession()
  local b = getBrowse()
  if not b.active then
    local Ctimes = getTimes()
    b.max = math.max(Ctimes - 1, -1)
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
      editor.flashNotification("pos@" .. tostring(pos))
      return
    end
  end
}

command.define {
  name = "Cursor History: Back",
  run = function()
    local b = ensureBrowseSession()

    if b.max < 0 then
      editor.flashNotification("No history available", "warning")
      return
    end

    if b.index > b.max then
      b.index = b.max
    end
    
    b.index = math.max(b.index - 1, 0)

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
  name = "Cursor History: Forward",
  run = function()
    local b = ensureBrowseSession()

    if b.max < 0 then
      editor.flashNotification("No history available", "warning")
      return
    end

    if b.index >= b.max then
      editor.flashNotification("Reached newest history (session limit)", "warning")
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
  name = "Cursor History: Exit Browse (Present)",
  run = function()
    local Ctimes = getTimes()
    local max = math.max(Ctimes - 1, -1)
    if max < 0 then
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

local Ctimes = getTimes()
setBrowse({ index = Ctimes, max = math.max(Ctimes - 1, -1), active = false })
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
