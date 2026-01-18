
1. [command to cycle between paragraph and task](https://community.silverbullet.md/t/command-to-cycle-between-paragraph-and-task/3774/8?u=chenzhu-xie) #community #silverbullet

- [ ] d

```space-lua
-- first we disable the Shortcut of the system command which already has the Keys assigned
-- command.update {
--   name = "Navigate: To This Page",
--   key = "",
--   mac = ""
-- }

-- and then define a command with the new shortcut keys
command.define {
  name = "Line: Toggle paragraph / list / task",
  key = "Ctrl-Tab",
  run = function()
    local line = editor.getCurrentLine()
    if not line or not line.textWithCursor then return end

    local s = line.textWithCursor

    -- task → list
    if s:match("^(%s*)%- %[[ xX]%] ") then
      s = s:gsub("^(%s*)%- %[[ xX]%] ", "%1- ", 1)
    
    -- list → task
    elseif s:match("^(%s*)%- ") then
      s = s:gsub("^(%s*)%- ", "%1- [ ] ", 1)
    
    -- paragraph → list (one-time)
    elseif s:match("%S") then
      s = "- " .. s
    
    -- empty / whitespace-only line
    else
      return
    end

    editor.replaceRange(line.from, line.to, s, true)
  end
}
```
