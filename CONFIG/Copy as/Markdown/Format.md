
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
-- 🧠 模式定义表：{ name, pattern, priority }
-- 注：priority 字段保留但不再用于决策，仅作为注释信息；真正的先后按表内顺序决定
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

-- 🧮 区间与光标的距离（光标在区间内则为0）
local function distanceToCursor(startPos, endPos, cursorPos)
  if cursorPos < startPos then return startPos - cursorPos end
  if cursorPos > endPos   then return cursorPos - endPos   end
  return 0
end

-- 🔍 主函数：严格“distance 优先，其次模式顺序，再次更短/更靠左”
local function findNearestPattern()
  local text = editor.getText() or ""
  local cur  = editor.getCursor()
  local cursor_pos = (type(cur) == "table" and cur.pos) or cur  -- 兼容返回形式

  if type(cursor_pos) ~= "number" or #text == 0 then
    return nil
  end

  local best = nil
  local bestDist = math.huge
  local bestPatIndex = math.huge
  local bestLen = math.huge
  local bestStart = math.huge

  for patIndex, pat in ipairs(PATTERNS) do
    local name, pattern = pat[1], pat[2]
    local init = 1

    -- 防御性执行：某条模式异常不影响整体
    local ok = pcall(function()
      while true do
        local s, e = text:find(pattern, init)
        if not s then break end

        local dist = distanceToCursor(s, e, cursor_pos)
        local len  = e - s + 1

        local better = false
        if dist < bestDist then
          better = true
        elseif dist == bestDist then
          if patIndex < bestPatIndex then
            better = true
          elseif patIndex == bestPatIndex then
            if len < bestLen then
              better = true
            elseif len == bestLen then
              if s < bestStart then
                better = true
              end
            end
          end
        end

        if better then
          best = { name = name, start = s, stop = e, text = text:sub(s, e) }
          bestDist = dist
          bestPatIndex = patIndex
          bestLen = len
          bestStart = s
        end

        -- 推进起点，避免零宽匹配导致死循环
        init = (e >= init) and (e + 1) or (init + 1)
      end
    end)

    -- 某模式异常则忽略，继续尝试其他模式
    if not ok then
      -- 可按需打开调试提示：
      -- editor.flashNotification("[Pattern error] " .. name)
    end
  end

  return best
end

-- 🪄 命令（保留你原来的命令签名）
command.define{
  name = "Editor: Copy Nearest Pattern",
  description = "复制光标附近最近；若距离相同按模式顺序/更短/更靠左决胜",
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
