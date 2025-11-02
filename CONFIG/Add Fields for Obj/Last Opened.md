---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Add%20Fields%20for%20Obj/Last%20Opened.md"
udpateDate: 2025-10-27
---

1. https://silverbullet.md/API/space

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

-- 工具：标准化换行/去首尾空白/取 basename
local function normalizeNewlines(s)
  if not s or s == "" then return "" end
  s = s:gsub("\r\n", "\n"):gsub("\r", "\n")
  return s
end
local function trim(s)
  return (tostring(s or ""):match("^%s*(.-)%s*$"))
end
local function basename(ref)
  -- 去掉目录部分
  local b = ref:gsub("[/\\]+$", ""):gsub("^.+[/\\]", "")
  return b ~= "" and b or ref
end
local function unquote(s)
  s = trim(s or "")
  local q = s:sub(1,1)
  if (q == '"' or q == "'") and s:sub(-1) == q then
    return s:sub(2, -2)
  end
  return s
end

-- 初始化空表内容（表头为 pageRef | lastVisit | visitTimes）
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
  return line:match("^%s*|%s*[-:]+") ~= nil
end

-- 行拆分器：把一行表格内容分成 N 个单元格
-- 支持：
--  - 链接 [[...|...]] 内的管道不会作为分隔符
--  - 转义管道 \| 不作为分隔符
local function splitRowCells(line)
  local cells = {}
  local buf = {}
  local i, n = 1, #line
  local started = false
  local linkDepth = 0 -- 处理 [[  ]] 成对出现
  local function pushCell()
    local cell = table.concat(buf)
    table.insert(cells, trim(cell))
    buf = {}
  end

  while i <= n do
    local ch = line:sub(i,i)
    local next2 = (i < n) and (line:sub(i, i+1)) or nil

    -- 跳过行首的分隔竖线
    if not started then
      if ch == "|" then
        started = true
        i = i + 1
      else
        -- 非表格行
        return nil
      end
    else
      -- 处理转义 \|
      if ch == "\\" and i < n then
        local ch2 = line:sub(i+1,i+1)
        table.insert(buf, ch) -- 保留转义（原样）
        table.insert(buf, ch2)
        i = i + 2
      -- 处理 [[ 与 ]]
      elseif next2 == "[[" then
        linkDepth = linkDepth + 1
        table.insert(buf, next2)
        i = i + 2
      elseif next2 == "]]" and linkDepth > 0 then
        linkDepth = linkDepth - 1
        table.insert(buf, next2)
        i = i + 2
      -- 非链接/非转义下的单元格分隔符
      elseif ch == "|" and linkDepth == 0 then
        pushCell()
        i = i + 1
        -- 如果后面直接是行尾或仅有一个额外的“|”，继续循环让它收集空单元格
      else
        table.insert(buf, ch)
        i = i + 1
      end
    end
  end

  if started then
    pushCell()
  end

  -- 去除最后一个空单元格（如果行末以 | 结束）
  while #cells > 0 and cells[#cells] == "" do
    table.remove(cells, #cells)
  end

  return cells
end

-- 解析一行是否为数据行，返回3列（忽略分隔行）
local function parseRow(line)
  if isSeparatorLine(line) then return nil end
  local cells = splitRowCells(line)
  if not cells or #cells < 3 then return nil end
  return cells[1], cells[2], cells[3]
end

-- 从第一格内容提取 pageRef：
-- 支持 "[[Ref]]" 或 "[[Ref|Alias]]"；否则原样返回去掉首尾空格的文本
local function extractPageRefFromFirstCell(cellText)
  local cell = trim(cellText or "")
  local inner = cell:match("^%[%[%s*(.-)%s*%]%]$")
  if inner then
    local ref = inner:match("^(.-)|") or inner
    return trim(ref or "")
  end
  return cell
end

-- 计算“显示别名”
local aliasCache = {}
local function extractFrontmatter(content)
  -- 只在文首提取简单 YAML frontmatter: ---\n ... \n---
  local fm = content:match("^%-%-%-\n(.-)\n%-%-%-")
  return fm
end
local function pickFirstAliasesFromFrontmatter(fm)
  -- 支持三种：title, alias, aliases
  local title = nil
  local alias = nil
  local firstAliases = nil

  -- 行级扫描，简单稳健
  for line in (fm or ""):gmatch("([^\n]+)") do
    local k, v = line:match("^%s*([%w_%-]+)%s*:%s*(.-)%s*$")
    if k and v then
      local kl = k:lower()
      if kl == "title" and not title then
        title = unquote(v)
      elseif kl == "alias" and not alias then
        alias = unquote(v)
      elseif kl == "aliases" and not firstAliases then
        -- 支持 array 语法 aliases: [A, B] 或后续多行 "- A"
        local bracket = v:match("^%[(.-)%]$")
        if bracket then
          local first = bracket:match("^%s*([^,]+)")
          firstAliases = first and unquote(first)
        end
      end
    else
      -- 也支持 YAML 列表项："- xxx" 仅在前一行是 aliases: 时有效，但为简化不做上下文跟踪
      -- 如需更严谨可扩展为状态机，这里尽量保持简单
    end
  end
  return title or alias or firstAliases
end

local function getPageAlias(pageRef)
  if aliasCache[pageRef] ~= nil then return aliasCache[pageRef] end
  local disp = basename(pageRef)

  local ok, content = pcall(function() return space.readPage(pageRef) end)
  if ok and content and content ~= "" then
    content = normalizeNewlines(content)
    local fm = extractFrontmatter(content)
    local picked = fm and pickFirstAliasesFromFrontmatter(fm)
    if picked and picked ~= "" then
      disp = picked
    else
      -- 从正文中取第一个 H1
      local h1 = content:match("^\n?#%s+([^\n]+)") or content:match("\n#%s+([^\n]+)")
      if h1 and trim(h1) ~= "" then
        disp = trim(h1)
      end
    end
  end

  -- 避免别名中出现会破坏链接的字符
  disp = disp:gsub("%]%]", "]] ")     -- 防止闭合符
  disp = disp:gsub("%[%[", " [[")     -- 防止开符
  disp = disp:gsub("|", "¦")          -- 别名内不允许有 |，替换为相似字符

  aliasCache[pageRef] = disp
  return disp
end

-- 将 pageRef 渲染成第一格内容：[[pageRef|alias]]
local function renderFirstCellFromPageRef(pageRef)
  local alias = getPageAlias(pageRef)
  return ("[[%s|%s]]"):format(tostring(pageRef or ""), tostring(alias or ""))
end

-- 行格式化：第一格写入前向链接 "[[pageRef|alias]]"
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
    if isSeparatorLine(line) then
      table.insert(newLines, line)
    else
      local c1, c2, c3 = parseRow(line)
      if not c1 then
        -- 非表格数据行（表头、空行或其他内容），原样保留
        local firstCellTrim = trim((splitRowCells(line) or {})[1] or "")
        local isHeaderRow = (firstCellTrim:lower() == "pagename" or firstCellTrim:lower() == "pageref")
        if isHeaderRow then
          table.insert(newLines, "| pageRef | lastVisit | visitTimes |")
        else
          table.insert(newLines, line)
        end
      else
        local firstCellTrim = trim(c1)
        local isHeaderRow = (firstCellTrim:lower() == "pagename" or firstCellTrim:lower() == "pageref")
        if isHeaderRow then
          -- 强制规范表头
          table.insert(newLines, "| pageRef | lastVisit | visitTimes |")
        else
          local rowRef = extractPageRefFromFirstCell(c1)

          -- 1) 自动清理：若该 pageRef 在空间中已不存在，则跳过（不写入 newLines）
          local canCheck = (type(space) == "table" and type(space.pageExists) == "function")
          if canCheck and rowRef ~= "" and rowRef ~= pageRef and not space.pageExists(rowRef) then
            -- 删除：跳过
          else
            -- 2) 更新目标行；非目标行保持原样
            if rowRef == pageRef then
              local timesNum = tonumber(trim(c3 or "")) or 0
              timesNum = timesNum + (incTimes and 1 or 0)
              line = formatRow(pageRef, lastVisit, timesNum) -- 第一列默认显示别名
              foundIndex = i
            end
            table.insert(newLines, line)
          end
        end
      end
    end
  end

  -- 未找到则追加（第一列默认显示别名）
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
