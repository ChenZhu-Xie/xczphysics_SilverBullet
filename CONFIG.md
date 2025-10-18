This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

```space-lua
config.set(
  "plugs", {
    -- 第一个 config.set() 覆盖 第二个 config.set() 覆盖 config.set{}
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
    "ghr:MrMugame/silversearch",
    -- PLUGS: Update (Download + Update these .plug.js) + SPACE: Reindex
  })
```


#SB_itself