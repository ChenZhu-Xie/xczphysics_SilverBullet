
```space-lua
event.listen {
  name = 'page:click',
  run = function(e)
    local d = e.data or {}
    if d.shiftKey and not (d.ctrlKey or d.metaKey) then
      local pos = d.pos
      editor.moveCursor(pos, false)
      return 1
    end
  end
}
```
