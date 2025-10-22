
有点像 浏览器的 Ctrl + N 或 Ctrl + Shift + N

1. https://community.silverbullet.md/t/live-rendering-mermaid-or-plugs/3427/2?u=chenzhu-xie

# Sidebar: Open Page

```space-lua
command.define {
  name = "Sidebar: Open Page",
  key = "Ctrl-Alt-ArrowRight",
  run = function()
    local allPages = query[[
      from index.tag "page"
      order by _.lastModified desc]]
    local page = editor.filterBox('➡️', allPages, "Select the page to open aside")
    if page != nil then
      editor.showPanel("rhs", 2, [[<iframe src = ]] .. page.name .. [[ style = "height: 98vh; width: 100%; border: 0;" />]])
    end
  end
}
```

# Sidebar: Close

```space-lua
command.define {
  name = "Sidebar: Close",
  key = "Ctrl-Alt-ArrowLeft",
  run = function()
    editor.hidePanel("rhs")
  end
}
```
