
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
-- 🧠 模式定义表：{ name, pattern, priority }
-- 注意：这里的 pattern 是 Lua 字符串模式（非 PCRE）。用 % 转义特殊字符。
local PATTERNS = {
  { "wikilink",      "%[%[[^%]]-%]%]",         100 }, -- [[...]] 或 [[...|...]]
  { "markdown_link", "%[[^%]]-%]%([^)]-%)",     90  }, -- [text](url)
  { "image",         "!%[[^%]]-%]%([^)]-%)",    85  }, -- ![alt](src)
  { "color_func",    "%${%s*Color%([^)]-%)}",   80  }, -- ${Color("...")}
  { "bold",          "%*%*[^%*]-%*%*",          70  }, -- **bold**
  { "italic",        "_[^_]-_",                 60  }, -- _italic_
  { "sup",           "%^.-%^",                  55  }, -- ^sup^
  { "tag",           "#[%w_%-]+",               50  }, -- #tag
}

-- 🧮 区间与光标的距离
local function distanceToCursor(startPos, endPos, cursorPos)
  if cursorPos < startPos then return startPos - cursorPos end
  if cursorPos > endPos   then return cursorPos - endPos   end
  return 0
end

-- 计算光标所在行的文本切片与其在全文的起始偏移
local function getCurrentLineSlice(text, cursor_pos)
  -- 行起点：最后一个换行后的第一个字符
  local lineStart = (text:sub(1, cursor_pos):match("()[^\n]*$")) or 1
  -- 行终点：下一个换行符前的最后一个字符
  local nextNL = text:find("\n", cursor_pos + 1, true) or (#text + 1)
  local lineEnd = nextNL - 1
  local lineText = text:sub(lineStart, lineEnd)
  local base = lineStart - 1  -- 把“行内索引”映射回“全文索引”的基数
  return lineText, base
end

-- 🔍 主函数：仅扫描光标所在行（dist 绝对优先；评分改为 dist*1001 + tie）
local function findNearestPattern()
  local text = editor.getText()
  local cur = editor.getCursor()
  local cursor_pos = (type(cur) == "table" and cur.pos) or cur
  local nearest = nil

  if type(cursor_pos) ~= "number" or not text or #text == 0 then
    return nil
  end

  -- 只取光标所在行
  local lineText, base = getCurrentLineSlice(text, cursor_pos)

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    local init = 1
    local ok, err = pcall(function()
      while true do
        local s, e = lineText:find(pattern, init)
        if not s then break end
        -- 映射为全文绝对位置以计算距离
        local absS, absE = base + s, base + e
        local dist = distanceToCursor(absS, absE, cursor_pos)

        -- 距离绝对优先
        local score = dist * 1001 + (1000 - prio * 10)

        if not nearest or score < nearest.score then
          nearest = {
            name = name,
            start = absS, stop = absE,
            text = lineText:sub(s, e),
            score = score
          }
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
