---
recommend: ⭐⭐⭐⭐⭐
udpateDate: 2025-11-08
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy%20as/page%20title/Page%20Link.md"
---
#forward #external #wiki

```space-lua
-- Page: Copy Link

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

-- local BASE_URL = "http://127.0.0.1:3000"
local BASE_URL = "https://enlarge-the-percentage.fly.dev/"

function build_page_url(pageName)
  local path = encode_url(pageName)
  if BASE_URL:sub(-1) == "/" then
    return BASE_URL .. path
  else
    return BASE_URL .. "/" .. path
  end
end

command.define {
  -- name = "Copy: Page Link",
  name = "Page: Copy Link",
  key = "Shift-Alt-l",
  run = function()
    local pageUrl = build_page_url(editor.getCurrentPage())
    editor.copyToClipboard(pageUrl)
    editor.flashNotification("Page Link ✅", "info")
    editor.flashNotification(pageUrl, "info")
  end
}
```
