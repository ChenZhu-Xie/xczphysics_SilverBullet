

```space-lua
-- Pick Pages (from query[[from index.tag "page"]]) with CMD-Tree UI
local function pagesPicker(options)
  options = options or {}
  local TAG = options.tag or "page"

  -- 统一的树形前缀符号（与 headingsPicker 保持一致的风格）
  local VERT = "│ 　　"
  local BLNK = "　　　"
  local TEE  = "├───　"
  local ELB  = "└───　"

  -- 工具：字符串分割（按 / 目录分隔）
  local function split_path(p)
    p = (p or ""):gsub("\\", "/")
    local parts = {}
    for seg in string.gmatch(p, "[^/]+") do
      table.insert(parts, seg)
    end
    return parts
  end

  -- 工具：去扩展名
  local function strip_ext(name)
    return name:gsub("%.[^%.]+$", "")
  end

  -- 工具：标准化页面列表
  -- 接受多种形态：字符串路径，或包含 path/file/title/name 的表
  local function normalizePages(res)
    local pages = {}
    if not res then return pages end

    -- 兼容：如果是 map 形式，拉平成数组
    local function iter(container)
      if #container > 0 then
        return ipairs(container)
      else
        local i = 0
        return function(_, _)
          i = i + 1
          local k, v = next(container, (i == 1) and nil or select(1, next(container, nil)))
          if not k then return nil end
          return i, v
        end
      end
    end

    for _, p in iter(res) do
      local path, title
      if type(p) == "string" then
        path = p
      elseif type(p) == "table" then
        path = p.path or p.file or p.name or p.id
        title = p.title or p.name
      end
      if path then
        path = path:gsub("\\", "/"):gsub("^%./", "")
        local base = path:match("([^/]+)$") or path
        title = title or strip_ext(base)
        table.insert(pages, { path = path, title = title })
      end
    end

    table.sort(pages, function(a, b) return a.path < b.path end)
    return pages
  end

  -- 数据获取：优先调用 index.tag("page")
  local function fetchPagesByTag(tag)
    -- 你们环境若有全局 index 且支持 index.tag("page")
    if type(index) == "table" then
      local tagGetter = index.tag or index.tags
      if type(tagGetter) == "function" then
        local ok, res = pcall(tagGetter, tag)
        if ok then return normalizePages(res) end
      elseif type(tagGetter) == "table" then
        local res = tagGetter[tag] or (tagGetter.get and tagGetter:get(tag))
        if res then return normalizePages(res) end
      end
    end

    -- 可选：fallback（按需实现）
    -- 若你们有 workspace/listPages 之类 API，可在这里补充：
    -- if workspace and workspace.listPages then
    --   local res = workspace.listPages(function(meta)
    --     if not meta then return false end
    --     if meta.tags then
    --       for _, t in ipairs(meta.tags) do if t == tag then return true end end
    --     end
    --     return false
    --   end)
    --   return normalizePages(res)
    -- end

    return {}
  end

  -- 构建树结构
  local function buildTree(pages)
    local root = { name = "", children = {}, isPage = false }
    local function ensureChild(node, key, display)
      if not node.children[key] then
        node.children[key] = { name = display or key, children = {}, isPage = false }
      end
      return node.children[key]
    end
    for _, pg in ipairs(pages) do
      local parts = split_path(pg.path)
      local cur = root
      for i, seg in ipairs(parts) do
        local child = ensureChild(cur, seg, seg)
        cur = child
        if i == #parts then
          cur.isPage = true
          cur.title = pg.title
          cur.path  = pg.path
        end
      end
    end
    return root
  end

  -- 将树拍平成可供 filterBox 使用的 items
  local function treeToItems(root)
    local items = {}

    local function sortedKeys(t)
      local ks = {}
      for k, _ in pairs(t) do table.insert(ks, k) end
      table.sort(ks)
      return ks
    end

    local function dfs(node, prefixStack)
      local keys = sortedKeys(node.children)
      for idx, k in ipairs(keys) do
        local child = node.children[k]
        local is_last = (idx == #keys)

        -- 构造前缀
        local prefix = ""
        for _, parentIsLast in ipairs(prefixStack) do
          prefix = prefix .. (parentIsLast and BLNK or VERT)
        end
        local elbow = is_last and ELB or TEE
        local labelText = child.isPage and (child.title or child.name) or child.name
        local label = prefix .. elbow .. labelText

        if child.isPage then
          table.insert(items, {
            name = label,
            description = child.path,
            page = child.path     -- 用于导航
          })
        else
          -- 文件夹节点（仅展示，不导航）
          table.insert(items, {
            name = label,
            description = "",
            folder = true
          })
        end

        table.insert(prefixStack, is_last)
        dfs(child, prefixStack)
        table.remove(prefixStack)
      end
    end

    dfs(root, {})
    return items
  end

  -- 主流程
  local pages = fetchPagesByTag(TAG)
  if #pages == 0 then
    editor.flashNotification(string.format("No pages found for tag: %s", TAG))
    return
  end

  local tree  = buildTree(pages)
  local items = treeToItems(tree)

  if #items == 0 then
    editor.flashNotification("No items to display")
    return
  end

  local result = editor.filterBox("Search Pages:", items, "Select a Page...", "Page")
  if not result then return end

  -- 与 headingsPicker 相同的选择处理分支
  if result.selected and result.selected.value then
    local item = result.selected.value
    if item.page then
      editor.navigate({ page = item.page })
    end
  elseif result.page then
    editor.navigate({ page = result.page })
  end
end

-- 绑定命令
command.define({
  name = "Navigate: Page Picker (index.tag 'page')",
  key  = "Shift-Alt-b",
  run  = function() pagesPicker({ tag = "page" }) end
})
```



```lua
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
