# Rounded Code Snippets
![](https://community.silverbullet.md/uploads/default/original/2X/6/660e0ae6a4321c3a1ace33cc2cab873e31c931dd.jpeg)

```
/* first line - editing */
div:not(.sb-line-fenced-code) + .sb-line-fenced-code {
  border-radius: 8px 8px 0px 0px;
  padding-top: 15px !important;
  padding-right: 10px !important;
}

/* only one line */
div:not(.sb-line-fenced-code) + .sb-line-fenced-code:not(:has(+ .sb-line-fenced-code)) {
  border-radius: 8px;
}

.sb-line-fenced-code:not(.sb-fenced-code-iframe) {
  padding-left: 15px !important;
  padding-right: 10px !important;
}

/* last line - editing  */
.sb-line-fenced-code.cm-line:not(:has(+ .sb-line-fenced-code)) {
  border-radius: 0px 0px 8px 8px;
}
```

1. https://community.silverbullet.md/t/space-style-snippets-showcase/2200/4
