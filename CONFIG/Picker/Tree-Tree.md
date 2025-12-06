---
name: CONFIG/Picker/Tree-Tree
tags: meta/library
pageDecoration.prefix: "🌲🌲 "
---

1. [headings picker](https://community.silverbullet.md/t/headings-picker/1745/10?u=chenzhu-xie) #community #silverbullet

# Implementation

## Tree-Tree (header path)

```space-lua
local function getPageHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then return {} end

  -- 根节点，用于存放顶级标题
  local root = { children = {}, level = 0 } 
  local stack = { root }
  local current_pos = 0
  local in_code_block = false

  -- 优化：使用 find 替代 match，并在一次遍历中完成层级构建
  for line, newline in string.gmatch(text, "([^\r\n]*)(\r?\n?)") do
    if line == "" and newline == "" then break end -- EOF

    -- 处理代码块，避免解析代码块内的注释为标题
    if line:find("^```") then 
      in_code_block = not in_code_block 
    end

    if not in_code_block then
      -- 快速检测是否可能是标题
      local first_char = line:sub(1, 1)
      if first_char == "#" then
        local hashes, title = line:match("^(#+)%s+(.*)")
        if hashes then
          title = title:match("^(.-)%s*$") -- trim right
          local level = #hashes
          
          local node = {
            text = title,
            level = level,
            pos = current_pos,
            type = "heading",
            page_name = pageName,
            children = {}
          }

          -- 栈逻辑：找到当前标题的正确父节点
          while #stack > 1 and stack[#stack].level >= level do
            table.remove(stack)
          end
          
          local parent = stack[#stack]
          table.insert(parent.children, node)
          table.insert(stack, node)
        end
      end
    end

    current_pos = current_pos + #line + #newline
  end
  
  return root.children
end

local function unifiedTreePicker()
  local pages = space.listPages()
  if not pages or #pages == 0 then
    editor.flashNotification("No pages found")
    return
  end

  -- 1. 构建文件系统树 (File System Tree)
  local fs_root = { children = {}, map = {} }
  
  -- 辅助函数：获取或创建节点
  local function getOrCreateNode(parent, name, is_folder)
    if not parent.map[name] then
      local new_node = {
        name = name, -- 仅当前部分名称
        full_path = "", -- 稍后填充
        text = name,
        type = is_folder and "folder" or "page",
        children = {},
        map = {}, -- 用于快速查找子节点
        is_real = not is_folder
      }
      table.insert(parent.children, new_node)
      parent.map[name] = new_node
      return new_node
    else
      local node = parent.map[name]
      if not is_folder then node.is_real = true; node.type = "page" end
      return node
    end
  end

  for _, page in ipairs(pages) do
    local current_node = fs_root
    local parts = {}
    for part in string.gmatch(page.name, "[^/]+") do
      table.insert(parts, part)
    end
    
    for i, part in ipairs(parts) do
      local is_last = (i == #parts)
      current_node = getOrCreateNode(current_node, part, not is_last)
      -- 更新完整路径
      current_node.full_path = table.concat(parts, "/", 1, i)
    end
  end

  -- 2. 递归排序并注入标题 (Sort & Inject Headings)
  -- 这是一个递归函数，用于处理排序和读取标题
  local function processNode(node)
    -- 对子节点按名称排序（文件夹和页面）
    table.sort(node.children, function(a, b) return a.name < b.name end)
    
    for _, child in ipairs(node.children) do
      -- 如果是页面，读取并解析标题
      if child.type == "page" and child.is_real then
        -- 这里直接把解析好的标题树挂载到 children 的末尾
        -- 注意：标题不需要排序，必须保持文档顺序
        local headings = getPageHeadings(child.full_path)
        for _, h in ipairs(headings) do
            table.insert(child.children, h)
        end
      end
      
      -- 递归处理子文件夹
      if child.type == "folder" or child.type == "page" then
        processNode(child)
      end
    end
  end

  processNode(fs_root)

  -- 3. 递归扁平化渲染 (Flatten & Render)
  -- 这一步将树形结构转换为列表，同时生成缩进线条
  local items = {}
  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  local function render(nodes, prefix, path_desc)
    for i, node in ipairs(nodes) do
      local is_last = (i == #nodes)
      local elbow = is_last and ELB or TEE
      local child_prefix = prefix .. (is_last and BLNK or VERT)
      
      -- 构建显示文本和描述
      local display_text = node.text
      local new_desc = path_desc
      
      if new_desc ~= "" then
        new_desc = new_desc .. " > " .. node.text
      else
        new_desc = node.text
      end

      if node.type == "folder" then
        display_text = display_text .. "/"
      end

      -- 添加到结果列表
      table.insert(items, {
        name = prefix .. elbow .. display_text,
        description = new_desc,
        value = {
          page = node.page_name or node.full_path,
          pos = node.pos,
          type = node.type
        }
      })

      -- 递归渲染子节点（文件夹内容 或 页面内的标题）
      if node.children and #node.children > 0 then
        render(node.children, child_prefix, new_desc)
      end
    end
  end

  render(fs_root.children, "", "")

  -- 4. 显示选择框
  local result = editor.filterBox("Jump to:", items, "Select Page or Heading...", "Unified Tree")

  if result then
    local selection = result.value or result
    if type(selection) ~= "table" then return end

    local page_name = selection.page
    local pos = selection.pos
    local node_type = selection.type

    if node_type == "folder" then
        editor.flashNotification("Folder selected. Going to: " .. page_name)
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
