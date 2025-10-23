---
LastVisit: 2025-10-24 00:14:21
---
---
LastVisit: 2025-10-24 00:08:34
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

    -- 更新 LastVisit
    fmTable.LastVisit = now

    local newText
    if fm.exists then
      -- 已有 frontmatter，只更新 LastVisit
      local updated = false
      local lines = {}
      for line in fm.raw:gmatch("[^\r\n]+") do
        if line:match("^LastVisit:") then
          table.insert(lines, "LastVisit: " .. now)
          updated = true
        else
          table.insert(lines, line)
        end
      end
      if not updated then
        -- 在最后一行 --- 前插入 LastVisit
        if lines[#lines]:match("^%s*---%s*$") then
          table.insert(lines, #lines, "LastVisit: " .. now)
        else
          table.insert(lines, "LastVisit: " .. now)
        end
      end
      -- 拼接 frontmatter + body
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