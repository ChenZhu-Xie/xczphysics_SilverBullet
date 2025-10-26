
1. https://community.silverbullet.md/t/mathematical-expressions/421/14
2. https://github.com/silverbulletmd/silverbullet-katex

```space-lua
latex = {
  header = [[<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">]],
  katex = js.import("https://cdn.jsdelivr.net/npm/katex@0.16.22/+esm")
}

function latex.inline(expression)  
  local html = latex.katex.renderToString(expression, {
    trust = true,
    throwOnError = false,
    displayMode = false
  })
  
  return widget.new {
    html = "<span>" + latex.header + html + "</span>"
  }
end

function latex.block(expression)
  local html = latex.katex.renderToString(expression, {
    trust = true,
    throwOnError = false,
    displayMode = true
  })
  
  return widget.new {
    html = "<span>" + latex.header + html + "</span>"
  }
end 

slashcommand.define {
  name = "math",
  run = function()
    editor.insertAtCursor("${latex.inline[[]]}", false, true)
    editor.moveCursor(editor.getCursor() - 3)
  end
}

slashcommand.define {
  name = "equation",
  run = function()
    editor.insertAtCursor("${latex.block[[]]}", false, true)
    editor.moveCursor(editor.getCursor() - 3)
  end
}
```

```space-style
.sb-lua-directive-inline:has(.katex-html) {
  border: none !important;
}
```
