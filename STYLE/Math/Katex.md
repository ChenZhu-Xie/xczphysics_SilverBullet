
If ${latex.inline[[S]]} is a set, ${latex.inline[[\circ]]} is a binary operation on ${latex.inline[[S]]}, and ${latex.inline[[e \in S]]}, then ${latex.inline[[G = (S, e, \circ)]]} is called a *group* if

1. ${latex.inline[[\forall a, b \in G, \quad a \circ \ b \in G]]} (completeness);
2. ${latex.inline[[(ab)c = a(bc), \quad \forall a,b,c \in S]]} (associativity);
3. ${latex.inline[[\exists e \in S]]} such that ${latex.inline[[ae=a=ea, \quad \forall a \in S]]} (identity);
4. ${latex.inline[[\forall a \in S, \quad \exists b \in S]]} such that ${latex.inline[[ab=e=ba]]} (inverse).

The Fourier transform of a complex-valued (Lebesgue) integrable function ${latex.inline[[f(x)]]} on the real line, is the complex valued function ${latex.inline[[\hat {f}(\xi )]]}, defined by the integral
${latex.block[[\widehat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\ e^{-i 2\pi \xi x}\,dx, \quad \forall \xi \in \mathbb{R}.]]}
1. https://community.silverbullet.md/t/mathematical-expressions/421/14
2. https://github.com/silverbulletmd/silverbullet-katex
3. https://community.silverbullet.md/t/how-to-center-latex-formulas-and-mermaid-diagrams/3018

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
    html = "<span>" .. latex.header .. html .. "</span>"
  }
end

function latex.block(expression)
  local html = latex.katex.renderToString(expression, {
    trust = true,
    throwOnError = false,
    displayMode = true
  })
  
  return widget.new {
    html = "<span>" .. latex.header .. html .. "</span>"
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
