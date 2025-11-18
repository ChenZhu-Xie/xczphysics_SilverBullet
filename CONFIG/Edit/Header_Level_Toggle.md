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

  local prefixCpos = string.find(textC, "|^|", 1, true) -- position of cursor marker
  local HeadLine
  local bodyText = string.gsub(text, "^#+%s*", "")

  -- Toggle: remove header if same level, otherwise adjust to new level
  if currentLevel == level then
    if prefixCpos > currentLevel + 1 then
      HeadLine = string.gsub(textC, "^#+%s*", "")
    else
      HeadLine = "|^|" .. bodyText
    end
  else
    if prefixCpos > currentLevel + 1 then
      local bodyTextC = string.gsub(textC, "^#+%s*", "")
      HeadLine = string.rep("#", level) .. " " .. bodyTextC
    else
      local prefixC = string.match(textC, "^(.+)%s*")
      local pos = string.find(prefixC, "|^|", 1, true)
      
      -- split prefix into left and right of cursor marker
      local left  = string.sub(prefixC, 1, pos - 1)
      local right = string.sub(prefixC, pos + 3)

      local leftHashes  = string.match(left,  "^(#+)$")  or ""
      local rightHashes = string.match(right, "^(#+)$")  or ""
      local total = #leftHashes + #rightHashes
      local diff = level - total

      if diff > 0 then
        -- Add # from left to right
        local addLeft = math.min(diff, 0)
        local addRight = diff - addLeft
        leftHashes  = string.rep("#", addLeft) .. leftHashes
        rightHashes = string.rep("#", addRight) .. rightHashes
      elseif diff < 0 then
        -- Remove # from left to right
        local needRemove = -diff
        if #leftHashes >= needRemove then
          leftHashes = string.sub(leftHashes, needRemove + 1)
        else
          local remain = needRemove - #leftHashes
          leftHashes = ""
          rightHashes = string.sub(rightHashes, remain + 1)
        end
      end

      prefixC = leftHashes .. "|^|" .. rightHashes
      HeadLine = prefixC .. " " .. bodyText
    end
  end

  -- Replace current line with updated header
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