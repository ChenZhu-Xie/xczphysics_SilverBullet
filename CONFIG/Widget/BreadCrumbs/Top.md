---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Widget/BreadCrumbs/Top.md"
githubUrl_Original: https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md
udpateDate: 2025-10-27
---

# Adaptive Bread Crumb: Top
Fork of [source](https://community.silverbullet.md/t/breadcrumbs-for-hierarchical-pages/737) to improve breadcrumbs with last updated children pages.

> **example** Example
> /[z-custom](https://silverbullet.l.malys.ovh/z-custom)/[breadcrumbs](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs) -[template](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs/template)

1. modified one https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/shared/c/68f9f16d-259c-832e-aae8-699bbb61fd15?owner_user_id=user-h5bPGeyU1zwi7LcI6XCA3cuY
2. https://community.silverbullet.md/t/hooks-rendertopwidgets/2074/2?u=chenzhu-xie
3. https://community.silverbullet.md/t/abc-adaptive-bread-crumb/3464

```space-lua
-- priority: 10
yg = yg or {}
local bc_folder = template.new[==[/[[${name}]]​]==]

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

local function choose(a, b, path)
  local mypage = path or editor.getCurrentPage()
  local children = query[[from index.tag "page" 
         where _.name:find("^" .. mypage .. "/")]]
  if #children > 0 then
    return a
  else
    return b
  end
end

local function bc_lastM(path)
  return template.new(choose([==[⇩[[${name}]]​]==], [==[⬇[[${name}]]​]==], path))
  -- return template.new(choose([==[⭽[[${name}]]​]==], [==[⭳🠫[[${name}]]​]==], path))
  -- https://symbl.cc/cn/search/?q=%E5%90%91%E4%B8%8B%E7%A9%BA%E5%BF%83%E7%AE%AD%E5%A4%B4
  -- :down_arrow
end
local function bc_lastV(path)
  return template.new(choose([==[○[[${name}]]​]==], [==[●[[${name}]]​]==], path))
  -- return template.new(choose([==[-[[${name}]]​]==], [==[=[[${name}]]​]==], path))
end

function yg.bc(path)
  local bc = template.each(yg.breadcrumbs(path), bc_folder) or ""
  local lastMs = template.each(yg.lastM(path), bc_lastM(path)) or ""
  local lastVs = template.each(yg.lastV(path), bc_lastV(path)) or ""
  return "[[.]]" .. bc .. " " .. lastMs .. " " .. lastVs
end

local max_num = 5

function yg.lastM(path)
  local mypage = path or editor.getCurrentPage()
  return choose(query[[from index.tag "page" 
         where _.name:find("^" .. mypage .. "/")
         order by _.lastModified desc
         limit max_num]], 
         query[[from index.tag "page"
         where _.name != mypage
         order by _.lastModified desc
         limit max_num]], mypage)
end

function yg.lastV(path)
  local mypage = path or editor.getCurrentPage()
  return choose(query[[from index.tag "page" 
         where _.lastVisit and _.name:find("^" .. mypage .. "/")
         order by _.lastVisit desc
         limit max_num]], 
         query[[from index.tag "page"
         where _.lastVisit and _.name != mypage
         order by _.lastVisit desc
         limit max_num]], mypage)
end

function widgets.breadcrumbs()
  return widget.new {markdown = yg.bc()}
end
```

## Original Bread Crumb

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