
1. https://silverbullet.md/Object#table
2. [tags from tables not indexed in tag object](https://community.silverbullet.md/t/tags-from-tables-not-indexed-in-tag-object/1690?u=chenzhu-xie) #community #silverbullet

`${query[[from index.tag "table"
order by _.tableref
]]}`

`${getTables()}`

## Picker

```space-lua
local function navigateToTable(ref, pos)
  if ref then
    editor.navigate(ref)
    if pos then
      editor.moveCursor(tonumber(pos), true)
    end
    return true
  end
  return false
end

command.define {
  name = "Navigate: Table Picker",
  key = "Ctrl-Shift-t",
  priority = 1,
  run = function()
    local tables = getTables()
    if not tables or #tables == 0 then
      editor.flashNotification("No tables found.")
      return
    end

    local items = {}
    for _, r in ipairs(tables) do
      table.insert(items, {
        name = string.format("%s @ %d", r.page, r.pos),
        -- description = string.format("%s @ %d", r.page, r.pos),
        ref = r.ref,
        page = r.page,
        pos = r.pos
      })
    end

    local sel = editor.filterBox("Jump to", items, "Select a Table", "Page @ Pos where the Table locates")
    if not sel then return end

    if not navigateToTable(sel.ref, sel.pos) then
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
