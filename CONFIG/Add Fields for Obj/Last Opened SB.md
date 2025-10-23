---
tags: 
LastVisit: 2025-10-24 00:19:14
---
---
LastVisit: 2025-10-24 00:18:11
---

${utilities.RecentlyOpenedPages(10)}

```space-lua
function utilities.RecentlyOpenedPages(limit)
  local pages = editor.getRecentlyOpenedPages()
  table.sort(pages, function(a,b)
    return (a.lastOpened or 0) > (b.lastOpened or 0)
  end)
  local lines, n = {}, math.min(limit or 5, #pages)
  for i = 1, n do
    local p = pages[i]
    local ts = math.floor((p.lastOpened or 0) / 1000)
    table.insert(lines, string.format("- [[%s]] (%s)",
      p.name or "?", os.date("%Y-%m-%d %H:%M", ts)))
  end
  return table.concat(lines, "\n")
end
```

