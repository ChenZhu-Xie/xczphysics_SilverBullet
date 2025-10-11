


```space-lua
command.define {
  name = "Cursor: Copy Reference",
  run = function()
    -- 获取当前页面名
    local pageName = space.getCurrentPage()
    if not pageName then
      editor.flashNotification("无法获取页面名", "error")
      return
    end

    -- 获取光标位置（行号）
    local pos = editor.getCursor()
    local textBefore = editor.getText():sub(1, pos)
    local lineNum = select(2, textBefore:gsub("\n", "")) + 1

    -- 构造引用
    local ref = string.format("[[%s@%d]]", pageName, lineNum)

    -- 复制到剪贴板并通知用户
    editor.flashNotification("Copied reference: " .. ref, "info")
    system.clipboardWrite(ref)
  end
}
```

