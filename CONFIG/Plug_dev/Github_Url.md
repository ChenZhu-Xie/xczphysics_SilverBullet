---
udpateDate: 2025-11-07
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Plug%20dev/Github%20Url.md"
recommend: ⭐⭐⭐⭐
---

# Add githubUrl to frontmatter

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=8a82458ab0
2. https://chatgpt.com/share/68fbc115-15c8-8010-a698-fea9877c82e2
3. Updated from the last space-lua block in [[CONFIG/Add_Fields_for_Obj/Last_Opened-Page]]
4. Referring to the use cases in [[^Library/Std/APIs/Template]]:
```lua
local fm = index.extractFrontmatter(space.readPage(name),  {
  removeFrontMatterSection = true,
  removeTags = true
})
```
5. https://community.silverbullet.md/t/add-githuburl-to-frontmatter-for-md-plug-developers/3462

```space-lua
-- Function: If the frontmatter lacks a githubUrl, automatically populate it with a direct GitHub link based on the current note’s path.

function encode_url(s)
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

command.define {
  name = "Frontmatter: Add githubUrl",
  key = "Ctrl-Alt-g",
  run = function()
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fm = fmExtract.frontmatter or {}
    
    if type(fm.recommend) == "string" and fm.recommend ~= "" then
      -- preserve exsiting value
      editor.flashNotification("\"recommend\" already Set", "info")
    else
      fm.recommend = "⭐⭐⭐⭐⭐"
      editor.flashNotification("recommend updated: " .. fm.recommend, "info")
    end
    
    if type(fm.udpateDate) == "string" and fm.udpateDate == os.date("%Y-%m-%d") then
      -- modify exsiting value
      editor.flashNotification("\"udpateDate\" already Set", "info")
    else
      fm.udpateDate = os.date("%Y-%m-%d")
      editor.flashNotification("udpateDate added: " .. fm.udpateDate, "info")
    end

    local body = index.extractFrontmatter(text,  {
    removeFrontMatterSection = true }).text or text
    
    local url = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/" .. tostring(editor.getCurrentPath())
    -- editor.flashNotification(url)
    -- editor.flashNotification(string.gsub(url, " ", "%20"))
    -- editor.flashNotification(string.gsub(url, " ", "%%20"))
    githubUrl_original = "\"" .. (fm.githubUrl or "") .. "\""
    -- editor.flashNotification(githubUrl_original)
    -- fm.githubUrl = encode_url(url)
    fm.githubUrl = "\"" .. encode_url(url) .. "\""

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

    editor.setText(newText, false)
    if type(fm.githubUrl) == "string" and fm.githubUrl ~= "" then
      -- modify exsiting value
      if fm.githubUrl ~= githubUrl_original then
        editor.flashNotification("githubUrl updated", "info")
      else
        editor.flashNotification("\"githubUrl\" already Set", "info")
      end
    else
      editor.flashNotification("githubUrl added", "info")
    end
  end
}
```

