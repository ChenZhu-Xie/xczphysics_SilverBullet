
1. https://community.silverbullet.md/t/permanent-dark-mode/370/8
2. https://community.silverbullet.md/t/changing-favicon-darkmode/836/33?u=chenzhu-xie
3. https://silverbullet.md/API/clientStore

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    if js.window.matchMedia('(prefers-color-scheme: dark)').matches then
      theme = "dark"
    else
      theme = "light"
    end
    function capitalize(str)
      if str == nil or str == "" then return str end
      return str:sub(1,1):upper() .. (str:sub(2) or "")
    end
    editor.flashNotification("Current Theme: " .. capitalize(theme))
    if theme == nil then
      
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

```lua
event.listen {
  name = 'system:ready',
  run = function(e)
    local theme = clientStore.get("theme")
    if theme == nil then
      if js.window.matchMedia('(prefers-color-scheme: dark)').matches then
        theme = "dark"
      else
        theme = "light"
      end
      function capitalize(str)
        if str == nil or str == "" then return str end
        return str:sub(1,1):upper() .. (str:sub(2) or "")
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
