
```space-lua
-- 🧠 模式定义表：依次为 { name, pattern, priority }
-- pattern 要匹配完整包围结构，可用非贪婪匹配 (.-)
local PATTERNS = {
  { "wikilink",      "%[%[[^%]]-()%]%]",     100 },  -- [[...]] 或 [[...|...]]
  { "markdown_link", "%[[^%]]-%]%([^)]-%)",  90 },   -- [text](url)
  { "image",         "!%[[^%]]-%]%([^)]-%)", 85 },   -- ![alt](src)
  { "color_func",    "%${%s*Color%([^)]-%)}",80 },   -- ${Color("...")}
  { "bold",          "%*%*[^%*]-()%*%*",     70 },   -- **bold**
  { "italic",        "_[^_]-_+",             60 },   -- _italic_
  { "sup",           "%^.-%^",               55 },   -- ^sup^
  { "tag",           "#[%w_%-]+",            50 },   -- #tag
}

-- 🧩 获取当前选中文本（若有）
local function getSelectedText()
  local sel = editor.getSelection()
  if sel and sel.from ~= sel.to then
    local text = editor.getText()
    return text:sub(sel.from + 1, sel.to)
  end
  return nil
end

-- 🧮 计算某区间与光标位置的“距离”
local function distanceToCursor(startPos, endPos, cursor)
  if cursor < startPos then return startPos - cursor end
  if cursor > endPos then return cursor - endPos end
  return 0
end

-- 🧭 主函数：查找最近的模式
local function findNearestPattern()
  local text = editor.getText()
  local cursor = editor.getCursor().pos
  local nearest = nil

  for _, pat in ipairs(PATTERNS) do
    local name, pattern, prio = pat[1], pat[2], pat[3]
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

-- 🪄 命令定义
command.define("Editor: Copy Nearest Pattern", {
  description = "复制光标附近最近且优先级最高的格式化结构",
  key = "Ctrl-Alt-Click",
  run = function()
    -- 若选中，则优先复制选中内容
    local selected = getSelectedText()
    if selected then
      editor.copyToClipboard(selected)
      editor.flashNotification("已复制选中文本")
      return
    end

    -- 否则查找最近模式
    local match = findNearestPattern()
    if not match then
      editor.flashNotification("未找到匹配模式")
      return
    end

    editor.copyToClipboard(match.text)
    editor.flashNotification("已复制：" .. match.name .. " → " .. match.text)
  end,
})
```
