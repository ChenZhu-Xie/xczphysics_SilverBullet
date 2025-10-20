This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

```space-lua
config.set(
  "plugs", {
    -- 第一个 config.set() 覆盖 第二个 config.set() 覆盖 config.set{}
    -- {} 是一个 Lua Table, 里面可装 list, array, map... 此处是 list
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
    "ghr:MrMugame/silversearch",
    -- PLUGS: Update (to Download + Update these .plug.js) + SPACE: Reindex (to Reindex the whole space, SilverSearch hooks into the general indexing infrastructure of SilverBullet)
  })
```

# Related to [[CONFIG/KeyBindings]]
${query[[from index.tag "space-lua" where string.match(_.script, "key = \"([^\n]+)\",") select {ref=_.ref, key=string.match(_.script, "key = \"([^\n]+)\",")}]]}

#SB_itself