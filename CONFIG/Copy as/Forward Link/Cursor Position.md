---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy%20as/Forward%20Link/Cursor%20Position.md"
udpateDate: 2025-11-07
---

# Generate Ref @ Cursor Position

1. https://chatgpt.com/share/68ea401c-7eb4-8010-b5b7-348257a7b961
2. https://community.silverbullet.md/t/generate-link-cursor-position/3372/7?u=chenzhu-xie

```space-lua
command.define {
  name = "Cursor: Copy Reference",
  key = "Shift-Alt-c",
  run = function()
    local currentLine = editor.getCurrentLine().text
    local pageName = editor.getCurrentPage()
    local pos = editor.getCursor()
    local headerMarks, headerName = string.match(currentLine, "^(#+) +(.+)$")
    -- editor.flashNotification(headerMarks .. headerName)
    local ref
    if headerMarks and headerName and headerName:match("%S") then
      headerName = headerName:match("^%s*(.+)")
      ref = string.format("[[%s#%s]]", pageName, headerName)
      editor.flashNotification("Copied header reference: " .. ref, "info")
    else
      -- if pos and pos > 0 then
      --   ref = string.format("[[%s@%d]]", pageName, pos)
      -- else
      --   ref = string.format("[[%s]]", pageName)
      -- end
      ref = string.format("[[%s@%d]]", pageName, pos)
      -- editor.flashNotification("Copied cursor reference: " .. ref, "info")
      editor.flashNotification("Cursor Reference ✅", "info")
      editor.flashNotification(ref, "info")
    end

    editor.copyToClipboard(ref)
  end
}
```

## Longer Version

```lua
command.define {
  name = "Cursor: Copy Reference",
  key = "Shift-Alt-c",
  run = function()
    -- Step 1: Get the current page name
    local pageName = editor.getCurrentPage()
    if not pageName then
      editor.flashNotification("Failed to get current page name", "error")
      return
    end

    -- Step 2: Get the cursor position (character offset)
    local pos = editor.getCursor()
    if type(pos) ~= "number" then
      editor.flashNotification("Cursor position is not a number", "error")
      return
    end

    -- Step 3: Build the reference string
    local ref = string.format("[[%s@%d]]", pageName, pos)

    -- Step 4: Copy the reference to clipboard
    local ok, err = pcall(function() editor.copyToClipboard(ref) end)
    if ok then
      editor.flashNotification("Copied reference: " .. ref, "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}
```

## Backup Test Version

```lua
command.define {
  name = "Cursor: Copy Reference (debug)",
  key = "Shift-Alt-c",
  run = function()
    -- Step 1: Get the current page name
    local pageName = editor.getCurrentPage()
    editor.flashNotification("pageName = " .. tostring(pageName), "info")

    if not pageName then
      editor.flashNotification("Failed to get current page name", "error")
      return
    end

    -- Step 2: Get cursor position
    local pos = editor.getCursor()
    editor.flashNotification("getCursor() type = " .. type(pos), "info")
    if type(pos) == "table" then
      local info = ""
      for k, v in pairs(pos) do
        info = info .. k .. "=" .. tostring(v) .. " "
      end
      editor.flashNotification("cursor table: " .. info, "info")
    else
      editor.flashNotification("cursor raw value: " .. tostring(pos), "info")
    end

    -- Step 3: Get full text
    local fullText = editor.getText()
    editor.flashNotification("editor.getText() length = " .. tostring(#(fullText or "")), "info")
    if not fullText or #fullText == 0 then
      editor.flashNotification("Failed to get full text", "error")
      return
    end

    -- Step 4: Get text before cursor (if pos is a number)
    local textBefore = ""
    if type(pos) == "number" then
      textBefore = fullText:sub(1, pos)
      editor.flashNotification("sub() success, len = " .. tostring(#textBefore), "info")
    else
      editor.flashNotification("pos is not a number, cannot substring", "error")
      return
    end

    -- Step 5: Count line number
    local _, newlineCount = textBefore:gsub("\n", "")
    local lineNum = newlineCount + 1
    editor.flashNotification("lineNum = " .. tostring(lineNum), "info")

    -- Step 6: Build reference string
    local ref = string.format("[[%s@%d]]", pageName, lineNum)
    editor.flashNotification("ref = " .. ref, "info")

    -- Step 7: Copy reference to clipboard
    local ok, err = pcall(function() editor.copyToClipboard(ref) end)
    if ok then
      editor.flashNotification("Copied reference successfully", "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}
```
