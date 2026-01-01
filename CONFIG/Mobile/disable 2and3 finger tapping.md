
# disable 2 and 3 finger tapping on mobile

```space-lua
local function ensureTouchBlockerInitialized()
  local window = js.window
  if not window._touchHandlerInitialized then
    window._touchGestureBlocker = function(ev)  
      if window._touchGesturesDisabled then
        if ev.touches.length == 2 or ev.touches.length == 3 then  
          ev.stopPropagation()  
          ev.preventDefault()  
          ev.stopImmediatePropagation()  
  --        local gestureType = (ev.touches.length == 2) and "Two-finger" or "Three-finger"  
         -- editor.flashNotification(gestureType .. " tap blocked")  
        end  
      end
    end  
    
    window.addEventListener("touchstart", window._touchGestureBlocker, { capture = true })  
    window._touchHandlerInitialized = true
  end
end

---

-- 1. TOGGLE COMMAND
command.define {  
  name = "Touch: Toggle Gestures",  
  run = function()  
    local window = js.window
    ensureTouchBlockerInitialized()
    
    window._touchGesturesDisabled = not window._touchGesturesDisabled
    local status = window._touchGesturesDisabled and "disabled" or "enabled"
    editor.flashNotification("Touch gestures " .. status)  
  end  
}

-- 2. ENABLE COMMAND (Explicit)
command.define {  
  name = "Touch: Enable Gestures",  
  run = function()  
    local window = js.window
    ensureTouchBlockerInitialized()
    
    window._touchGesturesDisabled = false
    editor.flashNotification("Touch gestures enabled")  
  end  
}

-- 3. DISABLE COMMAND (Explicit)
command.define {  
  name = "Touch: Disable Gestures",  
  run = function()  
    local window = js.window
    ensureTouchBlockerInitialized()
    
    window._touchGesturesDisabled = true
    editor.flashNotification("Touch gestures disabled")  
  end  
}
```
