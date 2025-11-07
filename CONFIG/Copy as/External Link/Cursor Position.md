---
recommend: ⭐⭐⭐⭐⭐
udpateDate: 2025-10-29
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy%20as/External%20Link/Cursor%20Position.md"
---

# Generate Link @ Cursor Position

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=a2cb4ea0b8

```space-lua
-- [[Page#Header]] -> http(s)://host/Page#Header
-- [[Page@pos]]    -> http(s)://host/Page@pos

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

-- your address:   "https://your-domain"
-- local BASE_URL = "http://127.0.0.1:3000"
local BASE_URL = "https://enlarge-the-percentage.fly.dev/"

local function build_page_url(pageName)
  local path = replace_space_with_percent20(pageName)
  if BASE_URL:sub(-1) == "/" then
    return BASE_URL .. path
  else
    return BASE_URL .. "/" .. path
  end
end

command.define {
  name = "Cursor: Copy Link",
  key = "Ctrl-Shift-c",
  run = function()
    local currentLine = editor.getCurrentLine().text
    local pageName = editor.getCurrentPage()
    local pos = editor.getCursor()
    local headerMarks, headerName = string.match(currentLine, "^(#+) +(.+)$")
    
    local pageUrl = build_page_url(pageName)
    local out
    if headerMarks and headerName and headerName:match("%S") then
      headerName = headerName:match("^%s*(.+)")
      headerName = replace_space_with_percent20(headerName)
      out = string.format("%s#%s", pageUrl, headerName)
      -- editor.flashNotification("Copied header external link: " .. out, "info")
      editor.flashNotification("Copied header link: " .. out, "info")
    else
      -- if pos and pos > 0 then
      --   out = string.format("%s@%d", pageUrl, pos)
      -- else
      --   out = string.format("%s", pageUrl)
      -- end
      out = string.format("%s@%d", pageUrl, pos)
      -- editor.flashNotification("Copied cursor external link: " .. out, "info")
      -- editor.flashNotification("Copied cursor link: " .. out, "info")
      editor.flashNotification("Copied cursor link: ", "info")
      editor.flashNotification(out, "info")
    end
  
    editor.copyToClipboard(out)
  end
}
```
