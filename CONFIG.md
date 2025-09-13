This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

```space-lua
   ---- https://github.com/silverbulletmd/silverbullet-libraries/blob/main/Git.md
 
config.set {
  git = {
    autoSync = 60 * 24, -- 只在启动的时候同步一次（设置超大间隔）
  },
}
```

```space-lua
   ---- https://community.silverbullet.md/t/either-key-bindings-or-plugs-in-config-not-working/3184
   ---- https://community.silverbullet.md/t/capslock-shortcut-keys-containing-letter-fail/3194
 
command.update {
  name = "Page: Delete",
  key = "Ctrl-Alt-d",
  mac = "Cmd-Alt-d",
  priority = 0
}

command.update {
  name = "Navigate: Page Picker",
  key = "Ctrl-Alt-p",
  mac = "Cmd-Alt-p",
  priority = 0
}

command.update {
  name = "Navigate: Home",
  key = "Ctrl-Alt-h",
  mac = "Cmd-Alt-h",
  priority = 0
}

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



