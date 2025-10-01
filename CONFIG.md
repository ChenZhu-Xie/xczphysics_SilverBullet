This is where you configure SilverBullet to your liking. See [[^Library/Std/Config]] for a full list of configuration options.

1. https://github.com/joekrill/silverbullet-treeview

```space-lua
config.set {
  plugs = {
    "github:joekrill/silverbullet-treeview/treeview.plug.js",
  },
}
```

1. https://github.com/silverbulletmd/silverbullet-libraries/blob/main/Git.md

```space-lua
config.set {
  git = {
    autoSync = 60 * 24, -- 只在启动的时候同步一次（设置超大间隔）
  },
}
```
