---
dontRenderTable: true
---



# ban table render on specific page

1. https://community.silverbullet.md/chat/c/-/2/6745
2. https://community.silverbullet.md/chat/c/-/2/6751

```space-lua
event.listen{
  name="editor:pageLoaded",
  run = function(e)
    local m = editor.getCurrentPageMeta()
    if m.dontRenderTable == true then
      local status = editor.getUiOption('markdownSyntaxRendering')
      if status == false then
        editor.setUiOption("markdownSyntaxRendering", true)
        editor.rebuildEditorState()
        return
      end
    else
      editor.setUiOption("markdownSyntaxRendering", false)
      editor.rebuildEditorState()
      return
    end
  end
}
```

| Header A | Header B |
|----------|----------|
| Cell A | Cell B |


