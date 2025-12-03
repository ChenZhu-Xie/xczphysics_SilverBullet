---
name: CONFIG/Picker/Transcluded File
tags: meta/library
pageDecoration.prefix: "📄 "
---

`${query[[
    from index.tag "link"
    where page == _CTX.currentPage.name 
  ]]}`

`getTranscludedFiles()`

# Table

## Picker

```space-lua
local function navigateToTranscludedFile(ref, pos)
  if ref then
    editor.navigate(ref)
    if pos then
      editor.moveCursor(tonumber(pos), true)
    end
    return true
  end
  return false
end

command.define {
  name = "Navigate: Table Picker",
  key = "Ctrl-Shift-t",
  priority = 1,
  run = function()
    local tables = getTables()
    if not tables or #tables == 0 then
      editor.flashNotification("No tables found.")
      return
    end

    local items = {}
    for _, r in ipairs(tables) do
      table.insert(items, {
        name = string.format("%s @ %d", r.page, r.pos),
        -- description = string.format("%s @ %d", r.page, r.pos),
        ref = r.ref,
        page = r.page,
        pos = r.pos
      })
    end

    local sel = editor.filterBox("Jump to", items, "Select a Table...", "Page @ Pos where the Table locates")
    if not sel then return end

    if not navigateToTable(sel.ref, sel.pos) then
      editor.flashNotification("Failed to navigate to selected table.")
    end
  end
}
```

## Query

```space-lua
function getTranscludedFiles()
  return query[[
    from index.tag "link"
    where _.toFile
    select{
      ref = _.ref,
      snippet = _.snippet,
      page = _.page,
      pos = _.pos,
    }
    order by _.page, _.pos
  ]]
end
```

```lua
-- 定义命令：Transcluded File Picker
editor.command({
    name = "Transclusion: Picker",
    key = "Alt-t", -- 你可以根据习惯修改快捷键，例如 "Ctrl-Alt-t"
    script = function()
        -- 1. 查询数据库
        -- 我们查找 Link 表，筛选常见的嵌入文件格式（图片、PDF等）
        -- page: 引用该文件的页面（所在位置）
        -- name: 被引用的文件名（Transcluded File）
        -- pos: 引用所在的字符位置
        local query = [[
            SELECT page, name, pos
            FROM Link
            WHERE
                name LIKE '%.png' OR
                name LIKE '%.jpg' OR
                name LIKE '%.jpeg' OR
                name LIKE '%.gif' OR
                name LIKE '%.webp' OR
                name LIKE '%.svg' OR
                name LIKE '%.bmp' OR
                name LIKE '%.pdf'
            ORDER BY page DESC
        ]]

        local results = index.query(query)
        
        -- 2. 构建 FilterBox 选项列表
        local options = {}
        for _, link in ipairs(results) do
            -- 格式化显示内容
            -- Name: 显示被嵌入的文件名 (如: 冰雪清韵・字根图.png)
            -- Description: 显示所在的页面 (如: Found in: Language/Input Method)
            table.insert(options, {
                name = link.name,
                description = "📍 " .. link.page,
                value = {
                    page = link.page,
                    pos = link.pos
                }
            })
        end

        -- 3. 唤起选择框
        local selection = editor.filterBox({
            label = "🔍 Select Transcluded File to Jump",
            options = options
        })

        -- 4. 处理跳转
        if selection then
            -- 跳转到对应的页面和精确的 pos 位置
            editor.navigate({
                page = selection.page,
                pos = selection.pos
            })
            
            -- 可选：给一个轻微的提示
            editor.flashNotification("Navigated to transclusion of: " .. selection.page)
        end
    end
})

```




![[Language/Input Method/冰雪清韵・字根图.png]]

![[Daydream/神经.png|300]]

