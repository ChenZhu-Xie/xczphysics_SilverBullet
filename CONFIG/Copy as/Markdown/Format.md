
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
-- 🧠 模式定义表：依次为 { name, pattern, priority }
-- pattern 要匹配完整包围结构，可用非贪婪匹配 (.-)
local PATTERNS = {
  { "wikilink",      "%[%[[^%]]-%]%]",          100 }, -- [[...]] 或 [[...|...]]
  { "markdown_link", "%[[^%]]-%]%([^)]-%)",     90  }, -- [text](url)
  { "image",         "!%[[^%]]-%]%([^)]-%)",    85  }, -- ![alt](src)
  { "color_func",    "%%${%s*Color%([^)]-%)}",  80  }, -- ${Color("...")}（注意如果写在长串里要双写 %）
  { "bold",          "%*%*[^%*]-%*%*",          70  }, -- **bold**
  { "italic",        "_[^_]-_",                 60  }, -- _italic_
  { "sup",           "%%^.-%%^",                55  }, -- ^sup^（在普通字符串里用 "%%^" 表示 "%^"）
  { "tag",           "#[%w_%-]+",               50  }, -- #tag
}

local function distanceToCursor(startPos, endPos, cursor)
  if cursor < startPos then return startPos - cursor end
  if cursor > endPos then return cursor - endPos end
  return 0
end

local function findNearestPattern()
  local text = editor.getText()
  local cursor = editor.getCursor()
  local nearest = nil

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    editor.flashNotification(name .. pattern .. prio)
    -- 外层捕获获取起止位置；内部模式不再含 "()"
    for s, e in text:gmatch("()" .. pattern .. "()") do
      local dist = distanceToCursor(s, e, cursor)
      local score = dist + (1000 - prio * 10) -- 距离越小、优先级越高得分越低
      if not nearest or score < nearest.score then
        nearest = { name = name, start = s, stop = e, text = text:sub(s, e - 1), score = score }
      end
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
