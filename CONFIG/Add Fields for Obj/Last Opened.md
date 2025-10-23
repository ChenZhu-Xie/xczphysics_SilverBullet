```space-lua
event.listen {
  name = "page:click",
  run = function()
    print(editor.goHistory())
  end
}
```