
```space-lua
-- 命令：Frontmatter: Ensure GitHub URL
-- 作用：先清理空的 tags，再确保 githubUrl 存在（缺失则补全）
command.define {
  name = "Frontmatter: Ensure GitHub URL",
  key = "Ctrl-Alt-g",
  run = function()
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fm = fmExtract.frontmatter or {}
    local body = fmExtract.body or fmExtract.text or text

    -- 判空工具：支持 table 空表、空字符串、"[]"/"{}" 这类占位
    local function isEmptyTags(v)
      if v == nil then return false end
      local t = type(v)
      if t == "table" then
        return next(v) == nil
      elseif t == "string" then
        local s = v:gsub("%s+", "")
        return s == "" or s == "[]" or s == "{}"
      end
      return false
    end

    local changed = false

    -- 1) 清理空 tags
    if isEmptyTags(fm.tags) then
      fm.tags = nil
      changed = true
    end

    -- 2) 确保 githubUrl 存在（若已存在且非空则不动）
    if not (type(fm.githubUrl) == "string" and fm.githubUrl ~= "") then
      local path = ""
      if editor.getCurrentPath then
        local ok, p = pcall(editor.getCurrentPath)
        path = ok and (p or "") or ""
      end
      local url = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/" .. path
      fm.githubUrl = url
      changed = true
    end

    -- 若无任何变化，直接提示并返回
    if not changed then
      editor.flashNotification("No changes (githubUrl present; tags not empty)", "info")
      return
    end

    -- 3) 重新序列化 frontmatter（保持你当前的简单 key: value；table 作为 YAML 列表输出）
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

    -- 4) 用重建的 frontmatter + 原 body 拼回文档
    local newText = string.format("---\n%s\n---\n%s", fmText, body)
    if newText ~= text then
      editor.setText(newText, false)
      editor.flashNotification("Frontmatter updated", "info")
    end
  end
}
```
