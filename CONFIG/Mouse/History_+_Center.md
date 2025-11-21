
本来是想做 鼠标穿透 penetration/pass through 的
发现这功能实现不了...
- 可能是被 preview:click 拦截了。
现在改为了做 ctrl + click 自动带 Navigate: Center Cursor 的功能

此外，在此基础上再新增了功能：不按 ctrl 的 普通点击 会记录 点击历史。

# Click History

点击任何行末，都不会触发。#Bug 无论是否是空行。

## Employed

### Set

```space-lua
-- Cursor History Plugin
-- 数据键规范：
--   {"ClickTimes", "!"}           -> { Ctimes = number }
--   {"ClickHistory", tostring(i)} -> { ref = "page@pos", ts = number }
--   {"ClickBrowse", "!"}          -> { index = number, max = number, active = boolean }

------------------------------------------------------------
-- 工具函数
------------------------------------------------------------
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
  -- 初次没有则按当前历史末尾初始化
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

-- 可选：是否在“浏览中”产生新点击时截断未来历史（更贴近浏览器）
local enableTruncateDuringBrowse = true

-- 追加一条历史（遵循你已有的 0 基索引写法：先用旧 Ctimes 作为索引再递增）
local function appendHistory(ref)
  local Ctimes = getTimes()

  -- 连续重复点击相同 ref 则忽略
  local lastRef = getRef(Ctimes - 1)
  if lastRef and lastRef == ref then
    return
  end

  local browse = getBrowse()

  if enableTruncateDuringBrowse and browse.active and browse.index <= browse.max then
    -- 截断未来历史：保留 [0 .. browse.index]，丢弃 (browse.index .. Ctimes-1]
    -- 避免逐条删除，这里直接重置 Ctimes 到 browse.index + 1 即可，新写入会覆盖后续键
    Ctimes = browse.index + 1
    setTimes(Ctimes)
  end

  -- 写入新条目：使用当前 Ctimes 作为索引
  setRef(Ctimes, ref)
  setTimes(Ctimes + 1)

  -- 新事件后，把浏览状态复位到“当前位置”
  local newTimes = Ctimes + 1
  setBrowse({ index = newTimes, max = newTimes - 1, active = false })
end

-- 导航到指定历史索引（已做存在性判断）
local function navigateIndex(idx)
  local ref = getRef(idx)
  if not ref then
    editor.flashNotification("历史不存在（" .. tostring(idx) .. "）", "warning")
    return false
  end
  editor.navigate(ref)
  local pos = tonumber(string.match(ref, "@.*"))
  editor.moveCursor(pos, true)
  return true      
end

-- 进入一次浏览会话：锁定 max 快照，并把 index 放在“当前位置”（Ctimes）
local function ensureBrowseSession()
  local b = getBrowse()
  if not b.active then
    local Ctimes = getTimes()
    b.max = math.max(Ctimes - 1, -1) -- 没有历史时为 -1
    b.index = Ctimes                 -- Ctimes 表示“当前位置/最新”，未指向具体条目
    b.active = true
    setBrowse(b)
  end
  return getBrowse()
end

------------------------------------------------------------
-- 事件：记录点击 -> 写入历史
------------------------------------------------------------
event.listen {
  name = "page:click",
  run = function(e)
    local d = e.data or {}
    local pageName = editor.getCurrentPage()
    local pos = d.pos
    if not pageName or not pos then return end

    local ref = string.format("%s@%d", pageName, pos)
    appendHistory(ref)

    -- Ctrl-点击：直接把光标移动到点击位置（保留你的逻辑）
    if d.ctrlKey then
      editor.moveCursor(pos, true)
      editor.flashNotification("pos@" .. tostring(pos))
      return
    end
  end
}

------------------------------------------------------------
-- 命令：后退（Back，去更旧的历史）——下界 0
------------------------------------------------------------
command.define {
  name = "Cursor History: Back",
  run = function()
    local b = ensureBrowseSession()

    if b.max < 0 then
      editor.flashNotification("暂无历史", "warning")
      return
    end

    -- 从“当前位置（Ctimes）”第一次后退，则去到 max
    if b.index > b.max then
      b.index = b.max
    else
      -- 否则往更旧的减一，但不小于 0
      b.index = math.max(b.index - 1, 0)
    end

    setBrowse(b)
    if navigateIndex(b.index) then
      editor.flashNotification(string.format("Back: %d / %d", b.index, b.max))
    end
  end,
  key = "Shift-Alt-ArrowLeft",
  mac = "Shift-Alt-ArrowLeft",
  priority = 1,
}

------------------------------------------------------------
-- 命令：前进（Forward，去更新的历史）——上界为进入浏览会话时的 max 快照
------------------------------------------------------------
command.define {
  name = "Cursor History: Forward",
  run = function()
    local b = ensureBrowseSession()

    if b.max < 0 then
      editor.flashNotification("暂无历史", "warning")
      return
    end

    if b.index >= b.max then
      -- 已到进入会话时的最新快照，不能再前进
      editor.flashNotification("已到达历史最新（会话上界）", "warning")
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

------------------------------------------------------------
-- 命令：回到当前位置（退出浏览会话）
------------------------------------------------------------
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

------------------------------------------------------------
-- 启动初始化：把浏览指针初始化为历史最大值（末尾）
-- 启动时执行一次即可
------------------------------------------------------------
local Ctimes = getTimes()
setBrowse({ index = Ctimes, max = math.max(Ctimes - 1, -1), active = false })
```
