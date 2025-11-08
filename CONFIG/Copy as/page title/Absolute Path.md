
```space-lua
command.define {
  name = "Page: Copy Absolute Path",
  key = "Ctrl-Shift-d",
  run = function()
    local sep = package.config:sub(1,1)  -- 自动检测操作系统的路径分隔符
    local basePath = app.getSpaceDir()   -- 获取当前空间的根目录（SB 内置 API）
    local absPath = basePath .. sep .. editor.getCurrentPage()

    -- 复制到剪贴板
    editor.copyToClipboard(absPath)
    editor.flashNotification("Absolute path ✅", "info")
    editor.flashNotification(absPath, "info")
  end
}

```