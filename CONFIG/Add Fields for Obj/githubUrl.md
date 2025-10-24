```space-lua
-- 命令：Frontmatter: Ensure GitHub URL
-- 作用：若 frontmatter 中无 githubUrl，则根据当前笔记路径自动补全为 GitHub 直链；否则不做任何事。
command.define {
  "Frontmatter: Ensure GitHub URL",
  run = function()
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fm = fmExtract.frontmatter or {}
    local body = fmExtract.body or fmExtract.text or text

    -- 已存在就直接退出
    if type(fm.githubUrl) == "string" and fm.githubUrl ~= "" then
      -- 可选：提示
      -- editor.flashNotification("githubUrl already set", "info")
      return
    end

    -- 计算 URL
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
      -- 可选：提示
      -- editor.flashNotification("githubUrl added", "info")
    end
  end
}

-- 快捷键绑定：Shift+Alt+X 触发上述命令
-- 若你的空间环境支持 keymap.define（常见做法），可使用如下写法：
if keymap and keymap.define then
  keymap.define {
    ["Shift-Alt-X"] = "Frontmatter: Ensure GitHub URL"
  }
end
```
