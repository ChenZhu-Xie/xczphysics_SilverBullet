```space-lua
-- 手动命令：用 editor.getCurrentPage() 拿当前页的 docId
command.define{
  name = "Stamp LastViewed (Current)",
  run = function()
    editor.flashNotification(editor.getRecentlyOpenedPages())
    -- if docId then stamp_last_viewed(docId) end
  end
}
```