```space-lua
event.listen {
  name = "page:click",
  run = function()
     print(editor.getCurrentPageMeta())
  end
}
```