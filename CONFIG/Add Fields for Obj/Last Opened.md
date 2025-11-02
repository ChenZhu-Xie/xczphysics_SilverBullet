---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Add%20Fields%20for%20Obj/Last%20Opened.md"
udpateDate: 2025-10-27
---

```space-lua
-- priority: -1
local path = "CONFIG/Add Fields for Obj/Last Opened/Visit Times"
local lastVisitStore = lastVisitStore or {}

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "lastVisit" then
        return lastVisitStore[self.name]
      end
    end
  }
}

event.listen{
  -- name = "hooks:renderTopWidgets",
  name = "editor:pageLoaded",
  run = function(e)
    local pageRef = editor.getCurrentPage()
    local now = os.date("%Y-%m-%d %H:%M:%S")

    if lastVisitStore[pageRef] == now then return end
    lastVisitStore[pageRef] = now

    local lastOpened = space.readPage(path)
    -- 查找 pageRef 是否在 lastOpened 内容里：若有，说明键存在，开始依次覆写中，该 pageRef 键所在行的 2 个值：lastVisit, Times
    -- 若 pageRef 不存在 lastOpened 内容里，则新增 pageRef 键及其所在行的 2 个值：lastVisit, Times
  end
}
```

# Add attr: LastVisit to Pages

1. https://silverbullet.md/API/index#Example
2. https://chatgpt.com/share/68fb38b1-bc48-8010-8bea-5fc4fbd1e7a9
3. https://community.silverbullet.md/t/add-one-off-attr-lastvisit-to-pages/3463/1

${query[[from index.tag "page" where _.lastVisit select {ref=_.ref, lastVisit=_.lastVisit} order by _.lastVisit desc limit 5]]}
```lua
-- priority: -1
local lastVisitStore = lastVisitStore or {}

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "lastVisit" then
        return lastVisitStore[self.name]
      end
    end
  }
}

event.listen{
  -- name = "hooks:renderTopWidgets",
  name = "editor:pageLoaded",
  run = function(e)
    local pageRef = editor.getCurrentPage()
    local now = os.date("%Y-%m-%d %H:%M:%S")

    if lastVisitStore[pageRef] == now then
      return
    end
    lastVisitStore[pageRef] = now
    -- editor.flashNotification("lastVisit: pageRef " .. now)
  end
}
```

## Previous Attempt

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=072f4db51d

```lua
-- priority: -1
local lastVisitStore = lastVisitStore or {}

local function nowEpoch()
  return os.time()
end

local function epochToISO(ts)
  return os.date("%Y-%m-%dT%H:%M:%S", ts)
end

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      local rec = lastVisitStore[self.name]
      if not rec then return nil end
      if attr == "lastVisit" then
        return rec.iso
      elseif attr == "lastVisitEpoch" then
        return rec.epoch
      end
    end
  }
}

event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local pageRef = editor.getCurrentPage()
    if not pageRef then return end
    local epoch = nowEpoch()
    local rec = lastVisitStore[pageRef]
    if rec and rec.epoch == epoch then return end

    lastVisitStore[pageRef] = { epoch = epoch, iso = epochToISO(epoch) }
    editor.flashNotification("lastVisit updated: " .. lastVisitStore[pageRef].epoch)
  end
}
```

```
${query[[from index.tag "page"
  where _.lastVisitEpoch
  select {ref=_.ref, lastVisit=_.lastVisit}
  order by lastVisitEpoch desc
  limit 5]]}

${query[[from index.tag "page"
  where _.lastVisitEpoch
  select {ref=_.ref, lastVisitEpoch=_.lastVisitEpoch}
  order by _.lastVisitEpoch desc  -- _. matters
  limit 5]]}
```

## Original Frontmatter Version

1. https://chatgpt.com/share/68fa6cef-4a6c-8010-93d1-41fe0c23c6a8
2. https://silverbullet.md/API/editor
3. https://silverbullet.md/API/os
4. https://silverbullet.md/Library/Std/APIs/Date
5. https://silverbullet.md/HTTP%20API

```lua
-- priority: -1
event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fmTable = fmExtract.frontmatter or {}
    local body = fmExtract.text or text

    local t = os.date("*t")
    local ms = math.floor((os.clock() % 1) * 1000)
    local now = string.format(
        "%04d-%02d-%02dT%02d:%02d:%02d.%03d",
        t.year, t.month, t.day,
        t.hour, t.min, t.sec,
        ms
    )

    local now = os.date("%Y-%m-%d %H:%M:%S")
    editor.flashNotification(now)
    if fmTable.LastVisit == now then
      return
    end
    fmTable.LastVisit = now

    local lines = {"---"}
    for k, v in pairs(fmTable) do
      if type(v) == "table" then
        v = "{" .. table.concat(v, ", ") .. "}"
      end
      table.insert(lines, string.format("%s: %s", k, v))
    end
    table.insert(lines, "---")
    local fmText = table.concat(lines, "\n") .. "\n"

    local pattern = "^%-%-%-([\r\n].-)+%-%-%-[\r\n]?"
    local newText
    if string.match(text, pattern) then
      newText = text:gsub(pattern, fmText)
    else
      newText = fmText .. body
    end

    if newText ~= text then
      editor.setText(newText, false)
    end
  end
}
```
