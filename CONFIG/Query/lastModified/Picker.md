
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
    
    local sel = editor.filterBox("🤏 Pick", VisitHistory, "order by _.lastOpened desc", "a Page")
    if not sel then return end
    editor.navigate(sel.name)
    editor.invokeCommand("Navigate: Center Cursor")
  end
}

local function queryVisitHistory()
  return query[[
    -- from editor.getRecentlyOpenedPages "page"
    from editor.getRecentlyOpenedPages()
    where _.lastOpened
    select {name=_.ref, description=os.date("%Y-%m-%d %H:%M:%S", _.lastOpened/1000)} 
    order by _.lastOpened desc
]]
end
```
