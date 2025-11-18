---
githubUrl: "https://github.com/Mr-xRed/silverbullet-libraries/blob/main/HeaderLevelToggle.md"
---

# Header: Toggle Level

Toggle header levels (h1-h6) headers with one convenient combo-keypress (Ctrl-1 to Ctrl-6):

## Implementation 
```space-lua
-- function to toggle a specific header level
local function toggleHead(level)
  local line = editor.getCurrentLine()
  local text = line.text
  local textC = line.textWithCursor
  
  -- Detect current header level
  local currentLevel = string.match(text, "^(#+)%s*")
  currentLevel = currentLevel and #currentLevel or 0

  local prefixCpos = string.find(textC, "|^|", 1, true) -- plain?
  editor.flashNotification(prefixCpos)
  if prefixCpos > currentLevel + 1 then
    local is_Cprefix = false
    local cleanTextC = string.gsub(textC, "^#+%s*", "")
    local HeadLine = string.rep("#", level) .. " " .. cleanTextC
  else
    local is_Cprefix = true
    local cleanText = string.gsub(text, "^#+%s*", "")
    if currentLevel == level then
      local cleanTextC = "|^|" .. cleanText
    else
      local prefixC = string.gsub(textC, , "")
    
  end
  
  

  -- Toggle: remove if same, otherwise set new level
  if currentLevel == level then
    editor.replaceRange(line.from, line.to, cleanTextC, true)
  else
    editor.replaceRange(line.from, line.to, string.rep("#", level) .. " " .. cleanTextC, true)
  end
end

-- register commands Ctrl-1 → Ctrl-6
for lvl = 1, 6 do
  command.define {
    name = "Header: Toggle Level " .. lvl,
    key = "Ctrl-" .. lvl,
    run = function() 
      toggleHead(lvl) 
    end
  }
end
```

## Discussions about this widget
* [SilverBullet Community](https://community.silverbullet.md/t/space-lua-toggle-rotate-header-level-h1-h6-on-off/3320?u=mr.red)