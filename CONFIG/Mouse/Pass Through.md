
```space-lua
-- priority = -1
event.listen {
  name = 'page:click',
  run = function(e)
    local d = e.data or {}
    if d.shiftKey then
      local pos = d.pos
      editor.moveCursor(pos, true)
      return 1
    end
  end
}
```
