
```space-lua
event.listen {
  name = "editor:pageOpened",
  run = function()
    editor.flashNotification "Hello world!"
  end
}
```