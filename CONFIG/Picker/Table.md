
1. https://silverbullet.md/Object#table

`${query[[from index.tag "table"
order by _.tableref
]]}`

`${getTables()}`


## Picker

```space-lua
-- 小工具：根据 ref 或 page+pos 跳转
local function navigateToTable(ref, page, pos)
  -- 优先尝试解析 ref 形如 "Page@123"
  if type(ref) == "string" and ref:find("@") then
    local p, ps = ref:match("^(.*)@(%d+)$")
    if p and ps then
      editor.navigate(p)
      editor.moveCursor(tonumber(ps), true)
      return true
    end
  end
  -- 回退：用 page + pos
  if page then
    editor.navigate(page)
    if pos then
      editor.moveCursor(tonumber(pos), true)
    end
    return true
  end
  return false
end

-- Table Picker 命令
command.define {
  name = "Navigate: Table Picker",
  key = "Ctrl-Shift-b",     -- 可自行改快捷键
  priority = 1,
  run = function()
    local tables = getTables()
    if not tables or #tables == 0 then
      editor.flashNotification("No tables found.")
      return
    end

    -- 构建供 filterBox 搜索/显示的条目
    -- 约定：filterBox 会返回被选中的这条对象
    local items = {}
    for _, r in ipairs(tables) do
      local name = r.tableref or (r.page or "Unknown") .. (r.pos and ("@" .. tostring(r.pos)) or "")
      local desc = string.format("%s @ %s:%s", r.tableref or "(no tableref)", r.page or "(no page)", tostring(r.pos or "?"))
      table.insert(items, {
        name = name,              -- 供列表显示/检索
        description = desc,       -- 次要说明
        -- 保留原始导航信息，选择后使用
        ref = r.ref,
        page = r.page,
        pos = tonumber(r.pos)
      })
    end

    -- 弹出选择框
    local sel = editor.filterBox("Table Picker", items, "Select a table")
    if not sel then
      return
    end

    -- 执行跳转
    if not navigateToTable(sel.ref, sel.page, sel.pos) then
      editor.flashNotification("Failed to navigate to selected table.")
    end
  end
}
```

## Realization 2

```space-lua
function getTables()
  local rows = query[[
    from index.tag "table"
    select {
      ref      = _.ref,
      tableref = _.tableref,
      page     = _.page,
      pos      = _.pos,
    }
    order by _.page, _.pos
  ]]

  local out, seen = {}, {}
  for _, r in ipairs(rows) do
    local key = r.tableref
    if not seen[key] then
      seen[key] = true
      table.insert(out, r)
    end
  end
  return out
end
```

## Realization 1

```lua
function getTables()
  local rows = query[[
    from index.tag "table"
    select {
      ref      = _.ref,
      tableref = _.tableref,
      page     = _.page,
      pos      = _.pos,
    }
    order by _.tableref, _.pos
  ]]

  local bestByRef = {}
  for _, r in ipairs(rows) do
    local key = r.tableref
    local cur = bestByRef[key]
    if not cur or (r.pos or math.huge) < (cur.pos or math.huge) then
      bestByRef[key] = r
    end
  end

  local out = {}
  for _, r in pairs(bestByRef) do
    table.insert(out, r)
  end

  return query[[
    from out
    order by _.page, _.pos
  ]]
end
```
