---
tags: {}
LastVisit: 2025-10-24 13:56:38.000
---
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

# Page Version

```space-lua
-- pattern def：{ name, pattern, priority }
-- use % to escape special characters
-- you can add your own patterns
local PATTERNS = {
  { "Wiki Link",     "%[%[[^\n%]]+%]%]",          100 }, -- [[...]] 或 [[...|...]]
  { "Fields",        "%[[^\n%]]+:[^\n%]]+%]",     95  }, -- [key:value]
  { "Image",         "!%[[^\n%]]-%]%([^\n)]+%)",  90  }, -- ![alt](src)
  { "Markdown Link", "%[[^\n%]]+%]%([^\n)]+%)",   85  }, -- [text](url)
  { "Color Func",    "%${[A-Za-z0-9]*%([\"\'][^\n}]*[\"\']%)}", 80 }, -- ${Color("...")}
  { "Bold",          "%*%*[^\n%*]+%*%*",          70  }, -- **bold**
  { "Italic",        "_[^\n_]+_",                 60  }, -- _italic_
  { "Sup",           "%^[^ \n%^]+%^",             55  }, -- ^sup^
  { "Strikethrough", "~~[^\n]+~~",                50  }, -- ~~?~~
  { "Sub",           "~[^ \n~]+~",                45  }, -- ^sub^
  { "Tag",           "#[^\n, <>%?%.:|\\{}%)%(%*&%^%%%$#@!]+",               40  }, -- #tag
  { "Marker",        "==[^\n]+==",                35  }, -- ==?==
  { "Inline Code",   "`[^\n`]+`",                 30  }, -- ``?``
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

local function findNearestPattern()
  local pageText = editor.getText()
  local curPos = getCursorPos()
  local nearest = nil

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    local init = 1
    local ok, err = pcall(function()
      while true do
        local s, e = pageText:find(pattern, init)
        if not s then break end
        local dist = distanceToCursor(s, e, curPos)
        local score = dist * 1001 + (1000 - prio * 10)
        if not nearest or score < nearest.score then
          nearest = { name = name, start = s, stop = e, text = pageText:sub(s, e), score = score }
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
  name = "Cursor: Copy Nearest Pattern",
  description = "Copy the nearest and highest-priority formatted structure around the cursor",
  key = "Alt-c",
  run = function()
    local match = findNearestPattern()
    if not match then
      editor.flashNotification("No pattern matched.")
      return
    end
    editor.copyToClipboard(match.text)
    editor.flashNotification("Copied: " .. match.name .. " → " .. match.text)
  end
}
```

# Line Version

```lua
-- pattern def：{ name, pattern, priority }
-- use % to escape special characters
-- you can add your own patterns
local PATTERNS = {
  { "Wiki Link",     "%[%[[^%]]+%]%]",       100  }, -- [[...]] 或 [[...|...]]
  { "Fields",        "%[[^%]]+:[^%]]+%]",     95  }, -- [key:value]
  { "Image",         "!%[[^%]]-%]%([^)]+%)",  90  }, -- ![alt](src)
  { "Markdown Link", "%[[^%]]+%]%([^)]+%)",   85  }, -- [text](url)
  { "Color Func",    "%${[A-Za-z0-9]*%([\"\'][^}]*[\"\']%)}", 80 }, -- ${Color("...")}
  { "Bold",          "%*%*[^%*]+%*%*",        70  }, -- **bold**
  { "Italic",        "_[^_]+_",               60  }, -- _italic_
  { "Sup",           "%^[^ %^]+%^",           55  }, -- ^sup^
  { "Strikethrough", "~~[^]+~~",              50  }, -- ~~?~~
  { "Sub",           "~[^ ~]+~",              45  }, -- ^sub^
  { "Tag",           "#[^, <>%?%.:|\\{}%)%(%*&%^%%%$#@!]+",               40  }, -- #tag
  { "Marker",        "==[^]+==",              35  }, -- ==?==
  { "Inline Code",   "`[^`]+`",               30  }, -- ``?``
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
  return cursorLineStart
end

function getPos_LineStart()
  local posLineStart = getCursorPos() - getCursor_LineStart() + 2
  -- editor.flashNotification(posLineStart)
  return posLineStart
end

local function findNearestPattern()
  -- local currentLine = editor.getCurrentLine().textWithCursor:gsub("|%^|", "")
  local currentLine = editor.getCurrentLine().text
  -- https://silverbullet.md/API/editor#editor.getCurrentLine()
  -- editor.flashNotification(currentLine)
  local curPos_LineStart = getCursor_LineStart()
  -- getPos_LineStart()
  local nearest = nil
  
  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    local init = 1
    local ok, err = pcall(function()
      while true do
        local s, e = currentLine:find(pattern, init)
        if not s then break end
        local dist = distanceToCursor(s, e, curPos_LineStart)
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
  name = "Cursor: Copy Nearest Pattern",
  description = "Copy the nearest and highest-priority formatted structure around the cursor",
  key = "Alt-c",
  run = function()
    local match = findNearestPattern()
    if not match then
      editor.flashNotification("No pattern matched.")
      return
    end
    editor.copyToClipboard(match.text)
    editor.flashNotification("Copied: " .. match.name .. " → " .. match.text)
  end
}
```

