
```space-lua
-- 命令：Frontmatter: Ensure GitHub URL
-- 作用：若 frontmatter 中无 githubUrl，则根据当前笔记路径自动补全为 GitHub 直链；否则不做任何事。
command.define {
  name = "Frontmatter: Ensure GitHub URL",
  key = "Ctrl-Alt-g",
  run = function()
    local text = editor.getText()
    if index.extractFrontmatter(text).frontmatter.tags == nil then
      local fmExtract = index.extractFrontmatter(text, {removeTags=true}) or {}
    else
      local fmExtract = index.extractFrontmatter(text) or {}
    end
    
    local fm = fmExtract.frontmatter or {}
    local body = fmExtract.body or fmExtract.text or text

    editor.flashNotification(body)

    if type(fm.githubUrl) == "string" and fm.githubUrl ~= "" then
      editor.flashNotification("githubUrl already set", "info")
      return
    end
    
    local path = ""
    if editor.getCurrentPath then
      local ok, p = pcall(editor.getCurrentPath)
      path = ok and (p or "") or ""
    end
    local url = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/" .. path
    fm.githubUrl = url

    -- 重新序列化 frontmatter（保持你当前的简单 key: value 风格；table 值按 YAML 列表输出）
    local lines = {}
    for k, v in pairs(fm) do
      if type(v) == "table" then
        table.insert(lines, k .. ":")
        for _, val in ipairs(v) do
          table.insert(lines, "  - " .. tostring(val))
        end
      else
        table.insert(lines, string.format("%s: %s", k, tostring(v)))
      end
    end
    local fmText = table.concat(lines, "\n")

    -- 用重建的 frontmatter + 原 body 拼回文档
    local newText = string.format("---\n%s\n---\n%s", fmText, body)

    if newText ~= text then
      editor.setText(newText, false)
      editor.flashNotification("githubUrl added", "info")
    end
  end
}
```
