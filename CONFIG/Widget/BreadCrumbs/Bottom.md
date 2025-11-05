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

## Ver 4: Adapt To [[CONFIG/Add Fields for Obj/Last Opened#Visitimes 2: Client level]] and [[index#Last Visit 👀]]

```space-lua
-- priority: 10
Yg = Yg or {}

-- 仅用于 pattern() 的场景选择（保留原逻辑）
local function choose(a, b, path)
  if path and #path > 0 then
    return a
  else
    return b
  end
end

-- 模板使用 ${badge}，序号徽章在数据阶段注入
local function Bc_last()
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 与原逻辑一致：决定“同父级子页”或“顶层单段”的匹配
local function pattern(path)
  return choose("^" .. path .. "/[^/]+$", "^[^/]+$", path)
end

local max_num = 5  -- 如需覆盖 1~9，可改为 9

function Yg.lastM(thisPage, mypath)
  local list = query[[from index.tag "page" 
         where _.name ~= thisPage and _.name:find(pattern(mypath))
         order by _.lastModified desc
         limit max_num]]

  -- 方块风格（沿用 Top 的约定）
  local M_hasFATHER = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_noFATHER  = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = choose(M_hasFATHER, M_noFATHER, mypath)

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function Yg.lastV(thisPage, mypath)
  local list = query[[from editor.getRecentlyOpenedPages "page"
         where _.lastOpened and _.name ~= thisPage and _.name:find(pattern(mypath))
         order by _.lastOpened desc
         limit max_num]]
  
  -- 圆形风格（沿用 Top 的约定）
  local V_hasFATHER = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_noFATHER  = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = choose(V_hasFATHER, V_noFATHER, mypath)

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

-- 主面包屑：按是否有子页面切换 ⇦⇨ / ⬅⮕ 分隔符，并追加 👀访问次数
function Yg.bc(path)
  local thisPage = path or editor.getCurrentPage()
  local mypath = thisPage:match("^(.*)/[^/]*$")
  local arrow = choose("⇦⇨", "⬅⮕", mypath)

  -- 构建 .⇦⇨CONFIG⇦⇨Widget... 或 .⬅⮕CONFIG⬅⮕Widget...
  local bc = "[[.]]"
  local parts = string.split(thisPage, "/")
  local current = ""
  for i, part in ipairs(parts) do
    if current ~= "" then current = current .. "/" end
    current = current .. part
    bc = bc .. arrow .. "[[" .. current .. "]]"
  end

  -- 最近修改 / 最近访问（带序号徽章）
  local lastMs = template.each(Yg.lastM(thisPage, mypath), Bc_last()) or ""
  local lastVs = template.each(Yg.lastV(thisPage, mypath), Bc_last()) or ""

  -- 访问次数
  local data = datastore.get({"Visitimes", thisPage}) or {}
  local visits = data.value or 0
  local visitsSuffix = "[[CONFIG/Add Fields for Obj/Last Opened/Visit Times|" .. "👀" .. tostring(visits) .. "]]"

  return bc .. " " .. visitsSuffix .. " " .. lastMs .. " " .. lastVs
end

function widgets.breadcrumbs_B()
  return widget.new {markdown = Yg.bc()}
end
```

## Ver 3: 👀lastVisit added

```lua
-- priority: 10
Yg = Yg or {}

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

-- 仅用于 pattern() 的场景选择（保留原逻辑）
local function choose(a, b, path)
  if path and #path > 0 then
    return a
  else
    return b
  end
end

-- 模板使用 ${badge}，序号徽章在数据阶段注入
local function Bc_last()
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 与原逻辑一致：决定“同父级子页”或“顶层单段”的匹配
local function pattern(path)
  return choose("^" .. path .. "/[^/]+$", "^[^/]+$", path)
end

local max_num = 5  -- 如需覆盖 1~9，可改为 9

function Yg.lastM(thisPage, mypath)
  local list = query[[from index.tag "page" 
         where _.name ~= thisPage and _.name:find(pattern(mypath))
         order by _.lastModified desc
         limit max_num]]

  -- 方块风格（沿用 Top 的约定）
  local M_hasFATHER = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_noFATHER  = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = choose(M_hasFATHER, M_noFATHER, mypath)

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function Yg.lastV(thisPage, mypath)
  local list = query[[from index.tag "page" 
         where _.lastVisit and _.name ~= thisPage and _.name:find(pattern(mypath))
         order by _.lastVisit desc
         limit max_num]]

  -- 圆形风格（沿用 Top 的约定）
  local V_hasFATHER = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_noFATHER  = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = choose(V_hasFATHER, V_noFATHER, mypath)

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

-- 主面包屑：按是否有子页面切换 ⇦⇨ / ⬅⮕ 分隔符，并追加 👀访问次数
function Yg.bc(path)
  local thisPage = path or editor.getCurrentPage()
  local mypath = thisPage:match("^(.*)/[^/]*$")
  local arrow = choose("⇦⇨", "⬅⮕", mypath)

  -- 构建 .⇦⇨CONFIG⇦⇨Widget... 或 .⬅⮕CONFIG⬅⮕Widget...
  local bc = "[[.]]"
  local parts = string.split(thisPage, "/")
  local current = ""
  for i, part in ipairs(parts) do
    if current ~= "" then current = current .. "/" end
    current = current .. part
    bc = bc .. arrow .. "[[" .. current .. "]]"
  end

  -- 最近修改 / 最近访问（带序号徽章）
  local lastMs = template.each(Yg.lastM(thisPage, mypath), Bc_last()) or ""
  local lastVs = template.each(Yg.lastV(thisPage, mypath), Bc_last()) or ""

  -- 访问次数（来自 Visit Times 表，带秒级缓存 + 快速路径）
  local visits = getVisitTimesFor(thisPage)
  local visitsSuffix = "[[CONFIG/Add Fields for Obj/Last Opened/Visit Times|" .. "👀" .. tostring(visits) .. "]]"

  return bc .. " " .. visitsSuffix .. " " .. lastMs .. " " .. lastVs
end

function widgets.breadcrumbs_B()
  return widget.new {markdown = Yg.bc()}
end
```

## Ver 2: emoji uploaded

➡🢧➩🢥 ⇨🡆🢥⮊

```lua
-- priority: 10
Yg = Yg or {}

-- 仅用于 pattern() 的场景选择（保留原逻辑）
local function choose(a, b, path)
  if path and #path > 0 then
    return a
  else
    return b
  end
end

-- 模板使用 ${badge}，序号徽章在数据阶段注入
local function Bc_last()
  return template.new([==[${badge}[[${name}]]​]==])
end

-- 主面包屑：按是否有子页面切换 ⇦⇨ / ⬅⮕ 分隔符
function Yg.bc(path)
  local thisPage = path or editor.getCurrentPage()
  local mypath = thisPage:match("^(.*)/[^/]*$")
  local arrow = choose("⇦⇨", "⬅⮕", mypath)

  -- 构建 .⇦⇨CONFIG⇦⇨Widget... 或 .⬅⮕CONFIG⬅⮕Widget...
  local bc = "[[.]]"
  local parts = string.split(thisPage, "/")
  local current = ""
  for i, part in ipairs(parts) do
    if current ~= "" then current = current .. "/" end
    current = current .. part
    bc = bc .. arrow .. "[[" .. current .. "]]"
  end

  -- 最近修改 / 最近访问（带序号徽章）
  local lastMs = template.each(Yg.lastM(thisPage, mypath), Bc_last()) or ""
  local lastVs = template.each(Yg.lastV(thisPage, mypath), Bc_last()) or ""
  return bc .. " " .. lastMs .. " " .. lastVs
end

-- 与原逻辑一致：决定“同父级子页”或“顶层单段”的匹配
local function pattern(path)
  return choose("^" .. path .. "/[^/]+$", "^[^/]+$", path)
end

local max_num = 5  -- 如需覆盖 1~9，可改为 9

function Yg.lastM(thisPage, mypath)
  local list = query[[from index.tag "page" 
         where _.name ~= thisPage and _.name:find(pattern(mypath))
         order by _.lastModified desc
         limit max_num]]

  -- 方块风格（沿用 Top 的约定）
  local M_hasFATHER   = {"1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"}
  local M_noFATHER = {"1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"}
  local badges = choose(M_hasFATHER, M_noFATHER, mypath)

  for i, item in ipairs(list) do
    item.badge = badges[i] or ""
  end
  return list
end

function Yg.lastV(thisPage, mypath)
  local list = query[[from index.tag "page" 
         where _.lastVisit and _.name ~= thisPage and _.name:find(pattern(mypath))
         order by _.lastVisit desc
         limit max_num]]

  -- 圆形风格（沿用 Top 的约定）
  local V_hasFATHER   = {"①","②","③","④","⑤","⑥","⑦","⑧","⑨"}
  local V_noFATHER = {"➊","➋","➌","➍","➎","➏","➐","➑","➒"}
  local badges = choose(V_hasFATHER, V_noFATHER, mypath)

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

```lua
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