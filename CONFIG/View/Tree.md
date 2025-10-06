
1. https://github.com/joekrill/silverbullet-treeview

```lua

actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}
```