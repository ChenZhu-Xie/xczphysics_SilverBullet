---
tags: meta/library
pageDecoration.prefix: 
---


# SB approach

## Query lastOpened: 1st shot

${query[[from editor.getRecentlyOpenedPages "page"
         where _.name == editor.getCurrentPage()
         select {lastOpened = _.lastOpened}]]}
${template.each(query[[from editor.getRecentlyOpenedPages "page"
    where _.name == editor.getCurrentPage()]], 
    template.new[==[
    ${_.lastOpened}
]==])}

## Query lastOpened: 2nd shot

另一种 先索引 attr，再索引 obj_name 的 方式（类似 [[CONFIG#SB stuff]]）

1. inspired by https://silverbullet.md/Objects#taskstate
${query[[from editor.getRecentlyOpenedPages "lastOpened" where _.page == editor.getCurrentPage()]]}

2. comming from [[CONFIG#SB stuff]]
${template.each(query[[
  from editor.getRecentlyOpenedPages "lastOpened"
  where _.tag == "page" and _.name == editor.getCurrentPage()
]], templates.fullPageItem)}
`${_CTX.currentPage.name}` from https://silverbullet.md/Objects#page
${query[[
  from editor.getRecentlyOpenedPages "lastOpened"
  where _.tag == "page" and _.name == editor.getCurrentPage()
  select ({lastOpened = _.lastOpened})
]]}
## Simplest way of getting lastOpened attr?

### Some equivalences
1. https://silverbullet.md/Space%20Lua

`${_CTX.currentPage.name}` from https://silverbullet.md/Objects#page
`${_CTX.currentPage}`
`${space.getPageMeta(editor.getCurrentPage())}`
`${query[[from index.tag "page" where _.name == editor.getCurrentPage()]]}`

`${_CTX._GLOBAL}` ?
`${space.listPages()}`
`${query[[from index.tag "page"]]}`

### Wraping `page.lastOpened` from [[CONFIG/API/Page Navigation]]

${page.lastOpened()}
```space-lua
-- priority: -1
-- 这个不能和 index.defineTag 分开，否则 index.defineTag 没用? 至少在 v2.1.9 可以分开。
page = page or {} -- function page.lastOpened(mypage)
function page.lastOpened(mypage)
  mypage = mypage or editor.getCurrentPage()
  local table = query[[
    from editor.getRecentlyOpenedPages "page"
    where _.name == mypage
  ]]
  return table[1].lastOpened
end
```

### integrate with `index.defineTag` 2

${(query[[
    from editor.getRecentlyOpenedPages "page"
    where _.name == editor.getCurrentPage()
  ]])[1].lastOpened}

有 page = page or {} 后，SB 重启后 lastVisit 又没了?

不。仍有。但仍撑不过 `Client: Wipe Out`，则下述是 [[SB Basics/SB API/index#Client level]]
这个版本的 lastVisit < lastOpened，是其子集。
奇怪，即便没有 editor:pageLoaded 这个 event.listen，也是 Client 周期

`${query[[from index.tag "page" 
         where _.lastVisit]]}`
```lua
-- priority: -1
-- work within client/indexdb cycle。不知道为什么不 work in lastOpened cycle，但试过与 [[CONFIG/Add Fields for Obj/Last Opened#Wraping `page.lastOpened` from [[CONFIG/API/Page Navigation]]]] 不在同一 block 无关
index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "lastVisit" then
        return page.lastOpened(self.name)
      end
    end
  }
}
```

### integrate with `index.defineTag` 1

${page.lastOpened()}
_.lastVisit 存在但 仍无法 从表格中 直接看到，只能 query 出来。

这个版本的 lastVisit = lastOpened，而不是其子集。生命周期：永续存在。

`${query[[from index.tag "page" 
         where _.lastVisit]]}`
```lua
-- priority: -1
page = page or {} -- work within lastOpened cycle
function page.lastOpened(mypage)
  mypage = mypage or editor.getCurrentPage()
  return template.each(query[[
    from editor.getRecentlyOpenedPages "page"
    where _.name == mypage
  ]], template.new[==[${_.lastOpened}]==])
end

-- work, but all nil
index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "lastVisit" then
        return page.lastOpened(self.name)
      end
    end
  }
}
```

### Visitimes 1: Instance level

${query[[from index.tag "page" 
         where _.Visitimes and _.name != editor.getCurrentPage()
         select {ref=_.ref, Visitimes=_.Visitimes} 
         order by _.Visitimes desc 
         limit 5]]}
`${Visitimes[editor.getCurrentPage()]}`

```lua
-- priority: -1
local Visitimes = Visitimes or {}

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "Visitimes" then
        return Visitimes[self.name]
      end
    end
  }
}

event.listen{
  -- name = "hooks:renderTopWidgets",
  name = "editor:pageLoaded",
  run = function(e)
    local mypage = editor.getCurrentPage()
    Visitimes[mypage] = (Visitimes[mypage] or 0) + 1
    -- editor.flashNotification("Visitimes: " .. Visitimes[mypage])
  end
}
```

### Visitimes 2: Client level

1. https://silverbullet.md/API/datastore
2. https://github.com/silverbulletmd/silverbullet/blob/df28a3f04dc8f1bcc20be1beb5e6e47c58bfd917/client/data/datastore.ts#L76

${datastore.set({"user","123"}, {name = "test"})}
${(datastore.get({"user","12"})).value}
${datastore.get({"Visitimes", editor.getCurrentPage()}).value} ← 单独 Query 特定 路径下的 ViewTimes 可以做，但 Table/List 还不行

${datastore.queryLua()}
${datastore.queryLua({"Visitimes", editor.getCurrentPage()})}
- Datastore: https://github.com/silverbulletmd/silverbullet/issues/914#issuecomment-2205905590
- ClientStore: https://github.com/silverbulletmd/silverbullet/pull/1542#issuecomment-3290746660

OtherGoodStuff:
- JsDebug: https://github.com/silverbulletmd/silverbullet/issues/1520#issuecomment-3285366880
- Per-tag page styling: https://github.com/silverbulletmd/silverbullet/pull/945
- Performance issues with a large garden: https://github.com/silverbulletmd/silverbullet/issues/1010

High Quality External Judgment about SB: https://github.com/silverbulletmd/silverbullet/pull/751#issue-2152559352
  - https://www.startpage.com/sp/search

还是 没能实现 直接将 Visitimes 按 value 降序，排列 mypage 成表格，以放在 [[index#Last Visit 👀]] 中，暂时不做了 = =...
“dataStore 查询” 的接口似乎还没暴露出来。[[index#Most Visit ❤️‍🔥|尽管另寻他法做表格很容易]]。

```space-lua
-- priority: -1
event.listen{
  -- name = "hooks:renderTopWidgets",
  name = "editor:pageLoaded",
  run = function(e)
    local mypage = editor.getCurrentPage()
    local data = datastore.get({"Visitimes", mypage}) or {}
    local value = data.value or 0
    datastore.set({"Visitimes", mypage}, { value = value + 1 })
    -- editor.flashNotification("Visitimes: " .. datastore.get({"Visitimes", mypage}).value)
  end
}
```

# 不使用 frontmatter 的 自建表

==优点== 不污染（查询出来的所有）page 对象的 fields
==缺点== 但也就没法直接 /query 查询。

1. https://silverbullet.md/API/space
2. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=968e4d9470
3. https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/shared/c/69070e88-48f8-8332-b60c-47f2ab2e1755?owner_user_id=user-h5bPGeyU1zwi7LcI6XCA3cuY

==效果== 见 [[CONFIG/Add Fields for Obj/Last Opened/Visit Times]]

重复造了已有的轮子：https://silverbullet.md/Page%20Picker 
其中的 page，默认就是按 lastVisit 排序的。
但我找不到其 lua 实现，就自己造了...。

## Sorted by lastVisit

```lua
-- priority: -1
local path = "CONFIG/Add Fields for Obj/Last Opened/Visit Times"
local lastVisitStore = lastVisitStore or {}
local isUpdatingVisitTimes = false

-- page 标签：page.lastVisit 可从 lastVisitStore 读取（仅用于需要的地方）
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

-- 工具函数：标准化换行
local function normalizeNewlines(s)
  if not s or s == "" then return "" end
  s = s:gsub("\r\n", "\n")
  s = s:gsub("\r", "\n")
  return s
end

-- 初始化空表内容（表头为 pageRef / lastVisit / visitTimes）
local function initialTable()
  return table.concat({
    "| pageRef | lastVisit | visitTimes |",
    "|---------|-----------|------------|",
    ""
  }, "\n")
end

-- 判断是否已有我们需要的表头（匹配 pageRef / visitTimes）
local function hasHeader(content)
  content = content or ""
  return content:find("|%s*pageRef%s*|%s*lastVisit%s*|%s*visitTimes%s*|") ~= nil
end

-- 是否为分隔行（例如 |-----|-----|-----|）
local function isSeparatorLine(line)
  return line:match("^%s*|%s*[%-:]+[%- :|]*$") ~= nil
end

-- 解析一行是否为数据行，返回3列（忽略分隔行）
local function parseRow(line)
  if isSeparatorLine(line) then return nil end
  local c1, c2, c3 = line:match("^%s*|%s*([^|]-)%s*|%s*([^|]-)%s*|%s*([^|]-)%s*|%s*$")
  if not c1 then return nil end
  return c1, c2, c3
end

-- 从第一格内容提取 pageRef：
-- 支持 "[[Ref]]" 或 "[[Ref|Alias]]"；否则原样返回去掉首尾空格的文本
local function extractPageRefFromFirstCell(cellText)
  local cell = (cellText or ""):match("^%s*(.-)%s*$") or ""
  local inner = cell:match("^%[%[%s*(.-)%s*%]%]$")
  if inner then
    local ref = inner:match("^(.-)|") or inner
    return (ref or ""):match("^%s*(.-)%s*$")
  end
  return cell
end

-- 将 pageRef 渲染成第一格内容（前向链接）
local function renderFirstCellFromPageRef(pageRef)
  return ("[[%s]]"):format(tostring(pageRef or ""))
end

-- 行格式化：第一格写入前向链接 "[[pageRef]]"
local function formatRow(pageRef, lastVisit, visitTimes)
  return ("| %s | %s | %s |"):format(
    renderFirstCellFromPageRef(pageRef),
    tostring(lastVisit or ""),
    tostring(visitTimes or 0)
  )
end

-- 把整页文本拆成行数组（保留顺序）
local function splitLines(text)
  text = normalizeNewlines(text or "")
  local lines = {}
  for line in (text .. "\n"):gmatch("([^\n]*)\n") do
    table.insert(lines, line)
  end
  -- 去掉末尾可能的空行堆叠
  while #lines > 0 and lines[#lines] == "" do
    table.remove(lines, #lines)
  end
  return lines
end

-- 合并行
local function joinLines(lines)
  return table.concat(lines, "\n") .. "\n"
end

-- 把 "YYYY-MM-DD HH:MM:SS" 解析为 epoch（本地时区）
local function parseTimestamp(s)
  if not s then return 0 end
  local y, mo, d, h, mi, se = s:match("^(%d%d%d%d)%-(%d%d)%-(%d%d)%s+(%d%d):(%d%d):(%d%d)$")
  if not y then return 0 end
  return os.time{
    year = tonumber(y), month = tonumber(mo), day = tonumber(d),
    hour = tonumber(h), min = tonumber(mi), sec = tonumber(se)
  } or 0
end

-- 仅对表格区段排序：保留表头与分隔行，按 lastVisit 降序重排数据行
local function sortTableByLastVisit(lines)
  local out = {}
  local i, n = 1, #lines

  while i <= n do
    local line = lines[i]
    local isHeader = line:match("^%s*|%s*pageRef%s*|%s*lastVisit%s*|%s*visitTimes%s*|%s*$") ~= nil

    if not isHeader then
      table.insert(out, line)
      i = i + 1
    else
      -- 1) 表头
      table.insert(out, line)
      i = i + 1

      -- 2) 分隔行（如果有）
      if i <= n and isSeparatorLine(lines[i]) then
        table.insert(out, lines[i])
        i = i + 1
      end

      -- 3) 收集连续的数据行
      local rows = {}
      while i <= n do
        local c1, c2, c3 = parseRow(lines[i])
        if not c1 then break end
        table.insert(rows, {
          pageRef = extractPageRefFromFirstCell(c1),
          lastVisit = (c2 or ""):match("^%s*(.-)%s*$"),
          visitTimes = tonumber((c3 or ""):match("^%s*(.-)%s*$")) or 0
        })
        i = i + 1
      end

      -- 4) 排序：lastVisit 降序；其次 visitTimes 降序；最后 pageRef 升序（稳定）
      if #rows > 1 then
        table.sort(rows, function(a, b)
          local ta, tb = parseTimestamp(a.lastVisit), parseTimestamp(b.lastVisit)
          if ta ~= tb then return ta > tb end
          if a.visitTimes ~= b.visitTimes then return a.visitTimes > b.visitTimes end
          return (a.pageRef or "") < (b.pageRef or "")
        end)
      end

      -- 5) 重写数据行
      for _, r in ipairs(rows) do
        table.insert(out, formatRow(r.pageRef, r.lastVisit, r.visitTimes))
      end
    end
  end

  return out
end

-- 写回页面：优先 space.writePage，如不可用则回退到 editor 全文替换
local function writePageContent(targetPath, newContent)
  if type(space) == "table" and type(space.writePage) == "function" then
    space.writePage(targetPath, newContent)
    return true
  end

  if editor and editor.openPage and editor.getText and editor.replaceRange then
    local ok = pcall(function()
      editor.openPage(targetPath)
      local old = editor.getText() or ""
      editor.replaceRange(0, #old, newContent, true)
    end)
    return ok
  end
  return false
end

-- 主更新逻辑：清理不存在的键 + 更新/追加一行 + 按 lastVisit 降序排序
local function upsertVisitRow(targetPath, pageRef, lastVisit, incTimes)
  local content = space.readPage(targetPath) or ""
  if content == "" or not hasHeader(content) then
    content = initialTable()
  end

  local lines = splitLines(content)
  local newLines = {}
  local foundIndex = nil

  for i, line in ipairs(lines) do
    -- 分隔行直接保留
    if isSeparatorLine(line) then
      table.insert(newLines, line)

    else
      local c1, c2, c3 = parseRow(line)
      if not c1 then
        -- 非表格数据行（包含表头、空行或其他内容），原样保留
        -- 如果是混用旧表头（pageName），统一为 pageRef
        local firstCellTrim = (line:match("^%s*|%s*([^|]-)%s*|") or ""):lower()
        if firstCellTrim == "pagename" or firstCellTrim == "pageref" then
          table.insert(newLines, "| pageRef | lastVisit | visitTimes |")
        else
          table.insert(newLines, line)
        end

      else
        -- 表格数据行
        local firstCellTrim = (c1 or ""):match("^%s*(.-)%s*$") or ""
        local isHeaderRow = (firstCellTrim:lower() == "pagename" or firstCellTrim:lower() == "pageref")

        if isHeaderRow then
          -- 统一表头
          table.insert(newLines, "| pageRef | lastVisit | visitTimes |")
        else
          -- 普通数据行：提取真正的 pageRef
          local rowRef = extractPageRefFromFirstCell(c1)

          -- 1) 自动清理：若该 pageRef 在空间中已不存在，则跳过（不写入 newLines）
          local canCheck = (type(space) == "table" and type(space.pageExists) == "function")
          if canCheck and rowRef ~= "" and rowRef ~= pageRef and not space.pageExists(rowRef) then
            -- 跳过该行
          else
            -- 2) 正常保留或更新目标行
            if rowRef == pageRef then
              local timesNum = tonumber((c3 or ""):match("^%s*(.-)%s*$")) or 0
              timesNum = timesNum + (incTimes and 1 or 0)
              line = formatRow(pageRef, lastVisit, timesNum)
              foundIndex = i
            end
            table.insert(newLines, line)
          end
        end
      end
    end
  end

  -- 未找到则追加
  if not foundIndex then
    table.insert(newLines, formatRow(pageRef, lastVisit, 1))
  end

  -- 在写回前对表格数据行按 lastVisit 降序排序（高性能：仅处理表格区段）
  local sortedLines = sortTableByLastVisit(newLines)
  local newContent = joinLines(sortedLines)
  return writePageContent(targetPath, newContent)
end

event.listen{
  name = "editor:pageLoaded",
  run = function(e)
    -- 再入保护
    if isUpdatingVisitTimes then return end

    local pageRef = editor.getCurrentPage()
    pageRef = tostring(pageRef or "")
    if pageRef == "" then return end

    -- 避免对统计页本身计数，防止自触发递归
    if pageRef == path then return end

    local now = os.date("%Y-%m-%d %H:%M:%S")

    -- 同秒防抖
    if lastVisitStore[pageRef] == now then return end
    lastVisitStore[pageRef] = now

    -- 更新统计表（包含清理 + 排序）
    isUpdatingVisitTimes = true
    local ok, err = pcall(function()
      upsertVisitRow(path, pageRef, now, true)
    end)
    isUpdatingVisitTimes = false

    if not ok then
      editor.flashNotification(("[Visit Times] 更新失败: %s"):format(tostring(err)))
    end
  end
}
```

# Add attr: LastVisit to Pages

1. https://silverbullet.md/API/index#Example
2. https://chatgpt.com/share/68fb38b1-bc48-8010-8bea-5fc4fbd1e7a9
3. https://community.silverbullet.md/t/add-one-off-attr-lastvisit-to-pages/3463/1

${query[[from index.tag "page" where _.lastVisit select {ref=_.ref, lastVisit=_.lastVisit} order by _.lastVisit desc limit 5]]}
```lua
-- priority: -1
local lastVisitStore = lastVisitStore or {}

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
  -- name = "hooks:renderTopWidgets",
  name = "editor:pageLoaded",
  run = function(e)
    local pageRef = editor.getCurrentPage()
    local now = os.date("%Y-%m-%d %H:%M:%S")

    if lastVisitStore[pageRef] == now then
      return
    end
    lastVisitStore[pageRef] = now
    -- editor.flashNotification("lastVisit: pageRef " .. now)
  end
}
```

## Previous Attempt

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=072f4db51d

```lua
-- priority: -1
local lastVisitStore = lastVisitStore or {}

local function nowEpoch()
  return os.time()
end

local function epochToISO(ts)
  return os.date("%Y-%m-%dT%H:%M:%S", ts)
end

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      local rec = lastVisitStore[self.name]
      if not rec then return nil end
      if attr == "lastVisit" then
        return rec.iso
      elseif attr == "lastVisitEpoch" then
        return rec.epoch
      end
    end
  }
}

event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local pageRef = editor.getCurrentPage()
    if not pageRef then return end
    local epoch = nowEpoch()
    local rec = lastVisitStore[pageRef]
    if rec and rec.epoch == epoch then return end

    lastVisitStore[pageRef] = { epoch = epoch, iso = epochToISO(epoch) }
    editor.flashNotification("lastVisit updated: " .. lastVisitStore[pageRef].epoch)
  end
}
```

```
${query[[from index.tag "page"
  where _.lastVisitEpoch
  select {ref=_.ref, lastVisit=_.lastVisit}
  order by lastVisitEpoch desc
  limit 5]]}

${query[[from index.tag "page"
  where _.lastVisitEpoch
  select {ref=_.ref, lastVisitEpoch=_.lastVisitEpoch}
  order by _.lastVisitEpoch desc  -- _. matters
  limit 5]]}
```

## Original Frontmatter Version

1. https://chatgpt.com/share/68fa6cef-4a6c-8010-93d1-41fe0c23c6a8
2. https://silverbullet.md/API/editor
3. https://silverbullet.md/API/os
4. https://silverbullet.md/Library/Std/APIs/Date
5. https://silverbullet.md/HTTP%20API

```lua
-- priority: -1
event.listen{
  name = "hooks:renderTopWidgets",
  run = function(e)
    local text = editor.getText()
    local fmExtract = index.extractFrontmatter(text) or {}
    local fmTable = fmExtract.frontmatter or {}
    local body = fmExtract.text or text

    local t = os.date("*t")
    local ms = math.floor((os.clock() % 1) * 1000)
    local now = string.format(
        "%04d-%02d-%02dT%02d:%02d:%02d.%03d",
        t.year, t.month, t.day,
        t.hour, t.min, t.sec,
        ms
    )

    local now = os.date("%Y-%m-%d %H:%M:%S")
    editor.flashNotification(now)
    if fmTable.LastVisit == now then
      return
    end
    fmTable.LastVisit = now

    local lines = {"---"}
    for k, v in pairs(fmTable) do
      if type(v) == "table" then
        v = "{" .. table.concat(v, ", ") .. "}"
      end
      table.insert(lines, string.format("%s: %s", k, v))
    end
    table.insert(lines, "---")
    local fmText = table.concat(lines, "\n") .. "\n"

    local pattern = "^%-%-%-([\r\n].-)+%-%-%-[\r\n]?"
    local newText
    if string.match(text, pattern) then
      newText = text:gsub(pattern, fmText)
    else
      newText = fmText .. body
    end

    if newText ~= text then
      editor.setText(newText, false)
    end
  end
}
```
