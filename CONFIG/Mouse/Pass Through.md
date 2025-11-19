
```space-lua
-- priority = -1
event.listen {
  name = 'page:click',
  run = function(e)
    local d = e.data or {}
    if d.ctrlKey then
      local pos = d.pos
      editor.moveCursor(pos, true)
      return
    end
  end
}
```
