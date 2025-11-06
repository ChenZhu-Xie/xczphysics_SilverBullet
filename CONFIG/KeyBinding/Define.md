---
recommend: ⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/KeyBinding/Define.md"
udpateDate: 2025-10-27
---

# Define Common used Commands

## Line: Move Up/Down

1. editor.toggleComment() https://silverbullet.md/API/editor
2. Extracting from [[SB Basics/SB API/editor]]

```space-lua
command.define {
  name = "Line: Move Up",
  run = function()
    editor.moveLineUp()
  end,
  key = "Shift-Alt-ArrowUp",
  mac = "Shift-Alt-ArrowUp",
  priority = 1,
}
```

```space-lua
command.define {
  name = "Line: Move Down",
  run = function()
    editor.moveLineDown()
  end,
  key = "Shift-Alt-ArrowDown",
  mac = "Shift-Alt-ArrowDown",
  priority = 1,
}
```

## Line: Toggle Comment

1. editor.toggleComment() https://silverbullet.md/API/editor

```space-lua
command.define {
  name = "Line: Toggle Comment",
  run = function()
    editor.toggleComment()
  end,
  key = "Shift-Alt-m",
  mac = "Shift-Alt-m",
  priority = 1,
}
```

## Page: New Sibling Page

1. https://chatgpt.com/g/g-p-68bb175bf6f48191b504746c0931128f-silverbullet-xue-xi/c/68fa0666-93d0-832a-b5cd-7d4d808a0b48

```space-lua
command.define {
  name = "Page: New Sibling",
  description = "New Sibling Page",
  key = "Ctrl-Alt-s",
  run = function()
    local current = editor.getCurrentPage()
    local lastSlash = current:match("^(.*)/[^/]*$") or ""
    local pageName = editor.prompt("Sibling Page Name", lastSlash.."/")
    if pageName then editor.navigate(pageName) end
  end
}
```

## Page: New Children Page

1. https://github.com/malys/silverbullet-libraries/blob/main/src/NewChildPage.md
2. https://community.silverbullet.md/t/folder-auto-complete/686/11?u=chenzhu-xie

```space-lua
command.define {
  name = "Page: New",
  description = "New Children Page",
  key = "Ctrl-Alt-n",
  run = function()
    local pageName = editor.prompt("Page Name",editor.getCurrentPage().."/")
    if pageName then editor.navigate(pageName) end
  end
}
```

## Navigate: CONFIG

1. https://community.silverbullet.md/t/either-key-bindings-or-plugs-in-config-not-working/3184
2. https://community.silverbullet.md/t/capslock-shortcut-keys-containing-letter-fail/3194

```lua
command.define {
  name = "Navigate: CONFIG",
  run = function()
    editor.navigate "CONFIG"
  end,
  key = "Ctrl-Alt-c",
  mac = "Cmd-Alt-c",
  priority = 1,
}
```
