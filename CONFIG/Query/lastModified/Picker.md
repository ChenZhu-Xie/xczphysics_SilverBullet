
```space-lua
command.define {
  name = "Page Picker: LastOpened",
  key = "Shift-Alt-p",
  priority = 1,
  run = function()
    local VisitHistory = queryVisitHistory()
    if not VisitHistory or #VisitHistory == 0 then
      editor.flashNotification("No Visit History found.")
      return
    end
    
    local sel = editor.filterBox("🤏 Pick", VisitHistory, "order by _.lastModified desc", "a Page")
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
