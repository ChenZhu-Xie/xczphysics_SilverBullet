---
tags: meta/library
pageDecoration.prefix: "📎 "
---
#forward #external #wiki

1. [690f2d31 4b60 8010 9770 eda3e44d845f](https://chatgpt.com/share/690f2d31-4b60-8010-9770-eda3e44d845f) #chatgpt

# Github Url

1. 使用了 [[CONFIG/Plug dev/Github Url]] 的 `function: encode_url`
   - [[CONFIG/Copy as/Cursor Link]] 和 [[CONFIG/Copy as/page title/Page Link]] 也用了

```space-lua
-- description: Copy the GitHub URL of the current page to clipboard

command.define {
  -- name = "Copy: Page Github Url",
  name = "Page: Copy Github",
  key = "Shift-Alt-g",
  run = function()
    -- Construct GitHub URL
    -- local base = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/"
    local base = "github:ChenZhu-Xie/xczphysics_SilverBullet/"
    local url = base .. encode_url(editor.getCurrentPath())

    -- Copy to clipboard
    editor.copyToClipboard(url)
    -- editor.flashNotification("Copied: GitHub URL ✅", "info")
    editor.flashNotification("GitHub URL ✅", "info")
    editor.flashNotification(url, "info")
  end
}
```
