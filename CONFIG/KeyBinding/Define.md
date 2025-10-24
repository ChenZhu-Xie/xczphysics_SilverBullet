
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
    if pageName then
      editor.navigate(pageName)
    end
  end
}

```

1. https://github.com/malys/silverbullet-libraries/blob/main/src/NewChildPage.md

```space-lua
command.define {
  name = "Page: New",
  description = "New Children Page",
  key = "Ctrl-Alt-n",
  run = function()
    local pageName=editor.prompt("Page Name",editor.getCurrentPage().."/")
    editor.navigate(pageName)
  end
}
```

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
  priority = 0
}
```
