
1. https://community.silverbullet.md/t/permanent-dark-mode/370/8
2. https://community.silverbullet.md/t/changing-favicon-darkmode/836/33?u=chenzhu-xie
3. https://silverbullet.md/API/clientStore

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    local theme = clientStore.get("theme")
    if theme == nil then
      if js.window.matchMedia('(prefers-color-scheme: dark)').matches then
        theme = "dark"
      else
        theme = "white"
      end
      function capitalize(str)
        return (str:gsub("^%l", string.upper))
      end
      editor.flashNotification("Current Theme: " .. capitalize(theme))
    else
      editor.flashNotification("current theme: " .. theme)
    end
    if theme ~= "dark" then
      clientStore.set("theme", "dark")
      editor.reloadUI()
    end
  end
}
```
