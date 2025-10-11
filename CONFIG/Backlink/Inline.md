
1. https://chatgpt.com/share/68ea401c-7eb4-8010-b5b7-348257a7b961

```space-lua
command.define {
  name = "Cursor: Copy Reference",
  key = "Shift-Alt-C",
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

1. backup test version

```lua
command.define {
  name = "Cursor: Copy Reference (debug)",
  key = "Shift-Alt-C",
  run = function()
    -- 第一步：获取当前页面名
    local pageName = editor.getCurrentPage()
    editor.flashNotification("pageName = " .. tostring(pageName), "info")

    if not pageName then
      editor.flashNotification("无法获取页面名", "error")
      return
    end

    -- 第二步：获取光标位置
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

    -- 第三步：尝试取全文
    local fullText = editor.getText()
    editor.flashNotification("editor.getText() length = " .. tostring(#(fullText or "")), "info")
    if not fullText or #fullText == 0 then
      editor.flashNotification("无法获取全文文本", "error")
      return
    end

    -- 第四步：尝试截取光标前文本（如果 pos 为数字）
    local textBefore = ""
    if type(pos) == "number" then
      textBefore = fullText:sub(1, pos)
      editor.flashNotification("sub() success, len=" .. tostring(#textBefore), "info")
    else
      editor.flashNotification("pos 不是数字，无法直接截取文本", "error")
      return
    end

    -- 第五步：计算行号
    local _, newlineCount = textBefore:gsub("\n", "")
    local lineNum = newlineCount + 1
    editor.flashNotification("lineNum = " .. tostring(lineNum), "info")

    -- 第六步：构造引用
    local ref = string.format("[[%s@%d]]", pageName, lineNum)
    editor.flashNotification("ref = " .. ref, "info")

    -- 第七步：复制到剪贴板
    local ok, err = pcall(function() editor.copyToClipboard(ref) end)
    if ok then
      editor.flashNotification("Copied reference OK", "info")
    else
      editor.flashNotification("clipboardWrite failed: " .. tostring(err), "error")
    end
  end
}
```
