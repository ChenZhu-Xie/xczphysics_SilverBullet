
### TOP breadcrumb 2

```space-lua
-- 最近修改/访问徽章
local lastMs = template.each(yg.lastM(mypage), bc_last()) or ""

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
