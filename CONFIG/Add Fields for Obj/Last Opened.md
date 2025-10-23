
```space-lua
event.listen {
  name = "page:click",
  run = function()
    editor.flashNotification "Hello world!"
  end
}
```