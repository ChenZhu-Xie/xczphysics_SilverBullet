---
githubUrl: https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md
---
# Breadcrumbs
Fork of [source](https://community.silverbullet.md/t/breadcrumbs-for-hierarchical-pages/737) to improve breadcrumbs with last updated children pages.

> **example** Example
> /[z-custom](https://silverbullet.l.malys.ovh/z-custom)/[breadcrumbs](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs)-[template](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs/template)

1. GPT 
```lua
-- priority: 10
-- 假设你已有 LastVisitStore = { [pageRef] = "2025-10-24T16:52:08.000Z", ... }
LastVisitStore = LastVisitStore or {}

yg = yg or {}

-- 取路径末级名，例如 "CONFIG/Widget/Embed External" -> "Embed External"
local function basename(ref)
  return (tostring(ref):match("([^/]+)$")) or tostring(ref)
end

-- 收集 path 下的子孙页面（包含多级），并按 lastModified 降序
local function collect_descendants_sorted(path)
  local pages = {}
  for _, p in ipairs(space.listPages()) do
    -- 用 ref 更稳妥；排除自己本身
    if p.ref ~= path and p.ref:find("^" .. path .. "/") then
      table.insert(pages, p)
    end
  end
  table.sort(pages, function(a, b)
    return (a.lastModified or 0) > (b.lastModified or 0)
  end)
  return pages
end

-- 取 path 下前 maxCount 个子页的“显示名”（末级名），拼成 -X-Y-Z 这种片段
local function hyphen_children_segment(path, maxCount)
  local segs, picked = {}, 0
  local pages = collect_descendants_sorted(path)
  for _, p in ipairs(pages) do
    table.insert(segs, "-" .. basename(p.ref))
    picked = picked + 1
    if picked >= (maxCount or 7) then break end
  end
  return table.concat(segs, "")
end

-- 从 LastVisitStore 中取最近访问的 page refs（降序），拼成 +ref1+ref2… 片段
local function plus_last_visit_segment(maxCount)
  local items = {}
  -- 拍平成数组便于排序
  for ref, when in pairs(LastVisitStore) do
    -- ISO 时间串可直接按字典序比较；若为空则视为最小
    table.insert(items, { ref = ref, when = tostring(when or "") })
  end
  table.sort(items, function(a, b)
    return a.when > b.when
  end)
  local segs, picked = {}, 0
  for _, it in ipairs(items) do
    if it.when ~= "" then
      table.insert(segs, "+" .. it.ref)
      picked = picked + 1
      if picked >= (maxCount or 4) then break end
    end
  end
  return table.concat(segs, "")
end

-- 组合最终一行：./PATH -child1-child2 ... +ref1+ref2 ...
function yg.bc_line(path, childCount, recentCount)
  path = path or editor.getCurrentPage() or "index"
  local left = "./" .. path
  local mid = " " .. hyphen_children_segment(path, childCount or 7)
  local right = " " .. plus_last_visit_segment(recentCount or 4)
  return left .. mid .. right
end

-- 如果你用的是 widgets 渲染：
function widgets.breadcrumbs_line()
  return widget.new({
    markdown = yg.bc_line("CONFIG", 7, 4),
    -- 如果你希望在正文顶部显示，继续沿用你昨天做的 renderContentWidgets 钩子
    event = { listen = "renderContentWidgets" },
    style = "display:block; margin-bottom: 0.5em;"
  })
end
```

1. modified one https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/shared/c/68f9f16d-259c-832e-aae8-699bbb61fd15?owner_user_id=user-h5bPGeyU1zwi7LcI6XCA3cuY

```space-lua
-- priority: 10
yg = yg or {}
yg.t_bc = template.new[==[/[[${name}]]​]==]
yg.t_bcsub = template.new[==[-[[${name}]]​]==]

function yg.breadcrumbs(path)
  local mypage = path or editor.getCurrentPage()
  local parts = string.split(mypage, "/")
  local crumbs = {}
  for i, part in ipairs(parts) do
    local current = table.concat(parts, "/", 1, i)
    table.insert(crumbs, {name = current})
  end
  return crumbs
end

function yg.bc(path)
  local bc = template.each(yg.breadcrumbs(path), yg.t_bc) or ""
  local subs = template.each(yg.children(path), yg.t_bcsub) or ""
  return "[[.]]" .. bc .. " " .. subs
end

local function collect_pages_for(mypage)
  local pages = {}
  if mypage == "index" then
    for _, page in ipairs(space.listPages()) do
      table.insert(pages, page)
    end
  else
    for _, page in ipairs(space.listPages()) do
      if page.name:find("^" .. mypage .. "/") and mypage ~= page.name then
        table.insert(pages, page)
      end
    end
  end
  return table, pages
end

function yg.children(path)
  local crumbsChildren = {}
  local mypage = path or editor.getCurrentPage()
  local table, pages = collect_pages_for(mypage)

  table.sort(pages, function(a, b) return a.lastModified > b.lastModified end)

  for i = 1, math.min(7, #pages) do
    table.insert(crumbsChildren, {name = pages[i].ref})
  end

  return crumbsChildren
end

function widgets.breadcrumbs()
  return widget.new {markdown = yg.bc()}
end
```

1. original one https://github.com/malys/silverbullet-libraries/blob/bdecff9d0c7a128b2705b04168f90c75b18248f0/src/Breadcrumbs.md

```lua
-- priority: 10
yg=yg or {}
yg.t_bc = template.new[==[/[[${name}]] ]==]
yg.t_bcsub = template.new[==[-[[${name}]] ]==]

function yg.breadcrumbs(path)
  local mypage = path or editor.getCurrentPage()
  local parts = string.split(mypage,"/")
  local crumbs = {}
  for i,part in ipairs(parts) do
    local current = ""
    for j=1,i do
      if current ~= "" then
        current=current.."/"
      end
      current = current..parts[j]
    end
      table.insert(crumbs, {name = current})
  end
  return crumbs
end

function yg.bc(path)
  return "[[home]]"..(template.each(yg.breadcrumbs(path),yg.t_bc)).." "..(template.each(yg.children(path),yg.t_bcsub)) 
end

function compareDate(a, b)
  print(a.lastModified  > b.lastModified )
  return a.lastModified  > b.lastModified 
end


function yg.children(path)
  local crumbsChildren = {}
  local mypage = path or editor.getCurrentPage()
  for page in each(table.sort(space.listPages(), compareDate)) do
   --print(mypage,page.name,string.find(page.name,mypage) )
    if (string.find(page.name,mypage) and mypage ~= page.name and #crumbsChildren <7)
    then
          table.insert(crumbsChildren, {name = page.ref})
    end
  end
  return crumbsChildren
end

-- template
function widgets.breadcrumbs()
  return widget.new {
    markdown = yg.bc()
  }
end
```

```space-lua
-- priority: -1
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs()
  end
}
```

See [flex table](https://community.silverbullet.md/t/space-lua-flexbox-columns/2017)
