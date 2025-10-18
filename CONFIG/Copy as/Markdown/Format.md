
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

-- 计算优先级打平项的范围，并据此设定 SCALE，确保 dist 绝对优先
local TIE_MIN, TIE_MAX = math.huge, -math.huge
for _, pat in ipairs(PATTERNS) do
  local prio = pat[3]
  local tie  = 1000 - prio * 10           -- 和你原来一致的“优先级项”
  if tie < TIE_MIN then TIE_MIN = tie end
  if tie > TIE_MAX then TIE_MAX = tie end
end
local TIE_RANGE = (TIE_MAX - TIE_MIN)
local SCALE     = (TIE_RANGE + 1)         -- 距离每差 1，比分至少差 (TIE_RANGE+1)

-- 🧮 区间与光标的距离
local function distanceToCursor(startPos, endPos, cursorPos)
  if cursorPos < startPos then return startPos - cursorPos end
  if cursorPos > endPos   then return cursorPos - endPos   end
  return 0
end

-- 🔍 主函数：用 string.find 扫描，避免 "()" 空捕获
local function findNearestPattern()
  local text = editor.getText() or ""
  local cur  = editor.getCursor()
  local cursor_pos = (type(cur) == "table" and cur.pos) or cur  -- 兼容不同返回形式
  local nearest = nil

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    local init = 1
    -- 用 pcall 防御单条模式异常
    local ok, err = pcall(function()
      while true do
        local s, e = text:find(pattern, init)
        if not s then break end
        local dist = distanceToCursor(s, e, cursor_pos)

        -- 绝对以距离为先：score = dist * SCALE + tie'
        -- 其中 tie' 被平移到 [0, TIE_RANGE] 防止负值
        local tie   = 1000 - prio * 10
        local score = dist * SCALE + (tie - TIE_MIN)

        if not nearest or score < nearest.score then
          nearest = { name = name, start = s, stop = e, text = text:sub(s, e), score = score }
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
  description = "复制光标附近最近（距离绝对优先，其次按优先级打平）的格式化结构",
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
