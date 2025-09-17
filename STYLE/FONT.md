
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
```
