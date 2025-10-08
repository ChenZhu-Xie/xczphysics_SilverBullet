
1. https://community.silverbullet.md/t/either-key-bindings-or-plugs-in-config-not-working/3184
2. https://community.silverbullet.md/t/capslock-shortcut-keys-containing-letter-fail/3194

```space-lua
command.update {
  name = "Page: Delete",
  key = "Ctrl-Alt-d",
  mac = "Cmd-Alt-d",
  priority = 0
}

command.update {
  name = "Navigate: Page Picker",
  key = "Ctrl-l",
  mac = "Cmd-l",
  priority = 0
}

command.update {
  name = "Navigate: Home",
  key = "Ctrl-h",
  mac = "Cmd-h",
  priority = 0
}
```