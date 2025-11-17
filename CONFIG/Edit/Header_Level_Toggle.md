---
githubUrl: "https://github.com/Mr-xRed/silverbullet-libraries/blob/main/HeaderLevelToggle.md"
---

# Header: Toggle Level

Toggle header levels (h1-h6) headers with one convenient combo-keypress (Ctrl-1 to Ctrl-6):

## Implementation 
```space-lua
-- Toggle a specific header level while preserving cursor
local function toggleHead(level)
  local line = editor.getCurrentLine()
  local textWithCursor = line.textWithCursor
  local text = line.text  -- 用无光标文本做全部解析与生成

  -- 提取“光标占位符字符”和其在 textWithCursor 中的索引
  local function extractCursorInfo(withC, withoutC)
    if withC == withoutC then return nil, nil end
    for i = 1, #withC do
      local candidate = withC:sub(1, i - 1) .. withC:sub(i + 1)
      if candidate == withoutC then
        return withC:sub(i, i), i -- 返回占位符字符和其位置（1-based）
      end
    end
    return nil, nil
  end

  local cursorChar, cursorIdxInWith = extractCursorInfo(textWithCursor, text)
  -- 在“无光标文本”中的插入点（即光标左侧字符数）：
  local posWithout = cursorIdxInWith and (cursorIdxInWith - 1) or nil

  -- 解析旧头部：hashes, spaces, body
  local hashes, spaces, body = text:match("^(#+)(%s*)(.*)")
  local currentLevel = hashes and #hashes or 0
  local oldBodyStart = 1
  if hashes then
    oldBodyStart = #hashes + #spaces + 1  -- 正文首字符的 1-based 索引
  end

  -- 基于“无光标文本”构造 cleanText 和新行
  local cleanText = body or text
  local newText
  if currentLevel == level then
    newText = cleanText
  else
    newText = string.rep("#", level) .. " " .. cleanText
  end

  -- 计算“新正文起点”
  local newBodyStart = 1
  if currentLevel ~= level then
    -- 我们构造的前缀固定为：level 个 '#' + 1 个空格
    newBodyStart = level + 2  -- 正文首字符在新行中的 1-based 索引
  end

  -- 计算新光标插入位置（在新行中的无光标位置）
  local newInsertPos = nil
  if posWithout then
    if posWithout < oldBodyStart then
      -- 原光标在旧头部内：吸附到新正文起点
      newInsertPos = newBodyStart
    else
      -- 原光标在旧正文内：保持相对位移
      local delta = posWithout - oldBodyStart
      newInsertPos = newBodyStart + delta
    end
  end
  -- 边界保护（允许插在开头或末尾之后一位）
  if newInsertPos then
    if newInsertPos < 1 then newInsertPos = 1 end
    if newInsertPos > #newText + 1 then newInsertPos = #newText + 1 end
  end

  -- 若识别到了占位符，则把它插回到新文本中相应位置
  local finalText = newText
  if cursorChar and newInsertPos then
    finalText = newText:sub(1, newInsertPos - 1) .. cursorChar .. newText:sub(newInsertPos)
  end

  editor.replaceRange(line.from, line.to, finalText, true)
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