
1. https://silverbullet.md/Object#table

`${query[[from index.tag "table"
order by _.tableref
]]}`

`${getTables()}`

## Picker

```space-lua
-- 小工具：根据 ref 或 page+pos 跳转
local function navigateToTable(page, pos)
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

    local items = {}
    for _, r in ipairs(tables) do
      local name = r.ref
      local desc = string.format("%s @ %d", r.page, r.pos)
      table.insert(items, {
        name = name,              -- 供列表显示/检索
        description = desc,       -- 次要说明
        -- 保留原始导航信息，选择后使用
        ref = r.ref,
        page = r.page,
        pos = r.pos
      })
    end

    local sel = editor.filterBox("Table Picker", items, "Select a table")
    if not sel then return end

    if not navigateToTable(sel.page, sel.pos) then
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
