This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

```space-lua
config.set(
  "plugs", {
    -- `config.set()` and `config.set{}` will cover each other
    -- {} is a Lua Table as a list, array, map... here's a list
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
    -- "ghr:deepkn/silverbullet-graphview",
    "ghr:MrMugame/silversearch",
    -- PLUGS: Update (to Download + Update these .plug.js) + SPACE: Reindex (to Reindex the whole space, SilverSearch hooks into the general indexing infrastructure of SilverBullet)
  })
```

# Related to [[CONFIG/KeyBindings]]

${query[[from index.tag "space-lua" where string.match(_.script, "key = \"([^\n]+)\",") select {ref=_.ref, key=string.match(_.script, "key = \"([^\n]+)\",")}]]}


#SB_itself