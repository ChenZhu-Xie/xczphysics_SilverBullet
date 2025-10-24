---
githubUrl: https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Add%20Fields%20for%20Obj/Github%20Url.md
---

```space-lua
-- Function: If the frontmatter lacks a githubUrl, automatically populate it with a direct GitHub link based on the current note’s path; otherwise, take no action.
command.define {
  name = "Frontmatter: Ensure GitHub URL",
  key = "Ctrl-Alt-g",
  run = function()
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fm = fmExtract.frontmatter or {}
    local body = fmExtract.body or fmExtract.text or text

    if type(fm.githubUrl) == "string" and fm.githubUrl ~= "" then
      editor.flashNotification("githubUrl already set", "info")
      return
    end

    local function replace_space_with_percent20(s)
      local parts = {}
      for i = 1, #s do
        local c = s:sub(i, i)
        if c == " " then
          parts[#parts+1] = "%20"
        else
          parts[#parts+1] = c
        end
      end
      return table.concat(parts)
    end
    
    local path = ""
    if editor.getCurrentPath then
      local ok, p = pcall(editor.getCurrentPath)
      path = ok and (p or "") or ""
    end
    local url = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/" .. tostring(path)
    fm.githubUrl = replace_space_with_percent20(url)
    -- editor.flashNotification(url)
    -- editor.flashNotification(string.gsub(url, " ", "%20"))
    -- editor.flashNotification(string.gsub(url, " ", "%%20"))

    local lines = {}
    for k, v in pairs(fm) do
      if type(v) == "table" then
        -- editor.flashNotification(k)
        if #v > 0 then
          table.insert(lines, k .. ":")
          for _, val in ipairs(v) do
            table.insert(lines, "  - " .. tostring(val))
          end
        end
      else
        -- editor.flashNotification(string.format("%s: %s", k, tostring(v)))
        table.insert(lines, k .. ": " .. tostring(v))
      end
    end
    -- editor.flashNotification(lines)
    local fmText = table.concat(lines, "\n")
    
    local newText = string.format("---\n%s\n---\n%s", fmText, body)

    if newText ~= text then
      editor.setText(newText, false)
      editor.flashNotification("githubUrl added", "info")
    end
  end
}
```
