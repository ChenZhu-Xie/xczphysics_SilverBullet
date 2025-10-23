---
tags: function
githubUrl: "https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md"
---
# Breadcrumbs
Fork of [source](https://community.silverbullet.md/t/breadcrumbs-for-hierarchical-pages/737) to improve breadcrumbs with last updated children pages.

> **example** Example
> [🏡 home](https://silverbullet.l.malys.ovh/home)/[z-custom](https://silverbullet.l.malys.ovh/z-custom)/[breadcrumbs](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs)-[template](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs/template)


```space-lua
yg = yg or {}
yg.t_bc = template.new
[==[/[[${name}]]​]==]
yg.t_bcsub = template.new
[==[-[[${name}]]​]==]

-- 面包屑主函数
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

-- 获取最近修改的子页（最多 7 个）
function yg.children(path)
  local crumbsChildren = {}
  local mypage = path or editor.getCurrentPage()
  local pages = {}

  -- 收集直接子页
  for _, page in ipairs(space.listPages()) do
    if page.name:find("^" .. mypage .. "/") and mypage ~= page.name then
      table.insert(pages, page)
    end
  end

  -- 按 lastModified 倒序排序（最近修改优先）
  table.sort(pages, function(a, b) return a.lastModified > b.lastModified end)

  -- 取最多 7 个子页
  for i = 1, math.min(7, #pages) do
    table.insert(crumbsChildren, {name = pages[i].ref})
  end

  return crumbsChildren
end

function widgets.breadcrumbs()
  return widget.new {
    markdown = yg.bc(),
    id = "breadcrumbs-container"
  }
end

event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs()
  end
}
```

See [flex table](https://community.silverbullet.md/t/space-lua-flexbox-columns/2017)

```space-style
#breadcrumbs-container {
  display: block;
  margin-bottom: 0.5em;
}

```