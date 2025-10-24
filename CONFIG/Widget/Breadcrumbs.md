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
yg = yg or {}

-- 链接模板：末尾保留一个空格用于分隔
yg.t_bc    = template.new[==[/[[${name}]]​]==]
yg.t_bcsub = template.new[==[-[[${name}]]​]==]

-- 工具：去掉末尾空白，避免渲染出多余空段落
local function rtrim(s)
  return (s or ""):gsub("%s+$", "")
end

-- 生成逐级面包屑
function yg.breadcrumbs(path)
  local mypage = path or editor.getCurrentPage()
  local parts = string.split(mypage, "/")
  local crumbs = {}
  for i, _ in ipairs(parts) do
    local current = ""
    for j = 1, i do
      if current ~= "" then current = current .. "/" end
      current = current .. parts[j]
    end
    table.insert(crumbs, { name = current })
  end
  return crumbs
end

-- 最近修改的子页面（不区分根页面，使用 substring 匹配）
local function compareDate(a, b)
  return a.lastModified > b.lastModified
end

function yg.children(path)
  local mypage = path or editor.getCurrentPage()
  local crumbsChildren = {}

  -- 拿出所有页面并按 lastModified 降序
  local pages = space.listPages()
  table.sort(pages, compareDate)

  -- 使用 substring 匹配（与你给的 string.find 保持一致），排除自身，最多 7 个
  for _, page in ipairs(pages) do
    -- 第四个参数 true 表示按字面匹配，避免把 mypage 当作模式
    if string.find(page.name, mypage, 1, true) and mypage ~= page.name then
      table.insert(crumbsChildren, { name = page.ref })
      if #crumbsChildren >= 7 then break end
    end
  end

  return crumbsChildren
end

-- 组装：前缀 [[home]] + 面包屑 + 子页面
function yg.bc(path)
  local bc = template.each(yg.breadcrumbs(path), yg.t_bc) or ""
  local subs = template.each(yg.children(path), yg.t_bcsub) or ""
  return "[[home]]" .. bc .. " " .. subs
end

-- template
function widgets.breadcrumbs()
  -- 渲染前做一次 rtrim，避免末尾空白触发多余段落
  return widget.new {
    markdown = rtrim(yg.bc())
  }
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
