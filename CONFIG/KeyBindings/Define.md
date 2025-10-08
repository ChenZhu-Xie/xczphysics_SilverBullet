
1. https://community.silverbullet.md/t/space-lua-toggle-rotate-header-level-h1-h6-on-off/3320/4?u=chenzhu-xie

```space-lua
-- function to toggle a specific header level

local function toggleHeader(level)
  local line = editor.getCurrentLine()
  local text = line.textWithCursor

  -- Detect current header level
  local currentLevel = string.match(text, "^(#+)%s*")
  currentLevel = currentLevel and #currentLevel or 0

  local cleanText = string.gsub(text, "^#+%s*", "")

  -- Toggle: remove if same, otherwise set new level
  if currentLevel == level then
    editor.replaceRange(line.from, line.to, cleanText, true)
  else
    editor.replaceRange(line.from, line.to, string.rep("#", level) .. " " .. cleanText, true)
  end
end

-- register commands Ctrl-1 → Ctrl-6
for lvl = 1, 6 do
  command.define {
    name = "Header: Toggle Level " .. lvl,
    key = "Ctrl-" .. lvl,
    run = function() toggleHeader(lvl) end
  }
end
```

1. https://community.silverbullet.md/t/either-key-bindings-or-plugs-in-config-not-working/3184
2. https://community.silverbullet.md/t/capslock-shortcut-keys-containing-letter-fail/3194

```lua
command.define {
  name = "Navigate: CONFIG",
  run = function()
    editor.navigate "CONFIG"
  end,
  key = "Ctrl-Alt-c",
  mac = "Cmd-Alt-c",
  priority = 0
}
```