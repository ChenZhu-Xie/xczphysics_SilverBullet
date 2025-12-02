
1. https://silverbullet.md/Object#table

`${query[[from index.tag "table"
order by _.tableref
]]}`

${getTables()}
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
  return out  -- 直接返回即可渲染为 table
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
