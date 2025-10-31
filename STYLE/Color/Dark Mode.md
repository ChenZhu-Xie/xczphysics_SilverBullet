
1. https://community.silverbullet.md/t/permanent-dark-mode/370/8
2. https://community.silverbullet.md/t/changing-favicon-darkmode/836/34
3. https://silverbullet.md/API/clientStore

```
event.listen {
  name = 'system:ready',
  run = function(e)
    local theme = clientStore.get("theme")
    print("Current theme: " .. theme)
    clientStore.set("theme", "dark")
    -- editor.reloadUI()
  end
}
```
