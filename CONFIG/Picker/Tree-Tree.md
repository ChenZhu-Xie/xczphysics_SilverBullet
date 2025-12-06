---
name: CONFIG/Picker/Tree-Tree
tags: meta/library
pageDecoration.prefix: "🌲🌲 "
---

1. [headings picker](https://community.silverbullet.md/t/headings-picker/1745/10?u=chenzhu-xie) #community #silverbullet

# Implementation

## Tree-Tree (header path)

```space-lua
-- 优化1: 稍微精简的标题解析逻辑
local function getPageHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then return {} end

  local nodes = {}
  local in_code_block = false
  local current_pos = 0
  
  -- 使用 gmatch 迭代每一行，避免一次性加载过多临时字符串
  for line in text:gmatch("([^\r\n]*)\r?\n?") do
    -- 快速跳过空行（性能微调）
    if #line > 0 then
      -- 检查代码块，只检查行首以提高速度
      if line:find("^```") then 
        in_code_block = not in_code_block 
      elseif not in_code_block then
        -- 仅当行首是 # 时才进行正则捕获，减少无用匹配
        local start_idx, end_idx = line:find("^#+%s")
        if start_idx then
          local hashes = line:sub(start_idx, end_idx - 1) -- 获取 # 部分
          local title = line:sub(end_idx + 1):match("^%s*(.-)%s*$") -- trim
          
          table.insert(nodes, {
            level = #hashes,
            text  = title,
            pos   = current_pos
          })
        end
      end
    end
    -- 简单的位置累加（假设换行符为1字节，如果系统是CRLF可能需要+2，但在SilverBullet中通常按字符计数）
    current_pos = current_pos + #line + 1 
  end
  
  return nodes
end

local function unifiedTreePicker()
  local pages = space.listPages()
  if not pages or #pages == 0 then
    editor.flashNotification("No pages found")
    return
  end

  -- 优化2: 构建嵌套树结构 (O(N))
  -- 这比原来的扁平列表 + 后期排序 + 再次遍历寻找父子关系要快得多
  local root = { children = {}, children_list = {} }

  for _, page in ipairs(pages) do
    local current_node = root
    local parts = {}
    for part in string.gmatch(page.name, "[^/]+") do
      table.insert(parts, part)
      local is_leaf = (#parts == #page.name:gsub("[^/]", "") + 1) -- 简单判断是否是最后一部分
      
      if not current_node.children[part] then
        local new_node = {
          name = part,
          full_path = table.concat(parts, "/"),
          type = "folder", -- 默认为文件夹
          children = {},
          children_list = {}
        }
        current_node.children[part] = new_node
        table.insert(current_node.children_list, new_node)
      end
      current_node = current_node.children[part]
    end
    -- 标记为真实页面
    current_node.type = "page"
    current_node.is_real = true
  end

  -- 递归排序函数
  local function sortTree(node)
    table.sort(node.children_list, function(a, b) 
      -- 文件夹排在文件前面，或者纯按字母排序，这里按字母排序
      return a.name < b.name 
    end)
    for _, child in ipairs(node.children_list) do
      sortTree(child)
    end
  end
  sortTree(root)

  -- 准备渲染所需的常量
  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"
  
  local items = {}

  -- 优化3: 递归渲染函数 (O(N))
  -- 自动处理缩进和 "is_last" 逻辑，无需原来的 O(N^2) 循环
  local function renderNode(node, prefix, is_last_child)
    local elbow = is_last_child and ELB or TEE
    local child_prefix = prefix .. (is_last_child and BLNK or VERT)
    
    -- 构造显示文本
    local display_text = node.name
    local desc = node.full_path
    if node.type == "folder" then
      display_text = display_text .. "/"
      desc = desc .. "/"
    end

    table.insert(items, {
      name = prefix .. elbow .. display_text,
      description = desc,
      value = { 
          page = node.full_path, 
          pos = 0,
          type = node.type
      }
    })

    -- 如果是真实页面，解析并插入标题
    -- 注意：这是主要的性能耗时点 (IO操作)
    if node.is_real then
      local headings = getPageHeadings(node.full_path)
      if #headings > 0 then
        local min_level = 10
        for _, h in ipairs(headings) do
          if h.level < min_level then min_level = h.level end
        end

        -- 渲染标题 (作为页面的子项)
        local h_count = #headings
        for idx, h in ipairs(headings) do
            local is_last_h = (idx == h_count) and (#node.children_list == 0) -- 如果页面没子文件夹，标题就是最后的
            
            -- 简单的缩进处理，不完全重建层级，只展示平铺的标题树
            -- 为了性能，这里简化了标题的“无限嵌套”计算，改为统一缩进
            local h_elbow = (idx == h_count and #node.children_list == 0) and ELB or TEE
            
            -- 视觉上将标题稍微向内缩进，区别于子文件夹
            local indent_spaces = string.rep(" ", (h.level - min_level) * 2) 
            
            table.insert(items, {
              name = child_prefix .. h_elbow .. indent_spaces .. h.text,
              description = node.full_path .. " > " .. h.text,
              value = {
                page = node.full_path,
                pos = h.pos,
                type = "heading"
              }
            })
        end
      end
    end

    -- 递归渲染子节点
    local count = #node.children_list
    for i, child in ipairs(node.children_list) do
      renderNode(child, child_prefix, i == count)
    end
  end

  -- 开始渲染根节点的子节点
  local root_count = #root.children_list
  for i, child in ipairs(root.children_list) do
    renderNode(child, "", i == root_count)
  end

  -- 过滤框
  local result = editor.filterBox("Jump to:", items, "Select Page or Heading...", "Unified Tree")

  if result then
    local selection = result.value or result
    if type(selection) ~= "table" then return end

    local page_name = selection.page
    local pos = selection.pos
    local node_type = selection.type

    if node_type == "folder" then
        editor.flashNotification("Folder: " .. page_name)
        editor.navigate({ page = page_name })
    else
        if pos and pos > 0 then
            editor.navigate({ page = page_name, pos = pos })
        else
            editor.navigate({ page = page_name })
        end
        editor.invokeCommand("Navigate: Center Cursor")
    end
  end
end

command.define({
  name = "Navigate: Unified Tree Picker",
  key = "Shift-Alt-e",
  run = function() unifiedTreePicker() end
})


```

## Tree-Tree (header name)

```lua
local function getPageHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then return {} end

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
  
  return nodes
end

local function unifiedTreePicker()
  local pages = space.listPages()
  local path_map = {}
  local real_pages = {}
  
  for _, page in ipairs(pages) do
    real_pages[page.name] = true
  end

  for _, page in ipairs(pages) do
    local parts = {}
    for part in string.gmatch(page.name, "[^/]+") do
      table.insert(parts, part)
      local current_path = table.concat(parts, "/")
      
      if not path_map[current_path] then
        path_map[current_path] = {
          name = current_path,
          text = part,
          level = #parts,
          is_real = false,
          type = "folder"
        }
      end
    end
  end

  for path, _ in pairs(real_pages) do
    if path_map[path] then
      path_map[path].is_real = true
      path_map[path].type = "page"
    end
  end

  local sorted_nodes = {}
  for _, node in pairs(path_map) do
    table.insert(sorted_nodes, node)
  end

  table.sort(sorted_nodes, function(a, b) 
    return a.name < b.name 
  end)

  if #sorted_nodes == 0 then
    editor.flashNotification("No pages found")
    return
  end

  local final_nodes = {}
  
  for _, node in ipairs(sorted_nodes) do
    table.insert(final_nodes, node)
    
    if node.is_real then
      local headings = getPageHeadings(node.name)
      
      if #headings > 0 then
        local min_level = 10
        for _, h in ipairs(headings) do
          if h.level < min_level then min_level = h.level end
        end

        for _, h in ipairs(headings) do
          local relative_level = h.level - min_level + 1
          local absolute_level = node.level + relative_level
          
          table.insert(final_nodes, {
            name = node.name,
            text = h.text,
            level = absolute_level,
            is_real = false,
            type = "heading",
            pos = h.pos,
            page_name = node.name
          })
        end
      end
    end
  end

  local last_flags = {}
  for i = 1, #final_nodes do
    local L = final_nodes[i].level
    local is_last = true
    
    for j = i + 1, #final_nodes do
      local next_L = final_nodes[j].level
      
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

  for i = 1, #final_nodes do
    local node = final_nodes[i]
    local L = node.level
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
    
    local display_text = node.text
    local desc = ""
    
    if node.type == "folder" then
        display_text = display_text .. "/"
        desc = node.name .. "/"
    elseif node.type == "page" then
        desc = node.name
    elseif node.type == "heading" then
        desc = node.page_name .. " > " .. node.text
    end

    local label = prefix .. elbow .. display_text

    table.insert(items, {
      name = label,
      description = desc,
      value = { 
          page = node.page_name or node.name, 
          pos = node.pos,
          type = node.type
      }
    })

    table.insert(stack, { level = L, last = is_last })
  end

  local result = editor.filterBox("Jump to:", items, "Select Page or Heading...", "Unified Tree")

  if result then
    local selection = result.value or result
    
    if type(selection) ~= "table" then return end

    local page_name = selection.page
    local pos = selection.pos
    local node_type = selection.type

    if node_type == "folder" then
        editor.flashNotification("Folder selected. Creating/Going to page: " .. page_name)
        editor.navigate({ page = page_name })
    elseif node_type == "page" or node_type == "heading" then
        if pos and pos > 0 then
            editor.navigate({ page = page_name, pos = pos })
        else
            editor.navigate({ page = page_name })
        end
        editor.invokeCommand("Navigate: Center Cursor")
    end
  end
end

command.define({
  name = "Navigate: Unified Tree Picker",
  key = "Shift-Alt-e",
  run = function() unifiedTreePicker() end
})

```

## Page + Heading (Full-Path Description)

```lua
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
    description = pageName,
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

    local path_parts = {}
    for _, s in ipairs(stack) do
      table.insert(path_parts, s.text)
    end
    table.insert(path_parts, nodes[i].text)
    local full_path = table.concat(path_parts, " > ")

    local elbow = is_last and ELB or TEE
    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = full_path, 
      pos = nodes[i].pos
    })

    table.insert(stack, { level = L, last = is_last, text = nodes[i].text })
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

pageTreePicker = function()
  local pages = space.listPages()
  
  local path_map = {}
  local real_pages = {}
  
  for _, page in ipairs(pages) do
    real_pages[page.name] = true
  end

  for _, page in ipairs(pages) do
    local parts = {}
    for part in string.gmatch(page.name, "[^/]+") do
      table.insert(parts, part)
      local current_path = table.concat(parts, "/")
      
      if not path_map[current_path] then
        path_map[current_path] = {
          name = current_path,
          text = part,
          level = #parts,
          is_real = false
        }
      end
    end
  end

  for path, _ in pairs(real_pages) do
    if path_map[path] then
      path_map[path].is_real = true
    end
  end

  local nodes = {}
  for _, node in pairs(path_map) do
    table.insert(nodes, node)
  end

  table.sort(nodes, function(a, b) 
    return a.name < b.name 
  end)

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
    
    local display_text = nodes[i].text
    local desc = nodes[i].name
    
    if not nodes[i].is_real then
        display_text = display_text .. "/"
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

  local result = editor.filterBox("Pick:", items, "Select a Page...", "Page Tree")

  if result then
    local selection = result.value or result
    
    if type(selection) ~= "table" then
       if selection then pickHeadings(selection) end
       return
    end

    local page_name = selection.page
    local is_real = selection.is_real

    if page_name then
        if is_real then
            pickHeadings(page_name)
        else
            editor.flashNotification("Folder selected. Creating page: " .. page_name)
            editor.navigate({ page = page_name })
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

## Page + Heading (double return)

1. fix empty folder’s wrong indent -_-||

```lua
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

pageTreePicker = function()
  local pages = space.listPages()
  
  local path_map = {}
  local real_pages = {}
  
  for _, page in ipairs(pages) do
    real_pages[page.name] = true
  end

  for _, page in ipairs(pages) do
    local parts = {}
    for part in string.gmatch(page.name, "[^/]+") do
      table.insert(parts, part)
      local current_path = table.concat(parts, "/")
      
      if not path_map[current_path] then
        path_map[current_path] = {
          name = current_path,
          text = part,
          level = #parts,
          is_real = false
        }
      end
    end
  end

  for path, _ in pairs(real_pages) do
    if path_map[path] then
      path_map[path].is_real = true
    end
  end

  local nodes = {}
  for _, node in pairs(path_map) do
    table.insert(nodes, node)
  end

  table.sort(nodes, function(a, b) 
    return a.name < b.name 
  end)

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
    
    local display_text = nodes[i].text
    local desc = nodes[i].name
    
    if not nodes[i].is_real then
        display_text = display_text .. "/"
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

  local result = editor.filterBox("Pick:", items, "Select a Page...", "Page Tree")

  if result then
    local selection = result.value or result
    
    if type(selection) ~= "table" then
       if selection then pickHeadings(selection) end
       return
    end

    local page_name = selection.page
    local is_real = selection.is_real

    if page_name then
        if is_real then
            pickHeadings(page_name)
        else
            editor.flashNotification("Folder selected. Creating page: " .. page_name)
            editor.navigate({ page = page_name })
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
