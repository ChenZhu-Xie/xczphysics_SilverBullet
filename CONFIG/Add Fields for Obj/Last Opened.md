
```space-lua
-- 仅用 gsub 对首个 YAML frontmatter 做“更新或插入 LastVisit"
local function upsert_last_visit(text, now)
  -- 统一换行，简化处理
  local s = text:gsub("\r\n", "\n")

  -- 用一次 gsub 捕获首个 frontmatter 块（--- … ---），只替换第 1 个
  local replaced_block
  s, replaced_block = s:gsub("^(%-%-%-\n)(.-)(\n%-%-%-\n)", function(open, fm_body, close)
    -- 1) 尝试替换已存在的 LastVisit 行（两步覆盖“第一行或其后行”的情况）
    local n = 0
    fm_body, n = fm_body:gsub("^%s*LastVisit%s*:%s*[^\n]*", "LastVisit: " .. now, 1)
    if n == 0 then
      fm_body, n = fm_body:gsub("\n%s*LastVisit%s*:%s*[^\n]*", "\nLastVisit: " .. now, 1)
    end

    -- 2) 若没替换到，则在 frontmatter 尾部追加一行 LastVisit
    if n == 0 then
      if fm_body ~= "" and fm_body:sub(-1) ~= "\n" then
        fm_body = fm_body .. "\n"
      end
      fm_body = fm_body .. ("LastVisit: %s\n"):format(now)
    end

    return open .. fm_body .. close
  end, 1)

  -- 若文档没有任何 frontmatter，则前置一个最小块
  if replaced_block == 0 then
    s = ("---\nLastVisit: %s\n---\n%s"):format(now, s)
  end

  return s
end

-- 同页同秒防抖，避免 renderTopWidgets 高频触发造成反复写入
_G.__last_visit_guard = _G.__last_visit_guard or {}
```

```space-lua
-- priority: -1  确保最先执行
event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local page = editor.getCurrentPage()
    local now  = os.date("%Y-%m-%d %H:%M:%S")

    if _G.__last_visit_guard[page] == now then
      return
    end

    local text = editor.getText()
    local newText = upsert_last_visit(text, now)
    if newText ~= text then
      editor.setText(newText)
      -- editor.save() -- 如需立即落盘再打开
    end

    _G.__last_visit_guard[page] = now
  end
}
```