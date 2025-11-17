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
  local text = line.text  -- 关键：不要用 textWithCursor

  -- 拆出当前的井号前缀和正文
  local hashes, body = string.match(text, "^(#+)%s*(.*)")
  local currentLevel = hashes and #hashes or 0
  local cleanText = body or text  -- 没有标题时 body 为 nil

  local newText
  if currentLevel == level then
    -- 同级 -> 移除标题前缀
    newText = cleanText
  else
    -- 不同级/无标题 -> 设为目标级别
    -- 若正文为空，仍保留一个空格以保持格式一致
    newText = string.rep("#", level) .. " " .. cleanText
  end

  editor.replaceRange(line.from, line.to, newText, true)
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