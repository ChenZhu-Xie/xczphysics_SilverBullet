---
name: CONFIG/Mouse/History_+_Center
tags: meta/library
pageDecoration.prefix: "🖱️ "
---

1. [click history](https://community.silverbullet.md/t/click-history/3569/8?u=chenzhu-xie) #community #silverbullet

本来是想做 鼠标穿透 penetration/pass through 的
发现这功能实现不了...                                                

- 可能是被 preview:click 拦截了。
现在改为了做 ctrl + click 自动带 Navigate: Center Cursor 的功能

此外，在此基础上再新增了功能：不按 ctrl 的 普通点击 会记录 点击历史。

# Click History

点击任何行末，都不会触发。#Bug 无论是否是空行。

## Employed

| Target: #hazel | Operation | Ctrl | Shift | Alt | letter |
|----------|----------|------|-------|-----|--------|
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Back]] | | Shift | Alt | ← |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Forward]] | | Shift | Alt | → |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|End]] | Ctrl | Shift | Alt | ← |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Start]] | Ctrl | Shift | Alt | → |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Delete]] | Ctrl | Shift | Alt | Delete |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Cursor Picker]] | Ctrl | | Alt | h |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Page Picker]] | Shift | | Alt | h |
| Click History: | [[CONFIG/Mouse/History_+_Center#Click History|Toggle Mode]] | Ctrl | Shift |  | m |

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

local function getTimeString(idx)
  local rec = datastore.get({"ClickHistory", tostring(idx)}) or {}
  if rec.tstr and rec.tstr ~= "" then
    return rec.tstr
  end
  if rec.ts then
    return os.date("%Y-%m-%d %H:%M:%S", rec.ts)
  end
  return nil
end

local function setRef(idx, ref)
  local now = os.time()
  datastore.set(
    {"ClickHistory", tostring(idx)},
    {
      ref = ref,
      -- ts = now,
      tstr = os.date("%Y-%m-%d %H:%M:%S", now),
    }
  )
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

-- add：Get/Set Record Mode
-- nil/false: `Click` to record (default)
-- true: `Ctrl + Click` to record
local function getRecordMode()
  local ClickHistoryMode = datastore.get({"ClickHistoryMode", "!"}) or {}
  return ClickHistoryMode.currentMode or false
end

event.listen {
  name = "page:click",
  run = function(e)
    local d = e.data or {}
    local pageName = editor.getCurrentPage()
    local pos = d.pos
    if not pageName or not pos then return end

    local ref = string.format("%s@%d", pageName, pos)
    local ctrlRecordMode = getRecordMode()

    if ctrlRecordMode then
      if d.ctrlKey then
        appendHistory(ref)
        editor.moveCursor(pos, true)
        editor.flashNotification("pos @ " .. tostring(pos))
      end
    else
      if d.ctrlKey then
        editor.moveCursor(pos, true)
        editor.flashNotification("pos @ " .. tostring(pos))
      else
        appendHistory(ref)
      end
    end
  end
}

command.define {
  name = "Click History: Toggle Mode",
  key = "Ctrl-Shift-m", 
  priority = 1,
  run = function()
    local currentMode = getRecordMode()
    local newMode = not currentMode
    datastore.set({"ClickHistoryMode", "!"}, {currentMode = newMode})
    
    if newMode then
      editor.flashNotification("Mode switched: [Ctrl + Click] to record history.")
    else
      editor.flashNotification("Mode switched: [Click] to record history.")
    end
  end,
}

-- 辅助函数：从 ref 中提取页面名称
local function extractPageName(idx)
    local ref = getRef(idx)
    if not ref then return "" end
    -- 匹配 @ 之前的所有内容作为页面名称
    return ref:match("^(.*)@") or ref
end

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
      local page = extractPageName(b.index)
      editor.flashNotification(string.format("Back:📃%s🕒%d/%d", page, b.index, b.max))
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
      local page = extractPageName(b.index)
      editor.flashNotification(string.format("Forward: %d / %d [%s]", b.index, b.max, page))
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
      local page = extractPageName(max)
      editor.flashNotification(string.format("End: %d / %d [%s]", max, max, page))
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
      local page = extractPageName(1)
      editor.flashNotification(string.format("Start: 1 / %d [%s]", b.max, page))
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

------------------------------------------------------------
-- Click History: Cursor Picker Implementation
------------------------------------------------------------

command.define {
  name = "Click History: Cursor Picker",
  run = function()
    local Ctimes = getTimes()
    local max = Ctimes - 1
    
    if max < 1 then
      editor.flashNotification("No click history found.", "warning")
      return
    end

    local historyItems = {}
    
    for i = max, 1, -1 do
      local ref = getRef(i)
      if ref then
        local pageName, pos = ref:match("^(.*)@(%d+)$")
        local displayName = ref
        local tstr = getTimeString(i) or ""
        
        if pageName and tstr then
          displayName = string.format("%d 🖱️ %s", i, pageName)
        else
          displayName = string.format("%d. %s", i, ref)
        end

        table.insert(historyItems, {
          id = i,
          name = displayName,
          description = tstr .. " 📍 " .. pos,
          ref = ref
        })
      end
    end

    local sel = editor.filterBox(
      "Back to",
      historyItems,
      "Select a Click History...",
      "Page @ Pos where you Once Clicked"
    )

    if sel then
      local b = ensureBrowseSession()
      b.index = sel.id
      setBrowse(b)
      if navigateIndex(sel.id) then
        local page = extractPageName(sel.id)
        editor.flashNotification(string.format("Jumped to history: %d / %d [%s]", sel.id, max, page))
      end
    end
  end,
  key = "Ctrl-Alt-h",
  priority = 1,
}

------------------------------------------------------------
-- Click History: Page Picker Implementation
------------------------------------------------------------

command.define {
  name = "Click History: Page Picker",
  run = function()
    local Ctimes = getTimes()
    local max = Ctimes - 1
    
    if max < 1 then
      editor.flashNotification("No click history found.", "warning")
      return
    end

    local historyItems, seen = {}, {}
    for i = max, 1, -1 do
      local ref = getRef(i)
      if ref then
        local pageName, pos = ref:match("^(.*)@(%d+)$")

        if not seen[pageName] then
          seen[pageName] = true
          local displayName = ref
          local tstr = getTimeString(i) or ""
          
          if pageName and tstr then
            displayName = string.format("%d 🖱️ %s", i, pageName)
          else
            displayName = string.format("%d. %s", i, ref)
          end
  
          table.insert(historyItems, {
            id = i,
            name = displayName,
            description = tstr .. " 📍 " .. pos,
            ref = ref
          })
        end
      end
    end

    local sel = editor.filterBox(
      "Back to",
      historyItems,
      "Select a Click History...",
      "Page @ Pos where you Once Clicked"
    )

    if sel then
      local b = ensureBrowseSession()
      b.index = sel.id
      setBrowse(b)
      if navigateIndex(sel.id) then
        local page = extractPageName(sel.id)
        editor.flashNotification(string.format("Jumped to history: 📃 %s 🕒 %d / %d", page, sel.id, max))
      end
    end
  end,
  key = "Shift-Alt-h",
  priority = 1,
}
```

1. 用了点 [[CONFIG/Picker/Table#Implementation 3|Table Query]] 的 `if not seen[pageName] then` 技巧来做 上述 `Click History: Page Picker`
2. 原则上还可以使用 [[CONFIG/Add_Fields_for_Obj/Last_Opened-Page/Visit_Times]] 中的：
   - 将 datastore 的 get 取值 过程，放进 query 的 select 中，来提速
   - 但我不知道 `if not seen[pageName] then` 还能用不
   - 当然，最限制的是 `query [[ from ...]]` 中的 from 接什么的问题：只有个 getRef(i)，没有现成的 table 可 query

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
