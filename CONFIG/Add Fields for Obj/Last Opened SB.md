---
tags: {}
LastVisit: 2025-10-24 13:56:35.000
---

1. https://chatgpt.com/share/68fa59ac-2e88-8010-aa2c-12021dda94fb

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

