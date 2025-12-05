

### Page + Heading Ver


### Page Ver

```space-lua
-- Page Tree Picker with CMD-Tree UI (Fixed)
local function pageTreePicker()
  local pages = space.listPages()
  
  local nodes = {}

  -- 解析页面层级和名称
  local function parse_page_info(page_name)
    local level = 1
    -- 计算 / 的数量来确定层级
    for _ in string.gmatch(page_name, "/") do
      level = level + 1
    end
    -- 获取文件名（最后一个 / 之后的内容）
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

  -- 计算每个节点是否是该层级的最后一个子节点
  -- 这决定了是画 "├───" 还是 "└───"
  local last_flags = {}
  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = true
    
    -- 向下查找后续节点
    for j = i + 1, #nodes do
      local next_L = nodes[j].level
      
      if next_L == L then
        -- 发现同级节点，说明当前节点不是最后一个
        is_last = false
        break
      elseif next_L < L then
        -- 发现更浅的层级（父级或祖先级的兄弟），说明当前子树结束了
        is_last = true
        break
      end
      -- 如果 next_L > L，说明是子节点，继续往下找
    end
    last_flags[i] = is_last
  end

  -- 绘图字符定义
  local VERT = "│ 　　" -- 竖线 + 全角空格
  local BLNK = "　　　" -- 空白占位
  local TEE  = "├───　" -- 中间节点
  local ELB  = "└───　" -- 结尾节点

  local items = {}
  local stack = {} -- 用于记录每一层的状态（是否是最后节点）

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    -- 维护栈：栈的大小应该对应当前的父级层数
    while #stack >= L do 
      table.remove(stack) 
    end

    -- 构建前缀
    local prefix = ""
    for d = 1, #stack do
      -- 如果父级已经是最后节点，则用空白，否则用竖线
      prefix = prefix .. (stack[d].last and BLNK or VERT)
    end
    
    -- 填充层级差（如果有跳级的情况，虽然排序后一般不会有）
    for d = #stack + 1, L - 1 do
      prefix = prefix .. BLNK
    end

    local elbow = is_last and ELB or TEE
    local label = prefix .. elbow .. nodes[i].text

    table.insert(items, {
      name = label,
      description = nodes[i].pos, -- 在搜索框下方显示完整路径
      value = nodes[i].pos
    })

    -- 将当前节点状态入栈，供子节点参考
    table.insert(stack, { level = L, last = is_last })
  end

  -- 调用选择器
  local result = editor.filterBox("Search:", items, "Select a Page...", "Page Tree")

  if result then
    local page_name = result.value or result
    -- 兼容不同版本的返回值结构
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
