---
tags: {}
LastVisit: 2025-10-24 01:22:48
---
---
tags: {}
LastVisit: 2025-10-24 01:22:12
---
---
tags: {}
LastVisit: 2025-10-24 01:17:49
---

```space-lua
-- priority: -1
event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fmTable = fmExtract.frontmatter or {}
    local body = fmExtract.text or text
    editor.flashNotification(body)

    local now = os.date("%Y-%m-%d %H:%M:%S")

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
    table.insert(lines, "---\n")

    local newText = table.concat(lines, "\n") .. body

    if newText ~= text then
      editor.setText(newText)
    end
  end
}

```