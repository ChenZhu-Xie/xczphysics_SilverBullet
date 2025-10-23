```space-lua
event.listen {
  name = "page:click",
  run = function()
    editor.flashNotification(editor.goHistory())
  end
}
```