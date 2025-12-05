

```space-lua
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

  for i = 1, #nodes do
    local L = nodes[i].level
    local is_last = last_flags[i]

    while #stack >= L do table.remove(stack) end

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
    end
  end
end

command.define({
  name = "Navigate: Page Tree Picker",
  key = "Shift-Alt-b",
  run = function() pageTreePicker() end
})
```
