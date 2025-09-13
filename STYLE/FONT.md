
- [更改 editor 和 UI 字体](https://community.silverbullet.md/t/how-to-change-editor-and-ui-fonts/752) #SB_Community
  - [space-style 环境](https://community.silverbullet.md/t/how-to-change-editor-and-ui-fonts/752/12?u=chenzhu-xie) #SB_Community
  - [窄页宽，换行，单词也不断开](https://community.silverbullet.md/t/how-to-change-editor-and-ui-fonts/752/9?u=chenzhu-xie) #SB_Community

- [正确的 Url format](https://community.silverbullet.md/t/custom-font-doesnt-work/1237?u=chenzhu-xie) #SB_Community
  - [Lumen Yang2 - woff2 格式](https://community.silverbullet.md/t/custom-font-doesnt-work/1237/2?u=chenzhu-xie) #SB_Community
    - [web性能-字体优化](https://juejin.cn/post/6948611659720032263)
- [Lumen Yang1 - 中英字体 分开设置](https://community.silverbullet.md/t/trying-to-get-custom-font-working/555/9?u=chenzhu-xie) #SB_Community

```space-style
@font-face {
    font-family: 'Inconsolata';
    font-display: swap;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    src: url('/STYLE/FONT/Inconsolata-Medium.woff2') format('woff2');
}

@font-face {
    font-family: 'LXGW Bright';
    font-display: swap;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    src: url('/STYLE/FONT/LXGWBright-Medium.woff2') format('woff2');
}

#sb-root {
   --ui-font: "Inconsolata", "LXGW Bright" !important;
   --editor-font: "Inconsolata", "LXGW Bright" !important;
}

html {
    --top-background-color: #fff;
}
html[data-theme="dark"], html[data-theme="dark"] {
    --top-background-color: rgba(30,33,38,255);
}
```

测试
sdfasdf
asdf
asdfooofffjjj
现在是什么字体？
懵逼。
aaii
好像现在宽度完全一致了？6
iiaahhddnnmmkkaaoozzxc660

- [正文 代码块 字体区分](https://community.silverbullet.md/t/use-different-fonts-for-body-text-and-code-blocks/364/2?u=chenzhu-xie) #SB_Community  