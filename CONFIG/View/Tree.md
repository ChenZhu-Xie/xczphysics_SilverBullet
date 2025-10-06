
1. https://github.com/joekrill/silverbullet-treeview

```space-lua
config.set("plugs", {
    -- "treeview.plug.js"
    -- "_plug/treeview.plug.js"
    -- "file:/_plug/treeview.plug.js"
    -- "file://.space/_plug/treeview.plug.js"
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
    "ghr:MrMugame/silversearch"
  })

actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}
```