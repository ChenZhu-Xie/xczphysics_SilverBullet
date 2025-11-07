
```space-lua
-- priority: 0
-- name: Copy GitHub URL
-- description: Copy the GitHub URL of the current page to clipboard (Shift+Alt+G)

command.define {
  name = "Copy: GitHub URL",
  key = "Shift-Alt-g",
  run = function()

    -- Helper: encode spaces (you can expand for more encoding if needed)
    local function encode_url(s)
      return (s:gsub(" ", "%%20"))
    end

    -- Construct GitHub URL
    local base = "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/"
    local url = base .. encode_url(editor.getCurrentPath())

    -- Copy to clipboard
    system.clipboard.set(url)
    editor.flashNotification("Copied GitHub URL to clipboard ✅", "info")
  end
}

```