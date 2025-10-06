This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

```space-lua
config.set{
  "plugs", {
    -- Add your plugs here (https://silverbullet.md/Plugs)
    -- Then run the `Plugs: Update` command to update them
  }
}

config.set(
  "plugs", {
    -- 第一个 config.set() 覆盖 第二个 config.set() 覆盖 config.set{}
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
    "ghr:MrMugame/silversearch",
  })

actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}
```
