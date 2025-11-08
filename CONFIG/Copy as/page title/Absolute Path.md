
```space-lua
command.define {
  name = "Page: Copy Absolute Path",
  key = "Ctrl-Shift-d",
  run = function()
    local basePath = "F:\\Note_book\\SilverBullet\\1.local_server\\SB_space"
    
    local sep
    if string.find(basePath, "\\") then
      sep = "\\"  -- Windows
      basePath = basePath:gsub("\\+", "\\")
    else
      sep = "/"   -- macOS / Linux
    end
    
    local absPath  -- ensure 
    if basePath:sub(-1) == sep then
      absPath = basePath .. editor.getCurrentPage()
    else
      absPath = basePath .. sep .. editor.getCurrentPage()
    end
    
    editor.copyToClipboard(absPath)
    editor.flashNotification("Absolute path ✅", "info")
    editor.flashNotification(absPath, "info")
  end
}

```