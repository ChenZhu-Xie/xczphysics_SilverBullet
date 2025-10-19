
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
-- pattern def：{ name, pattern, priority }
-- use % to escape special characters
local PATTERNS = {
  { "Wiki Link",     "%[%[[^%]]+%]%]",         100 }, -- [[...]] 或 [[...|...]]
  { "Fields",        "%[[^%]]+:[^%]]+%]",       95  }, -- ![alt](src)
  { "Image",         "!%[[^%]]-%]%([^)]+%)",    90  }, -- ![alt](src)
  { "Markdown Link", "%[[^%]]+%]%([^)]+%)",     85  }, -- [text](url)
  { "Color Func",    "%${[A-Za-z0-9]*%([\"\'][^}]*[\"\']%)}", 80 }, -- ${Color("...")}
  { "Bold",          "%*%*[^%*]+%*%*",          70  }, -- **bold**
  { "Italic",        "_[^_]+_",                 60  }, -- _italic_
  { "Sup",           "%^.+%^",                  55  }, -- ^sup^
  { "Tag",           "#[^, <>%?%.:|\\{}%)%(%*&%^%%%$#@!]+",               50  }, -- #tag
  { "Highlight",     "==[^=]+==",               50  }, -- ==?==
  { "Inline Code",   "`[^`]+`",                 45  }, -- ``?``
}

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

function getCursor_LineStart()
  local textBeforeCursor = editor.getText():sub(1, getCursorPos())
  local cursorLineStart = textBeforeCursor:reverse():find("\n", 1, true)
  -- editor.flashNotification(cursorLineStart)
  return textBeforeCursor:reverse():find("\n", 1, true)
end

function getLineStart()
  local revPos = getCursorPos_LineStart()
  if revPos then
    return getCursorPos() - revPos + 2
  else
    return 1
  end
end

local function findNearestPattern()
  local currentLine = editor.getCurrentLine().textWithCursor:gsub("|%^|", "")
  -- editor.flashNotification(currentLine)
  local nearest = nil
  getCursor_LineStart()

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    local init = 1
    local ok, err = pcall(function()
      while true do
        local s, e = currentLine:find(pattern, init)
        if not s then break end
        local dist = distanceToCursor(s, e, getCursor_LineStart())
        local score = dist * 1001 + (1000 - prio * 10)
        if not nearest or score < nearest.score then
          nearest = { name = name, start = s, stop = e, text = currentLine:sub(s, e), score = score }
        end
        init = (e >= init) and (e + 1) or (init + 1)
      end
    end)
    if not ok then
      editor.flashNotification(("[Pattern error] %s: %s"):format(name, tostring(err)))
    end
  end

  return nearest
end

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

