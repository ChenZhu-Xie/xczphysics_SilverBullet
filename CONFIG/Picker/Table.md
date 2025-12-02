
1. https://silverbullet.md/Object#table

`${query[[from index.tag "table"
order by _.tableref
]]}`

${getTables()}

```space-lua
function getTables()
  local rows = query[[
    from index.tag "table"
    select {
      ref      = _.ref,
      page     = _.page,
      pos      = _.pos,
      tableref = _.tableref,
    }
    order by _.page, _.pos
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
