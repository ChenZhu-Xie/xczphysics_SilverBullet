---
name: CONFIG/KeyBinding/Define
tags: meta/library
pageDecoration.prefix: "⌨️ "
---

# Define Commonly-used Commands

## Scroll

### to Top

```space-lua
command.define {
  name = "Scroll: to Top",
  run = function()
    editor.moveCursor(0, true)
  end,
  key = "Ctrl-ArrowUp",
  mac = "Ctrl-ArrowUp",
  priority = 1,
}
```

### to Bottom

```space-lua
command.define {
  name = "Scroll: to Bottom",
  run = function()
    local text = editor.getText()
    editor.moveCursor(#text, true)
  end,
  key = "Ctrl-ArrowDown",
  mac = "Ctrl-ArrowDown",
  priority = 1,
}
```

## Line

### Move Up

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

### Move Down

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

## Text: Toggle Comment

1. editor.toggleComment() https://silverbullet.md/API/editor
- 之所以是 Text: 而不是 Line: ，是因为 可以选中多行，
  - 类似的还有 [[STYLE/Builtin_Formats#Quote Selection: > ...]]
  - [[STYLE/Builtin_Formats#Number Listify Selection: 1. text]]
  - [[STYLE/Builtin_Formats#Listify Selection: * text]]

```space-lua
command.define {
  name = "Text: Toggle Comment",
  run = function()
    editor.toggleComment()
  end,
  key = "Shift-Alt-m",
  mac = "Shift-Alt-m",
  priority = 1,
}
```

## Page 

### New Sibling

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

### New Child

1. https://github.com/malys/silverbullet-libraries/blob/main/src/NewChildPage.md
2. https://community.silverbullet.md/t/folder-auto-complete/686/11?u=chenzhu-xie

```space-lua
command.define {
  name = "Page: New",
  description = "New Child Page",
  key = "Ctrl-Alt-Shift-n",
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
