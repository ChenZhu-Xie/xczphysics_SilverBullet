---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Add%20Fields%20for%20Obj/Last%20Opened.md"
udpateDate: 2025-10-27
---

1. https://silverbullet.md/API/space
2. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=968e4d9470
3. https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/shared/c/69070e88-48f8-8332-b60c-47f2ab2e1755?owner_user_id=user-h5bPGeyU1zwi7LcI6XCA3cuY

```space-lua
-- priority: -1
local path = "CONFIG/Add Fields for Obj/Last Opened/Visit Times"
local lastVisitStore = lastVisitStore or {}
local isUpdatingVisitTimes = false

-- page 标签：page.lastVisit 可从 lastVisitStore 读取
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

-- 初始化空表内容（表头改为 pageRef，末列为 visitTimes）
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
  -- editor.flashNotification(line:match("^%s*|%s*[%-:]+[%- :|]*$"))
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

-- 主更新逻辑：清理不存在的键 + 更新/追加一行
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
        table.insert(newLines, line)
      else
        -- 表格数据行
        local firstCellTrim = (c1 or ""):match("^%s*(.-)%s*$") or ""
        local isHeaderRow = (firstCellTrim:lower() == "pagename" or firstCellTrim:lower() == "pageref")

        if isHeaderRow then
          -- 把表头第一列强制改成 pageRef（兼容你之前的 pageName）
          -- local _, h2, h3 = c1, c2 or "lastVisit", c3 or "visitTimes"
          line = "| pageRef | lastVisit | visitTimes |"
          table.insert(newLines, line)
        else
          -- 普通数据行：提取真正的 pageRef
          local rowRef = extractPageRefFromFirstCell(c1)

          -- 1) 自动清理：若该 pageRef 在空间中已不存在，则跳过（不写入 newLines）
          local canCheck = (type(space) == "table" and type(space.pageExists) == "function")
          if canCheck and rowRef ~= "" and rowRef ~= pageRef and not space.pageExists(rowRef) then
            -- 跳过该行，相当于删除
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

  local newContent = joinLines(newLines)
  return writePageContent(targetPath, newContent)
end

event.listen{
  -- name = "hooks:renderTopWidgets",
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

    -- 更新统计表（包含清理）
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
