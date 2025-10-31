
1. https://community.silverbullet.md/t/permanent-dark-mode/370/8
2. https://community.silverbullet.md/t/changing-favicon-darkmode/836/34
3. https://silverbullet.md/API/clientStore

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    clientStore.set("theme", "dark")
    editor.reloadUI()
  end
}
```
