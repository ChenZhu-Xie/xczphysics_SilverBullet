
```space-lua
   ---- https://github.com/joekrill/silverbullet-treeview
 
config.set {
  plugs = {
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
  },
}

actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}
```
