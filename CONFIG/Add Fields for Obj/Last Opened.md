---
tags: {}
LastVisit: 2025-10-24 02:16:03
---

1. https://chatgpt.com/share/68fa6cef-4a6c-8010-93d1-41fe0c23c6a8
2. https://silverbullet.md/API/editor

```space-lua
-- priority: -1
event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fmTable = fmExtract.frontmatter or {}
    local body = fmExtract.text or text

    local now = os.time()
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

