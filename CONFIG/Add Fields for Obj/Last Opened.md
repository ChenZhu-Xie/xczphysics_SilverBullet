```space-lua
event.listen {
  name = "page:Opened",
  run = function()
    editor.flashNotification "Hello world!"
  end
}
```