

```space-lua
-- Page Tree Picker with CMD-Tree UI
local function pageTreePicker()
  -- 1. 获取所有页面 (相当于 query[[from index.tag "page"]])
  local pages = space.listPages()
  local nodes = {}

  -- 辅助函数：计算层级和获取显示名称
  local function parse_page_info(page_name)
    local level = 1
    -- 计算 "/" 的数量来决定层级
    for _ in string.gmatch(page_name, "/") do
      level = level + 1
    end
    
    -- 获取最后一个 "/" 之后的内容作为显示名称
    local text = page_name:match(".*/(.*)") or page_name
    
    return level, text
  end

  -- 3. 构建节点列表
  for _, page in ipairs(pages) do
    local level, text = parse_page_info(page.name)
    table.insert(nodes, {
      level = level,
      text  = text,
      pos   = page.name -- 这里 pos 存储完整的页面名称
    })
  end

  if #nodes == 0 then
    editor.flashNotification("No pages found")
    return
  end

  -- 4. 计算 "Is Last" 标志 (完全复用 Heading Picker 的逻辑)
  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    for j = i + 1, #nodes do
      if nodes[j].level <= L then
        if nodes[j].level == L then
          is_last = false
        else
          is_last = true -- 遇到了更上层的节点（叔叔节点），说明我是这一支的最后一个
        end
        break
      end
    end
    last_flags[i] = is_last
  end

  -- 5. 生成 ASCII 树形图 (完全复用 Heading Picker 的 UI 常量和逻辑)
  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  local items = {}
  local stack = {}

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    -- 调整栈的大小以匹配当前层级
    while #stack >= L do table.remove(stack) end

    local prefix = ""
    -- 根据栈中祖先节点的状态绘制前缀
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    
    -- 填充当前层级之前的空白
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE
    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = nodes[i].pos, -- 在描述中显示完整路径
      value = nodes[i].pos        -- 将完整路径作为返回值
    })

    table.insert(stack, { level = L, last = is_last })
  end

  -- 6. 显示 Filter Box 并导航
  local result = editor.filterBox("Search:", items, "Select a Page...", "Page Tree")

  if result then
    -- 兼容不同的返回值结构 (直接返回 value 或 table)
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
  key = "Shift-Alt-b",
  run = function() pageTreePicker() end
})
```
