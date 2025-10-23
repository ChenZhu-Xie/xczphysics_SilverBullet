
1. https://github.com/malys/silverbullet-libraries/blob/main/src/NewChildPage.md

```space-lua
command.define {
  name = "new page",
  description = "new children page",
  key = "Alt-Ctrl-n",
  run = function()
    local pageName=editor.prompt("page name",editor.getCurrentPage().."/")
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
