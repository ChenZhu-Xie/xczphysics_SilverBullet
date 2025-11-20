
本来是想做 鼠标穿透 penetration/pass through 的
发现这功能实现不了...
- 可能是被 preview:click 拦截了。
现在改为了做 ctrl + click 自动带 Navigate: Center Cursor 的功能


点击任何行末，都不会触发。#Bug 无论是否是空行。

```space-lua
-- priority = -1
event.listen {
  name = 'page:click',
  run = function(e)
    local d = e.data or {}
    -- editor.flashNotification(d.ctrlKey)
    -- editor.flashNotification(d.pos)
    local pos = d.pos
    if d.ctrlKey then
      editor.flashNotification(pos)
      editor.moveCursor(pos, true)
      return
    end
  end
}
```

1. [Events](https://silverbullet.md/Events) #silverbullet

```lua
-- priority = -1
event.listen {
  name = 'preview:click',
  run = function(e)
    local d = e.data or {}
    -- editor.flashNotification(d.ctrlKey)
    editor.flashNotification(d.pos)
    if d.ctrlKey then
      local pos = d.pos
      editor.flashNotification(pos)
      editor.moveCursor(pos, true)
      return
    end
  end
}
```
