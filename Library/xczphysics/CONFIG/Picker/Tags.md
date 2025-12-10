---
author: Chenzhu-Xie
name: Library/xczphysics/CONFIG/Picker/Tags
tags: meta/library
pageDecoration.prefix: "🔖 "
---

Practical tag search handles multi-tag intersections, which is both the advantage and the drawbacks (not one-to-one) of tags (Webs) over file systems (Trees).

One item can have many tags, and one tag can match many items.

Both are Webs, yet 
Tag is Star-like Set-theory, good at Filtering, Intersection, Classification
Wiki is Mesh-like Graph-theory, good at Navigation, Association, 

# Multiple Tags

4. 实用的 标签检索 应 自带多选 找交集 https://marijnhaverbeke.nl/blog #💡
   而不是 只 pick 1 tag（像下面的 tag picker）或 [[QUERY/Tags/Tag-Page_Navigator|找并集]]


## CMD: Tags Picker 2

```space-lua
-- priority: 11
command.define {
  name = "Navigate: Tags Picker",
  key = "Ctrl-Alt-T",
  run = function()
    local selectedNames = {}
    
    while true do
      local potentialTags = {}
      
      if #selectedNames == 0 then
        potentialTags = query[[from index.tag "tag" select {name = _.name}]]
      else
        
        local q = query[[from index.tag(selectedNames[1])]]
        
        for i = 2, #selectedNames do
          q = query[[
            from q where table.includes(_.tags, selectedNames[i])
          ]]
        end
        
        local tagSet = {}
        for _, obj in ipairs(q) do
          if obj.tags and type(obj.tags) == "table" then
            for _, t in ipairs(obj.tags) do
              tagSet[t] = true
            end
          end
        end
        
        -- 将 Set 转换回 list 供 picker 使用
        for tagName, _ in pairs(tagSet) do
          table.insert(potentialTags, {name = tagName})
        end
        
        -- 对结果进行排序，方便查找
        table.sort(potentialTags, function(a, b) return a.name < b.name end)
      end
      -- === 核心逻辑修改结束 ===

      local availableOptions = {}
      for _, tagObj in ipairs(potentialTags) do
        -- 排除已经选过的标签
        if not table.includes(selectedNames, tagObj.name) then
          table.insert(availableOptions, tagObj)
        end
      end

      -- 如果没有可选的标签了（说明没有更多交集），直接跳转
      if #availableOptions == 0 then
        break
      end

      -- UI 显示逻辑
      local description = "Select a Tag"
      local placeholder = "🔖 a Tag"
      if #selectedNames > 0 then
        description = "Selected Tags ⏺️：" .. table.concat(selectedNames, ", ") .. " ➕ (ESC to Go)"
        placeholder = string.rep("🔖", #selectedNames) .. " Filter next tag..."
      end

      local selection = editor.filterBox("🤏 Pick (Faceted)", availableOptions, description, placeholder)
      
      if selection then
        table.insert(selectedNames, selection.name)
      else
        -- 用户按 ESC
        if #selectedNames == 0 then
          return -- 没选任何东西，直接退出
        else
          break -- 选了东西按 ESC，开始跳转
        end
      end
    end

    -- 跳转到我们在上一个问题中定义的 virtual page
    local targetPage = "tag:" .. table.concat(selectedNames, ",")
    editor.navigate(targetPage)
  end
}

```

## CMD: Tags Picker 1

```lua
-- priority: 11
command.define {
  name = "Navigate: Tags Picker",
  key = "Ctrl-Alt-T",
  run = function()
    local allTags = query[[from index.tag "tag" select {name = _.name}]]
    local selectedNames = {}
    while true do
      local availableOptions = {}
      for _, tagObj in ipairs(allTags) do
        if not table.includes(selectedNames, tagObj.name) then
          table.insert(availableOptions, tagObj)
        end
      end
      if #availableOptions == 0 then
        break
      end
      local description = "Select a Tag"
      local placeholder = "🔖 a Tag"
      if #selectedNames > 0 then
        description = "Selected Tags ⏺️：" .. table.concat(selectedNames, ", ") .. " ➕ (ESC to Go)"
        placeholder = string.rep("🔖", #selectedNames) .. " a Tag"
      end
      local selection = editor.filterBox("🤏 Pick", availableOptions, description, placeholder)
      if selection then
        table.insert(selectedNames, selection.name)
      else
        if #selectedNames == 0 then
          return
        else
          break
        end
      end
    end
    local targetPage = "tags:" .. table.concat(selectedNames, ",")
    editor.navigate(targetPage)
  end
}

```

## Virtual Page

```space-lua
-- priority: 11
virtualPage.define {
  pattern = "tags:(.+)",
  run = function(inputString)
    local rawTags = inputString:split(",")
    local tags = {}
    for _, t in ipairs(rawTags) do
      local cleanTag = t:trim()
      if cleanTag ~= "" then
        table.insert(tags, cleanTag)
      end
    end

    if #tags == 0 then return "No tags specified." end

    local text = ""
    local tagName = tags[1]
    local allObjects = query[[
      from index.tag(tagName)
      order by ref
    ]]
    
    if #tags == 1 then
      text = "# Objects tagged with: " .. tagName .. "\n"
      local tagParts = tagName:split("/")
      local parentTags = {}
      for i in ipairs(tagParts) do
        local slice = table.pack(table.unpack(tagParts, 1, i))
        if i ~= #tagParts then
          table.insert(parentTags, {name=table.concat(slice, "/")})
        end
      end
      if #parentTags > 0 then
        text = text .. "## Parent tags\n"
          .. template.each(parentTags, templates.tagItem)
      end
      local subTags = query[[
        from index.tag "tag"
        where string.startsWith(_.name, tagName .. "/")
        select {name=_.name}
      ]]
      if #subTags > 0 then
        text = text .. "## Child tags\n"
          .. template.each(subTags, templates.tagItem)
      end
    else
      text = "# Objects tagged with: " .. table.concat(tags, ", ") .. "\n"
      for i = 2, #tags do
        allObjects = query[[
          from allObjects
          where table.includes(_.tags, tags[i])
        ]]
      end
    end
    
    local taggedPages = {}
    local taggedTasks = {}
    local taggedItems = {}
    local taggedData = {}
    local taggedParagraphs = {}

    -- improve performance 
    for _, obj in ipairs(allObjects) do
      if obj.itags and table.includes(obj.itags, "page") then
        table.insert(taggedPages, obj)
      end
      if obj.itags and table.includes(obj.itags, "task") then
        table.insert(taggedTasks, obj)
      end
      if obj.itags and table.includes(obj.itags, "item") then
        table.insert(taggedItems, obj)
      end
      if obj.itags and table.includes(obj.itags, "data") then
        table.insert(taggedData, obj)
      end
      if obj.itags and table.includes(obj.itags, "paragraph") then
        table.insert(taggedParagraphs, obj)
      end
    end

    if #taggedPages > 0 then
      text = text .. "## Pages\n"
        .. template.each(taggedPages, templates.pageItem)
    end
    
    if #taggedTasks > 0 then
      text = text .. "## Tasks\n"
        .. template.each(taggedTasks, templates.taskItem)
    end
    
    if #taggedItems > 0 then
      text = text .. "## Items\n"
        .. template.each(taggedItems, templates.itemItem)
    end
    
    if #taggedData > 0 then
      text = text .. "## Data\n"
        .. markdown.objectsToTable(taggedData) .. "\n"
    end
    
    if #taggedParagraphs > 0 then
      text = text .. "## Paragraphs\n"
        .. template.each(taggedParagraphs, templates.paragraphItem)
    end

    return text
  end
}

```

# Single Tag

1. https://community.silverbullet.md/t/quickly-search-open-tag-virtual-page/1104/2?u=chenzhu-xie

`${query[[from index.tag "tag" select {name = _.name}]]}` 中的 name 不含重复元素, 是个 set 集合。

`${query[[from index.tag "tag"}` 中的 name 含重复的元素。

2. https://community.silverbullet.md/t/quickly-search-open-tag-virtual-page/1104/15

3. official one: [silverbullet 2 3 released share libraries library manager and repositories](https://community.silverbullet.md/t/silverbullet-2-3-released-share-libraries-library-manager-and-repositories/3580?u=chenzhu-xie) #community #silverbullet

```space-lua
-- priority: 11
command.define {
  name = "Navigate: Tag Picker",
  key = "Ctrl-Alt-t",
  run = function()
    local tags = query[[from index.tag "tag" select {name = _.name}]]
    local sel = editor.filterBox("🤏 Pick", tags, "Select a Tag", "🔖 a Tag")
    if sel then editor.navigate("tag:" .. sel.name) end
  end
}
```

## Community Version

3. https://community.silverbullet.md/t/quickly-search-open-tag-virtual-page/1104/14?u=chenzhu-xie

```lua
command.define {  
  name = "Search All",
  key = "Ctrl-Shift-t",
  run = function()  
    -- Query all object types  
    local allHeaders = query[[from index.tag "header" ]]
    local allPages = query[[from index.tag "page" ]]
    local allItems = query[[from index.tag "item" ]]
    local allParagraph = query[[from index.tag "paragraph" ]]
      
    -- Combine all results  
    local all = {}  
    for _, item in ipairs(allHeaders) do  
      table.insert(all, item)  
    end  
    for _, item in ipairs(allPages) do  
      table.insert(all, item)  
    end  
    for _, item in ipairs(allItems) do  
      table.insert(all, item)  
    end  
    for _, item in ipairs(allParagraph) do  
      table.insert(all, item)  
    end  
      
    -- Create filter options  
    local options = {}  
    for _, item in ipairs(all) do  
      table.insert(options, {  
        name = item.text or item.name or item.page,  
        description = item.page,  
        page = item.ref  
      })  
    end  
      
    -- Show filter box  
    local selected = editor.filterBox(  
      "Full Text Search",  
      options,  
      "Select the search"  
    )  
      
    if selected then  
      -- Find the original data item  
      local data = nil  
      for _, item in ipairs(all) do  
        if (item.text or item.name or item.page) == selected.name then  
          data = item  
          break  
        end  
      end  
        
      if data then  
        editor.navigate(data.ref)  
      end  
    end  
  end  
}
```