---
name: CONFIG/Copy_as/page_title/Github_Url
tags: meta/library
website: https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy_as/page_title/Github_Url.md
pageDecoration.prefix: "✂️ "
---
#forward #external #wiki

1. [690f2d31 4b60 8010 9770 eda3e44d845f](https://chatgpt.com/share/690f2d31-4b60-8010-9770-eda3e44d845f) #chatgpt

# Github Url

1. 使用了 [[CONFIG/Plug_dev/Github_Url]] 的 `function: encode_url`
   - [[CONFIG/Copy_as/Cursor_Link]] 和 [[CONFIG/Copy_as/page_title/Page_Link]] 也用了

```space-lua
-- description: Copy the GitHub URL of the current page to clipboard

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

command.define {
  -- name = "Copy: Page Github Url",
  name = "Page: Copy Github",
  key = "Shift-Alt-g",
  run = function()
    -- Construct GitHub URL
    local base = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/"
    -- local base = "github:ChenZhu-Xie/xczphysics_SilverBullet/"
    local url = base .. encode_url(editor.getCurrentPath())

    -- Copy to clipboard
    editor.copyToClipboard(url)
    -- editor.flashNotification("Copied: GitHub URL ✅", "info")
    editor.flashNotification("GitHub URL ✅", "info")
    editor.flashNotification(url, "info")
  end
}
```
