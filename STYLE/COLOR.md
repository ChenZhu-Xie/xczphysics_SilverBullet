*D*
_D_
?{blue}

```space-style
@import {
  /* 给 data-tag-name="blue" 的 hashtag 上色 */
  .sb-hashtag[data-tag-name="blue"] {
    color: blue;
    font-weight: bold;
  }

  /* 可选：紧跟的 highlight 背景变浅蓝 */
  .sb-hashtag[data-tag-name="blue"] + .sb-highlight {
    background-color: #ccf;
  }
}
```