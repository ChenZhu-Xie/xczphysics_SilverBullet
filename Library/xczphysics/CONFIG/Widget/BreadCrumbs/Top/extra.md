

### TOP breadcrumb 2

```space-lua
-- priority: 11
yg = yg or {}

-- 辅助：判断是否有子页面
function has_children(mypage)
  local children = query[[from index.tag "page"
         where _.name:find("^" .. mypage .. "/")
         limit 1]]
  return #children > 0
end

-- 模板改为使用 ${badge}，具体符号在数据阶段注入
function bc_last()
  return template.new([==[${badge}[[${name}]]​]==])
end

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
    -- markdown = lastMs
    html = dom.div({ lastMs }),
    display = "block",
  }
end
```

```space-lua
-- priority: 21
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs_2()
  end
}
```

### TOP breadcrumb 3

```space-lua
-- priority: 9

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
    -- markdown = lastVs
    html = dom.div({ lastVs }),
    display = "block",
  }
end
```

```space-lua
-- priority: 19
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.breadcrumbs_3()
  end
}
```

