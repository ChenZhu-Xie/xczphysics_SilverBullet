
1. https://community.silverbullet.md/t/permanent-dark-mode/370/8
2. https://community.silverbullet.md/t/changing-favicon-darkmode/836/33?u=chenzhu-xie
3. https://silverbullet.md/API/clientStore

```space-lua
event.listen {
  name = 'system:ready',
  run = function(e)
    local theme = clientStore.get("theme")
    if theme == nil then
      local mquery = js.window.matchMedia('(prefers-color-scheme: dark)').matches
      editor.flashNotification("Current theme: " .. mquery)
    else
      editor.flashNotification("Current: " .. theme)
    end
    
    
  end
}
```
