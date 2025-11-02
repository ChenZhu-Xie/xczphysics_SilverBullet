
```space-lua
-- priority: -1
local yaml = require("yaml")  -- SB 已内建 yaml 支持
local fs = require("fs")
local path = "CONFIG/Add Fields for Obj/Last Opened/lastVisit.yaml"

-- 尝试读取 YAML 数据
local function loadLastVisit()
  if not fs.exists(path) then return {} end
  local f = io.open(path, "r")
  if not f then return {} end
  local content = f:read("*a")
  f:close()
  local ok, data = pcall(yaml.decode, content)
  if ok and type(data) == "table" then
    return data
  else
    return {}
  end
end

-- 保存 YAML 数据（覆盖写）
local function saveLastVisit(data)
  local yamlStr = yaml.encode(data)
  fs.mkdirp("CONFIG/Add Fields for Obj/Last Opened") -- 确保目录存在
  local f = io.open(path, "w")
  if f then
    f:write(yamlStr)
    f:close()
  end
end

-- 全局缓存
local lastVisitStore = loadLastVisit()

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "lastVisit" then
        return lastVisitStore[self.name]
      end
    end
  }
}

event.listen{
  name = "editor:pageLoaded",
  run = function(e)
    local pageRef = editor.getCurrentPage()
    local now = os.date("%Y-%m-%d %H:%M:%S")

    -- 确保该页条目存在
    if not lastVisitStore[pageRef] then
      lastVisitStore[pageRef] = {
        lastOpened = now,
        openedTimes = 1
      }
    else
      local entry = lastVisitStore[pageRef]
      entry.lastOpened = now
      entry.openedTimes = (entry.openedTimes or 0) + 1
    end

    -- 增量更新写回
    saveLastVisit(lastVisitStore)
  end
}
```

