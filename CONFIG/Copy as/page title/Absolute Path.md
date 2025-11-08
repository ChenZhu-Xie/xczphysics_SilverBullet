
```space-lua
command.define {
  name = "Page: Copy Absolute Path",
  key = "Ctrl-Shift-d",
  run = function()
    local basePath = "D:\\MySB"
    local sep = string.find(basePath, "\\") and "\\" or "/"
    local absPath
    if basePath:sub(-1) == sep then
      absPath = basePath .. editor.getCurrentPage()
    else
      absPath = basePath .. sep .. editor.getCurrentPage()
    end

    -- 复制到剪贴板
    editor.copyToClipboard(absPath)
    editor.flashNotification("Absolute path ✅", "info")
    editor.flashNotification(absPath, "info")
  end
}

```