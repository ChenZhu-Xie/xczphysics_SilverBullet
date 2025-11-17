---
githubUrl: "https://github.com/Mr-xRed/silverbullet-libraries/blob/main/HeaderLevelToggle.md"
---

# Header: Toggle Level

Toggle header levels (h1-h6) headers with one convenient combo-keypress (Ctrl-1 to Ctrl-6):

### Implementation# Implementation 
```space-lua
-- function to toggle a specific header level
-- function to toggle a specific header level (h1-h6) with cursor-aware behavior
local function toggleHead(level)
  local line = editor.getCurrentLine()
  local textWithCursor = line.textWithCursor
  local text = line.text -- 用无光标文本做匹配与生成，避免正则被占位符打断

  -- 计算光标在“无占位文本”中的 0-based 位置（若无占位符，则为 nil）
  local function cursorPosWithout(withC, withoutC)
    if withC == withoutC then return nil end
    -- 找出 withC 中被多出来的那个字符的位置（即光标占位符）
    for i = 1, #withC do
      local candidate = withC:sub(1, i - 1) .. withC:sub(i + 1)
      if candidate == withoutC then
        -- 返回无占位文本中的 0-based 位置（光标在第 i 个字符之前）
        return i - 1
      end
    end
    return nil
  end

  local cur0 = cursorPosWithout(textWithCursor, text) -- 0-based

  -- 解析行首标题：hashes + spaces + body
  local hashes, spaces, body = text:match("^(#+)(%s*)(.*)")
  local currentLevel = hashes and #hashes or 0
  local oldBodyStart0 = 0
  if hashes then
    oldBodyStart0 = #hashes + #spaces -- 0-based：正文第一个字符的索引
  end
  local cleanText = body or text

  -- 决定新文本和“新正文起点”
  local newText, newBodyStart0
  if currentLevel == level then
    -- 同级 -> 移除标题
    newText = cleanText
    newBodyStart0 = 0
  else
    -- 设为目标级别（统一用 1 个空格分隔）
    newText = string.rep("#", level) .. " " .. cleanText
    newBodyStart0 = level + 1 -- level 个 '#'+ 一个空格
  end

  -- 计算替换后光标应处位置（0-based）
  local newCur0 = nil
  if cur0 ~= nil then
    if cur0 <= oldBodyStart0 then
      -- 光标在旧的标题前缀或空格内：吸附到新正文起点
      newCur0 = newBodyStart0
    else
      -- 光标在正文内：保持相对正文起点的偏移量
      local delta = cur0 - oldBodyStart0
      newCur0 = newBodyStart0 + delta
    end
    -- 边界保护
    if newCur0 < 0 then newCur0 = 0 end
    if newCur0 > #newText then newCur0 = #newText end
  end

  -- 执行替换
  editor.replaceRange(line.from, line.to, newText, true)

  -- 复位光标（优先用 setCursor；若你的环境没有该 API，可改为 setSelection）
  if newCur0 ~= nil then
    if editor.setCursor then
      editor.setCursor(line.from + newCur0)
    elseif editor.setSelection then
      editor.setSelection(line.from + newCur0, line.from + newCur0)
    end
  end

  -- 反馈消息（可选）
  if currentLevel == level then
    editor.flashNotification("Header level removed", "info")
  elseif currentLevel == 0 then
    editor.flashNotification("Header level set to " .. level, "info")
  else
    editor.flashNotification("Header level changed to " .. level, "info")
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