```space-lua
event.listen {
  name = "page:Click",
  run = function()
    print(editor.goHistory())
  end
}
```