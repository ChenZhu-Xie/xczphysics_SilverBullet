---
author: Chenzhu-Xie
name: Library/xczphysics/CONFIG/Picker/Tree-Tree
tags: meta/library
pageDecoration.prefix: "🌳🌲 "
---

1. [headings picker](https://community.silverbullet.md/t/headings-picker/1745/10?u=chenzhu-xie) #community #silverbullet

# Implementation

## Giant-Tree: Insert

1. needs `func() aliasPaste` from [[Library/xczphysics/CONFIG/Paste_as/Smart_Url#Paste: Smart URL|Paste: Smart URL]]

```space-lua
-- 1. 定义两套样式：Standard (Folder/Page) 和 Heading (虚线风格)
local function unifiedTreePicker()
  local pages = space.listPages()
  local path_map = {}
  local real_pages = {}

  -- 标记真实存在的页面
  for _, page in ipairs(pages) do
    real_pages[page.name] = true
  end

  -- 构建文件树结构
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
          type = "folder",
          ref = current_path,
        }
      end
    end
  end

  -- 修正真实页面的类型
  for path, _ in pairs(real_pages) do
    if path_map[path] then
      path_map[path].is_real = true
      path_map[path].type = "page"
    end
  end

  -- 排序节点
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

  -- 获取所有标题
  local all_headers = query[[
    from index.tag "header"
    order by _.page, _.pos
  ]]

  local headers_by_page = {}
  for _, h in ipairs(all_headers or {}) do
    local p = h.page
    if p and h.name and h.name ~= "" then
      local bucket = headers_by_page[p]
      if not bucket then
        bucket = {}
        headers_by_page[p] = bucket
      end
      table.insert(bucket, {
        level = h.level or 1,
        text  = h.name,
        -- ref   = h.ref,
        ref   = h.page .. "#" .. h.name
      })
    end
  end

  -- 合并节点（将标题插入到对应页面下方）
  local final_nodes = {}

  for _, node in ipairs(sorted_nodes) do
    table.insert(final_nodes, node)

    if node.is_real then
      local headings = headers_by_page[node.name]

      if headings and #headings > 0 then
        local min_level = 10
        for _, h in ipairs(headings) do
          if h.level and h.level < min_level then
            min_level = h.level
          end
        end

        local heading_stack = {}

        for _, h in ipairs(headings) do
          local hlevel = h.level or min_level
          while #heading_stack > 0 and heading_stack[#heading_stack].level >= hlevel do
            table.remove(heading_stack)
          end

          table.insert(heading_stack, { level = hlevel, text = h.text })

          local path_parts = { node.name }
          for _, stack_item in ipairs(heading_stack) do
            table.insert(path_parts, stack_item.text)
          end
          local full_path_desc = table.concat(path_parts, ">")

          local relative_level = hlevel - min_level + 1
          local absolute_level = node.level + relative_level

          table.insert(final_nodes, {
            name      = node.name,
            text      = h.text,
            level     = absolute_level,
            is_real   = false,
            type      = "heading", -- 关键标识
            ref       = h.ref,
            page_name = node.name,
            full_desc = full_path_desc
          })
        end
      end
    end
  end

  -- 计算每一层是否为最后一个节点
  local last_flags = {}
  local total = #final_nodes

  for i = 1, total do
    local L = final_nodes[i].level
    local is_last = true

    for j = i + 1, total do
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

  -- 生成显示列表
  local items = {}
  local stack = {} -- stack 现在存储 { level, last, type }

  for i = 1, total do
    local node   = final_nodes[i]
    local L      = node.level
    local is_last = last_flags[i]

    -- 弹出层级过深的 stack
    while #stack > 0 and stack[#stack].level >= L do
      table.remove(stack)
    end

    local prefix = ""
    
    -- 2. 绘制父级垂直线 (Vertical Lines)
    for d = 1, #stack do
      local parent = stack[d]
      if parent.last then
        prefix = prefix .. BLNK
      else
        -- 如果父级是 heading，垂直线用虚线；如果是 folder/page，用实线
        if parent.type == "heading" then
          prefix = prefix .. H_VERT
        else
          prefix = prefix .. VERT
        end
      end
    end

    -- 补齐层级差 (通常发生在标题跳级时，如 H1 -> H3)
    for k = #stack + 1, L - 1 do
      local has_deeper = false
      for j = i + 1, total do
        local next_L = final_nodes[j].level
        if next_L == k then
          has_deeper = true
          break
        elseif next_L < k then
          break
        end
      end
      -- 如果当前节点是 heading，中间的补齐线也用虚线风格
      local v_char = (node.type == "heading") and H_VERT or VERT
      prefix = prefix .. (has_deeper and v_char or BLNK)
    end

    -- 3. 绘制当前节点的连接符 (Elbow/Tee)
    local elbow = ""
    if node.type == "heading" then
        elbow = is_last and H_ELB or H_TEE
    else
        elbow = is_last and ELB or TEE
    end

    local display_text = node.text
    local desc = ""

    if node.type == "folder" then
      display_text = display_text .. "/"
      desc = node.name .. "/"
    elseif node.type == "page" then
      desc = node.name
    elseif node.type == "heading" then
      desc = node.full_desc
    end

    local label = prefix .. elbow .. display_text

    table.insert(items, {
      name        = label,
      description = desc,
      value       = {
        page = node.page_name or node.name,
        ref  = node.ref,
        type = node.type
      }
    })

    -- 将当前节点压入栈，记录 type 以便子节点判断样式
    table.insert(stack, { level = L, last = is_last, type = node.type })
  end

  local result = editor.filterBox("🔌 Insert", items, "Select Page or Heading...", "🌳🌲 Unified Tree")

  if result then
    local selection = result.value or result
    if type(selection) ~= "table" then
      return
    end

    local page_name = selection.page
    local ref       = selection.ref
    local node_type = selection.type

    if node_type == "folder" then
      aliasPaste(page_name)
    elseif node_type == "page" or node_type == "heading" then
      aliasPaste(ref)
    end
  end
end

command.define({
  name = "Giant-Tree: Insert",
  key  = "Alt-e",
  run  = function() unifiedTreePicker() end
})
```

## Giant-Tree: Query Version

1. 如果不一次性 Query all header，像 [[#Tree-Tree: Query Version]]
   - 看上去是每次只 query 了每个 page 的，但实际上 where 之前仍 query 了所有的 headers
   - 所以如果每次都只 query 一页，速度反而会变慢。

```space-lua
-- 1. 定义两套样式：Standard (Folder/Page) 和 Heading (虚线风格)
local function unifiedTreePicker()
  local pages = space.listPages()
  local path_map = {}
  local real_pages = {}

  -- 标记真实存在的页面
  for _, page in ipairs(pages) do
    real_pages[page.name] = true
  end

  -- 构建文件树结构
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
          type = "folder",
          ref = current_path,
        }
      end
    end
  end

  -- 修正真实页面的类型
  for path, _ in pairs(real_pages) do
    if path_map[path] then
      path_map[path].is_real = true
      path_map[path].type = "page"
    end
  end

  -- 排序节点
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

  -- 获取所有标题
  local all_headers = query[[
    from index.tag "header"
    order by _.page, _.pos
  ]]

  local headers_by_page = {}
  for _, h in ipairs(all_headers or {}) do
    local p = h.page
    if p and h.name and h.name ~= "" then
      local bucket = headers_by_page[p]
      if not bucket then
        bucket = {}
        headers_by_page[p] = bucket
      end
      table.insert(bucket, {
        level = h.level or 1,
        text  = h.name,
        ref   = h.ref,
        -- ref   = h.page .. "#" .. h.name
      })
    end
  end

  -- 合并节点（将标题插入到对应页面下方）
  local final_nodes = {}

  for _, node in ipairs(sorted_nodes) do
    table.insert(final_nodes, node)

    if node.is_real then
      local headings = headers_by_page[node.name]

      if headings and #headings > 0 then
        local min_level = 10
        for _, h in ipairs(headings) do
          if h.level and h.level < min_level then
            min_level = h.level
          end
        end

        local heading_stack = {}

        for _, h in ipairs(headings) do
          local hlevel = h.level or min_level
          while #heading_stack > 0 and heading_stack[#heading_stack].level >= hlevel do
            table.remove(heading_stack)
          end

          table.insert(heading_stack, { level = hlevel, text = h.text })

          local path_parts = { node.name }
          for _, stack_item in ipairs(heading_stack) do
            table.insert(path_parts, stack_item.text)
          end
          local full_path_desc = table.concat(path_parts, ">")

          local relative_level = hlevel - min_level + 1
          local absolute_level = node.level + relative_level

          table.insert(final_nodes, {
            name      = node.name,
            text      = h.text,
            level     = absolute_level,
            is_real   = false,
            type      = "heading", -- 关键标识
            ref       = h.ref,
            page_name = node.name,
            full_desc = full_path_desc
          })
        end
      end
    end
  end

  -- 计算每一层是否为最后一个节点
  local last_flags = {}
  local total = #final_nodes

  for i = 1, total do
    local L = final_nodes[i].level
    local is_last = true

    for j = i + 1, total do
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

  -- 生成显示列表
  local items = {}
  local stack = {} -- stack 现在存储 { level, last, type }

  for i = 1, total do
    local node   = final_nodes[i]
    local L      = node.level
    local is_last = last_flags[i]

    -- 弹出层级过深的 stack
    while #stack > 0 and stack[#stack].level >= L do
      table.remove(stack)
    end

    local prefix = ""
    
    -- 2. 绘制父级垂直线 (Vertical Lines)
    for d = 1, #stack do
      local parent = stack[d]
      if parent.last then
        prefix = prefix .. BLNK
      else
        -- 如果父级是 heading，垂直线用虚线；如果是 folder/page，用实线
        if parent.type == "heading" then
          prefix = prefix .. H_VERT
        else
          prefix = prefix .. VERT
        end
      end
    end

    -- 补齐层级差 (通常发生在标题跳级时，如 H1 -> H3)
    for k = #stack + 1, L - 1 do
      local has_deeper = false
      for j = i + 1, total do
        local next_L = final_nodes[j].level
        if next_L == k then
          has_deeper = true
          break
        elseif next_L < k then
          break
        end
      end
      -- 如果当前节点是 heading，中间的补齐线也用虚线风格
      local v_char = (node.type == "heading") and H_VERT or VERT
      prefix = prefix .. (has_deeper and v_char or BLNK)
    end

    -- 3. 绘制当前节点的连接符 (Elbow/Tee)
    local elbow = ""
    if node.type == "heading" then
        elbow = is_last and H_ELB or H_TEE
    else
        elbow = is_last and ELB or TEE
    end

    local display_text = node.text
    local desc = ""

    if node.type == "folder" then
      display_text = display_text .. "/"
      desc = node.name .. "/"
    elseif node.type == "page" then
      desc = node.name
    elseif node.type == "heading" then
      desc = node.full_desc
    end

    local label = prefix .. elbow .. display_text

    table.insert(items, {
      name        = label,
      description = desc,
      value       = {
        page = node.page_name or node.name,
        ref  = node.ref,
        type = node.type
      }
    })

    -- 将当前节点压入栈，记录 type 以便子节点判断样式
    table.insert(stack, { level = L, last = is_last, type = node.type })
  end

  local result = editor.filterBox("🤏 Pick", items, "Select Page or Heading...", "🌳🌲Unified Tree")

  if result then
    local selection = result.value or result
    if type(selection) ~= "table" then
      return
    end

    local page_name = selection.page
    local ref       = selection.ref
    local node_type = selection.type

    if node_type == "folder" then
      editor.flashNotification("Folder selected. Creating/Going to page: " .. page_name)
      editor.navigate({ page = page_name })
    elseif node_type == "page" or node_type == "heading" then
      editor.navigate(ref)
      editor.invokeCommand("Navigate: Center Cursor")
    end
  end
end

command.define({
  name = "Giant-Tree: Pick",
  key  = "Shift-Alt-e",
  run  = function() unifiedTreePicker() end
})
```

### Tree-Tree (header path)

```lua
local function getPageHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then return {} end

  local nodes = {}
  local in_code_block = false
  local current_pos = 0
  
  for line, newline in string.gmatch(text, "([^\r\n]*)(\r?\n?)") do
    if line == "" and newline == "" then break end

    if line:match("^```") then 
      in_code_block = not in_code_block 
    end

    if not in_code_block then
      local hashes, title = line:match("^(#+)%s+(.*)")
      if hashes then
        title = title:match("^(.-)%s*$")
        table.insert(nodes, {
          level = #hashes,
          text  = title,
          pos   = current_pos
        })
      end
    end

    current_pos = current_pos + #line + #newline
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

        local heading_stack = {}

        for _, h in ipairs(headings) do
          while #heading_stack > 0 and heading_stack[#heading_stack].level >= h.level do
            table.remove(heading_stack)
          end
          
          table.insert(heading_stack, {level = h.level, text = h.text})

          local path_parts = { node.name }
          for _, stack_item in ipairs(heading_stack) do
            table.insert(path_parts, stack_item.text)
          end
          local full_path_desc = table.concat(path_parts, ">")

          local relative_level = h.level - min_level + 1
          local absolute_level = node.level + relative_level
          
          table.insert(final_nodes, {
            name = node.name,
            text = h.text,
            level = absolute_level,
            is_real = false,
            type = "heading",
            pos = h.pos,
            page_name = node.name,
            full_desc = full_path_desc
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
        desc = node.full_desc
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

### Tree-Tree (header name)

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

## Tree-Tree: Insert

1. needs `func() aliasPaste` from [[Library/xczphysics/CONFIG/Paste_as/Smart_Url#Paste: Smart URL|Paste: Smart URL]]
2. need `func() buildPageTreeItems` from [[#Pure-Page (along with Tree-Tree)]]

```space-lua
local pageTreePicker

local function pickHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then
    editor.flashNotification("Could not read page: " .. pageName)
    return
  end

  local nodes = query[[
      from index.tag "header"
      where _.page == pageName
      order by _.pos
    ]]

  if #nodes == 0 then
    aliasPaste(pageName)
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

  local items = {}
  local stack = {}

  table.insert(items, {
    name        = ".",
    description = pageName,
    ref         = pageName,
  })

  for i = 1, #nodes do
    local node = nodes[i]
    local L = node.level - min_level + 1
    local is_last = last_flags[i]

    while #stack > 0 and stack[#stack].level >= L do
      table.remove(stack)
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or H_VERT)
    end

    for k = #stack + 1, L - 1 do
      local has_deeper = false
      for j = i + 1, #nodes do
        local next_L = nodes[j].level - min_level + 1
        if next_L == k then
          has_deeper = true
          break
        elseif next_L < k then
          break
        end
      end
      prefix = prefix .. (has_deeper and H_VERT or BLNK)
    end

    local path_parts = {}
    for _, s in ipairs(stack) do
      table.insert(path_parts, s.text)
    end
    table.insert(path_parts, node.name)
    local full_path = table.concat(path_parts, " > ")

    local elbow = is_last and H_ELB or H_TEE
    local label = prefix .. elbow .. node.name

    table.insert(items, {
      name        = label,
      description = full_path,
      -- ref         = node.ref,
      ref         = pageName .. "#" .. node.name,
    })

    table.insert(stack, { level = L, last = is_last, text = node.name })
  end

  local result = editor.filterBox(pageName .. "#", items, "Select a Header...", "Heading Picker")

  if result then
    aliasPaste(result.ref)
    editor.invokeCommand("Navigate: Center Cursor")
  else
    return pageTreePicker()
  end
end

------------------------------------------------------------------
-- page( + heading)
------------------------------------------------------------------

pageTreePicker = function()
  local items, err = buildPageTreeItems()
  if not items then
    editor.flashNotification(err)
    return
  end

  local result = editor.filterBox("🤏 Pick", items, "Select a Page...", "🌳 Page Tree")

  if result then
    local selection = result.value or result

    if type(selection) ~= "table" then
      if selection then pickHeadings(selection) end
      return
    end

    local page_name = selection.page
    local is_real   = selection.is_real

    if page_name then
      if is_real then
        pickHeadings(page_name)
      else
        aliasPaste(page_name)
      end
    end
  end
end

------------------------------------------------------------------
-- page + heading: Insert
------------------------------------------------------------------

command.define({
  name = "Tree-Tree Picker: Insert",
  key  = "Alt-e",
  run  = function() pageTreePicker() end,
})
```

## Tree-Tree (depend on Pure-Page)

1. need `func() buildPageTreeItems` from [[#Pure-Page (along with Tree-Tree)]]

```space-lua
local pageTreePicker

local function pickHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then
    editor.flashNotification("Could not read page: " .. pageName)
    return
  end

  local nodes = query[[
      from index.tag "header"
      where _.page == pageName
      order by _.pos
    ]]

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

  local items = {}
  local stack = {}

  table.insert(items, {
    name        = ".",
    description = pageName,
    ref         = pageName,
  })

  for i = 1, #nodes do
    local node = nodes[i]
    local L = node.level - min_level + 1
    local is_last = last_flags[i]

    while #stack > 0 and stack[#stack].level >= L do
      table.remove(stack)
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or H_VERT)
    end

    for k = #stack + 1, L - 1 do
      local has_deeper = false
      for j = i + 1, #nodes do
        local next_L = nodes[j].level - min_level + 1
        if next_L == k then
          has_deeper = true
          break
        elseif next_L < k then
          break
        end
      end
      prefix = prefix .. (has_deeper and H_VERT or BLNK)
    end

    local path_parts = {}
    for _, s in ipairs(stack) do
      table.insert(path_parts, s.text)
    end
    table.insert(path_parts, node.name)
    local full_path = table.concat(path_parts, " > ")

    local elbow = is_last and H_ELB or H_TEE
    local label = prefix .. elbow .. node.name

    table.insert(items, {
      name        = label,
      description = full_path,
      ref         = node.ref,
      -- ref         = pageName .. "#" .. node.name,
    })

    table.insert(stack, { level = L, last = is_last, text = node.name })
  end

  local result = editor.filterBox(pageName .. "#", items, "Select a Header...", "Heading Picker")

  if result then
    editor.navigate(result.ref)
    editor.invokeCommand("Navigate: Center Cursor")
  else
    return pageTreePicker()
  end
end

------------------------------------------------------------------
-- page( + heading)
------------------------------------------------------------------

pageTreePicker = function()
  local items, err = buildPageTreeItems()
  if not items then
    editor.flashNotification(err)
    return
  end

  local result = editor.filterBox("🤏 Pick", items, "Select a Page...", "🌳 Page Tree")

  if result then
    local selection = result.value or result

    if type(selection) ~= "table" then
      if selection then pickHeadings(selection) end
      return
    end

    local page_name = selection.page
    local is_real   = selection.is_real

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

------------------------------------------------------------------
-- page + heading
------------------------------------------------------------------

command.define({
  name = "Tree-Tree Picker: Navigate",
  key  = "Shift-Alt-e",
  run  = function() pageTreePicker() end,
})
```

## Tree-Tree: Query Version

```lua
local pageTreePicker

local VERT = "│ 　　"
local BLNK = "　　　"
local TEE  = "├───　"
local ELB  = "└───　"

local H_VERT = "┊ 　　"
local H_TEE  = "┊┈┈🔹 "
local H_ELB  = "╰┈┈🔸 "

local function pickHeadings(pageName)
  local text = space.readPage(pageName)
  if not text then
    editor.flashNotification("Could not read page: " .. pageName)
    return
  end

  local nodes = query[[
      from index.tag "header"
      where _.page == pageName
      order by _.pos
    ]]

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

  local items = {}
  local stack = {}

  table.insert(items, {
    name        = ".",
    description = pageName,
    pos         = 0,
  })

  for i = 1, #nodes do
    local node = nodes[i]
    local L = node.level - min_level + 1
    local is_last = last_flags[i]

    while #stack > 0 and stack[#stack].level >= L do
      table.remove(stack)
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or H_VERT)
    end

    for k = #stack + 1, L - 1 do
      local has_deeper = false
      for j = i + 1, #nodes do
        local next_L = nodes[j].level - min_level + 1
        if next_L == k then
          has_deeper = true
          break
        elseif next_L < k then
          break
        end
      end
      prefix = prefix .. (has_deeper and H_VERT or BLNK)
    end

    local path_parts = {}
    for _, s in ipairs(stack) do
      table.insert(path_parts, s.text)
    end
    table.insert(path_parts, node.name)
    local full_path = table.concat(path_parts, " > ")

    local elbow = is_last and H_ELB or H_TEE
    local label = prefix .. elbow .. node.name

    table.insert(items, {
      name        = label,
      description = full_path,
      pos         = node.pos,
    })

    table.insert(stack, { level = L, last = is_last, text = node.name })
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

  local path_map  = {}
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
          name    = current_path,
          text    = part,
          level   = #parts,
          is_real = false,
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

  local items = {}
  local stack = {}

  for i = 1, #nodes do
    local node = nodes[i]
    local L = node.level
    local is_last = last_flags[i]

    while #stack >= L do
      table.remove(stack)
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end

    for _ = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE

    local display_text = node.text
    local desc = node.name

    if not node.is_real then
      display_text = display_text .. "/"
      desc = desc .. "/"
    end

    local label = prefix .. elbow .. display_text

    table.insert(items, {
      name        = label,
      description = desc,
      value       = {
        page    = node.name,
        is_real = node.is_real,
      },
    })

    table.insert(stack, { level = L, last = is_last })
  end

  local result = editor.filterBox("🤏 Pick", items, "Select a Page...", "Page Tree")

  if result then
    local selection = result.value or result

    if type(selection) ~= "table" then
      if selection then pickHeadings(selection) end
      return
    end

    local page_name = selection.page
    local is_real   = selection.is_real

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
  key  = "Shift-Alt-e",
  run  = function() pageTreePicker() end,
})

```

### Page + Heading (Full-Path Description)

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

  local result = editor.filterBox("Pick", items, "Select a Page...", "Page Tree")

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

### Page + Heading (double return)

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

  local result = editor.filterBox("Pick", items, "Select a Page...", "Page Tree")

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

### Page + Heading (direct return)

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

  local result = editor.filterBox("Pick", items, "Select a Page...", "Page Tree")

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

## Pure-Page: Insert (depend on Pure-Page)

1. needs `func() aliasPaste` from [[Library/xczphysics/CONFIG/Paste_as/Smart_Url#Paste: Smart URL|Paste: Smart URL]]
2. need `func() buildPageTreeItems` from [[#Pure-Page (along with Tree-Tree)]]

```space-lua
local function pageOnlyPicker()
  local items, err = buildPageTreeItems()
  if not items then
    editor.flashNotification(err)
    return
  end

  local result = editor.filterBox("🔌 Insert", items, "Select a Page...", "📃 Page Tree")

  if not result then return end

  local selection = result.value or result
  local page_name

  if type(selection) ~= "table" then
    page_name = selection
  else
    page_name = selection.page
  end

  if page_name then
    -- editor.copyToClipboard(selection.ref)
    -- editor.copyToClipboard("[[" .. page_name .. "]]")
    -- editor.invokeCommand("Paste: Smart URL (via Prompt)")
    aliasPaste(page_name)
  end
end

------------------------------------------------------------------
-- page cmd: Paste
------------------------------------------------------------------

command.define({
  name = "Page Picker: Insert",
  key  = "Alt-k",
  run  = function() pageOnlyPicker() end,
})
```

## Pure-Page (along with Tree-Tree)

```space-lua

VERT = "│ 　　"
BLNK = "　　　"
TEE  = "├───　"
ELB  = "└───　"

-- Heading 专用样式 (使用虚线/点状)
-- H_VERT = "┊ 　　" 
-- H_TEE  = "┊┈•┈• "
-- H_ELB  = "╰┈•┈• "

-- H_VERT = "┊ 　　"
-- H_TEE  = "┊┈💠┈ "
-- H_ELB  = "╰┈💎┈ "

-- H_VERT = "┊ 　　"
-- H_TEE  = "┊┈🔹┈ "
-- H_ELB  = "╰┈🔸┈ "

H_VERT = "┊ 　　"
H_TEE  = "┊┈┈🔹 "
H_ELB  = "╰┈┈🔸 "

------------------------------------------------------------------
-- public: buildPageTreeItems
------------------------------------------------------------------

function buildPageTreeItems()
  local pages = space.listPages()

  local path_map  = {}
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
          name    = current_path,
          text    = part,
          level   = #parts,
          is_real = false,
          -- ref     = page.ref,
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
    return nil, "No pages found"
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

  local items = {}
  local stack = {}

  for i = 1, #nodes do
    local node = nodes[i]
    local L = node.level
    local is_last = last_flags[i]

    while #stack >= L do
      table.remove(stack)
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end

    for _ = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE

    local display_text = node.text
    local desc = node.name

    if not node.is_real then
      display_text = display_text .. "/"
      desc = desc .. "/"
    end

    local label = prefix .. elbow .. display_text

    table.insert(items, {
      name        = label,
      description = desc,
      value       = {
        page    = node.name,
        is_real = node.is_real,
        -- ref = node.ref,
      },
    })

    table.insert(stack, { level = L, last = is_last })
  end

  return items
end

------------------------------------------------------------------
-- page
------------------------------------------------------------------

local function pageOnlyPicker()
  local items, err = buildPageTreeItems()
  if not items then
    editor.flashNotification(err)
    return
  end

  local result = editor.filterBox("🤏 Pick", items, "Select a Page...", "📃 Page Tree")

  if not result then return end

  local selection = result.value or result
  local page_name

  if type(selection) ~= "table" then
    page_name = selection
  else
    page_name = selection.page
  end

  if page_name then
    editor.navigate({ page = page_name })
    editor.invokeCommand("Navigate: Center Cursor")
  end
end

------------------------------------------------------------------
-- page cmd
------------------------------------------------------------------

command.define({
  name = "Page Picker: Tree",
  key  = "Shift-Alt-k",
  run  = function() pageOnlyPicker() end,
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
