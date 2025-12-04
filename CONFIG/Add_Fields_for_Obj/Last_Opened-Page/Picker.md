
1. [click history](https://community.silverbullet.md/t/click-history/3569/10?u=chenzhu-xie) #community #silverbullet
 - 浏览器历史记录 ==等于== `alt + ←→`
 - ==等于== `editor.getRecentlyOpenedPages()` 中 _.lastOpened 这个 attr
 - ==不等于== [[CONFIG/KeyBinding/Update#Page Picker|Page Picker]]
    - 到现在为止，我也没搞清楚 [[CONFIG/KeyBinding/Update#Page Picker|Page Picker]] 的排序规则：
    - 既不是 [[CONFIG/Add_Fields_for_Obj/Last_Opened-Page/Query#3rd try|lastOpened]] 的 降序
    - 也不是 [[CONFIG/Query/lastModified]] 的 降序
    - 也不是 [[CONFIG/Mouse/History_+_Center#Click History|Click History]] 的 降序...
- 我也没搞清楚 `[[` 所触发的 排序规则...不是 上述顺序 中的 任何一个。

# Implementation

```space-lua
command.define {
  name = "Page Picker: LastOpened",
  key = "Ctrl-p",
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

# Update `Ctrl+p`'s Original KeyBind

```space-lua
command.update {
  name = "Share: Page",
  key = "Shift-Alt-s",
  mac = "Shift-Alt-s",
  priority = ,
}
```
