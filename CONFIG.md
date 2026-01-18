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
  -- mobileMenuStyle = 'bottom-bar', -- or 'hamburger'
  mobileMenuStyle = 'hamburger',
  actionButtons = {
    -- {
    --   icon = "home",
    --   description = "Go to the index page",
    --   priority = 3,
    --   run = function()
    --     editor.invokeCommand "Navigate: Home"
    --   end
    -- },
    {
      icon = 'book',
      description = 'Open Tree-Tree',
      priority = 3,
      run = function()
        editor.invokeCommand('Tree-Tree Picker: Navigate')
      end
    },
    {
      icon = "terminal",
      description = "Run command",
      priority = 1,
      run = function()
        editor.invokeCommand "Open Command Palette"
      end,
    }
  },
}

actionButton.define {
  icon = 'plus-square', -- https://feathericons.com/
  description = 'Insert Tree-Tree',
  -- mobile =  true,
  run = function()
    editor.invokeCommand('Tree-Tree Picker: Insert')
  end
}

-- actionButton.define {
--   -- Love for Silversearch
--   icon = 'search',
--   description = 'Search for words in space',
--   run = function()
--     editor.invokeCommand('Silversearch: Search')
--   end
-- }

actionButton.define {
  -- Global Search
  icon = 'zoom-in',
  description = 'Global Search',
  run = function()
    editor.invokeCommand('Global Search')
  end
}

-- actionButton.define {
--   -- https://v2.silverbullet.md/Library/Std/Page%20Templates/Quick%20Note
--   icon = 'calendar',
--   description = 'Quick Note', 
--   -- mobile =  true,
--   run = function()
--     editor.invokeCommand('Quick Note')
--   end
-- }

-- actionButton.define {
--   -- https://v2.silverbullet.md/Library/Std/Page%20Templates/Quick%20Note
--   icon = 'calendar',
--   description = 'Journal: Floating Calendar', 
--   -- mobile =  true,
--   run = function()
--     editor.invokeCommand('Journal: Floating Calendar')
--   end
-- }

-- actionButton.define {
--   icon = 'trash',
--   description = 'Page: Delete', 
--   -- mobile =  true,
--   run = function()
--     editor.invokeCommand('Page: Delete')
--   end
-- }

-- actionButton.define {
--   icon = 'delete',
--   description = 'Delete Line', 
--   -- mobile =  true,
--   run = function()
--     editor.invokeCommand('Delete Line')
--   end
-- }

actionButton.define {
  icon = 'layout',
  description = 'Open: Floating Page',
  run = function()
    editor.invokeCommand('Floating: Open')
  end
}

-- actionButton.define {
--   icon = "chevrons-up",
--   description = "Scroll: to Top",
--   run = function()
--     editor.invokeCommand("Scroll: to Top")
--   end
-- }

-- actionButton.define {
--   icon = "chevrons-down",
--   description = "Scroll: to Bottom",
--   run = function()
--     editor.invokeCommand("Scroll: to Bottom")
--   end
-- }

actionButton.define {
  icon = "file-plus",
  description = "Page: New Sibling",
  run = function()
    editor.invokeCommand("Page: New Sibling")
  end
}

actionButton.define {
  icon = "folder-plus",
  description = "Page: New",
  run = function()
    editor.invokeCommand("Page: New")
  end
}

actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}

-- actionButton.define {
--   icon = "folder",
--   description = "Toggle Document Explorer",
--   run = function()
--     editor.invokeCommand("Navigate: Toggle Document Explorer")
--   end
-- }

actionButton.define {
  mobile = config.get('readOnly').mobileOnlyActionButton,
  icon = editor.getUiOption("forcedROMode") and config.get('readOnly').enabledIcon or config.get('readOnly').disabledIcon,
  description = editor.getUiOption("forcedROMode") and "Enable edit mode" or "Enable read-only mode",
  run = function()
    editor.invokeCommand("Toggle Read-Only Mode")
  end
}


actionButton.define {
  icon = "clock",
  description = "Click History: Page Picker",
  run = function()
    editor.invokeCommand("Click History: Page Picker")
  end
}

```

1. [mobile toolbar via hamburger menu](https://community.silverbullet.md/t/mobile-toolbar-via-hamburger-menu/3776?u=chenzhu-xie) #community #silverbullet

```space-style
/* ===== Mobile settings ===== */
@media (max-width: 600px) {
  html {
    --editor-width: 100%;
  }

/* hamburger menu smaller buttons on mobile */
#sb-top .sb-actions.hamburger button:not(.sb-code-copy-button) {
          height: 1.4rem; /* !!!!! adjust height to suit your mobile !!!!!!! */
          margin: 4px 0;
          padding: 4px 0;
  }
}

/* hamburger menu  colors */
#sb-root .sb-actions button {
  color: #a31952e1;
}

/* change backticked and plain triple back tick code block colors */
#sb-editor .sb-code {
    background: #444444 !important;
    color: #8cbdf4;
    text-decoration: none !important;
  }
```

#SB_itself