

```space-lua
-- Page Tree Picker with CMD-Tree UI (Fixed Sorting)
local function pageTreePicker()
  -- 1. 获取所有页面
  local pages = space.listPages()

  -- 2. 【核心修复】按层级结构排序
  -- 将 "/" 替换为 "\0" (ASCII 0)，确保子页面紧跟父页面
  -- 原理： "A/B" -> "A\0B"， "A-C" -> "A-C"。
  -- 因为 \0 < -，所以 "A/B" 会排在 "A-C" 之前，保持树枝完整。
  table.sort(pages, function(a, b)
    local a_key = a.name:gsub("/", "\0")
    local b_key = b.name:gsub("/", "\0")
    return a_key < b_key
  end)

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
      pos   = page.name
    })
  end

  if #nodes == 0 then
    editor.flashNotification("No pages found")
    return
  end

  -- 4. 计算 "Is Last" 标志
  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    for j = i + 1, #nodes do
      local next_level = nodes[j].level
      if next_level < L then
        -- 遇到了层级更浅的节点（叔叔或长辈），说明我是当前分支最后一个
        break
      elseif next_level == L then
        -- 遇到了同级节点（弟弟），说明我不是最后一个
        is_last = false
        break
      end
      -- 如果是 next_level > L (子节点)，继续往下找，直到找到同级或上级
    end
    last_flags[i] = is_last
  end

  -- 5. 生成 ASCII 树形图
  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  local items = {}
  local stack = {} -- 栈存储每一层是否是最后一个节点 { last = bool }

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    -- 调整栈的大小以匹配当前层级
    -- 如果当前层级比栈深，说明进入了子目录；如果浅，说明回退了
    -- 实际上只需要保留父级的状态
    while #stack >= L do table.remove(stack) end

    local prefix = ""
    -- 根据栈中祖先节点的状态绘制前缀
    -- stack[d].last 为 true 表示该祖先已经是它那层的最后一个，所以它的子孙不需要画竖线
    for d = 1, #stack do
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    
    -- 处理跳级的情况（例如从 L1 直接到 L3，中间缺少 L2）
    -- 虽然排序修复了大部分问题，但如果父页面不存在，这里补全空白
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK -- 或者使用 VERT，取决于你想如何显示断层
    end

    local elbow = is_last and ELB or TEE
    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = nodes[i].pos,
      value = nodes[i].pos
    })

    -- 将当前节点的状态推入栈，供子节点使用
    table.insert(stack, { last = is_last })
  end

  -- 6. 显示 Filter Box
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
  key = "Shift-Alt-b",
  run = function() pageTreePicker() end
})
```
