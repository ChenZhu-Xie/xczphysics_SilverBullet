
# Plugs That I Wrote

${query[[from index.tag "page"]]}

# Plugs that have [[CONFIG/KeyBinding]]s

${query[[from index.tag "space-lua" where string.match(_.script, "key = \"([^\n]+)\",") select {ref=_.ref, key=string.match(_.script, "key = \"([^\n]+)\",")}]]}

This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

```space-lua
config.set(
  "plugs", {
    -- `config.set()`|`config.set{}` will cover each other
    -- {} is a Lua Table as a list, array, map... here's a list
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
    -- "ghr:deepkn/silverbullet-graphview",
    "ghr:MrMugame/silversearch",
    -- PLUGS: Update (to Download + Update these .plug.js) + SPACE: Reindex (to Reindex the whole space, SilverSearch hooks into the general indexing infrastructure of SilverBullet)
    -- "page-meta.plug.js",
  })
```

```space-lua
-- prioity: 10
config.set("admonLang","en")
```

#SB_itself