

${query[[from index.tag "page" 
         where _.Visitimes and _.name != editor.getCurrentPage()
         select {ref=_.ref, Visitimes=_.Visitimes} 
         order by _.Visitimes desc 
         limit 5]]}

`${Visitimes[editor.getCurrentPage()]}`

```space-lua
-- priority: -1
local visitimeStore = visitimeStore or {}

index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "Visitimes" then
        return visitimeStore[self.name]
      end
    end
  }
}

event.listen{
  name = "hooks:renderTopWidgets",
  -- name = "editor:pageLoaded",
  run = function(e)
    local mypage = editor.getCurrentPage()
    visitimeStore[mypage] = (visitimeStore[mypage] or 0) + 1
    editor.flashNotification("Visitimes: " .. visitimeStore[mypage])
  end
}
```