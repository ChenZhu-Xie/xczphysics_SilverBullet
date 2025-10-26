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

```space-lua
actionButton.define {
  icon = "layout",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand "Tree View: Toggle"
    js.import("/.fs/Library/PanelDragResize.js").enableDrag()
   end
}
```

```lua
actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}
```