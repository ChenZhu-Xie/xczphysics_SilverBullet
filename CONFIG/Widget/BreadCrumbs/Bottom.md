---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Widget/BreadCrumbs/Bottom.md"
githubUrl_Original: https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md
udpateDate: 2025-10-27
---

# Adaptive Bread Crumb: Bottom
Fork of [source](https://community.silverbullet.md/t/breadcrumbs-for-hierarchical-pages/737) to improve breadcrumbs with last updated children pages.

> **example** Example
> /[z-custom](https://silverbullet.l.malys.ovh/z-custom)/[breadcrumbs](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs) -[template](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs/template)

## ver 2

➡🢧➩🢥 ⇨🡆🢥⮊

```lua
-- priority: 10
Yg = Yg or {}
Bc_folder = template.new[==[/[[${name}]]​]==]  -- 保留但不再在 bc() 中使用

function Yg.breadcrumbs(path)
  local mypage = path or editor.getCurrentPage()
  local parts = string.split(mypage, "/")
  local crumbs = {}
  for i, part in ipairs(parts) do
    local current = table.concat(parts, "/", 1, i)
    table.insert(crumbs, {name = current})
  end
  return crumbs
end

-- 仅用于 pattern() 的场景选择（保留原逻辑）
local function choose(a, b, path)
  local mypath = path or editor.getCurrentPage():match("^(.*)/[^/]*$")
  if mypath and #mypath > 0 then
    return a
  else
    return b
  end
end

-- 模板使用 ${badge}，序号徽章在数据阶段注入
local function Bc_lastM(_path)
  return template.new([==[${badge}[[${name}]]​]==])
end

local function Bc_lastV(_path)
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 主面包屑：按是否有子页面切换 ⇦⇨ / ⬅⮕ 分隔符
function Yg.bc(path)
  local mypage = path or editor.getCurrentPage()
  local arrow = choose("⇦⇨", "⬅⮕", mypage)

  -- 构建 .⇦⇨CONFIG⇦⇨Widget... 或 .⬅⮕CONFIG⬅⮕Widget...
  local bc = "[[.]]"
  local parts = string.split(mypage, "/")
  local current = ""
  for i, part in ipairs(parts) do
    if current ~= "" then current = current .. "/" end
    current = current .. part
    bc = bc .. arrow .. "[[" .. current .. "]]"
  end

  -- 最近修改 / 最近访问（带序号徽章）
  local lastMs = template.each(Yg.lastM(mypage), Bc_lastM(mypage)) or ""
  local lastVs = template.each(Yg.lastV(mypage), Bc_lastV(mypage)) or ""
  return bc .. " " .. lastMs .. " " .. lastVs
end

-- 与原逻辑一致：决定“同父级子页”或“顶层单段”的匹配
local function pattern(path)
  local mypath = path or editor.getCurrentPage():match("^(.*)/[^/]*$")
  return choose("^" .. mypath .. "/[^/]+$", "^[^/]+$", mypath)
end

local max_num = 5  -- 如需覆盖 1~9，可改为 9

function Yg.lastM(path)
  local list = query[[from index.tag "page" 
         where _.name ~= editor.getCurrentPage() and _.name:find(pattern(path))
         order by _.lastModified desc
         limit max_num]]

  -- 方块风格（沿用 Top 的约定）
  local M_HASFATHER   = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_NOFATHER = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = choose(M_HASFATHER, M_NOFATHER, path)

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function Yg.lastV(path)
  local mypage = path or editor.getCurrentPage()
  local hasChild = has_children(mypage)

  local list = query[[from index.tag "page" 
         where _.lastVisit and _.name ~= editor.getCurrentPage() and _.name:find(pattern(path))
         order by _.lastVisit desc
         limit max_num]]

  -- 圆形风格（沿用 Top 的约定）
  local V_CHILD   = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_NOCHILD = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = hasChild and V_CHILD or V_NOCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function widgets.breadcrumbs_B()
  return widget.new {markdown = Yg.bc()}
end
```

## Ver 1

1. modified one https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/shared/c/68f9f16d-259c-832e-aae8-699bbb61fd15?owner_user_id=user-h5bPGeyU1zwi7LcI6XCA3cuY
2. https://community.silverbullet.md/t/abc-adaptive-bread-crumb/3464

```space-lua
-- priority: 10
Yg = Yg or {}
Bc_folder = template.new[==[/[[${name}]]​]==]

function Yg.breadcrumbs(path)
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

local function choose(a, b, path)
  local mypath = path or editor.getCurrentPage():match("^(.*)/[^/]*$")
  if mypath and #mypath > 0 then
    return a
  else
    return b
  end
end

local function Bc_lastM(path)
  return template.new(choose([==[⇦⇨[[${name}]]​]==], [==[⬅⮕[[${name}]]​]==], path))
  -- return template.new(choose([==[⤄[[${name}]]​]==], [==[⬅⮕[[${name}]]​]==], path))
  -- https://symbl.cc/cn/search/?q=%E5%90%91%E5%8F%B3%E7%9A%84%E9%BB%91%E7%AE%AD#google_vignette :left_arrow https://symbl.cc/cn/search/?q=%E5%B7%A6%E5%8F%B3%E5%8F%8C%E7%AE%AD%E5%A4%B4#google_vignette
  -- return template.new(choose([==[⬄[[${name}]]​]==], [==[⬌[[${name}]]​]==], path))
  -- https://symbl.cc/cn/search/?q=%E5%B7%A6%E5%8F%B3%E7%A9%BA%E5%BF%83%E7%AE%AD%E5%A4%B4
end
local function Bc_lastV(path)
  return template.new(choose([==[◻[[${name}]]​]==], [==[◼[[${name}]]​]==], path))
  -- return template.new(choose([==[∴[[${name}]]​]==], [==[※[[${name}]]​]==], path))
  -- return template.new(choose([==[☷[[${name}]]​]==], [==[☰[[${name}]]​]==], path))
end


function Yg.bc(path)
  local bc = template.each(Yg.breadcrumbs(path), Bc_folder) or ""
  local lastMs = template.each(Yg.lastM(path), Bc_lastM(path)) or ""
  local lastVs = template.each(Yg.lastV(path), Bc_lastV(path)) or ""
  return "[[.]]" .. bc .. " " .. lastMs .. " " .. lastVs
end

local function pattern(path)
  local mypath = path or editor.getCurrentPage():match("^(.*)/[^/]*$")
  return choose("^" .. mypath .. "/[^/]+$", "^[^/]+$", mypath)
end

local max_num = 5

function Yg.lastM(path)
  return query[[from index.tag "page" 
         where _.name != editor.getCurrentPage() and _.name:find(pattern(path))
         order by _.lastModified desc
         limit max_num]]
end

function Yg.lastV(path)
  return query[[from index.tag "page" 
         where _.lastVisit and _.name != editor.getCurrentPage() and _.name:find(pattern(path))
         order by _.lastVisit desc
         limit max_num]]
end

function widgets.breadcrumbs_B()
  return widget.new {markdown = Yg.bc()}
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