---
tags: {}
LastVisit: 2025-10-24 14:33:39
---

1. https://chatgpt.com/share/68fa6cef-4a6c-8010-93d1-41fe0c23c6a8
2. https://silverbullet.md/API/editor
3. https://silverbullet.md/API/os
4. https://silverbullet.md/Library/Std/APIs/Date
5. https://silverbullet.md/HTTP%20API

```space-lua
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

```space-lua
command.define{
  name = "cleanup LastVisit",
  description = "remove LastVisit field from front matter in all pages",
  run = function()
    local pages = index.listPages()
    local count = 0
    for _, p in ipairs(pages) do
      local text = index.getPageText(p.ref)
      if text then
        local fmExtract = index.extractFrontmatter(text)
        if fmExtract and fmExtract.frontmatter and fmExtract.frontmatter.LastVisit then
          fmExtract.frontmatter.LastVisit = nil

          -- 重建 front matter
          local lines = {"---"}
          for k, v in pairs(fmExtract.frontmatter) do
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
            newText = fmText .. (fmExtract.text or text)
          end

          index.writePage(p.ref, newText)
          count = count + 1
        end
      end
    end
    editor.flashNotification("已清理 "..count.." 个文件的 LastVisit 字段")
  end
}
```