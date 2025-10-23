
```space-lua
event.listen {
  name = "page:opened",
  run = function()
    editor.flashNotification "Hello world!"
  end
}
```