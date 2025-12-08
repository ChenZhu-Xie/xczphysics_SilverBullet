---
author: Chenzhu-Xie
name: Library/xczphysics/CONFIG/Picker/Heading
tags: meta/library
pageDecoration.prefix: "🔎 "
---

${query[[
      from index.tag "header"
      where _.page == _CTX.currentPage.name
      order by _.pos
    ]]}

# Heading Picker: Across Pages

1. coming from [[Library/xczphysics/CONFIG/Picker/Tree-Tree#Giant-Tree: Query Version|]]

```space-lua
-- 1. 定义两套样式：Standard (用于顶级标题) 和 Sub-Heading (用于子标题)
VERT   = "│ 　　"
BLNK   = "　　　"
TEE    = "├───　"
ELB    = "└───　"

local function unifiedTreePicker()
  local pages = space.listPages()
  
  -- 1. 预处理：按名称排序页面，确保输出顺序稳定
  table.sort(pages, function(a, b)
    return a.name < b.name
  end)

  if #pages == 0 then
    editor.flashNotification("No pages found")
    return
  end

  -- 2. 获取所有标题
  local all_headers = query[[
    from index.tag "header"
    order by _.page, _.pos
  ]]

  -- 将标题按页面分组
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
        ref  = h.ref,
        -- ref  = h.page .. "#" .. h.name,
      })
    end
  end

  -- 3. 构建扁平化的节点列表 (只包含 Heading)
  local final_nodes = {}

  for _, page in ipairs(pages) do
    local headings = headers_by_page[page.name]

    -- 只有当页面有标题时才处理
    if headings and #headings > 0 then
      -- 计算该页面的最小标题层级，用于归一化 (让最顶级变成 Level 1)
      local min_level = 10
      for _, h in ipairs(headings) do
        if h.level and h.level < min_level then
          min_level = h.level
        end
      end

      local heading_stack = {}

      for _, h in ipairs(headings) do
        local hlevel = h.level or min_level
        
        -- 维护堆栈以构建 description 路径
        while #heading_stack > 0 and heading_stack[#heading_stack].level >= hlevel do
          table.remove(heading_stack)
        end
        table.insert(heading_stack, { level = hlevel, text = h.text })

        -- 构建 Description: page/path>heading>path
        local path_parts = { page.name }
        for _, stack_item in ipairs(heading_stack) do
          table.insert(path_parts, stack_item.text)
        end
        local full_path_desc = table.concat(path_parts, ">")

        -- 关键修改：计算绝对层级
        -- 以前是 page.level + relative_level，现在直接是 relative_level
        -- 这样每一页的顶级 Heading 都会是 Level 1 (无缩进)
        local relative_level = hlevel - min_level + 1

        table.insert(final_nodes, {
          text      = h.text,
          level     = relative_level, 
          type      = "heading",
          ref       = h.ref,
          page_name = page.name,
          full_desc = full_path_desc
        })
      end
    end
  end

  if #final_nodes == 0 then
    editor.flashNotification("No headings found in pages")
    return
  end

  -- 4. 计算每一层是否为最后一个节点 (用于绘制树状图)
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

  -- 5. 生成显示列表 (绘制 ASCII 树)
  local items = {}
  local stack = {} -- stack 存储 { level, last, is_top_level }

  for i = 1, total do
    local node    = final_nodes[i]
    local L       = node.level
    local is_last = last_flags[i]
    local is_top  = (L == 1) -- 是否为顶级标题

    -- 弹出层级过深的 stack
    while #stack > 0 and stack[#stack].level >= L do
      table.remove(stack)
    end

    local prefix = ""
    
    -- 绘制父级垂直线
    for d = 1, #stack do
      local parent = stack[d]
      if parent.last then
        prefix = prefix .. BLNK
      else
        -- 样式逻辑：如果父级是顶级(Level 1)，它的延伸线用实线；如果是子级，用虚线
        if parent.is_top_level then
          prefix = prefix .. VERT
        else
          prefix = prefix .. H_VERT
        end
      end
    end

    -- 补齐层级差 (跳级处理)
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
      -- 如果当前节点是顶级，使用实线；否则使用虚线 (逻辑上这里通常是虚线，因为已经在 Level > 1 了)
      local v_char = is_top and VERT or H_VERT
      prefix = prefix .. (has_deeper and v_char or BLNK)
    end

    -- 绘制当前节点的连接符 (ELBow/TEE)
    local ELBow = ""
    if is_top then
        -- 顶级标题使用实线连接符
        ELBow = is_last and ELB or TEE
    else
        -- 子标题使用虚线连接符
        ELBow = is_last and H_ELB or H_TEE
    end

    local display_text = node.text
    local desc = node.full_desc

    local label = prefix .. ELBow .. display_text

    table.insert(items, {
      name        = label,
      description = desc,
      value       = {
        page = node.page_name,
        ref  = node.ref,
      }
    })

    -- 将当前节点压入栈
    table.insert(stack, { level = L, last = is_last, is_top_level = is_top })
  end

  local result = editor.filterBox("🤏 Pick", items, "Select Heading...", "Unified Tree")

  if result then
    local selection = result.value or result
    if type(selection) ~= "table" then return end
    editor.navigate(selection.ref)
    editor.invokeCommand("Navigate: Center Cursor")
  end
end

command.define({
  name = "Heading Picker: across Pages",
  key  = "Shift-Alt-a",
  run  = function() unifiedTreePicker() end
})
```

# Heading Picker: In Page

## Query Version

1. headers are indexed -_-||
   - [Object](https://silverbullet.md/Object#header) #silverbullet 
2. fixed 6级 → 4级 → 2级 problem,  2级 → 4级 → 6级 problem
        -  2级 → 4级 → 2级 problem,  6级 → 4级 → 6级 problem

```space-lua
-- H_VERT = "│ 　　"
-- H_TEE  = "├───　"
-- H_ELB  = "└───　"

-- H_VERT = "┊ 　　"
-- H_TEE  = "┊┈🔹┈ "
-- H_ELB  = "╰┈🔸┈ "

H_VERT = "┊ 　　"
H_TEE  = "┊┈┈🔹 "
H_ELB  = "╰┈┈🔸 "

command.define({
  name = "Heading Picker: in Page",
  key = "Ctrl-Shift-h",
  run = function()
    local headers = query[[
      from index.tag "header"
      where _.page == editor.getCurrentPage()
      order by _.pos
    ]]

    if #headers == 0 then
      editor.flashNotification("No headings found")
      return
    end

    local min_level = 10
    for _, h in ipairs(headers) do
      if h.level < min_level then min_level = h.level end
    end

    local items = {}
    local stack = {}

    for i, h in ipairs(headers) do
      local is_last = true
      for j = i + 1, #headers do
        if headers[j].level <= h.level then
          if headers[j].level == h.level then is_last = false end
          break
        end
      end

      local rel_level = h.level - min_level + 1
      while #stack > 0 and stack[#stack].level >= rel_level do
        table.remove(stack)
      end

      local prefix = ""
      for _, s in ipairs(stack) do
        prefix = prefix .. (s.last and BLNK or H_VERT)
      end
      for k = #stack + 1, rel_level - 1 do
        local has_deeper = false
        for j = i + 1, #headers do
          local target_level = min_level + k - 1
          if headers[j].level == target_level then
            has_deeper = true
            break
          elseif headers[j].level < target_level then
            break
          end
        end
        prefix = prefix .. (has_deeper and H_VERT or BLNK)
      end

      table.insert(items, {
        name = prefix .. (is_last and H_ELB or H_TEE) .. h.name,
        ref  = h.ref,
        -- ref  = h.page .. "#" .. h.name,
      })

      table.insert(stack, { level = rel_level, last = is_last })
    end

    local selection = editor.filterBox("🤏 Pick", items, "Select a Header...", "a Header")
    if selection then
      editor.navigate(selection.ref)
      editor.invokeCommand("Navigate: Center Cursor")
    end
  end
})
```

## 3rd Version

4. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=9647438d39
5. https://community.silverbullet.md/t/headings-picker/1745/8

下述 代码 6级→4级→2级 时，
6级标题左侧加的竖线多加了一条：
||| |_ 
| |_ 
|-

```lua
local function headingsPicker(options)
  local text = editor.getText()
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
    editor.flashNotification("No headings found")
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

  local H_VERT = "│ 　　"
  local BLNK = "　　　"
  local H_TEE  = "├───　"
  local H_ELB  = "└───　"

  local items = {}
  local stack = {} -- stack structure: { level = number, last = boolean }

  for i = 1, #nodes do
    local L = nodes[i].level - min_level + 1
    local is_last = last_flags[i]

    while #stack > 0 and stack[#stack].level >= L do 
      table.remove(stack) 
    end

    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or H_VERT)
    end
    
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local H_ELBow = is_last and H_ELB or H_TEE
    local label = prefix .. H_ELBow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = "",
      pos = nodes[i].pos
    })

    table.insert(stack, { level = L, last = is_last })
  end

  local result = editor.filterBox("Search:", items, "Select a Header...", "Heading")
  local page = editor.getCurrentPage()

  if result and result.selected and result.selected.value then
    local item = result.selected.value
    if item.pos then editor.navigate({ page = page, pos = item.pos }) end
  elseif result and result.pos then
    editor.navigate({ page = page, pos = result.pos })
    editor.moveCursor(result.pos, true)
  end
end

command.define({
  name = "Navigate: Heading Picker",
  key = "Ctrl-Shift-h",
  run = function() headingsPicker({}) end
})
```

## 2nd Version

3. [[Library/xczphysics/CONFIG/Paste_as/Smart_Url#Navigate Cursor+View Version]]

```lua
-- Pick Headings (robust version)
local function headingsPicker(options)
  local text = editor.getText()
  local parsed = markdown.parseMarkdown(text)
  local headers = {}

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
        table.insert(headers, {
          name = string.rep("　", math.max(0, level - 1)) .. "🔹　" .. title,
          description = "",
          pos = node_pos(n),
        })
      end
    end
  end

  if #headers == 0 then
    editor.flashNotification("No headings found")
    return
  end

  local result = editor.filterBox("Headings", headers, { label = "name", description = "description" })

  local page = editor.getCurrentPage()
  
  if result and result.selected and result.selected.value then
    local item = result.selected.value
    -- if item.pos then editor.moveCursor(item.pos, true) end
    -- if item.pos then editor.navigate({ pos = item.pos }) end
    if item.pos then editor.navigate({page = page , pos = item.pos }) end
  elseif result and result.pos then
    -- editor.moveCursor(result.pos, true)
    -- editor.navigate({ pos = result.pos })
    editor.navigate({page = page , pos = result.pos })
  end

  -- editor.filterBox({
  --   placeholder = "Select Heading:",
  --   items = headers,
  --   label = "name",
  --   description = "description",
  --   onSelect = function(selected)
  --     if selected and selected.value and selected.value.pos then
  --       editor.moveCursor(selected.value.pos, true)
  --     end
  --   end
  -- })
end

command.define({
  name = "Pick Headings",
  key = "Ctrl-Shift-h",
  run = function() headingsPicker({}) end
})
```

## 1st Version

2. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=52214e9250

```lua
-- Pick Headings (robust version)
local function headingsPicker(options)
  local text = editor.getText()
  local parsed = markdown.parseMarkdown(text)
  local headers = {}

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
        table.insert(headers, {
          name = string.rep("　", math.max(0, level - 1)) .. "🔹　" .. title,
          description = "",
          pos = node_pos(n),
        })
      end
    end
  end

  if #headers == 0 then
    editor.flashNotification("No headings found")
    return
  end

  local result = editor.filterBox("Headings", headers, { label = "name", description = "description" })

  if result and result.selected and result.selected.value then
    local item = result.selected.value
    if item.pos then editor.moveCursor(item.pos, true) end
  elseif result and result.pos then
    editor.moveCursor(result.pos, true)
  end

  -- editor.filterBox({
  --   placeholder = "Select Heading:",
  --   items = headers,
  --   label = "name",
  --   description = "description",
  --   onSelect = function(selected)
  --     if selected and selected.value and selected.value.pos then
  --       editor.moveCursor(selected.value.pos, true)
  --     end
  --   end
  -- })
end

command.define({
  name = "Pick Headings",
  key = "Ctrl-Shift-h",
  run = function() headingsPicker({}) end
})
```

## Original Version

1. https://community.silverbullet.md/t/headings-picker/1745/6

```lua
function headingsPicker(options)

  local text = editor.getText()
  local pageName = editor.getCurrentPage()
  local parsedMarkdown = markdown.parseMarkdown(text)

  -- Collect all headers
  local headers = {}
  for topLevelChild in parsedMarkdown.children do
    if topLevelChild.type then
      local headerLevel = string.match(topLevelChild.type, "^ATXHeading(%d+)")
      if headerLevel then
        local text = ""
        table.remove(topLevelChild.children, 1)
        for child in topLevelChild.children do
          text = text .. string.trim(markdown.renderParseTree(child))
        end

        if text != "" then
          table.insert(headers, {
            name = string.rep("⠀⠀", headerLevel-1) .. " 🔹 " .. text,
            pos = topLevelChild.from,
            description = "",
          })
        end
      end
    end
  end

    local result = editor.filterBox("Select:", headers, "Headers")

    if result and result.pos then
      editor.moveCursor(result.pos, true)
    end
end

command.define {
  name = "Pick Headings",
  key = "Ctrl-Shift-h",
  run = function() headingsPicker({}) end
}
```
