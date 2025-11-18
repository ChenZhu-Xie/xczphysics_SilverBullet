---
githubUrl: "https://github.com/Mr-xRed/silverbullet-libraries/blob/main/HeaderLevelToggle.md"
---

# Header: Toggle Level

Toggle header levels (h1-h6) headers with one convenient combo-keypress (Ctrl-1 to Ctrl-6):

## Implementation 
```space-lua
------------------------------------------------------------
-- Adjust the # prefix around "|^|" to targetLevel
-- prefixC 可能为 "###|^|", "##|^|#", "#|^|##", "|^|###" 等
------------------------------------------------------------
local function adjustPrefixC(prefixC, targetLevel)
  local cur = prefixC
  local pos = string.find(cur, "|^|", 1, true)
  if not pos then return prefixC end

  local left  = string.sub(cur, 1, pos - 1)
  local right = string.sub(cur, pos + 3)

  local leftHashes  = string.match(left,  "^(#+)$")  or ""
  local rightHashes = string.match(right, "^(#+)$")  or ""
  local total = #leftHashes + #rightHashes

  local diff = targetLevel - total

  if diff > 0 then
    -- add to right
    rightHashes = rightHashes .. string.rep("#", diff)
  elseif diff < 0 then
    -- remove from right first, then left
    diff = -diff
    if #rightHashes >= diff then
      rightHashes = string.sub(rightHashes, 1, #rightHashes - diff)
    else
      local remain = diff - #rightHashes
      rightHashes = ""
      leftHashes = string.sub(leftHashes, 1, #leftHashes - remain)
    end
  end

  return leftHashes .. "|^|" .. rightHashes
end


------------------------------------------------------------
-- Main toggle logic
------------------------------------------------------------
local function toggleHead(level)
  local line = editor.getCurrentLine()
  local text = line.text
  local textC = line.textWithCursor

  -- Detect current header level
  local currentLevel = string.match(text, "^(#+)%s*")
  currentLevel = currentLevel and #currentLevel or 0

  local prefixCpos = string.find(textC, "|^|", 1, true)
  editor.flashNotification(prefixCpos)

  -- Case A: cursor is OUTSIDE header prefix
  if prefixCpos > currentLevel + 1 then
    local cleanTextC = string.gsub(textC, "^#+%s*", "")
    local HeadLine = string.rep("#", level) .. " " .. cleanTextC
    editor.replaceRange(line.from, line.to, HeadLine, true)
    return
  end

  -- Case B: cursor is INSIDE header prefix
  local cleanText = string.gsub(text, "^#+%s*", "")

  -- If same level → remove header
  if currentLevel == level then
    local cleanTextC = "|^|" .. cleanText
    editor.replaceRange(line.from, line.to, cleanTextC, true)
    return
  end

  -- Build prefixC from textC (only prefix part)
  local prefixC = string.match(textC, "^(.-)" .. "%|%^%|") or ""
  prefixC = prefixC .. "|^|" -- ensure the cursor marker is kept

  local prefixC_new = adjustPrefixC(prefixC, level)
  local cleanTextC = prefixC_new .. cleanText
  editor.replaceRange(line.from, line.to, cleanTextC, true)
end


------------------------------------------------------------
-- Register commands Ctrl-1 → Ctrl-6
------------------------------------------------------------
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