
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
local PATTERNS = {
  { "wikilink",      "%[%[[^%]]-%]%]",          100 }, -- [[...]] 或 [[...|...]]
  { "markdown_link", "%[[^%]]-%]%([^)]-%)",     90  }, -- [text](url)
  { "image",         "!%[[^%]]-%]%([^)]-%)",    85  }, -- ![alt](src)
  { "color_func",    "%%${%s*Color%([^)]-%)}",  80  }, -- ${Color("...")}
  { "bold",          "%*%*[^%*]-%*%*",          70  }, -- **bold**
  { "italic",        "_[^_]-_",                 60  }, -- _italic_
  { "sup",           "%%^.-%%^",                55  }, -- ^sup^
  { "tag",           "#[%w_%-]+",               50  }, -- #tag
}

local function distanceToCursor(startPos, endPos, cursorPos)
  if cursorPos < startPos then return startPos - cursorPos end
  if cursorPos > endPos   then return cursorPos - endPos   end
  return 0
end

local function findNearestPattern()
  local text = editor.getText()
  -- 关键修复：取数值位置
  local cur = editor.getCursor()
  local cursor_pos = (type(cur) == "table" and cur.pos) or cur  -- 兼容某些环境直接返回数字

  local nearest = nil

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    -- 轻量日志，确认走到哪条模式
    -- editor.flashNotification(name .. " / prio=" .. tostring(prio))

    -- 用 pcall 包住匹配，避免某一条模式把整个流程中断
    local ok, err = pcall(function()
      for s, e in text:gmatch("()" .. pattern .. "()") do
        -- s/e 是位置捕获（数字）
        if type(s) ~= "number" or type(e) ~= "number" then
          -- 防御性检查（几乎不该发生，除非模式里仍有内部捕获干扰）
          -- editor.flashNotification(("Bad capture in %s: s=%s(%s), e=%s(%s)"):format(name, tostring(s), type(s), tostring(e), type(e)))
          goto continue_match
        end
        local dist = distanceToCursor(s, e, cursor_pos)
        local score = dist + (1000 - prio * 10)
        if not nearest or score < nearest.score then
          nearest = { name = name, start = s, stop = e, text = text:sub(s, e - 1), score = score }
        end
        ::continue_match::
      end
    end)
    if not ok then
      -- 报出哪条模式崩了，便于定位
      editor.flashNotification(("[Pattern error] %s: %s"):format(name, tostring(err)))
      -- 不中断，继续其他模式
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
