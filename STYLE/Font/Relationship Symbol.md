# Fira Code Fonts + Ligatures
![](https://community.silverbullet.md/uploads/default/original/2X/0/092ad6b30d4a5b2341b42dafaa26d73f342340ef.jpeg)

```space-style
@font-face {
  font-family: 'Fira Code';
  src: url('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/woff2/FiraCode-Light.woff2') format('woff2'),
    url("/STYLE/FONT/FiraCode-Light.woff") format("woff");
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'Fira Code';
  src: url('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/woff2/FiraCode-Regular.woff2') format('woff2'),
    url("/STYLE/FONT/FiraCode-Regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Fira Code';
  src: url('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/woff2/FiraCode-Medium.woff2') format('woff2'),
    url("/STYLE/FONT/FiraCode-Medium.woff") format("woff");
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: 'Fira Code';
  src: url('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/woff2/FiraCode-SemiBold.woff2') format('woff2'),
    url("/STYLE/FONT/FiraCode-SemiBold.woff") format("woff");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: 'Fira Code';
  src: url('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/woff2/FiraCode-Bold.woff2') format('woff2'),
    url("/STYLE/FONT/FiraCode-Bold.woff") format("woff");
  font-weight: 700;
  font-style: normal;
}


/* Use Fira Nerdfont for fancy ligatures -> <=> <= != */
#sb-root {
  --editor-font: "Fira Code", "iA-Mono", "Menlo";
}
```

1. https://community.silverbullet.md/t/space-style-snippets-showcase/2200/2