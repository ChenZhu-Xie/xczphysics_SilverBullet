

This text should turn blue #blue

```space-style
   /* https://community.silverbullet.md/t/custom-css-for-ttrpg-statblocks/2509/9 */
 
@import {
  .sb-hashtag[data-tag-name="blue"]:has(.sb-highlight) + .sb-highlight,
  .sb-hashtag[data-tag-name="blue"]:has(.sb-highlight, + .sb-highlight) > .sb-highlight,
  .sb-hashtag[data-tag-name="blue"]:has(.sb-highlight) + .sb-highlight + .sb-meta.sb-highlight,
  .sb-meta.sb-highlight:has(+ .sb-hashtag[data-tag-name="blue"]) {
    background-color: blue !important;
  }
  
  .sb-hashtag[data-tag-name="blue"]:has(.sb-highlight) + .sb-highlight {
    display:inline-block;
    text-indent: -1ch;
  }
  
  .sb-hashtag[data-tag-name="blue"]:has(.sb-highlight, + .sb-highlight):not(:has( + .sb-highlight + .sb-highlight.sb-meta)) {
    display: none;
  }
}
```

Colors ${Red("red")} and ${Green("green")} and ${Blue("blue!")}.

```space-lua
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