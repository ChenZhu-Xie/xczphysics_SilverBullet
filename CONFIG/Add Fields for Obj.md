

```space-lua
function utilities.recentPages(limit)
  local pages = editor.getRecentlyOpenedPages()
  table.sort(pages, function(a,b) return a.lastOpened > b.lastOpened end)
  local lines = {}
  for i = 1, math.min(limit or 5, #pages) do
    local p = pages[i]
    table.insert(lines, string.format("- [[%s]] (%s)", 
      p.name, os.date("%Y-%m-%d %H:%M", p.lastOpened/1000)))
  end
  return table.concat(lines, "\n")
end

```

${utilities.recentPages(5)}
