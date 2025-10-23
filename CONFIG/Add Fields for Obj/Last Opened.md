```space-lua
event.listen {
  name = "page:Click",
  run = function()
    editor.flashNotification(editor.goHistory())
  end
}
```