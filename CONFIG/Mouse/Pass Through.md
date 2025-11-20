
```space-lua
-- priority = -1
event.listen {
  name = 'page:click',
  run = function(e)
    local d = e.data or {}
    -- editor.flashNotification(d.ctrlKey)
    -- editor.flashNotification(d.pos)
    if d.ctrlKey then
      local pos = d.pos
      editor.flashNotification(pos)
      editor.moveCursor(pos, true)
      return
    end
  end
}
```

