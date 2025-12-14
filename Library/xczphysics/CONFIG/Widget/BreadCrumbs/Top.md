---
author: Chenzhu-Xie
name: Library/xczphysics/CONFIG/Widget/BreadCrumbs/Top
tags: meta/library
pageDecoration.prefix: "🥖 "
githubUrl_Original: https://github.com/malys/silverbullet-libraries/blob/main/src/Breadcrumbs.md
---

Related:
1. [add Buttons to (Top)Widgets](https://community.silverbullet.md/t/is-there-a-navigate-to-page-command-in-v2/3258/7?u=chenzhu-xie) #community #silverbullet
  - pretty much like: Tana’s botton appied to nodes !!

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

> **warning** Warning
> depend on [[Library/xczphysics/CONFIG/Add_Fields_for_Obj/Last_Opened-Page#Visitimes 2: Client level|]]

## Ver 5: add Picker widgets + Split into 3

### TOP breadcrumb 1

```space-lua
-- priority: 10
yg = yg or {}

-- 模板改为使用 ${badge}，具体符号在数据阶段注入
function bc_last()
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 辅助：判断是否有子页面
function has_children(mypage)
  local children = query[[from index.tag "page"
         where _.name:find("^" .. mypage .. "/")
         limit 1]]
  return #children > 0
end

-- 面包屑：根据是否有子页面，使用 🧑‍🤝‍🧑 或 👩🏼‍🤝‍👩🏻 拼接
function yg.bc(path)
  local mypage = path or editor.getCurrentPage()
  -- 仅决定视觉符号，不再直接拼接字符串
  local arrow_symbol_1 = has_children(mypage) and "⇩" or "⬇"
  local arrow_symbol_2 = has_children(mypage) and "🧑‍🤝‍🧑" or "👬🏼"
  
  local parts = string.split(mypage, "/")
  local current = ""
  local dom_list = {"[[.]]"}

  -- 抽出来一个辅助函数：给定 parent_path/current，算出可用的 sibling options
  local function collect_siblings(parent_path, current_page)
    -- 1. 确定查询前缀：如果是根目录则为空，否则加 /
    local prefix = parent_path == "" and "" or (parent_path .. "/")

    local siblings = query[[
      from index.tag 'page'
      where _.name:startsWith(prefix) and _.name != current_page
      select { path = _.name,
        name = string.match(_.name, "([^/]+)$") }
    ]]

    -- 3. 过滤：只保留直接子级（模拟文件系统的同级目录），排除孙级页面
    local options = {}
    for _, item in ipairs(siblings) do
      local p_path = item.path
      -- 获取相对路径
      local rel_path = p_path:sub(#prefix + 1)

      -- 如果相对路径中没有 "/"，说明是直接同级
      if not rel_path:find("/") then
        table.insert(options, { path = p_path ,
        name = string.match(p_path, "([^/]+)$") })
      end
    end
    return options
  end

  for _, part in ipairs(parts) do
    -- 记录当前层级的父路径（用于查询同级页面）
    local parent_path = current

    if current ~= "" then current = current .. "/" end
    current = current .. part

    -- 先预查一次 siblings
    local options = collect_siblings(parent_path, current)

    if #options == 0 then
      -- 没有 siblings：只渲染一个箭头符号字符串，避免“点了也没用”的按钮
      table.insert(dom_list, arrow_symbol_1)
    else
      -- 有 siblings：生成按钮，点击时直接用预先算好的 options
      local function pick_sibling()
        local opt = editor.filterBox("🤏 Pick", options, "Select a Sibling", "🧑‍🤝‍🧑 a Sibling")
        if not opt then return end
        editor.navigate(opt.path)
      end

      local buto = widgets.button(arrow_symbol_2 .. #options, pick_sibling)
      table.insert(dom_list, buto)
    end
    table.insert(dom_list, "[[" .. current .. "]]")
  end
  
  -- 访问次数
  local data = datastore.get({"Visitimes", mypage}) or {}
  local visits = data.value or 0
  -- local visitsSuffix = "[[CONFIG/Add_Fields_for_Obj/Last_Opened-Page/Visit_Times|" .. "👀" .. tostring(visits) .. "]]"
  local visiTimes = "[[CONFIG/Add_Fields_for_Obj/Last_Opened-Page/Visit_Times|" .. tostring(visits) .. "]]"

  -- pick children
  local options = query[[from index.tag "page"
         -- where _.name:startsWith(mypage .. "/")
         where _.name:find("^" .. mypage .. "/")
         select { path = _.name,
        name = string.match(_.name, "([^/]+)$") }]]
  -- table.insert(dom_list, " " .. visitsSuffix)
  if #options == 0 then
    table.insert(dom_list, "👀")
  else
    local function pick_child()
      local opt = editor.filterBox("🤏 Pick", options, "Select a Child", "👶🏻 a Child")
      if not opt then return end
      editor.navigate(opt.path)
    end
    local buto = widgets.button("👶🏻" .. #options, pick_child)
    table.insert(dom_list, buto)
  end
  
  table.insert(dom_list, visiTimes)
  -- table.insert(dom_list, lastMs)
  -- table.insert(dom_list, lastVs)

  return dom_list
end

function widgets.breadcrumbs_1()
  return widget.new {
    -- markdown = yg.bc()
    html = dom.div(yg.bc()),
    display = "block",
  }
end
```

```space-lua
-- priority: 20
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs_1()
  end
}
```

### TOP breadcrumb 2

```space-lua
-- priority: 9

-- 支持最多 9 个（对应 1~9）
local max_num = 5

function yg.lastM(mypage)
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
  local M_hasCHILD  = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_noCHILD   = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = hasChild and M_hasCHILD or M_noCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

-- 最近修改/访问徽章
local mypage = path or editor.getCurrentPage()
local lastMs = template.each(yg.lastM(mypage), bc_last()) or ""

function widgets.breadcrumbs_2()
  return widget.new {
    markdown = lastMs
  }
end
```

```space-lua
-- priority: 19
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs_2()
  end
}
```

### TOP breadcrumb 3

```space-lua
-- priority: 8

-- 支持最多 9 个（对应 1~9）
local max_num = 5

function yg.lastV(mypage)
  local hasChild = has_children(mypage)

  -- 选择数据源：有子页面时选子页面最近访问，否则全局最近访问（排除当前页）
  local list = hasChild and 
  query[[from editor.getRecentlyOpenedPages "page" 
         where _.lastOpened and _.name:find("^" .. mypage .. "/")
         order by _.lastOpened desc
         limit max_num]]
       or query[[from editor.getRecentlyOpenedPages "page" 
         where _.lastOpened and _.name != mypage
         order by _.lastOpened desc
         limit max_num]]
  
  -- 序号徽章（bc_lastV）
  local V_hasCHILD  = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_noCHILD   = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = hasChild and V_hasCHILD or V_noCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

local mypage = path or editor.getCurrentPage()
local lastVs = template.each(yg.lastV(mypage), bc_last()) or ""

function widgets.breadcrumbs_3()
  return widget.new {
    markdown = lastVs
  }
end
```

```space-lua
-- priority: 18
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs_3()
  end
}
```

## Ver 4: Adapt To [[Library/xczphysics/CONFIG/Add_Fields_for_Obj/Last_Opened-Page#Visitimes 2: Client level]] and [[index#Your Last Visit 👶🏻]]

```lua
-- priority: 10
yg = yg or {}

-- 模板改为使用 ${badge}，具体符号在数据阶段注入
local function bc_last()
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 面包屑：根据是否有子页面，使用 ⇩ 或 ⬇ 拼接
function yg.bc(path)
  local mypage = path or editor.getCurrentPage()
  local arrow = has_children(mypage) and "⇩" or "⬇"
  
  -- 构建类似 .⇩CONFIG⇩Widget⇩BreadCrumbs⇩Top 的链接串
  local bc = "[[.]]"
  local parts = string.split(mypage, "/")
  local current = ""
  for i, part in ipairs(parts) do
    if current ~= "" then current = current .. "/" end
    current = current .. part
    bc = bc .. arrow .. "[[" .. current .. "]]"
  end

  -- 最近修改/访问徽章（沿用原有逻辑）
  local lastMs = template.each(yg.lastM(mypage), bc_last()) or ""
  local lastVs = template.each(yg.lastV(mypage), bc_last()) or ""

  -- 访问次数
  local data = datastore.get({"Visitimes", mypage}) or {}
  local visits = data.value or 0
  local visitsSuffix = "[[CONFIG/Add Fields for Obj/Last Opened/Visit Times|" .. "👶🏻" .. tostring(visits) .. "]]"

  return bc .. " " .. visitsSuffix .. " " .. lastMs .. " " .. lastVs
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

function yg.lastM(mypage)
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
  local M_hasCHILD  = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_noCHILD   = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = hasChild and M_hasCHILD or M_noCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function yg.lastV(mypage)
  local hasChild = has_children(mypage)

  -- 选择数据源：有子页面时选子页面最近访问，否则全局最近访问（排除当前页）
  local list = hasChild and 
  query[[from editor.getRecentlyOpenedPages "page" 
         where _.lastOpened and _.name:find("^" .. mypage .. "/")
         order by _.lastOpened desc
         limit max_num]]
       or query[[from editor.getRecentlyOpenedPages "page" 
         where _.lastOpened and _.name != mypage
         order by _.lastOpened desc
         limit max_num]]
  
  -- 序号徽章（bc_lastV）
  local V_hasCHILD  = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_noCHILD   = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = hasChild and V_hasCHILD or V_noCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function widgets.breadcrumbs()
  return widget.new {markdown = yg.bc()}
end
```

## Ver 3: 👶🏻lastVisit added

.⇩CONFIG⇩Widget⇩BreadCrumbs⇩Top 👶🏻lastVisit

```lua
-- priority: 10
yg = yg or {}

-- 访问次数数据来源：统计表（按 lastVisit 降序维护）
local VISIT_TABLE_PATH = "CONFIG/Add Fields for Obj/Last Opened/Visit Times"
local VISIT_CACHE_TTL = 3 -- 秒级缓存，避免高频 IO
local visitCache = { map = {}, loadedAt = 0 }

-- 行解析辅助（与统计表写入端一致）
local function _isSeparatorLine(line)
  return line:match("^%s*|%s*[%-:]+[%- :|]*$") ~= nil
end

local function _parseRow(line)
  if _isSeparatorLine(line) then return nil end
  local c1, c2, c3 = line:match("^%s*|%s*([^|]-)%s*|%s*([^|]-)%s*|%s*([^|]-)%s*|%s*$")
  if not c1 then return nil end
  return c1, c2, c3
end

local function _extractPageRefFromFirstCell(cellText)
  local cell = (cellText or ""):match("^%s*(.-)%s*$") or ""
  local inner = cell:match("^%[%[%s*(.-)%s*%]%]$")
  if inner then
    local ref = inner:match("^(.-)|") or inner
    return (ref or ""):match("^%s*(.-)%s*$")
  end
  return cell
end

local function _loadVisitMapIfStale(force)
  local now = os.time()
  if not force and (now - (visitCache.loadedAt or 0)) < VISIT_CACHE_TTL then
    return
  end
  local safeRead = (type(space) == "table" and type(space.readPage) == "function")
  local content = safeRead and (space.readPage(VISIT_TABLE_PATH) or "") or ""
  local map = {}

  if content ~= "" then
    local seenHeader, afterSep = false, false
    for line in (content .. "\n"):gmatch("([^\n]*)\n") do
      if not seenHeader then
        if line:match("^%s*|%s*pageRef%s*|%s*lastVisit%s*|%s*visitTimes%s*|%s*$") then
          seenHeader = true
        end
      else
        if not afterSep then
          if _isSeparatorLine(line) then
            afterSep = true
          end
        else
          local c1, _, c3 = _parseRow(line)
          if not c1 then break end -- 数据区结束
          local ref = _extractPageRefFromFirstCell(c1)
          local times = tonumber((c3 or ""):match("^%s*(%d+)%s*$")) or 0
          if ref ~= "" then map[ref] = times end
        end
      end
    end
  end

  visitCache.map = map
  visitCache.loadedAt = now
end

-- 获取某 pageRef 的访问次数：
-- 1) 命中缓存 -> 直接返回
-- 2) 读取统计表，快速路径：检查第一条数据行是否就是当前页，是则 O(1) 取值
-- 3) 否则回退：完整解析构建 map 再取值（并缓存）
local function getVisitTimesFor(pageRef)
  if not pageRef or pageRef == "" then return 0 end

  local now = os.time()
  if (now - (visitCache.loadedAt or 0)) < VISIT_CACHE_TTL then
    return visitCache.map[pageRef] or 0
  end

  local safeRead = (type(space) == "table" and type(space.readPage) == "function")
  local content = safeRead and (space.readPage(VISIT_TABLE_PATH) or "") or ""
  if content == "" then
    visitCache.map, visitCache.loadedAt = {}, now
    return 0
  end

  -- 快速路径：只检查第一条数据行
  local seenHeader, afterSep = false, false
  for line in (content .. "\n"):gmatch("([^\n]*)\n") do
    if not seenHeader then
      if line:match("^%s*|%s*pageRef%s*|%s*lastVisit%s*|%s*visitTimes%s*|%s*$") then
        seenHeader = true
      end
    else
      if not afterSep then
        if _isSeparatorLine(line) then
          afterSep = true
        end
      else
        local c1, _, c3 = _parseRow(line)
        if not c1 then break end -- 数据区结束
        local ref = _extractPageRefFromFirstCell(c1)
        if ref == pageRef then
          local times = tonumber((c3 or ""):match("^%s*(%d+)%s*$")) or 0
          visitCache.map = { [pageRef] = times } -- 轻缓存
          visitCache.loadedAt = now
          return times
        end
        -- 第一行不是当前页 -> 精确回退
        break
      end
    end
  end

  -- 回退：完整解析
  _loadVisitMapIfStale(true)
  return visitCache.map[pageRef] or 0
end

-- 模板改为使用 ${badge}，具体符号在数据阶段注入
local function bc_last()
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 面包屑：根据是否有子页面，使用 ⇩ 或 ⬇ 拼接
function yg.bc(path)
  local mypage = path or editor.getCurrentPage()
  local arrow = has_children(mypage) and "⇩" or "⬇"

  -- 构建类似 .⇩CONFIG⇩Widget⇩BreadCrumbs⇩Top 的链接串
  local bc = "[[.]]"
  local parts = string.split(mypage, "/")
  local current = ""
  for i, part in ipairs(parts) do
    if current ~= "" then current = current .. "/" end
    current = current .. part
    bc = bc .. arrow .. "[[" .. current .. "]]"
  end

  -- 最近修改/访问徽章（沿用原有逻辑）
  local lastMs = template.each(yg.lastM(mypage), bc_last()) or ""
  local lastVs = template.each(yg.lastV(mypage), bc_last()) or ""

  -- 访问次数（来自 Visit Times 表，带秒级缓存 + 快速路径）
  local visits = getVisitTimesFor(mypage)
  local visitsSuffix = "[[CONFIG/Add Fields for Obj/Last Opened/Visit Times|" .. "👶🏻" .. tostring(visits) .. "]]"

  return bc .. " " .. visitsSuffix .. " " .. lastMs .. " " .. lastVs
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

function yg.lastM(mypage)
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
  local M_hasCHILD  = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_noCHILD   = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = hasChild and M_hasCHILD or M_noCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function yg.lastV(mypage)
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
  local V_hasCHILD  = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_noCHILD   = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = hasChild and V_hasCHILD or V_noCHILD

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function widgets.breadcrumbs()
  return widget.new {markdown = yg.bc()}
end
```

## Ver 2: emoji uploaded

```lua
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
  local parts = string.split(mypage, "/")
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
  local M_hasCHILD     = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_noCHILD   = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  -- local M_CHILD     = {"⇩","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  -- local M_NOCHILD   = {"⬇","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = hasChild and M_hasCHILD or M_noCHILD

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
  local V_hasCHILD     = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_noCHILD   = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  -- local V_CHILD     = {"⇩","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  -- local V_NOCHILD   = {"⬇","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = hasChild and V_hasCHILD or V_noCHILD

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

```lua
-- priority: 20
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs()
  end
}
```
