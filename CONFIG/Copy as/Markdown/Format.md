
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
-- 🧠 模式定义表：{ name, pattern, priority }
-- 注意：这里的 pattern 是 Lua 字符串模式（非 PCRE）。用 % 转义特殊字符。
local PATTERNS = {
  { "wikilink",      "%[%[[^%]]-%]%]",         100 }, -- [[...]] 或 [[...|...]]
  { "markdown_link", "%[[^%]]-%]%([^)]-%)",     90  }, -- [text](url)
  { "image",         "!%[[^%]]-%]%([^)]-%)",    85  }, -- ![alt](src)
  { "color_func", "%$%b{}", 80 }, -- ${Color("...")}
  { "bold",          "%*%*[^%*]-%*%*",          70  }, -- **bold**
  { "italic",        "_[^_]-_",                 60  }, -- _italic_
  { "sup",           "%^.-%^",                  55  }, -- ^sup^
  { "tag",           "#[^, <>%?%.:|\\{}%)%(%*&%^%%%$#@!]+",               50  }, -- #tag
}

-- 🧮 区间与光标的距离
local function distanceToCursor(startPos, endPos, cursorPos)
  if cursorPos < startPos then return startPos - cursorPos end
  if cursorPos > endPos   then return cursorPos - endPos   end
  return 0
end

function getCursorPos()
  local cur = editor.getCursor() 
  local cursor_pos = (type(cur) == "table" and cur.pos) or cur
  return cursor_pos
end

function getLineStart()
  local textBeforeCursor = editor.getText():sub(1, getCursorPos())
  -- editor.flashNotification(textBeforeCursor)
  local lastNewlineEnd = textBeforeCursor:match(".*()\n")
  if not lastNewlineEnd then
    return 1
  end
  return lastNewlineEnd + 1
end

function getCursor_LineStart()
  local cursor_LineStart = getCursorPos() - getLineStart()
  editor.flashNotification(cursor_LineStart)
  return cursor_LineStart
end

-- 🔍 主函数：用 string.find 扫描，避免 "()" 空捕获
local function findNearestPattern()
  local currentLine = editor.getCurrentLine().textWithCursor:gsub("|%^|", "")
  editor.flashNotification(currentLine)
  local nearest = nil
  getCursor_LineStart()

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    local init = 1
    -- 用 pcall 防御单条模式异常
    local ok, err = pcall(function()
      while true do
        local s, e = currentLine:find(pattern, init)
        if not s then break end
        local dist = distanceToCursor(s, e, getCursor_LineStart())
        local score = dist * 1001 + (1000 - prio * 10) -- 距离越小、优先级越高，得分越低
        if not nearest or score < nearest.score then
          nearest = { name = name, start = s, stop = e, text = currentLine:sub(s, e), score = score }
        end
        -- 推进起点，避免零宽匹配卡死
        init = (e >= init) and (e + 1) or (init + 1)
      end
    end)
    if not ok then
      -- 若某模式在该运行时不被支持，记录后继续其他模式
      editor.flashNotification(("[Pattern error] %s: %s"):format(name, tostring(err)))
    end
  end

  return nearest
end

-- 🪄 命令
command.define{
  name = "Editor: Copy Nearest Pattern",
  description = "复制光标附近最近且优先级最高的格式化结构",
  key = "Ctrl-Alt-k",
  run = function()
    local match = findNearestPattern()
    if not match then
      editor.flashNotification("未找到匹配模式")
      return
    end
    editor.copyToClipboard(match.text)
    editor.flashNotification("已复制：" .. match.name .. " → " .. match.text)
  end
}
```

