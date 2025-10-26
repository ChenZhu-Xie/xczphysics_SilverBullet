---
recommend: ⭐⭐⭐⭐⭐
udpateDate: 2025-10-26
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Add%20Fields%20for%20Obj/Github%20Url.md"
---

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=8a82458ab0
2. https://chatgpt.com/share/68fbc115-15c8-8010-a698-fea9877c82e2
3. Updated from the last space-lua block in [[CONFIG/Add Fields for Obj/Last Opened]]
4. [[^Library/Std/APIs/Template]]

```space-lua
-- Function: If the frontmatter lacks a githubUrl, automatically populate it with a direct GitHub link based on the current note’s path; otherwise, take no action.
command.define {
  name = "Frontmatter: Add githubUrl",
  key = "Ctrl-Alt-g",
  run = function()
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fm = fmExtract.frontmatter or {}
    local body = index.extractFrontmatter(text,  {
    removeFrontMatterSection = true }).text or text

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
    -- editor.flashNotification(url)
    -- editor.flashNotification(string.gsub(url, " ", "%20"))
    -- editor.flashNotification(string.gsub(url, " ", "%%20"))
    -- fm.githubUrl = replace_space_with_percent20(url)
    if type(fm.recommend) == "string" and fm.recommend ~= "" then
      editor.flashNotification("\"recommend\" already Set", "info")
    else
      fm.recommend = "⭐⭐⭐⭐⭐"
      editor.flashNotification("Added - recommend: " .. fm.udpateDate, "info")
    end
    if type(fm.udpateDate) == "string" and fm.udpateDate ~= "" then
      editor.flashNotification("\"udpateDate\" already Set", "info")
    else
      fm.udpateDate = os.date("%Y-%m-%d")
      editor.flashNotification("Added - udpateDate: " .. fm.udpateDate, "info")
    end
    fm.githubUrl = "\"" .. replace_space_with_percent20(url) .. "\""

    
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
    
    local newText = string.format("---\n%s\n---%s", fmText, body)

    if newText ~= text then
      editor.setText(newText, false)
      if type(fm.githubUrl) == "string" and fm.githubUrl ~= "" then
        editor.flashNotification("Updated - githubUrl: " .. fm.githubUrl, "info")
      else
        editor.flashNotification("Added - githubUrl: " .. fm.githubUrl, "info")
      end
    end
  end
}
```

