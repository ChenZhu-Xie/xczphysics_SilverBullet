---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Widget/BreadCrumbs/Top.md"
githubUrl_Original: https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md
udpateDate: 2025-10-27
---

**① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩**  
**⑪ ⑫ ⑬ ⑭ ⑮ ⑯ ⑰ ⑱ ⑲ ⑳**  
**㉑ ㉒ ㉓ ㉔ ㉕ ㉖ ㉗ ㉘ ㉙ ㉚**  
**㉛ ㉜ ㉝ ㉞ ㉟ ㊱ ㊲ ㊳ ㊴ ㊵**  
**㊶ ㊷ ㊸ ㊹ ㊺ ㊻ ㊼ ㊽ ㊾ ㊿**

➊ ➋ ➌ ➍ ➎ ➏ ➐ ➑ ➒ ➓

**Ⓐ Ⓑ Ⓒ Ⓓ Ⓔ Ⓕ Ⓖ Ⓗ Ⓘ Ⓙ**  
**Ⓚ Ⓛ Ⓜ Ⓝ Ⓞ Ⓟ Ⓠ Ⓡ Ⓢ Ⓣ**  
**Ⓤ Ⓥ Ⓦ Ⓧ Ⓨ Ⓩ**

🅐 🅑 🅒 🅓 🅔 🅕 🅖 🅗 🅘 🅙  
🅚 🅛 🅜 🅝 🅞 🅟 🅠 🅡 🅢 🅣  
🅤 🅥 🅦 🅧 🅨 🅩

**ⓐ ⓑ ⓒ ⓓ ⓔ ⓕ ⓖ ⓗ ⓘ ⓙ**  
**ⓚ ⓛ ⓜ ⓝ ⓞ ⓟ ⓠ ⓡ ⓢ ⓣ**  
**ⓤ ⓥ ⓦ ⓧ ⓨ ⓩ**

🅰 🅱 🅲 🅳 🅴 🅵 🅶 🅷 🅸 🅹  
🅺 🅻 🅼 🅽 🅾 🅿 🆀 🆁 🆂 🆃  
🆄 🆅 🆆 🆇 🆈 🆉 🆎 🆑

**🄰 🄱 🄲 🄳 🄴 🄵 🄶 🄷 🄸 🄹**  
**🄺 🄻 🄼 🄽 🄾 🄿 🅀 🅁 🅂 🅃**  
**🅄 🅅 🅆 🅇 🅈 🅉**

0⃣ 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣
0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟

# Adaptive Bread Crumb: Top
Fork of [source](https://community.silverbullet.md/t/breadcrumbs-for-hierarchical-pages/737) to improve breadcrumbs with last updated children pages.

> **example** Example
> /[z-custom](https://silverbullet.l.malys.ovh/z-custom)/[breadcrumbs](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs) -[template](https://silverbullet.l.malys.ovh/z-custom/breadcrumbs/template)

## Ver 2

```space-lua
-- priority: 10
yg = yg or {}

-- 模板改为使用 ${badge}，具体符号在数据阶段注入
local function bc_last(_path)
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 面包屑：根据是否有子页面，使用 ⇩ 或 ⬇ 拼接
function yg.bc(path)
  local mypage = path or editor.getCurrentPage()
  local arrow = has_children(mypage) and "⇩" or "⬇"

  -- 构建类似 .⇩CONFIG⇩Widget⇩BreadCrumbs⇩Top 的链接串
  local bc = "[[.]]"
  local parts = string.split(editor.getCurrentPage(), "/")
  local current = ""
  for i, part in ipairs(parts) do
    if current ~= "" then current = current .. "/" end
    current = current .. part
    bc = bc .. arrow .. "[[" .. current .. "]]"
  end

  -- 保持你已有的最近修改/访问徽章渲染（使用之前注入 badge 的模板）
  local lastMs = template.each(yg.lastM(mypage), bc_last(mypage)) or ""
  local lastVs = template.each(yg.lastV(mypage), bc_last(mypage)) or ""
  return bc .. " " .. lastMs .. " " .. lastVs
end

-- 支持最多 9 个（对应 1~9）
local max_num = 5

-- 辅助：判断是否有子页面
local function has_children(mypage)
  local children = query[[from index.tag "page"
         where _.name:find("^" .. mypage .. "/")
         limit 1]]
  return #children > 0
end

function yg.lastM(path)
  local mypage = path or editor.getCurrentPage()
  local hasChild = has_children(mypage)

  -- 选择数据源：有子页面时选子页面最近修改，否则全局最近修改（排除当前页）
  local list = hasChild and query[[from index.tag "page" 
         where _.name:find("^" .. mypage .. "/")
         order by _.lastModified desc
         limit max_num]]
       or query[[from index.tag "page"
         where _.name != mypage
         order by _.lastModified desc
         limit max_num]]

  -- 序号徽章（bc_lastM）
  local M_CHILD     = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_NOCHILD   = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  -- local M_CHILD     = {"⇩","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  -- local M_NOCHILD   = {"⬇","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = hasChild and M_CHILD or M_NOCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function yg.lastV(path)
  local mypage = path or editor.getCurrentPage()
  local hasChild = has_children(mypage)

  -- 选择数据源：有子页面时选子页面最近访问，否则全局最近访问（排除当前页）
  local list = hasChild and query[[from index.tag "page" 
         where _.lastVisit and _.name:find("^" .. mypage .. "/")
         order by _.lastVisit desc
         limit max_num]]
       or query[[from index.tag "page"
         where _.lastVisit and _.name != mypage
         order by _.lastVisit desc
         limit max_num]]

  -- 序号徽章（bc_lastV）
  local V_CHILD     = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_NOCHILD   = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  -- local V_CHILD     = {"⇩","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  -- local V_NOCHILD   = {"⬇","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = hasChild and V_CHILD or V_NOCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function widgets.breadcrumbs()
  return widget.new {markdown = yg.bc()}
end
```

## Ver 1

1. modified one https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/shared/c/68f9f16d-259c-832e-aae8-699bbb61fd15?owner_user_id=user-h5bPGeyU1zwi7LcI6XCA3cuY
2. https://community.silverbullet.md/t/hooks-rendertopwidgets/2074/2?u=chenzhu-xie
3. https://community.silverbullet.md/t/abc-adaptive-bread-crumb/3464

```lua
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