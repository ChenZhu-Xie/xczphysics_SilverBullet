

```space-lua
command.define {
  name = "Line: Toggle paragraph / list / task",
  key = "Ctrl-Alt-Tab",
  run = function()
    local line = editor.getCurrentLine()
    if not line or not line.textWithCursor then return end

    local s = line.textWithCursor

    -- task → paragraph
    if s:match("^%s*%- %[[ xX]%] ") then
      s = s:gsub("^%s*%- %[[ xX]%] ", "", 1)

    -- list → task
    elseif s:match("^%s*%- ") then
      s = s:gsub("^%s*%- ", "- [ ] ", 1)

    -- paragraph → list
    elseif s:match("%S") then
      s = "- " .. s
    else
      return
    end

    editor.replaceRange(line.from, line.to, s, true)
  end
}
```
