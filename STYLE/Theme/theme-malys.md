---
pageDecoration:
  prefix: "🎄 "
  disableTOC: true
githubUrl: "https://github.com/malys/silverbullet-libraries/blob/main/src/Theme/theme-malys.md"
---

# (Modified) Malys theme

Dark theme thought for readibility and productivity.

## Example
# 1 
## 2
### 3
#### 4
##### 5
###### 6

`code`

*emphasis*

**strong**

## Editor

html {
  --ui-font: ui-sans-serif, sans-serif !important;
  --editor-font: ui-sans-serif, sans-serif !important;
  --editor-width: 1100px !important;
  line-height: 1 !important;
}

.sb-line-h1::before {
  content: "h1";
  margin-right: 0.5em;
  font-size: 0.5em !important;
}

.sb-line-h2::before {
  content: "h2";
  margin-right: 0.5em;
  font-size: 0.5em !important;
}

.sb-line-h3::before {
  content: "h3";
  margin-right: 0.5em;
  font-size: 0.5em !important;
}

.sb-line-h4::before {
  content: "h4";
  margin-right: 0.5em;
  font-size: 0.5em !important;
}

.sb-line-h5::before {
  content: "h5";
  margin-right: 0.5em;
  font-size: 0.5em !important;
}

.sb-line-h6::before {
  content: "h6";
  margin-right: 0.5em;
  font-size: 0.5em !important;
}

```space-style

.markmap {
  --markmap-text-color: #BBDEFB !important;
}

.sb-code {
  color: grey !important;
}
.sb-emphasis {
  color: darkorange !important;
}
.sb-strong {
  color: salmon !important;
}

html {
  --treeview-phone-height: 25vh;
  --treeview-tablet-width: 25vw;
  --treeview-tablet-height: 100vh;
  --treeview-desktop-width: 20vw; 
}

.sb-bhs {
  height: var(--treeview-phone-height);
}
```

.sb-line-h1 {
  font-size: 1.8em !important;
  color: #ee82ee !important;
}
.sb-line-h2 {
  font-size: 1.6em !important;
  color: #6a5acd !important;
}
.sb-line-h3 {
   font-size: 1.4em !important;
  color: #4169e1 !important;
}
.sb-line-h4 {
  font-size: 1.2em !important;
  color: #008000 !important;
}
.sb-line-h5 {
  font-size: 1em !important;
  color: #ffff00 !important;
}
.sb-line-h6 {
  font-size: 1em !important;
  color: #ffa500 !important;
}

```style
html[data-theme="dark"] {
  .sb-line-h1 { font-size: 1.8em !important; color: #e6b3ff !important; } /* 淡紫亮调 */
  .sb-line-h2 { font-size: 1.6em !important; color: #b8b0ff !important; } /* 柔和蓝紫 */
  .sb-line-h3 { font-size: 1.4em !important; color: #89b4ff !important; } /* 浅蓝 */
  .sb-line-h4 { font-size: 1.2em !important; color: #8fe1b5 !important; } /* 青绿 */
  .sb-line-h5 { font-size: 1em !important;  color: #f0e68c !important; } /* 柔黄 */
  .sb-line-h6 { font-size: 1em !important;  color: #ffbb66 !important; } /* 暖橙 */
}

html[data-theme="light"] {
  .sb-line-h1 { font-size: 1.8em !important; color: #7a3fbf !important; } /* 深紫 */
  .sb-line-h2 { font-size: 1.6em !important; color: #4b4bb8 !important; } /* 靛蓝 */
  .sb-line-h3 { font-size: 1.4em !important; color: #1a73e8 !important; } /* 经典蓝 */
  .sb-line-h4 { font-size: 1.2em !important; color: #008c6f !important; } /* 蓝绿 */
  .sb-line-h5 { font-size: 1em !important;  color: #b59b00 !important; } /* 暖金 */
  .sb-line-h6 { font-size: 1em !important;  color: #e67e22 !important; } /* 柔橙 */
}

```

```space-style
html[data-theme="dark"] {
  /* H1：暖橙 */
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: #ffbb66 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #ffbb66, transparent) 1;
  }

  /* H2：柔黄 */
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: #f0e68c !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #f0e68c, transparent) 1;
  }

  /* H3：青绿 */
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: #8fe1b5 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #8fe1b5, transparent) 1;
  }

  /* H4：浅蓝 */
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: #89b4ff !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #89b4ff, transparent) 1;
  }

  /* H5：柔和蓝紫 */
  .sb-line-h5 {
    font-size: 1em !important;
    color: #b8b0ff !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #b8b0ff, transparent) 1;
  }

  /* H6：淡紫亮调 */
  .sb-line-h6 {
    font-size: 1em !important;
    color: #e6b3ff !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #e6b3ff, transparent) 1;
  }
}

html[data-theme="light"] {
  /* H1：柔橙 */
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: #e67e22 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #e67e22, transparent) 1;
  }

  /* H2：暖金 */
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: #b59b00 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #b59b00, transparent) 1;
  }

  /* H3：蓝绿 */
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: #008c6f !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #008c6f, transparent) 1;
  }

  /* H4：经典蓝 */
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: #1a73e8 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #1a73e8, transparent) 1;
  }

  /* H5：靛蓝 */
  .sb-line-h5 {
    font-size: 1em !important;
    color: #4b4bb8 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #4b4bb8, transparent) 1;
  }

  /* H6：深紫 */
  .sb-line-h6 {
    font-size: 1em !important;
    color: #7a3fbf !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #7a3fbf, transparent) 1;
  }
}

```

## Treeview
```
.tree__label > span {
  font-size: calc(11px + 0.1vh);
}

@media (min-width: 960px) {
  #sb-root:has(.sb-lhs) #sb-main,
  #sb-root:has(.sb-lhs) #sb-top {
    margin-left: var(--treeview-tablet-width);
  }

  .sb-lhs {
    position: fixed;
    left: 0;
    height: var(--treeview-tablet-height);
    width: var(--treeview-tablet-width);
    border-right: 1px solid var(--top-border-color);
  }
}

@media (min-width: 1440px) {
  #sb-root:has(.sb-lhs) #sb-main,
  #sb-root:has(.sb-lhs) #sb-top {
    margin-left: var(--treeview-desktop-width);
  }

  .sb-lhs {
    width: var(--treeview-desktop-width);
  }
}
```

```
.tree__label > span {
    padding: 0 5px;
    font-size: 11px;
    line-height: 1.2;
}
.treeview-root {
    --st-label-height: auto;
    --st-subnodes-padding-left: 0.1rem;
    --st-collapse-icon-height: 2.1rem;
    --st-collapse-icon-width: 1.25rem;
    --st-collapse-icon-size: 1rem;
}
```

## Outline

```space-style
div.cm-scroller {
  scroll-behavior: smooth;
  scrollbar-width: thin;
}
```
