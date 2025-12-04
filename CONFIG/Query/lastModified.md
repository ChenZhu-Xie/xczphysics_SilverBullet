
`${getModifyHistory()}`

```space-lua
function getModifyHistory()
  return query[[
    from index.tag "page"
    select {ref=_.ref, lastModified=string.sub(_.lastModified:gsub("T", " "), 1, -5)} 
    order by lastModified desc
]]
end
```
