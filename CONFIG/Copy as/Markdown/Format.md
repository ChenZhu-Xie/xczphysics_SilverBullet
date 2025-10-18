
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
-- 模式定义：顺序即 tie-break 顺序（distance 相同才看这里）
local PATTERNS = {
  { "wikilink",      "%[%[[^%]]-%]%]"       }, -- [[...]] 或 [[...|...]]
  { "markdown_link", "%[[^%]]-%]%([^)]-%)"  }, -- [text](url)
  { "image",         "!%[[^%]]-%]%([^)]-%)" }, -- ![alt](src)
  { "color_func",    "%${%s*Color%([^)]-%)}"}, -- ${Color("...")}
  { "bold",          "%*%*[^%*]-%*%*"       }, -- **bold**
  { "italic",        "_[^_]-_"              }, -- _italic_
  { "sup",           "%^.-%^"               }, -- ^sup^
  { "tag",           "#[%w_%-]+"            }, -- #tag
}

-- 区间与光标的距离（inside = 0；否则到最近边界）
local function distanceToCursor(startPos, endPos, cursorPos)
  if cursorPos < startPos then return startPos - cursorPos end
  if cursorPos > endPos   then return cursorPos - endPos   end
  return 0
end

-- 串联选择：distance 最小；若相同，按 PATTERNS 中的顺序
local function findNearestPattern()
  local text = editor.getText()
  local cur  = editor.getCursor()
  local cursor_pos = (type(cur) == "table" and cur.pos) or cur  -- 兼容不同返回形式

  local best = nil
  local bestDist = math.huge
  local bestPatIndex = math.huge

  for patIndex, pat in ipairs(PATTERNS) do
    local name, pattern = pat[1], pat[2]
    local init = 1
    -- 单条模式防御性执行，避免中断全局
    local ok, err = pcall(function()
      while true do
        local s, e = text:find(pattern, init)
        if not s then break end

        local dist = distanceToCursor(s, e, cursor_pos)

        -- 严格串联：先比 dist，再比模式顺序
        local better =
          (dist < bestDist) or
          (dist == bestDist and patIndex < bestPatIndex)

        if better then
          best = { name = name, start = s, stop = e, text = text:sub(s, e) }
          bestDist = dist
          bestPatIndex = patIndex
        end

        -- 推进，避免零宽匹配卡死
        init = (e >= init) and (e + 1) or (init + 1)
      end
    end)
    if not ok then
      -- 如遇模式不兼容，记录后继续
      editor.flashNotification(("[Pattern error] %s: %s"):format(name, tostring(err)))
    end
  end

  return best
end

-- 命令保持不变
command.define{
  name = "Editor: Copy Nearest Pattern",
  description = "复制光标附近最近且（距离相同则）按模式顺序胜出的结构",
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
