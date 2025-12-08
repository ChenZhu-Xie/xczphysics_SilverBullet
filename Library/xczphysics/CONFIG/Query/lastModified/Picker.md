---
author: Chenzhu-Xie
name: Library/xczphysics/CONFIG/Query/lastModified/Picker
tags: meta/library
pageDecoration.prefix: "📃✍🏻 "
---

# Implementation

```space-lua
command.define {
  name = "Page Picker: Last Modified",
  key = "Shift-Alt-p",
  priority = 1,
  run = function()
    local ModifyHistory = queryModifyHistory()
    if not ModifyHistory or #ModifyHistory == 0 then
      editor.flashNotification("No Modify History found.")
      return
    end
    
    local sel = editor.filterBox("🤏 Pick", ModifyHistory, "order by _.lastModified desc", "📃✍🏻 a Page")
    if not sel then return end
    editor.navigate(sel.name)
    editor.invokeCommand("Navigate: Center Cursor")
  end
}

local function queryModifyHistory()
  return query[[
    from index.tag "page"
    select {name=_.ref, description=string.sub(_.lastModified:gsub("T", " "), 1, -5)} 
    order by lastModified desc
]]
end
```
