

### Page + Heading Ver

```space-lua
-- 辅助函数：处理 Heading 选择逻辑
local function pickHeadings(pageName)
  -- 1. 读取目标页面内容
  local text = space.readPage(pageName)
  if not text then
    editor.flashNotification("Could not read page: " .. pageName)
    return
  end

  local parsed = markdown.parseMarkdown(text)
  local nodes = {}

  -- 辅助函数：检测标题层级
  local function detect_level(node)
    if node.tag then
      local m = string.match(node.tag, "ATXHeading%s*(%d+)")
      if m then return tonumber(m) end
    end
    if node.type then
      local m = string.match(node.type, "ATXHeading%s*(%d+)") or string.match(node.type, "Heading(%d+)")
      if m then return tonumber(m) end
    end
    return nil
  end

  -- 辅助函数：获取节点位置
  local function node_pos(node)
    return node.from or node.pos or node.name
  end

  -- 2. 提取节点 (保留原逻辑)
  for _, n in ipairs(parsed.children or {}) do
    local level = detect_level(n)
    if level then
      local children = {}
      if n.children then
        for i, c in ipairs(n.children) do
          if i > 1 then table.insert(children, c) end
        end
      end

      local parts = {}
      for _, c in ipairs(children) do
        local rendered = markdown.renderParseTree(c)
        if rendered and rendered ~= "" then
          table.insert(parts, string.trim(rendered))
        end
      end
      local title = table.concat(parts, "")

      if title ~= "" then
        table.insert(nodes, {
          level = level,
          text  = title,
          pos   = node_pos(n)
        })
      end
    end
  end

  -- 3. 判断是否有 Headings
  -- 如果没有 Headings，直接跳转到页面
  if #nodes == 0 then
    editor.navigate({ page = pageName })
    return
  end

  -- 4. 构建树形 UI (保留原逻辑)
  
  -- 计算最小层级
  local min_level = 10
  for _, n in ipairs(nodes) do
    if n.level < min_level then min_level = n.level end
  end

  -- 计算 last_flags
  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    for j = i + 1, #nodes do
      if nodes[j].level <= L then
        if nodes[j].level == L then
          is_last = false
        else
          is_last = true
        end
        break
      end
    end
    last_flags[i] = is_last
  end

  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  local items = {}
  local stack = {} 

  -- **关键修改：首先插入根节点 "."**
  table.insert(items, {
    name = ".",
    description = "Go to page root",
    pos = 0 -- 0 代表页面顶部
  })

  for i = 1, #nodes do
    local L = nodes[i].level - min_level + 1
    local is_last = last_flags[i]

    while #stack > 0 and stack[#stack].level >= L do 
      table.remove(stack) 
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE
    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = "", 
      pos = nodes[i].pos
    })

    table.insert(stack, { level = L, last = is_last })
  end

  -- 5. 显示 Headings 选择器
  -- 标题栏提示当前正在查看哪个页面的大纲
  local result = editor.filterBox("Jump to in " .. pageName .. ":", items, "Select a Header...", "Heading Picker")

  if result then
    -- 处理 filterBox 返回结果的差异 (有些版本返回 table，有些直接返回 value)
    local pos = result.pos
    if not pos and result.value and result.value.pos then
        pos = result.value.pos
    end
    
    -- 6. 执行跳转
    if pos == 0 then
        -- 跳转到页面根部
        editor.navigate({ page = pageName })
    elseif pos then
        -- 跳转到具体 Heading 位置
        editor.navigate({ page = pageName, pos = pos })
    end
  end
end

-- 主函数：页面树选择器
local function pageTreePicker()
  local pages = space.listPages()
  
  local nodes = {}

  local function parse_page_info(page_name)
    local level = 1
    for _ in string.gmatch(page_name, "/") do
      level = level + 1
    end
    local text = page_name:match(".*/(.*)") or page_name
    return level, text
  end

  for _, page in ipairs(pages) do
    local level, text = parse_page_info(page.name)
    table.insert(nodes, {
      level = level,
      text  = text,
      pos   = page.name
    })
  end

  if #nodes == 0 then
    editor.flashNotification("No pages found")
    return
  end

  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    
    for j = i + 1, #nodes do
      local next_L = nodes[j].level
      
      if next_L == L then
        is_last = false
        break
      elseif next_L < L then
        is_last = true
        break
      end
    end
    last_flags[i] = is_last
  end

  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  local items = {}
  local stack = {}

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    while #stack >= L do 
      table.remove(stack) 
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE
    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = nodes[i].pos,
      value = nodes[i].pos
    })

    table.insert(stack, { level = L, last = is_last })
  end

  -- 第一步：选择页面
  local result = editor.filterBox("Search Pages:", items, "Select a Page...", "Page Tree")

  if result then
    local page_name = result.value or result
    if type(page_name) == "table" and page_name.value then
        page_name = page_name.value
    end
    
    if page_name then
        -- 第二步：不直接跳转，而是进入 Heading 检测流程
        pickHeadings(page_name)
    end
  end
end

command.define({
  name = "Navigate: Page Tree & Heading Picker",
  key = "Shift-Alt-e",
  run = function() pageTreePicker() end
})

```

### Page Ver

```lua
-- Page Tree Picker with CMD-Tree UI
local function pageTreePicker()
  local pages = space.listPages()
  
  local nodes = {}

  local function parse_page_info(page_name)
    local level = 1
    for _ in string.gmatch(page_name, "/") do
      level = level + 1
    end
    local text = page_name:match(".*/(.*)") or page_name
    return level, text
  end

  for _, page in ipairs(pages) do
    local level, text = parse_page_info(page.name)
    table.insert(nodes, {
      level = level,
      text  = text,
      pos   = page.name
    })
  end

  if #nodes == 0 then
    editor.flashNotification("No pages found")
    return
  end

  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    
    for j = i + 1, #nodes do
      local next_L = nodes[j].level
      
      if next_L == L then
        is_last = false
        break
      elseif next_L < L then
        is_last = true
        break
      end
    end
    last_flags[i] = is_last
  end

  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  local items = {}
  local stack = {}

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    while #stack >= L do 
      table.remove(stack) 
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE
    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = nodes[i].pos,
      value = nodes[i].pos
    })

    table.insert(stack, { level = L, last = is_last })
  end

  local result = editor.filterBox("Search:", items, "Select a Page...", "Page Tree")

  if result then
    local page_name = result.value or result
    if type(page_name) == "table" and page_name.value then
        page_name = page_name.value
    end
    if page_name then
        editor.navigate({ page = page_name })
    end
  end
end

command.define({
  name = "Navigate: Page Tree Picker",
  key = "Shift-Alt-e",
  run = function() pageTreePicker() end
})
```
