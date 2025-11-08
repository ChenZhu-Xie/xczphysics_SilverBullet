
# Github Url

1. 使用了 [[CONFIG/Plug dev/Github Url]] 的 `function: encode_url`
   - [[CONFIG/Copy as/External Link/Cursor Pos]] 和 [[CONFIG/Copy as/page title/Page Link]] 也用了

```space-lua
-- description: Copy the GitHub URL of the current page to clipboard

command.define {
  -- name = "Copy: Page Github Url",
  name = "Page: Copy Github",
  key = "Shift-Alt-g",
  run = function()
    -- Construct GitHub URL
    local base = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/"
    local url = base .. encode_url(editor.getCurrentPath())

    -- Copy to clipboard
    editor.copyToClipboard(url)
    -- editor.flashNotification("Copied: GitHub URL ✅", "info")
    editor.flashNotification("GitHub URL ✅", "info")
    editor.flashNotification(url, "info")
  end
}
```
