---
name: CONFIG/Picker/Heading
tags: meta/library
pageDecoration.prefix: "🔎 "
---

# Pick Headings with CMD-Tree UI

## Final Version

4. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=9647438d39
5. https://community.silverbullet.md/t/headings-picker/1745/8

```space-lua
-- Pick Headings with CMD-Tree UI (Optimized)
local function headingsPicker(options)
  local text = editor.getText()
  -- 边缘情况：空文本
  if not text or text == "" then 
    editor.flashNotification("Document is empty")
    return 
  end

  local parsed = markdown.parseMarkdown(text)
  local nodes = {}
  local min_level = 6 -- Markdown 最大只有 H6，用于归一化层级

  -- 辅助：提取纯文本标题（去除 Markdown 符号如 **bold** 等，简单版）
  -- 如果想要保留 Markdown 格式，可以只用 renderParseTree
  local function strip_markdown(str)
    str = str:gsub("([%*%_`%[%]])", "") -- 去除基本标记
    str = str:gsub("%b()", "") -- 去除链接地址部分 [text](url) -> text
    return str
  end

  for _, n in ipairs(parsed.children or {}) do
    -- 兼容不同解析器的 Tag/Type 检查
    local level = nil
    if n.tag then
      local m = string.match(n.tag, "ATXHeading%s*(%d+)")
      if m then level = tonumber(m) end
    elseif n.type then
      local m = string.match(n.type, "Heading(%d+)") or string.match(n.type, "ATXHeading%s*(%d+)")
      if m then level = tonumber(m) end
    end

    if level then
      -- 优化：渲染整个节点，然后清洗字符串，比操作 children 更稳健
      local raw_text = markdown.renderParseTree(n)
      -- 去除开头的 # 号和空格
      local clean_title = raw_text:gsub("^#+%s*", "")
      clean_title = string.trim(clean_title)

      if clean_title ~= "" then
        if level < min_level then min_level = level end
        table.insert(nodes, {
          level = level,
          text  = clean_title, -- 或者 strip_markdown(clean_title)
          pos   = n.from or n.pos or n.name -- 兼容不同 AST 结构
        })
      end
    end
  end

  if #nodes == 0 then
    editor.flashNotification("No headings found")
    return
  end

  -- 计算每个节点是否是当前层级范围内的“最后一个”
  -- 用于决定绘制 ├── 还是 └──
  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    for j = i + 1, #nodes do
      if nodes[j].level <= L then
        if nodes[j].level == L then
          is_last = false -- 后面还有同级兄弟
        else
          is_last = true -- 后面是更高级的长辈（说明我是这一支的最后）
        end
        break
      end
    end
    last_flags[i] = is_last
  end

  -- 绘图符号
  local VERT = "│   " -- 垂直线
  local BLNK = "    " -- 空白
  local TEE  = "├── " -- 中间节点
  local ELB  = "└── " -- 结尾节点

  local items = {}
  local stack = {} -- 记录父级的状态 { level=x, last=true/false }

  for i = 1, #nodes do
    -- 归一化层级：如果文档从 H2 开始，我们将其视为视觉上的 Level 1
    local visual_level = nodes[i].level - (min_level - 1)
    local is_last = last_flags[i]

    -- 栈维护：如果栈顶层级 >= 当前层级，说明上一层级已结束，出栈
    -- 注意：这里比较的是原始 level 还是 visual_level 都可以，只要一致
    -- 原始代码逻辑：while #stack >= L do table.remove(stack) end
    -- 修正逻辑：我们需要根据 visual_level 来控制缩进深度
    
    -- 这里的 stack 实际上存储的是“当前路径上的祖先状态”
    -- 栈的深度应该对应 visual_level - 1
    while #stack >= visual_level do 
      table.remove(stack) 
    end

    local prefix = ""
    
    -- 1. 绘制祖先的垂直线
    for _, ancestor in ipairs(stack) do
      prefix = prefix .. (ancestor.last and BLNK or VERT)
    end

    -- 2. 处理跳级 (例如 H1 -> H3)
    -- 如果当前 visual_level 比 stack 深度 + 1 还要大，说明中间缺层了
    -- 缺层通常用空白填充
    for d = #stack + 1, visual_level - 2 do
      prefix = prefix .. BLNK -- 或者 VERT，取决于你想要 H1 直接连到 H3 还是留空
    end

    -- 3. 绘制当前节点的连接符
    -- 如果是根节点（visual_level == 1），不需要前缀连接符，或者看个人喜好
    local elbow = ""
    if visual_level > 0 then -- 总是绘制，保持树形统一
       elbow = is_last and ELB or TEE
    end
    
    -- 特殊处理：如果是第一层级，通常不画连接线，或者画得不一样？
    -- 你的原代码逻辑对第一层也会画 ├──，这是可以的。

    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = "H" .. nodes[i].level, -- 在描述中显示真实层级
      value = nodes[i] -- 将整个对象存入 value，方便后续取 pos
    })

    -- 入栈：记录当前节点状态，供子节点绘制前缀使用
    -- 注意：如果是跳级 H1->H3，我们在栈里记录的是 H3 的状态。
    -- 下一个节点如果是 H3 的兄弟，它会复用 H1 的前缀。
    table.insert(stack, { level = visual_level, last = is_last })
  end

  local result = editor.filterBox("Navigate Heading", items, "Select a Header...", "Heading")
  local page = editor.getCurrentPage()

  if result then
    -- 兼容直接返回 item 或返回 {selected={value=...}} 的情况
    local item = result.selected and result.selected.value or result.value or result
    if item and item.pos then
      editor.navigate({ page = page, pos = item.pos })
      -- 某些编辑器需要显式移动光标
      if editor.moveCursor then editor.moveCursor(item.pos, true) end
    end
  end
end

command.define({
  name = "Navigate: Heading Picker",
  key = "Ctrl-Shift-h",
  run = function() headingsPicker({}) end
})

```

## 2nd Version

3. [[CONFIG/Paste_as/Smart_Url#Navigate Cursor+View Version]]

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
