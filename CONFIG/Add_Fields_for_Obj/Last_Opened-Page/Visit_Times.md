
${query[[
    from getVisitStat()
    limit 5
]]}

```space-lua
function getVisitStat()
  local VisitStat = query[[
      from index.tag "page"
      select {ref=_.ref, Visitimes=((datastore.get({"Visitimes", _.name}) or {}).value or 0)}
    ]] 
  return query[[
    from VisitStat
    where _.Visitimes > 0
    order by _.Visitimes desc
]]
end
```
