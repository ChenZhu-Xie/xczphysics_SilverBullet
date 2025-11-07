
# Github Url

1. 使用了 [[CONFIG/Plug dev/Github Url]] 的 `function: replace_space_with_percent20`

```space-lua
-- description: Copy the GitHub URL of the current page to clipboard

command.define {
  name = "Copy: Page GitHub URL",
  key = "Shift-Alt-g",
  run = function()

    -- Helper: encode spaces (you can expand for more encoding if needed)
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
