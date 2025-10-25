```space-lua
function orphanPages()
  -- Collect all page names of non meta-pages and put them in a map
  local orphans = {}
  for name in query[[
    from tags.page
    where not table.find(_.tags,
      function(t) return t:startsWith("meta") end)
    select _.name
  ]] do
    orphans[name] = true
  end
  
  -- Then delete all the ones that have links to them
  for linked in query[[from tags.link select _.toPage]] do
    orphans[linked] = nil
  end
  return table.keys(orphans)
end
```

${orphanPages()}