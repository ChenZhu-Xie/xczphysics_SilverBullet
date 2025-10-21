
4.

```space-lua
-- Pick Headings with CMD-like Tree UI
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

  local VERT = "│　　　"   -- 祖先层级：还有后续兄弟 => 画竖线
  local BLNK = " 　　　"   -- 祖先层级：已是最后兄弟 => 空白
  local TEE  = "├────　"   -- 当前节点：还有后续兄弟
  local ELB  = "└────　"   -- 当前节点：该层级最后一个

  local items = {}
  local stack = {}  -- 祖先路径的“是否最后一个”标记：{ {level=, last=}, ... }

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    -- 收缩栈到 L-1（同级/上跳时弹出）
    while #stack >= L do table.remove(stack) end

    -- 祖先前缀：非最后 -> │   ，最后 -> 空白
    local prefix = ""
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    -- 若出现跳级（如从 H1 跳到 H3），缺失的祖先层用空白填充
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

    -- 将当前节点作为祖先压栈，供后续更深层使用
    table.insert(stack, { level = L, last = is_last })
  end

  -- 4) 展示并导航
  local result = editor.filterBox("Headings", items, { label = "name", description = "description" })
  local page = editor.getCurrentPage()

  if result and result.selected and result.selected.value then
    local item = result.selected.value
    if item.pos then editor.navigate({ page = page, pos = item.pos }) end
  elseif result and result.pos then
    editor.navigate({ page = page, pos = result.pos })
  end
end

command.define({
  name = "Pick Headings",
  key = "Ctrl-Shift-h",
  run = function() headingsPicker({}) end
})
```

3.

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

2. [[CONFIG/Paste as/Markdown/Image Url#Navigate Cursor+View Version]]

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
