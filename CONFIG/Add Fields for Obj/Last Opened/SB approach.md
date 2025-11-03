---
recommend: ⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Add%20Fields%20for%20Obj/Last%20Opened/SB%20approach.md"
udpateDate: 2025-10-27
---

${utilities.RecentlyOpenedPages(10)}
2. https://chatgpt.com/share/6908ca51-ebf4-8010-9900-25e55eacaa6a

```space-lua
function utilities.RecentlyOpenedPages(limit)
  local raw = editor.getRecentlyOpenedPages()
  local pages = {}

  -- 如果 raw 已经是数组（ipairs 有元素），优先按数组拷贝
  for _, v in ipairs(raw) do
    pages[#pages + 1] = v
  end
  -- 如果没拿到（可能 raw 是 map），用 pairs 收集所有值
  if #pages == 0 then
    for _, v in pairs(raw) do
      pages[#pages + 1] = v
    end
  end

  -- 安全排序：把 lastOpened 转为 number，缺失或无法转为 0
  table.sort(pages, function(a, b)
    local aa = tonumber(a and a.lastOpened) or 0
    local bb = tonumber(b and b.lastOpened) or 0
    return aa > bb  -- 降序：最近的在前
  end)

  local lines = {}
  local n = math.min(limit or 5, #pages)
  for i = 1, n do
    local p = pages[i] or {}
    local last = tonumber(p.lastOpened) or 0
    local ts = math.floor(last / 1000) -- 毫秒 -> 秒
    table.insert(lines, string.format("- [[%s]] (%s)",
      p.name or "?", os.date("%Y-%m-%d %H:%M", ts)))
  end
  return table.concat(lines, "\n")
end
```

1. https://chatgpt.com/share/68fa59ac-2e88-8010-aa2c-12021dda94fb

```lua
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

