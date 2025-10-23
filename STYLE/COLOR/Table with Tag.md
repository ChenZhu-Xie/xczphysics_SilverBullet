This text should turn blued #blue

1. https://community.silverbullet.md/t/custom-css-for-ttrpg-statblocks/2509/9
2. https://chatgpt.com/share/68c5a24b-db7c-8010-8178-43e725691479

```space-style
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