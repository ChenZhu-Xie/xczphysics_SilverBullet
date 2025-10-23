---
LastVisit: 2025-10-24 00:06:47
---
---
tags: 
LastVisit: 2025-10-24 00:06:14
---
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

    local fm = index.extractFrontmatter(text)
    local fmTable = fm.frontmatter or {}

    -- 如果 LastVisit 已经是最新，就不改
    if fmTable.LastVisit == now then return end

    fmTable.LastVisit = now

    local newText
    if fm.exists then
      -- 已有 frontmatter，只更新 LastVisit
      local lines = {}
      local updated = false
      for line in fm.raw:gmatch("[^\r\n]+") do
        if line:match("^LastVisit:") then
          table.insert(lines, "LastVisit: " .. now)
          updated = true
        else
          table.insert(lines, line)
        end
      end
      if not updated then
        table.insert(lines, 2, "LastVisit: " .. now) -- 插入到开头
      end
      newText = table.concat(lines, "\n") .. "\n" .. fm.body
    else
      -- 没有 frontmatter，新建
      newText = string.format("---\nLastVisit: %s\n---\n%s", now, text)
    end

    if newText ~= text then
      editor.setText(newText)
      editor.save()
    end
  end
}

```