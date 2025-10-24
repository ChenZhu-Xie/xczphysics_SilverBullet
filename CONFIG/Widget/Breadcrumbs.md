---
githubUrl: https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md
---
# Breadcrumbs
Fork of [source](https://community.silverbullet.md/t/breadcrumbs-for-hierarchical-pages/737) to improve breadcrumbs with last updated children pages.

> **example** Example
> /[z-custom](https://silverbullet.l.malys.ovh/z-custom)/[breadcrumbs](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs)-[template](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs/template)

```space-lua
-- priority: 10
yg = yg or {}

-- 可自定义的“根目录页面”名字
local ROOT_PAGE = "_root"

-- 去掉模板尾部的零宽空格，并且不含换行
yg.t_bc    = template.new[==[/[[${name}]]​]==]
yg.t_bcsub = template.new[==[-[[${name}]]​]==]

-- 工具: rtrim 去掉末尾空白/换行
local function rtrim(s)
  return (s or ""):gsub("%s+$", "")
end

-- 判断是否是“根目录页面”
local function is_root_page(page)
  return page == ROOT_PAGE
end

function yg.breadcrumbs(path)
  local mypage = path or editor.getCurrentPage()
  local parts = string.split(mypage, "/")
  local crumbs = {}
  for i, _ in ipairs(parts) do
    local current = table.concat(parts, "/", 1, i)
    table.insert(crumbs, { name = current })
  end
  return crumbs
end

-- 获取当前路径下（或全局）的“最近修改子页面”
function yg.children(path)
  local mypage = path or editor.getCurrentPage()
  local pages = {}
  if is_root_page(mypage) then
    -- 根目录页面：取全空间最近修改的 7 个页面
    for _, page in ipairs(space.listPages()) do
      table.insert(pages, page)
    end
  else
    -- 普通页面：仅取当前路径下的子页面
    for _, page in ipairs(space.listPages()) do
      if page.name:find("^" .. mypage .. "/") and mypage ~= page.name then
        table.insert(pages, page)
      end
    end
  end

  table.sort(pages, function(a, b) return a.lastModified > b.lastModified end)

  local crumbsChildren = {}
  for i = 1, math.min(7, #pages) do
    -- 使用 ref 以生成 wikilink
    table.insert(crumbsChildren, { name = pages[i].ref })
  end

  return crumbsChildren
end

-- 最近访问（沿用你给的查询）。作为一个内嵌模板片段返回。
function yg.last_visit_inline(limit)
  limit = tostring(limit or 5)
  -- 注意内部的引号要转义
  return ' ${query[[from index.tag "page" where _.lastVisit select {ref=_.ref, lastVisit=_.lastVisit} order by _.lastVisit desc limit ' .. limit .. ']]}'
end

-- 组装：. + 面包屑 + （+ 最近修改子页面） + （+ 最近访问）
function yg.bc(path)
  local dot = "[[" .. ROOT_PAGE .. "|.]]"
  local bc = template.each(yg.breadcrumbs(path), yg.t_bc) or ""
  local children = template.each(yg.children(path), yg.t_bcsub) or ""

  -- 拼接，只有有子项时才加“ + ”
  local parts = { dot, bc }
  if children:match("%S") then
    table.insert(parts, " + ")
    table.insert(parts, children)
  end
  -- 总是加上 lastVisit 段
  table.insert(parts, " + ")
  table.insert(parts, yg.last_visit_inline(5))

  -- 合并并去掉尾部空白，避免多出的空行
  return rtrim(table.concat(parts))
end

function widgets.breadcrumbs()
  local md = yg.bc()
  -- 再保险：做一次 rtrim
  md = (md or ""):gsub("%s+$", "")
  return widget.new { markdown = md }
end
```

```lua
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
  return template.each(yg.breadcrumbs(path), yg.t_bc)
         .. template.each(yg.children(path), yg.t_bcsub)
end

function yg.children(path)
  local crumbsChildren = {}
  local mypage = path or editor.getCurrentPage()
  local pages = {}

  for _, page in ipairs(space.listPages()) do
    if page.name:find("^" .. mypage .. "/") and mypage ~= page.name then
      table.insert(pages, page)
    end
  end

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
