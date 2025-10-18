
1. https://chatgpt.com/share/68f394f8-fa80-8010-a0cf-db0a89923385

```space-lua
-- 🧠 模式定义表：{ name, pattern, priority }
-- 注意：pattern 是 Lua 字符串模式（非 PCRE）。用 % 转义特殊字符。
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

-- 可选：若你的正文多用星号斜体/行内代码/URL，可把下列三行临时解注释试试
-- table.insert(PATTERNS, 2, { "italic_star", "%*[^%*]-%*", 88 })     -- *italic*
-- table.insert(PATTERNS, 3, { "code_inline", "`[^`]-`",     87 })     -- `code`
-- table.insert(PATTERNS, 4, { "url",         "https?://%S+", 86 })     -- URL

-- 轻量统计：数一数每个模式能否在全文匹配到至少一次
local function has_any_match(text, pattern)
  local s = text:find(pattern, 1)
  return s ~= nil
end

-- 🧮 区间与光标的距离
local function distanceToCursor(startPos, endPos, cursorPos)
  if cursorPos < startPos then return startPos - cursorPos end
  if cursorPos > endPos   then return cursorPos - endPos   end
  return 0
end

-- 🔍 主函数：用 string.find 扫描
local function findNearestPattern()
  local text = editor.getText() or ""
  local cur = editor.getCursor()
  local cursor_pos = (type(cur) == "table" and cur.pos) or cur  -- 兼容不同返回形式
  if type(cursor_pos) ~= "number" then
    editor.flashNotification("cursor 无效（非数字）")
    return nil
  end
  if #text == 0 then
    editor.flashNotification("当前页面为空文本")
    return nil
  end

  local nearest = nil

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
    local init = 1
    local ok, err = pcall(function()
      while true do
        local s, e = text:find(pattern, init)
        if not s then break end
        local dist = distanceToCursor(s, e, cursor_pos)
        local score = dist + (1000 - prio * 10) -- 与你“之前代码”一致
        if not nearest or score < nearest.score then
          nearest = { name = name, start = s, stop = e, text = text:sub(s, e), score = score }
        end
        init = (e >= init) and (e + 1) or (init + 1)
      end
    end)
    if not ok then
      editor.flashNotification(("[Pattern error] %s: %s"):format(name, tostring(err)))
    end
  end

  -- 若完全没有命中，做一次“每种模式有无命中”的汇总，帮助定位（只提示一次）
  if not nearest then
    local hits = {}
    for _, pat in ipairs(PATTERNS) do
      local name, pattern = pat[1], pat[2]
      local ok = has_any_match(text, pattern)
      table.insert(hits, name .. "=" .. (ok and "Y" or "N"))
    end
    editor.flashNotification("无匹配；概览: " .. table.concat(hits, " | "))
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
      -- 兜底：没有任何模式命中时，复制光标处“单词”（避免空手而归）
      local text = editor.getText() or ""
      local cur  = editor.getCursor()
      local pos  = (type(cur) == "table" and cur.pos) or cur
      if type(pos) == "number" and #text > 0 then
        -- 使用 frontier %f 做词边界，兼容字母数字与下划线
        local left  = text:sub(1, pos):find("%f[%w_][%w_]*$") or pos
        local right = text:find("%f[^%w_]", pos + 1) or (#text + 1)
        local word = text:sub(left, right - 1)
        if word and #word > 0 then
          editor.copyToClipboard(word)
          editor.flashNotification("未命中任何模式；已复制词: " .. word)
          return
        end
      end
      editor.flashNotification("未找到匹配模式")
      return
    end
    editor.copyToClipboard(match.text)
    editor.flashNotification("已复制：" .. match.name .. " → " .. match.text)
  end
}
```
