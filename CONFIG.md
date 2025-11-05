# Custom Plugs are Located @
[[CONFIG]] & [[STYLE]]

## Plugs (a)i Wrote
${query[[from index.tag "page" 
  where _.githubUrl and string.match(_.githubUrl, "https://github%.com/ChenZhu%-Xie/xczphysics_SilverBullet/blob/main/.*")
  select {ref=_.ref, recommend=_.recommend, githubUrl=_.githubUrl, githubUrl_Original=_.githubUrl_Original}
]]}

## Plugs community Wrote
${query[[from index.tag "page" 
  where _.githubUrl and not string.match(_.githubUrl, "https://github%.com/ChenZhu%-Xie/xczphysics_SilverBullet/blob/main/.*")
  select {ref=_.ref, name=_.name, githubUrl=_.githubUrl, githubUrl_Original=_.githubUrl_Original}
]]}

## Plugs with [[CONFIG/KeyBinding]]s
${query[[from index.tag "space-lua" where string.match(_.script, "key = \"([^\n]+)\",") select {ref=_.ref, key=string.match(_.script, "key = \"([^\n]+)\",")}]]}

# SB stuff
${template.each(query[[
  from index.tag "SB_itself"
  where _.tag == "page"
]], templates.fullPageItem)}
1. https://silverbullet.md/Library/Std/Infrastructure/Page%20Templates#Currently%20active%20page%20templates 先过滤 tag 再过滤 page
2. https://chatgpt.com/share/68fc9915-ebe4-8010-8332-d82ebd289464

```lua -- 先过滤 page 再过滤 tag
${query[[from index.tag "page"
  where _.tags and ("SB_itself" in _.tags)
  select {ref=_.ref, tags=_.tags}
]]}
```

```lua -- not working again though
${query[[from index.tag "page"
  where _.tags and table.concat(_.tags, "|"):match("SB_itself")
  select {ref=_.ref, tags=_.tags}
]]}
```

3. [where <expression>](https://silverbullet.md/Space%20Lua/Lua%20Integrated%20Query/where <expression>)
- https://community.silverbullet.md/t/v2-understanding-queries-lua-and-help-to-migrate-old-requests/2253/4?u=chenzhu-xie

${query[[from index.tag "page" where table.includes(tags, "SB_itself")]]}
# CONFIG begin
This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

```space-lua
config.set(
  "plugs", {
    -- `config.set()`|`config.set{}` will cover each other ( for specific "key":table )
    -- {} is a Lua Table as a list, array, map... here's a list
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
    -- "ghr:deepkn/silverbullet-graphview",
    -- "ghr:MrMugame/silversearch",
    -- PLUGS: Update (to Download + Update these .plug.js) + SPACE: Reindex (to Reindex the whole space, SilverSearch hooks into the general indexing infrastructure of SilverBullet)
    -- "page-meta.plug.js",
    -- "https://raw.githubusercontent.com/ChenZhu-Xie/xczphysics_SilverBullet/main/Library/HierarchyHighlightHeadings.plug.js", -- related to [[STYLE/Theme]]
    -- "github:silverbulletmd/silverbullet-katex/katex.plug.js",
    -- "https://raw.githubusercontent.com/ChenZhu-Xie/xczphysics_SilverBullet/main/Library/hello.plug.js", -- related to [[STYLE/Theme]]
  })
```

```lua
-- prioity: 10
config.set("admonLang","en")
```

#SB_itself