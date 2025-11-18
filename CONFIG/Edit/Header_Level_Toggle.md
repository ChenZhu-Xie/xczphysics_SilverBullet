---
githubUrl: "https://github.com/Mr-xRed/silverbullet-libraries/blob/main/HeaderLevelToggle.md"
---

##### Header: Toggle Level

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
  -- editor.flashNotification(prefixCpos)
  local HeadLine
  local bodyText = string.gsub(text, "^#+%s*", "")

  -- Toggle: remove if same, otherwise set new level
  if currentLevel == level then
    HeadLine = "|^|" .. bodyText
  else
    if prefixCpos > currentLevel + 1 then
      local bodyTextC = string.gsub(textC, "^#+%s*", "")
      HeadLine = string.rep("#", level) .. " " .. bodyTextC
    else
      local prefixC = string.match(textC, "^(.+)%s*")
      local pos = string.find(prefixC, "|^|", 1, true)
      editor.flashNotification(pos)
      local left  = string.sub(prefixC, 1, pos - 1)
      local right = string.sub(prefixC, pos + 3)

      local leftHashes  = string.match(left,  "^(#+)$")  or ""
      local rightHashes = string.match(right, "^(#+)$")  or ""
      local total = #leftHashes + #rightHashes
      local diff = level - total

      if diff > 0 then
        rightHashes = rightHashes .. string.rep("#", diff)
      elseif diff < 0 then
        local needRemove = -diff
        if #rightHashes >= needRemove then
          rightHashes = string.sub(rightHashes, 1, #rightHashes - needRemove)
        else
          local remain = needRemove - #rightHashes
          rightHashes = ""
          leftHashes = string.sub(leftHashes, 1, #leftHashes - remain)
        end
      end
      prefixC = leftHashes .. "|^|" .. rightHashes
      HeadLine = prefixC .. " " .. bodyText
    end
  end
  editor.replaceRange(line.from, line.to, HeadLine, true)
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