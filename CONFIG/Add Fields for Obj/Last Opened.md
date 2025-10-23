---
tags: {}
LastVisit: 2025-10-24 01:43:27
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

    local now = os.date("%Y-%m-%d %H:%M:%S")
    if fmTable.LastVisit == now then
      return
    end
    fmTable.LastVisit = now

    -- 构造新的 frontmatter
    local lines = {"---"}
    for k, v in pairs(fmTable) do
      if type(v) == "table" then
        v = "{" .. table.concat(v, ", ") .. "}"
      end
      table.insert(lines, string.format("%s: %s", k, v))
    end
    table.insert(lines, "---")
    local fmText = table.concat(lines, "\n") .. "\n"

    -- 判断原文是否已有 frontmatter：即 text 以 "---" 开头
    local newText
    if string.match(text, "^%-%-%-\n.-") then
      -- 已有 frontmatter，直接替换掉旧 frontmatter 区块
      newText = text:gsub("^%-%-%-\n.-\n%-%-%-\n?", fmText)
    else
      -- 无 frontmatter，直接在开头添加
      newText = fmText .. body
    end

    if newText ~= text then
      editor.setText(newText, false)
      -- editor.save()
    end
  end
}

```