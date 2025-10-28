1. https://github.com/joekrill/silverbullet-treeview

```lua
config.set("plugs", { -- 注意，哪怕是 config.set() 也会相互覆盖
    -- "treeview.plug.js" -- 这个「本地相对路径」可以用
    -- "_plug/treeview.plug.js"
    -- "file:/_plug/treeview.plug.js"
    -- "file://.space/_plug/treeview.plug.js"
    -- "github:joekrill/silverbullet-treeview/treeview.plug.js",
    -- "ghr:MrMugame/silversearch" -- 由于会相互覆盖，多插件须写在同一个 config.set 下
  })
```

```lua
actionButton.define {
  icon = "layout", 
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand "Tree View: Toggle Move&Resize"
  end
}
```

```lua
command.update {
  name = "Tree View: Toggle",
  key = "",
  mac = "",
  hide = true
}

command.define {
  name = "Tree View: Toggle Move&Resize",
  key = "Ctrl-Alt-b",
  mac = "Cmd-Alt-b",
  run = function()
    editor.invokeCommand "Tree View: Toggle"
    js.import("/.fs/Library/PanelDragResize.js").enableDrag()
  end
}
```

```lua
event.listen {
  name = 'system:ready',
  run = function(e)
    editor.invokeCommand "Tree View: Toggle"
    js.import("/.fs/Library/PanelDragResize.js").enableDrag()
  end
}
```

```space-lua
actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}
```

```lua
command.update {
  name = "Tree View: Toggle",
  run = function()
    editor.invokeCommand "Tree View: Toggle"
    js.import("/.fs/Library/PanelDragResize.js").enableDrag()
  end,
  key = "Ctrl-Alt-b",
  mac = "Cmd-Alt-b",
  priority = 0
}
```
