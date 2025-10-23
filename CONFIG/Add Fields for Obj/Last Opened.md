
```space-lua
-- priority: -1  确保最先执行

local function normalize_lf(s)
  -- 统一换行，便于解析；写回用 \n 即可
  return (s or ""):gsub("\r\n", "\n")
end

local function update_last_visit_in_text(text, now)
  local src = normalize_lf(text)
  -- 只处理“文件开头的 YAML frontmatter”
  if not src:match("^%-%-%-\n") then
    -- 无 frontmatter：最小注入一段，仅含 LastVisit
    return string.format("---\nLastVisit: %s\n---\n%s", now, src)
  end

  -- 找到收尾的 ---（紧接换行）
  local closing_start, closing_end = src:find("\n%-%-%-\n", 4) -- 从第4个字符（---\n）之后找
  if not closing_start then
    -- 结构异常，保底：直接在最前插一次（避免越写越乱）
    return string.format("---\nLastVisit: %s\n---\n%s", now, src)
  end

  local fm_body = src:sub(4, closing_start - 1)  -- 去掉起始 ---\n
  local body    = src:sub(closing_end + 1)

  -- 逐行替换/插入 LastVisit
  local lines, replaced = {}, false
  for line in (fm_body .. "\n"):gmatch("([^\n]*)\n") do
    if line:match("^%s*LastVisit%s*:") then
      table.insert(lines, "LastVisit: " .. now)
      replaced = true
    else
      table.insert(lines, line)
    end
  end
  if not replaced then
    table.insert(lines, "LastVisit: " .. now)
  end

  local new_fm = table.concat(lines, "\n")
  -- 去掉可能的末尾空行
  new_fm = new_fm:gsub("%s+$", "")

  return table.concat({
    "---",
    new_fm,
    "---",
    body
  }, "\n")
end

-- 同一页同一秒防抖，避免频繁写入导致重复渲染
_G.__last_visit_guard = _G.__last_visit_guard or {}

event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local page = editor.getCurrentPage()
    local now  = os.date("%Y-%m-%d %H:%M:%S")

    if _G.__last_visit_guard[page] == now then
      return
    end

    local text = editor.getText()
    local newText = update_last_visit_in_text(text, now)

    if newText and newText ~= text then
      editor.setText(newText)
      -- 如需立即持久化可解开下一行；也可改挂到 editor:pageSaved 事件更稳
      -- editor.save()
    end

    _G.__last_visit_guard[page] = now
  end
}
```