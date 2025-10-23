```space-lua
function utilities.recentPages(limit)
  local pages = editor.getRecentlyOpenedPages()
  table.sort(pages, function(a,b) return a.lastOpened > b.lastOpened end)
  local out = {}
  for i=1, math.min(limit or 5, #pages) do
    table.insert(out, string.format("- [[%s]] (%s)", 
      pages[i].name, os.date("%Y-%m-%d %H:%M", pages[i].lastOpened/1000)))
  end
  return table.concat(out, "\n")
end

```