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
    editor.replaceRange(line.from, line.to, HeadLine, true)
  else
    local is_Cprefix = true
    local cleanText = string.gsub(text, "^#+%s*", "")
    -- Toggle: remove if same, otherwise set new level
    if currentLevel == level then
      local cleanTextC = "|^|" .. cleanText
      editor.replaceRange(line.from, line.to, cleanTextC, true)
    else
      local prefixC = string.match(text, "^(.+)%s*")

      -------------------------------------------------------------------
      -- 在这里，根据 currentLevel 的值，从后往前增减 prefixC 中的 # 数量，
      -- 直到其数量等于 level。prefixC 可能是：
      --   "###|^|", "##|^|#", "#|^|##", "|^|###" 等形式。
      --
      -- 处理步骤：
      -- 1. 找到 "|^|" 的位置，把 prefixC 分成左、右两部分(left/right)
      -- 2. 统计两侧 # 的总数 total
      -- 3. 若 total < level → 在右侧追加 #(level - total)
      --    若 total > level → 从右往左删除 #(total - level)
      -------------------------------------------------------------------
      local pos = string.find(prefixC, "|^|", 1, true)
      editor.flashNotification(pos)
      local left  = string.sub(prefixC, 1, pos - 1)
      local right = string.sub(prefixC, pos + 3)

      local leftHashes  = string.match(left,  "^(#+)$")  or ""
      local rightHashes = string.match(right, "^(#+)$")  or ""
      local total = #leftHashes + #rightHashes
      local diff = level - total

      if diff > 0 then
        -- 增加 # → 追加到右侧
        rightHashes = rightHashes .. string.rep("#", diff)
      elseif diff < 0 then
        -- 减少 # → 优先从右侧删，再删左侧
        local needRemove = -diff
        if #rightHashes >= needRemove then
          rightHashes = string.sub(rightHashes, 1, #rightHashes - needRemove)
        else
          local remain = needRemove - #rightHashes
          rightHashes = ""
          leftHashes = string.sub(leftHashes, 1, #leftHashes - remain)
        end
      end

      -- 重建 prefixC
      prefixC = leftHashes .. "|^|" .. rightHashes
      -------------------------------------------------------------------

      local cleanTextC = prefixC .. " " .. cleanText
      editor.replaceRange(line.from, line.to, cleanTextC, true)
    end
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