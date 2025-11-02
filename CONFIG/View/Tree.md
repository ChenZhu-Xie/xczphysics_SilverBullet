
```lua
config.set("plugs", { -- 注意，哪怕是 config.set() 也会相互覆盖
    -- "treeview.plug.js" -- 这个「本地相对路径」可以用
    -- "_plug/treeview.plug.js"
    -- "file:/_plug/treeview.plug.js"
    -- "file://.space/_plug/treeview.plug.js"
    -- "github:joekrill/silverbullet-treeview/treeview.plug.js",
    -- "ghr:MrMugame/silversearch" -- 由于会相互覆盖，多插件须写在同一个 config.set 下
  })
```

# Responsive inhancement

1. https://community.silverbullet.md/t/responsive-treeview/2188

# actionButton

```space-lua
actionButton.define {
  icon = "sidebar",
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand("Tree View: Toggle")
  end
}
```

```lua
actionButton.define {
  icon = "layout", 
  description = "Toggle Tree View",
  run = function()
    editor.invokeCommand "Tree View: Toggle Move&Resize"
  end
}
```

```lua
command.update {
  name = "Tree View: Toggle",
  run = function()
    editor.invokeCommand "Tree View: Toggle"
    js.import("/.fs/Library/PanelDragResize.js").enableDrag()
  end,
  key = "Ctrl-Alt-b",
  mac = "Cmd-Alt-b",
  priority = 0
}
```

# TreeView.ini

1. https://github.com/joekrill/silverbullet-treeview

```space-lua
config.set (
  "treeview", {
    -- Determines where the panel is displayed:
    -- - "lhs" - left hand side
    -- - "rhs" - right hand side
    -- - "bhs" - bottom
    -- - "modal" - in a modal
    position = "bhs",
  }
)
```

```
config.set (
  "treeview", {
    -- Determines where the panel is displayed:
    -- - "lhs" - left hand side
    -- - "rhs" - right hand side
    -- - "bhs" - bottom
    -- - "modal" - in a modal
    position = "bhs",

    -- Must be > 0.
    -- position = "lhs" | "rhs": determines the width of the panel.
    -- position = "modal": sets the margin around the modal window.
    -- position = "bhs": No effect
    size=0.5,

    dragAndDrop = {
      -- Set to false to disable drag-and-drop
      enabled = true,

      -- Set to false to disable the confirmation prompt shown when dragging and
      -- dropping pages that causes them to be renamed/moved.
      confirmOnRename = true
    },

    -- An array of exclusion rules that will exclude pages from being
    -- displayed in the sidebar.
    exclusions = {
      {
        -- Filter by regular expression:
        type = "regex",
        -- Regular Expression string to exclude pages from the tree
        -- Examples:
        -- - Any page that is all-caps: "^[A-Z]+$"
        -- - A specific set of pages: "^(?:CONFIG|Library|index).*$"
        -- - Any path containing Hidden (e.g. test/Hidden/page1): "Hidden"
        rule="^(?:CONFIG|Library|index).*$",
        -- Optional: set to true to negate the rule, only showing pages that match this regex.
        negate= false,
      },
      {
        -- Filter by page tags:
        type = "tags",
        tags = {"meta"},
        -- Optional: set to true to negate the rule, only showing pages that include any of the tags.
        negate = false
      }
    }
  }
)
```

# Style

1. https://community.silverbullet.md/t/responsive-treeview/2188

```space-style
html {
  --treeview-phone-height: 25vh;
  --treeview-tablet-width: 25vw;
  --treeview-tablet-height: 100vh;
  --treeview-desktop-width: 20vw; 
}

.sb-bhs {
  height: var(--treeview-phone-height);
}

.tree__label > span {
  font-size: calc(14px + 0.5vh); 
}

@media (min-width: 960px) {
  #sb-root:has(.sb-bhs) #sb-main,
  #sb-root:has(.sb-bhs) #sb-top {
    margin-left: var(--treeview-tablet-width);
  }

  .sb-bhs {
    position: fixed;
    left: 0;
    height: var(--treeview-tablet-height);
    width: var(--treeview-tablet-width);
    border-right: 1px solid var(--top-border-color);
  }
}

@media (min-width: 1440px) {
  #sb-root:has(.sb-bhs) #sb-main,
  #sb-root:has(.sb-bhs) #sb-top {
    margin-left: var(--treeview-desktop-width);
  }

  .sb-bhs {
    width: var(--treeview-desktop-width);
  }
}
```


# Initialize


```lua
event.listen {
  -- name = 'system:ready',
  name = 'editor:init',
  run = function(e)
    editor.invokeCommand "Tree View: Toggle"
    js.import("/.fs/Library/PanelDragResize.js").enableDrag()
  end
}
```


