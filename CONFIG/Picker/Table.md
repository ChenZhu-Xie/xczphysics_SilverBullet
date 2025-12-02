
1. https://silverbullet.md/Object#table

`${query[[from index.tag "table"
order by _.tableref
]]}`

```space-lua
function getTables()
  -- 1) 拉取所有 table 行，取到我们需要的列，并先按 tableref、pos 排序
  local rows = query[[
    from index.tag "table"
    select {
      tableref = _.tableref,
      pos      = _.pos,
      ref      = _.ref,
      page     = _.page,
    }
    order by _.tableref, _.pos
  ]]

  -- 2) 对每个 tableref 只保留 pos 最小的那一行
  local bestByRef = {}
  for _, r in ipairs(rows) do
    local key = r.tableref
    local cur = bestByRef[key]
    if not cur or (r.pos or math.huge) < (cur.pos or math.huge) then
      bestByRef[key] = r
    end
  end

  -- 3) 转成数组，并排序一下（可选）
  local out = {}
  for _, r in pairs(bestByRef) do
    table.insert(out, r)
  end
  table.sort(out, function(a, b)
    if a.tableref == b.tableref then
      return (a.pos or 1e18) < (b.pos or 1e18)
    end
    return tostring(a.tableref) < tostring(b.tableref)
  end)

  -- 4) 返回列表：将被渲染为一个新的 table
  return out
end
```
