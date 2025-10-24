
```space-lua
-- priority: -1
local LastVisitStore = LastVisitStore or {}

-- 给 page tag 定义动态属性 LastVisit
index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "lastVisit" then
        return LastVisitStore[self.name]
      end
    end
  }
}

event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local pageRef = editor.getCurrentPage()
    local now = os.date("!%Y-%m-%dT%H:%M:%S.000")

    if LastVisitStore[pageRef] == now then
      return
    end
    LastVisitStore[pageRef] = now

    editor.flashNotification("lastVisit updated: " .. now)
  end
}
```

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
