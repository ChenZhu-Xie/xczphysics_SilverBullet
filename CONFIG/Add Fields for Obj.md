

${query[[from index.tag "page" 
         where _.Visitimes and _.name != editor.getCurrentPage()
         select {ref=_.ref, Visitimes=_.Visitimes} 
         order by _.Visitimes desc 
         limit 5]]}

`${Visitimes[editor.getCurrentPage()]}`

```lua
-- priority: -1
local Visitimes = Visitimes or {}

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "Visitimes" then
        return Visitimes[self.name]
      end
    end
  }
}

event.listen{
  -- name = "hooks:renderTopWidgets",
  name = "editor:pageLoaded",
  run = function(e)
    local mypage = editor.getCurrentPage()
    Visitimes[mypage] = (Visitimes[mypage] or 0) + 1
    editor.flashNotification("Visitimes: " .. Visitimes[mypage])
  end
}
```