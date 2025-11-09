
${query[[
    from query[[
      from index.tag "page"
      select {ref=_.ref, Visitimes=((datastore.get({"Visitimes", _.name}) or {}).value or 0)}
    ]] 
    where _.Visitimes > 0
    order by _.Visitimes desc
    limit 5
]]}
