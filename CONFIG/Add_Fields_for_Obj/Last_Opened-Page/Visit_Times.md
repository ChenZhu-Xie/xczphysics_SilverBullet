
${query[[
    from getVisitHistory()
    limit 5
]]}
```space-lua
function getVisitHistory()
  local VisitHistory = query[[
      from index.tag "page"
      select {ref=_.ref, Visitimes=((datastore.get({"Visitimes", _.name}) or {}).value or 0)}
    ]] 
  return query[[
    from VisitHistory
    where _.Visitimes > 0
    order by _.Visitimes desc
]]
end
```

