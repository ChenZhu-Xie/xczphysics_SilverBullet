
# Custom Plugs are Located @
[[CONFIG]] & [[STYLE]]

## Plugs community Wrote
${query[[from index.tag "page" 
  where _.githubUrl and not string.match(_.githubUrl, "https://github%.com/ChenZhu%-Xie/xczphysics_SilverBullet/blob/main/.*")
  select {ref=_.ref, name=_.name, githubUrl=_.githubUrl, githubUrl_Original=_.githubUrl_Original}
]]}

## Plugs with KeyBindings
[[CONFIG/KeyBinding]]
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
    "ghr:MrMugame/silversearch",
    -- PLUGS: Update (to Download + Update these .plug.js) + SPACE: Reindex (to Reindex the whole space, SilverSearch hooks into the general indexing infrastructure of SilverBullet)
    -- "page-meta.plug.js",
    -- "https://raw.githubusercontent.com/ChenZhu-Xie/xczphysics_SilverBullet/main/Library/HierarchyHighlightHeadings.plug.js", -- related to [[STYLE/Theme]]
    -- "github:silverbulletmd/silverbullet-katex/katex.plug.js",
    -- "https://raw.githubusercontent.com/ChenZhu-Xie/xczphysics_SilverBullet/main/Library/hello.plug.js", -- related to [[STYLE/Theme]]
    "github:deepkn/silverbullet-nldates/nldates.plug.js",
  })
```

```lua
-- prioity: 10
config.set("admonLang","en")
```

[mobile friendly toolbar](https://community.silverbullet.md/t/mobile-friendly-toolbar/871/12?u=chenzhu-xie) #community #silverbullet
[mobile friendly toolbar](https://community.silverbullet.md/t/mobile-friendly-toolbar/871/19?u=chenzhu-xie) #community #silverbullet
```space-lua
config.set {
  -- Think this should be default, current size of phones makes
  -- the hamburger menu too far away for right and left handed
  -- users
  mobileMenuStyle = 'bottom-bar', -- or 'hamburger'
  actionButtons = {
    -- I'm left handed so prefer to have frequent buttons left
    {
      icon = 'home',
      description = 'Go to the index page',
      run = function()
        editor.invokeCommand('Navigate: Home')
      end
    },
    {
      -- Love for Silversearch
      icon = 'search',
      description = 'Search for words in space',
      run = function()
        editor.invokeCommand('Silversearch: Search')
      end
    },
    {
      -- https://v2.silverbullet.md/Library/Std/Page%20Templates/Quick%20Note
      icon = 'calendar',
      description = 'Quick Note', 
      run = function()
        editor.invokeCommand('Quick Note')
      end
    },
    {
      icon = 'layout',
      description = 'Floating: Open',
      run = function()
        editor.invokeCommand('Open: Floating Page')
      end
    },
    {
      icon = 'file-plus', -- https://feathericons.com/
      description = 'Insert Tree-Tree',
      -- mobile =  true,
      run = function()
        editor.invokeCommand('Tree-Tree Picker: Insert')
      end
    },
    {
      icon = 'book',
      description = 'Open Tree-Tree',
      run = function()
        editor.invokeCommand('Tree-Tree Picker: Navigate')
      end
    },
    {
      icon = 'terminal',
      description = 'Run command',
      run = function()
        editor.invokeCommand('Open Command Palette')
      end
    },
  }
}
```

#SB_itself