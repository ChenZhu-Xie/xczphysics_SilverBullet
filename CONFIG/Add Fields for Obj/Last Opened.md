---
tags: 
LastVisit: 2025-10-24 00:05:07
---
---
tags: 
LastVisit: 2025-10-24 00:04:59
---
---
tags: 
LastVisit: 2025-10-24 00:04:44
---
```space-lua
-- priority: -1, 确保最先执行
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    local pageName = editor.getCurrentPage()
    local text = editor.getText()
    local now = os.date("%Y-%m-%d %H:%M:%S")

    -- 使用 index.extractFrontmatter 提取 frontmatter
    local fm = index.extractFrontmatter(text)
    local fmTable = fm.frontmatter or {}

    -- 更新 LastVisit
    fmTable.LastVisit = now

    local body = fm.body or text

    -- 重新生成 frontmatter
    local newFmLines = {"---"}
    for k,v in pairs(fmTable) do
      table.insert(newFmLines, string.format("%s: %s", k, v))
    end
    table.insert(newFmLines, "---\n")

    local newText = table.concat(newFmLines, "\n") .. body

    -- 如果内容有变化才写回
    if newText ~= text then
      editor.setText(newText)
      editor.save()
    end

    return nil  -- 不返回 widget，本 widget 仅更新 frontmatter
  end
}
```