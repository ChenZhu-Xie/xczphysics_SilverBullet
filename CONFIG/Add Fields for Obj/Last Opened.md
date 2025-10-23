
```space-lua
event.listen {
  name = "page:open",
  run = function()
    editor.flashNotification "Hello world!"
  end
}
```