
# Hello 👋
Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

# Last Modified
${query[[from index.tag "page" select {ref=_.ref, contentType=_.contentType} order by lastModified desc limit 5]]}

# Tags
`${query[[from index.tag "tag" select {name = '#' .. _.name} where not string.find(name, "meta")]]}`

1. https://community.silverbullet.md/t/graphview-plug-for-silverbullet/1651/22?u=chenzhu-xie
2. https://community.silverbullet.md/t/how-could-i-migrate-my-index-page-to-v2/3173/2?u=chenzhu-xie

# TAGS
${template.each(query[[from index.tag "tag" select {name = _.name} where not string.find(name, "meta")]], home.renderTag)}

# TASKS
${template.each(query[[from index.tag "task" select {currentPage = _.page} where not _.done]], template.new[==[
**[[${currentPage}]]** ${template.each(query[[from index.tag "tag" where _.page == currentPage]], home.renderTag)}
${template.each(query[[from index.tag "task" where _.page == currentPage and not _.done]], home.renderTask)}
]==])}

# LATEST
[[All pages|Show all]]

${template.each(query[[from index.tag "page" where not string.find(_.name,"Library") order by created desc limit 15]], home.renderPage)}

```space-lua
home = home or {}

home.renderTag = template.new[==[_[[tag:${name}|#${name}]]_ ]==]

home.renderTask = template.new[==[- ${text}
]==]

home.renderPage = template.new[==[### [[${name}]]
  ${created}

]==]
```

```space-lua
command.define {  
  name = "Search All",
  
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