
1. https://community.silverbullet.md/t/permanent-dark-mode/370/8
2. https://community.silverbullet.md/t/changing-favicon-darkmode/836/34
3. https://silverbullet.md/API/clientStore

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    local theme = clientStore.get("theme")
    if theme == nil then
      local mquery = js.window.matchMedia('(prefers-color-scheme: dark)')
      editor.flashNotification("Current theme: " .. mquery)
    else
      editor.flashNotification("Current: " .. theme)
    end
    
    if clientStore.get("theme") ~= "dark" then
      clientStore.set("theme", "dark")
      -- editor.reloadUI()
    end
  end
}
```
