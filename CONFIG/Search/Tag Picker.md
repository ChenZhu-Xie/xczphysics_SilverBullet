1. https://community.silverbullet.md/t/quickly-search-open-tag-virtual-page/1104/2?u=chenzhu-xie

`${query[[from index.tag "tag" select {name = _.name}]]}` 中的 name 不含重复元素, 是个 set 集合。

`${query[[from index.tag "tag"}` 中的 name 含重复的元素。

2. https://community.silverbullet.md/t/quickly-search-open-tag-virtual-page/1104/15

```space-lua
command.define {
  name = "Navigate: Tag Picker",
  key = "Ctrl-Shift-t",
  run = function()
    local tags = query[[from index.tag "tag" select {name = _.name}]]
    local sel = editor.filterBox("Tag Search", tags, "Select a Tag")
    if sel then editor.navigate("tag:" .. sel.name) end
  end
}
```

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