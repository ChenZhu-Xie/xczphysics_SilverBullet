---
name: CONFIG/Picker/Tree-Tree
tags: meta/library
pageDecoration.prefix: "🌲🌲 "
---

1. [headings picker](https://community.silverbullet.md/t/headings-picker/1745/10?u=chenzhu-xie) #community #silverbullet

# Implementation

## Page + Heading (double return)

```space-lua
local pageTreePicker 

local function pickHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then
    editor.flashNotification("Could not read page: " .. pageName)
    return
  end

  local parsed = markdown.parseMarkdown(text)
  local nodes = {}

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

  local function node_pos(node)
    return node.from or node.pos or node.name
  end

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

  if #nodes == 0 then
    editor.navigate({ page = pageName })
    editor.invokeCommand("Navigate: Center Cursor")
    return
  end
  
  local min_level = 10
  for _, n in ipairs(nodes) do
    if n.level < min_level then min_level = n.level end
  end

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

  table.insert(items, {
    name = ".",
    -- description = "Go to page root",
    pos = 0
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

  local result = editor.filterBox(pageName .. "#", items, "Select a Header...", "Heading Picker")

  if result then
    local pos = result.pos
    if not pos and result.value and result.value.pos then
        pos = result.value.pos
    end
    
    if pos == 0 then
        editor.navigate({ page = pageName })
    elseif pos then
        editor.navigate({ page = pageName, pos = pos })
    end
    editor.invokeCommand("Navigate: Center Cursor")
  else
    return pageTreePicker()
  end
end

-- 重写的 pageTreePicker 逻辑 --
pageTreePicker = function()
  local pages = space.listPages()
  
  -- 1. 构建完整路径图 (补全缺失的父节点)
  local path_map = {}
  local real_pages = {}
  
  -- 标记真实存在的页面
  for _, page in ipairs(pages) do
    real_pages[page.name] = true
  end

  -- 遍历所有页面，生成所有层级的节点
  for _, page in ipairs(pages) do
    local parts = {}
    for part in string.gmatch(page.name, "[^/]+") do
      table.insert(parts, part)
      local current_path = table.concat(parts, "/")
      
      if not path_map[current_path] then
        path_map[current_path] = {
          name = current_path,
          text = part, -- 只取最后一段作为显示名称
          level = #parts,
          is_real = false -- 默认为虚拟节点
        }
      end
    end
  end

  -- 更新真实页面的状态
  for path, _ in pairs(real_pages) do
    if path_map[path] then
      path_map[path].is_real = true
    end
  end

  -- 2. 转换为列表并排序 (这是绘制树的关键)
  local nodes = {}
  for _, node in pairs(path_map) do
    table.insert(nodes, node)
  end

  -- 按字母顺序排序，确保 a 在 a/b 之前
  table.sort(nodes, function(a, b) 
    return a.name < b.name 
  end)

  if #nodes == 0 then
    editor.flashNotification("No pages found")
    return
  end

  -- 3. 计算树状连接线 (Last Flags Logic)
  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    
    for j = i + 1, #nodes do
      local next_L = nodes[j].level
      
      if next_L == L then
        is_last = false -- 同级还有节点，不是最后一个
        break
      elseif next_L < L then
        is_last = true -- 下一个节点层级更浅，说明当前子树结束
        break
      end
      -- 如果 next_L > L，说明是子节点，继续往后找同级节点
    end
    last_flags[i] = is_last
  end

  -- 4. 绘制树
  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  local items = {}
  local stack = {}

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    -- 栈维护缩进
    while #stack >= L do 
      table.remove(stack) 
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    
    -- 补齐中间的空白
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE
    
    -- 视觉优化：如果是虚拟文件夹，加上 "/" 后缀，或者颜色变淡(如果有颜色支持)
    local display_text = nodes[i].text
    local desc = nodes[i].name
    
    if not nodes[i].is_real then
        display_text = display_text .. "/" -- 虚拟节点加斜杠区分
        desc = desc .. "/"
    end

    local label = prefix .. elbow .. display_text

    table.insert(items, {
      name = label,
      description = desc,
      value = { 
          page = nodes[i].name, 
          is_real = nodes[i].is_real 
      }
    })

    table.insert(stack, { level = L, last = is_last })
  end

  -- 5. 显示选择框
  local result = editor.filterBox("Pick:", items, "Select a Page...", "Page Tree")

  if result then
    local selection = result.value or result
    
    -- 处理 filterBox 可能返回不同结构的情况
    if type(selection) ~= "table" then
       -- 兼容旧逻辑或异常情况
       if selection then pickHeadings(selection) end
       return
    end

    local page_name = selection.page
    local is_real = selection.is_real

    if page_name then
        if is_real then
            -- 如果是真实页面，进入标题选择
            pickHeadings(page_name)
        else
            -- 如果选择了虚拟文件夹，通常有两个选择：
            -- 1. 什么都不做，重新打开选择器
            -- 2. 直接跳转（这会创建一个新页面）
            -- 这里我们选择方案1：提示用户并重新打开，或者你可以选择方案2直接 navigate
            editor.flashNotification("Folder selected. Creating page: " .. page_name)
            editor.navigate({ page = page_name })
            -- 如果不想允许创建，可以使用 return pageTreePicker()
        end
    end
  end
end

command.define({
  name = "Navigate: Tree-Tree Picker",
  key = "Shift-Alt-e",
  run = function() pageTreePicker() end
})

```

## Page + Heading (direct return)

```lua
local function pickHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then
    editor.flashNotification("Could not read page: " .. pageName)
    return
  end

  local parsed = markdown.parseMarkdown(text)
  local nodes = {}

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

  local function node_pos(node)
    return node.from or node.pos or node.name
  end

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

  if #nodes == 0 then
    editor.navigate({ page = pageName })
    editor.invokeCommand("Navigate: Center Cursor")
    return
  end
  
  local min_level = 10
  for _, n in ipairs(nodes) do
    if n.level < min_level then min_level = n.level end
  end

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

  table.insert(items, {
    name = ".",
    -- description = "Go to page root",
    pos = 0
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

  local result = editor.filterBox(pageName .. "#", items, "Select a Header...", "Heading Picker")

  if result then
    local pos = result.pos
    if not pos and result.value and result.value.pos then
        pos = result.value.pos
    end
    
    if pos == 0 then
        editor.navigate({ page = pageName })
    elseif pos then
        editor.navigate({ page = pageName, pos = pos })
    end
    editor.invokeCommand("Navigate: Center Cursor")
  end
end

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

  local result = editor.filterBox("Pick:", items, "Select a Page...", "Page Tree")

  if result then
    local page_name = result.value or result
    if type(page_name) == "table" and page_name.value then
        page_name = page_name.value
    end
    
    if page_name then
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

## Page Ver

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
        editor.invokeCommand("Navigate: Center Cursor")
    end
  end
end

command.define({
  name = "Navigate: Page Tree Picker",
  key = "Shift-Alt-e",
  run = function() pageTreePicker() end
})
```
