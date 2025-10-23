---
tags: 
LastVisit: 2025-10-24 00:17:43
---
---
tags: 
LastVisit: 2025-10-24 00:17:26
---
---
LastVisit: 2025-10-24 00:14:21
---
---
LastVisit: 2025-10-24 00:08:34
---

```space-lua
-- priority: -1
event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local text = editor.getText()
    local fm = index.extractFrontmatter(text) or {}
    local body = fm.body or text
    local fmTable = fm.frontmatter or {}
    local now = os.date("%Y-%m-%d %H:%M:%S")

    if fmTable.LastVisit == now then
      return -- 无需写回
    end

    fmTable.LastVisit = now

    -- 重建 frontmatter 文本（安全做法：始终用 fm.body，不用原始 text）
    local lines = {"---"}
    for k, v in pairs(fmTable) do
      table.insert(lines, string.format("%s: %s", k, v))
    end
    table.insert(lines, "---")

    local newText = table.concat(lines, "\n") .. "\n" .. (body or "")
    if newText ~= text then
      editor.setText(newText)
      -- editor.save()
    end
  end
}
```