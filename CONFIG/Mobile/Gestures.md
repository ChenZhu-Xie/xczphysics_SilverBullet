
1. [touch gestures on mobile](https://community.silverbullet.md/t/touch-gestures-on-mobile/3642?u=chenzhu-xie) #community #silverbullet

```space-lua
local startX = nil
local startY = nil

js.window.addEventListener("touchstart", function(e)
  startX = e.touches[1].clientX
  startY = e.touches[1].clientY
end)

js.window.addEventListener("touchend", function(e)
  if startX == nil or startY == nil then return end

  local diffX = startX - e.changedTouches[1].clientX
  local diffY = startY - e.changedTouches[1].clientY

  if math.abs(diffX) > math.abs(diffY) then
    if diffX > 40 then
      event.dispatch("gesture", {dir = "left"})
    elseif diffX < -40 then
      event.dispatch("gesture", {dir = "right"})
    end
  end
  
  startX = nil
  startY = nil
end)

event.listen {
  name = "gesture",
  run = function(e)
    local dir = e.data.dir
    if dir == "left" then
      editor.invokeCommand("Outline: Move Left")
    elseif dir == "right" then
      editor.invokeCommand("Outline: Move Right")
    end
  end
}
```
