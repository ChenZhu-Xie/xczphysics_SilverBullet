
```space-lua
command.define {
  name = "Copy: Page Reference",
  key = "Shift-Alt-p",
  run = function()
    local ref = string.format("[[%s]]", editor.getCurrentPage())
    editor.copyToClipboard(ref)
    editor.flashNotification("Page Reference ✅", "info")
    editor.flashNotification(ref, "info")
  end
}
```