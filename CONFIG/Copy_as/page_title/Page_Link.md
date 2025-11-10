---
tags: meta/library
pageDecoration.prefix: "✂️ "
---
#forward #external #wiki

1. [690f2cf2 f8a8 8010 bc58 2bc6c9a33a03](https://chatgpt.com/share/690f2cf2-f8a8-8010-bc58-2bc6c9a33a03) #chatgpt

```space-lua
-- Page: Copy Link

local function encode_url(s)
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
