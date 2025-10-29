# Auto-collapsing Frontmatter

```
/* Hiding Frontmatter when not editing */
.sb-frontmatter.sb-line-frontmatter-outside:has(+ .sb-frontmatter) ~ .sb-frontmatter {
    display:none
}

/*Making background same as top*/
.sb-frontmatter {
  background-color: var(--top-background-color) !important;
}

/* First line while editing */
:not(.sb-frontmatter) + .sb-frontmatter:not(.sb-line-frontmatter-outside) {
  padding-top: 5px;
  margin-top: -5px;
}

/* Pad lines while not editing */
.sb-frontmatter:not(.sb-line-frontmatter-outside) {
  padding-left: 10px !important;
}

/* Last line while editing */
.sb-frontmatter:not(:has(+ .sb-frontmatter)) {
  border-radius: 0px 0px 8px 8px;
  padding-bottom: 5px;
}

/* Cursor outside */
.sb-line-frontmatter-outside {
  padding-top: 0px;
  margin-top: -5px;
  border-radius: 0px 0px 8px 8px;
}

/* make frontmatter text same color as script markers */
.sb-frontmatter-marker{
  color: var(--editor-code-info-color);
}
```

1. https://community.silverbullet.md/t/space-style-snippets-showcase/2200/3?u=chenzhu-xie
