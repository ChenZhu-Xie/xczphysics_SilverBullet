
```space-lua
-- priority = -1
event.listen {
  name = 'page:click',
  run = function(e)
    local d = e.data or {}
    if d.ctrlKey then
      local pos = d.pos
      editor.moveCursor(pos, false)
      return 1
    end
  end
}
```
