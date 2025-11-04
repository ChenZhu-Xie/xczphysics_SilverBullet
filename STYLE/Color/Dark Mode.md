---
recommend: ⭐⭐⭐⭐⭐
udpateDate: 2025-11-03
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/STYLE/Color/Dark%20Mode.md"
---

1. https://community.silverbullet.md/t/changing-favicon-darkmode/836/27?u=chenzhu-xie
2. [[SB Basics/SB API/editor#editor.setUiOption()]]
 - https://enlarge-the-percentage.fly.dev/SB%20Basics/SB%20API/editor#editor.setUiOption()
 - <https://enlarge-the-percentage.fly.dev/SB%20Basics/SB%20API/editor#editor.setUiOption()>
   - comes from https://community.silverbullet.md/t/silverbullet-2-2-released/3482?u=chenzhu-xie
     - 

```space-lua
event.listen {
  -- name = 'system:ready',
  name = 'editor:init',
  run = function(e)
    if clientStore.get("darkMode") then
      editor.flashNotification("Current Theme: Dark")
    else
      editor.flashNotification("Current Theme: Light")
      clientStore.set("darkMode", true)
      editor.reloadUI()
    end
  end
}
```

1. https://silverbullet.md/Index%20Page
1. https://community.silverbullet.md/t/permanent-dark-mode/370/9?u=chenzhu-xie

```lua
-- priority: -1
event.listen {
  -- name = "editor:pageLoaded",
  name = "hooks:renderTopWidgets",
  run = function(e)
    if not clientStore.get("darkMode") then
      clientStore.set("darkMode", true)
      editor.reloadUI()
    end
  end
}
```

1. https://community.silverbullet.md/t/permanent-dark-mode/370/8?u=chenzhu-xie
2. https://silverbullet.md/API/event#event.listEvents()

```lua
event.listen {
  -- name = 'system:ready',
  name = 'editor:init',
  run = function(e)
    if clientStore.get("darkMode") then
      editor.flashNotification("Current Theme: Dark")
    else
      editor.flashNotification("Current Theme: Light")
      clientStore.set("darkMode", true)
      editor.reloadUI()
    end
    
    local events = event.listEvents()
    for _, eventName in ipairs(events) do
        print("Registered event: " .. eventName)
    end
  end
}
```

1. https://community.silverbullet.md/t/permanent-dark-mode/370/8
2. https://community.silverbullet.md/t/changing-favicon-darkmode/836/33?u=chenzhu-xie
3. https://silverbullet.md/API/clientStore

```lua
event.listen {
  -- name = 'system:ready',
  name = 'editor:init',
  run = function(e)
    if js.window.matchMedia('(prefers-color-scheme: dark)').matches then
      editor.flashNotification("Current Theme: Dark")
    else
      editor.flashNotification("Current Theme: Light")
      editor.invokeCommand "Editor: Toggle Dark Mode"
    end
  end
}
```

1. `string.upper("str")` https://silverbullet.md/API/index#Example

```lua
event.listen {
  -- name = 'system:ready',
  name = 'editor:init',
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
