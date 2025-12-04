
1. [click history](https://community.silverbullet.md/t/click-history/3569/10?u=chenzhu-xie) #community #silverbullet
 - 浏览器历史记录 ==等于== `alt + ←→`
 - ==等于== `editor.getRecentlyOpenedPages()` 中 _.lastOpened 这个 attr
 - ==不等于== [[CONFIG/KeyBinding/Update#Page Picker|Page Picker]]
    - 到现在为止，我也没搞清楚 [[CONFIG/KeyBinding/Update#Page Picker|Page Picker]] 的排序规则：
    - 既不是 [[CONFIG/Add_Fields_for_Obj/Last_Opened-Page/Query#3rd try|lastOpened]] 的 降序
    - 也不是 [[CONFIG/Query/lastModified]] 的 降序
    - 也不是 [[CONFIG/Mouse/History_+_Center#Click History|Click History]] 的 降序...
- 我也没搞清楚 `[[` 所触发的 排序规则...不是 上述顺序 中的 任何一个。

```space-lua
command.define {
  name = "Pick: Last Opened",
  key = "Alt-",
  priority = 1,
  run = function()
    local VisitHistory = getVisitHistory()
    if not VisitHistory or #VisitHistory == 0 then
      editor.flashNotification("No Visit History found.")
      return
    end
    
    local sel = editor.filterBox("🤏 Pick", VisitHistory, "Pick a Page...", "a Page")
    if not sel then return end
    editor.navigate(sel.ref)
    editor.invokeCommand("Navigate: Center Cursor")
  end
}
```
