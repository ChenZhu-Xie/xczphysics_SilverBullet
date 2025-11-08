
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

    local relPath = (editor.getCurrentPage():match("^(.*)/[^/]*$") or ""):gsub("/", sep) or ""
    local absPath  -- ensure 
    if basePath:sub(-1) == sep then
      absPath = basePath .. relPath
    elseif relPath ~= "" then
      absPath = basePath .. sep .. relPath
    else
      absPath = basePath
    end
    
    editor.copyToClipboard(absPath)
    -- js.window.navigator.clipboard.writeText(absPath)
    editor.flashNotification("Absolute path ✅", "info")
    editor.flashNotification(absPath, "info")
  end
}

```