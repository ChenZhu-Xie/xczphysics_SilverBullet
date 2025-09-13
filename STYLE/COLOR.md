
Colors ${Red("red")} and ${Green("green")} and ${Blue("blue!")}.

```space-lua
   ---- https://community.silverbullet.md/t/custom-css-for-ttrpg-statblocks/2509/9

function Red(text)
  return widget.html(dom.span {
    style="color:red; font-weight: bold;",
    text
  })
end
function Green(text)
  return widget.html(dom.span {
    style="color:green; font-weight: bold;",
    text
  })
end
function Blue(text)
  return widget.html(dom.span {
    style="color:blue; font-weight: bold;",
    text
  })
end
```