---
recommend: ⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Widget/BreadCrumbs%20Bottom.md"
githubUrl_Original: "https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md"
---
# Breadcrumbs
Fork of [source](https://community.silverbullet.md/t/breadcrumbs-for-hierarchical-pages/737) to improve breadcrumbs with last updated children pages.

> **example** Example
> /[z-custom](https://silverbullet.l.malys.ovh/z-custom)/[breadcrumbs](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs) -[template](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs/template)

1. modified one https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/shared/c/68f9f16d-259c-832e-aae8-699bbb61fd15?owner_user_id=user-h5bPGeyU1zwi7LcI6XCA3cuY

```space-lua
-- priority: 10
yg_B = yg_B or {}
yg_B.t_bc = template.new[==[/[[${name}]]​]==]
yg_B.t_bc_lastM = template.new[==[-[[${name}]]​]==]
yg_B.t_bc_lastV = template.new[==[+[[${name}]]​]==]

function yg_B.breadcrumbs(path)
  -- local mypage = path or editor.getCurrentPage():match("^(.*)/[^/]*$")
  local mypage = path or editor.getCurrentPage()
  -- editor.flashNotification(mypage)
  local parts = string.split(mypage, "/")
  local crumbs = {}
  for i, part in ipairs(parts) do
    local current = table.concat(parts, "/", 1, i)
    table.insert(crumbs, {name = current})
  end
  return crumbs
end

function yg_B.bc(path)
  local bc = template.each(yg_B.breadcrumbs(path), yg_B.t_bc) or ""
  local lastMs = template.each(yg_B.lastM(path), yg_B.t_bc_lastM) or ""
  local lastVs = template.each(yg_B.lastV(path), yg_B.t_bc_lastV) or ""
  return "[[.]]" .. bc .. " " .. lastMs .. " " .. lastVs
end

function pattern(path)
  mypath = path or editor.getCurrentPage():match("^(.*)/[^/]*$")
  if mypath and #mypath > 0 then
    return "^" .. mypath .. "/[^/]+$"
  else
    return "^[^/]+$"
  end
end

function yg_B.lastM(path)
  return query[[from index.tag "page" 
         where _.name != editor.getCurrentPage() and _.name:find(pattern(path))
         order by _.lastModified desc
         limit 7]]
end

function yg_B.lastV(path)
  return query[[from index.tag "page" 
         where _.lastVisit and _.name != editor.getCurrentPage() and _.name:find(pattern(path))
         order by _.lastVisit desc
         limit 7]]
end

function widgets.breadcrumbs_B()
  return widget.new {markdown = yg_B.bc()}
end
```

```space-lua
-- priority: -1
event.listen {
  name = "hooks:renderBottomWidgets",
  run = function(e)
    return widgets.breadcrumbs_B()
  end
}
```

See [flex table](https://community.silverbullet.md/t/space-lua-flexbox-columns/2017)