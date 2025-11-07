---
recommend: ⭐⭐⭐⭐⭐
udpateDate: 2025-11-07
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy%20as/External%20Link/Cursor%20Pos.md"
---

# Generate Link @ Cursor Position

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=a2cb4ea0b8

```space-lua
-- [[Page#Header]] -> http(s)://host/Page#Header
-- [[Page@pos]]    -> http(s)://host/Page@pos

-- your address:   "https://your-domain"
-- local BASE_URL = "http://127.0.0.1:3000"
local BASE_URL = "https://enlarge-the-percentage.fly.dev/"

local function build_page_url(pageName)
  local path = encode_url(pageName)
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
      headerName = encode_url(headerName)
      out = string.format("%s#%s", pageUrl, headerName)
      -- editor.flashNotification("Copied header external link: " .. out, "info")
      -- editor.flashNotification("Copied header link: " .. out, "info")
      editor.copyToClipboard(out)
      editor.flashNotification("Header Link ✅", "info")
      editor.flashNotification(out, "info")
    else
      -- if pos and pos > 0 then
      --   out = string.format("%s@%d", pageUrl, pos)
      -- else
      --   out = string.format("%s", pageUrl)
      -- end
      out = string.format("%s@%d", pageUrl, pos)
      -- editor.flashNotification("Copied cursor external link: " .. out, "info")
      -- editor.flashNotification("Copied cursor link: " .. out, "info")
      editor.copyToClipboard(out)
      editor.flashNotification("Cursor Link ✅", "info")
      editor.flashNotification(out, "info")
    end
  end
}
```
