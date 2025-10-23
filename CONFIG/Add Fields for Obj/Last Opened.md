```space-lua
event.listen("hooks:renderTopWidgets", function(name)
  -- 读取当前页面内容
  local content = editor.getText()
  editor.flashNotification 'testetsetsetset'
  local now = os.date("%Y-%m-%d %H:%M")

  -- 检查是否已有 frontmatter
  if string.match(content, "^%-%-%-[\r\n]") then
    -- 若有 frontmatter，则尝试替换或追加 LastVisit
    local replaced, n = string.gsub(content,
      "LastVisit:%s*[^\r\n]*",
      "LastVisit: " .. now
    )

    if n == 0 then
      -- 若没有该键，则在第一个 YAML 块中添加
      replaced = string.gsub(replaced,
        "^(%-%-%-[\r\n])",
        "%1LastVisit: " .. now .. "\n"
      )
    end

    if replaced ~= content then
      editor.setText(replaced)
      editor.save()
    end
  else
    -- 若没有 frontmatter，则创建一个新的
    local newContent = string.format("---\nLastVisit: %s\n---\n\n%s", now, content)
    editor.setText(newContent)
    editor.save()
  end
end)

```