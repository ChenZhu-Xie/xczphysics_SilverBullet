```space-style
:root {
  /* Dark theme 颜色变量 */
  --h1-color-dark: #e6c8ff;
  --h2-color-dark: #a0d8ff;
  --h3-color-dark: #98ffb3;
  --h4-color-dark: #fff3a8;
  --h5-color-dark: #ffb48c;
  --h6-color-dark: #ffa8ff;

  --h1-underline-dark: rgba(230,200,255,0.3);
  --h2-underline-dark: rgba(160,216,255,0.3);
  --h3-underline-dark: rgba(152,255,179,0.3);
  --h4-underline-dark: rgba(255,243,168,0.3);
  --h5-underline-dark: rgba(255,180,140,0.3);
  --h6-underline-dark: rgba(255,168,255,0.3);

  /* Light theme 颜色变量 */
  --h1-color-light: #6b2e8c;
  --h2-color-light: #1c4e8b;
  --h3-color-light: #1a6644;
  --h4-color-light: #a67c00;
  --h5-color-light: #b84c1c;
  --h6-color-light: #993399;

  --h1-underline-light: rgba(107,46,140,0.3);
  --h2-underline-light: rgba(28,78,139,0.3);
  --h3-underline-light: rgba(26,102,68,0.3);
  --h4-underline-light: rgba(166,124,0,0.3);
  --h5-underline-light: rgba(184,76,28,0.3);
  --h6-underline-light: rgba(153,51,153,0.3);

  --title-opacity: 0.7;
}

/* 公共 H1–H6 样式 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  position: relative;
  opacity: var(--title-opacity);
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-image-slice: 1;
}

/* Dark Theme */
html[data-theme="dark"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; border-bottom: 2px solid var(--h1-underline-dark); }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; border-bottom: 2px solid var(--h2-underline-dark); }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; border-bottom: 2px solid var(--h3-underline-dark); }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; border-bottom: 2px solid var(--h4-underline-dark); }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-dark)!important; border-bottom: 2px solid var(--h5-underline-dark); }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-dark)!important; border-bottom: 2px solid var(--h6-underline-dark); }
}

/* Light Theme */
html[data-theme="light"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; border-bottom: 2px solid var(--h1-underline-light); }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; border-bottom: 2px solid var(--h2-underline-light); }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; border-bottom: 2px solid var(--h3-underline-light); }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; border-bottom: 2px solid var(--h4-underline-light); }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-light)!important; border-bottom: 2px solid var(--h5-underline-light); }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-light)!important; border-bottom: 2px solid var(--h6-underline-light); }
}

/* 高亮类 */
.sb-active {
  opacity: 1 !important;
}

```


```style
:root {
  /* Dark theme 颜色变量 */
  --h1-color-dark: #ffdd66;
  --h2-color-dark: #ff9966;
  --h3-color-dark: #66cc66;
  --h4-color-dark: #66cccc;
  --h5-color-dark: #66aaff;
  --h6-color-dark: #cc66ff;

  --h1-underline-dark: rgba(255,221,102,0.2);
  --h2-underline-dark: rgba(255,153,102,0.2);
  --h3-underline-dark: rgba(102,204,102,0.2);
  --h4-underline-dark: rgba(102,204,204,0.2);
  --h5-underline-dark: rgba(102,170,255,0.2);
  --h6-underline-dark: rgba(204,102,255,0.2);

  /* Light theme 颜色变量 */
  --h1-color-light: #664400;
  --h2-color-light: #993300;
  --h3-color-light: #336633;
  --h4-color-light: #336666;
  --h5-color-light: #3355aa;
  --h6-color-light: #663399;

  --h1-underline-light: rgba(102,68,0,0.2);
  --h2-underline-light: rgba(153,51,0,0.2);
  --h3-underline-light: rgba(51,102,51,0.2);
  --h4-underline-light: rgba(51,102,102,0.2);
  --h5-underline-light: rgba(51,85,170,0.2);
  --h6-underline-light: rgba(102,51,153,0.2);

  /* 全局标题透明度 */
  --title-opacity: 0.8; 
}

/* 公共 H1–H6 样式 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-image-slice: 1;
  text-shadow: none;
  position: relative;
  opacity: var(--title-opacity);
}

/* Dark Theme */
html[data-theme="dark"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; border-bottom: 2px solid var(--h1-underline-dark); }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; border-bottom: 2px solid var(--h2-underline-dark); }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; border-bottom: 2px solid var(--h3-underline-dark); }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; border-bottom: 2px solid var(--h4-underline-dark); }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-dark)!important; border-bottom: 2px solid var(--h5-underline-dark); }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-dark)!important; border-bottom: 2px solid var(--h6-underline-dark); }
}

/* Light Theme */
html[data-theme="light"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; border-bottom: 2px solid var(--h1-underline-light); }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; border-bottom: 2px solid var(--h2-underline-light); }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; border-bottom: 2px solid var(--h3-underline-light); }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; border-bottom: 2px solid var(--h4-underline-light); }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-light)!important; border-bottom: 2px solid var(--h5-underline-light); }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-light)!important; border-bottom: 2px solid var(--h6-underline-light); }
}

/* 鼠标悬停效果：非悬停标题透明度为 0 */
.sb-line-h1:hover ~ .sb-line-h1,
.sb-line-h1:hover ~ .sb-line-h2,
.sb-line-h1:hover ~ .sb-line-h3,
.sb-line-h1:hover ~ .sb-line-h4,
.sb-line-h1:hover ~ .sb-line-h5,
.sb-line-h1:hover ~ .sb-line-h6,
.sb-line-h2:hover ~ .sb-line-h1,
.sb-line-h2:hover ~ .sb-line-h2,
.sb-line-h2:hover ~ .sb-line-h3,
.sb-line-h2:hover ~ .sb-line-h4,
.sb-line-h2:hover ~ .sb-line-h5,
.sb-line-h2:hover ~ .sb-line-h6,
.sb-line-h3:hover ~ .sb-line-h1,
.sb-line-h3:hover ~ .sb-line-h2,
.sb-line-h3:hover ~ .sb-line-h3,
.sb-line-h3:hover ~ .sb-line-h4,
.sb-line-h3:hover ~ .sb-line-h5,
.sb-line-h3:hover ~ .sb-line-h6,
.sb-line-h4:hover ~ .sb-line-h1,
.sb-line-h4:hover ~ .sb-line-h2,
.sb-line-h4:hover ~ .sb-line-h3,
.sb-line-h4:hover ~ .sb-line-h4,
.sb-line-h4:hover ~ .sb-line-h5,
.sb-line-h4:hover ~ .sb-line-h6,
.sb-line-h5:hover ~ .sb-line-h1,
.sb-line-h5:hover ~ .sb-line-h2,
.sb-line-h5:hover ~ .sb-line-h3,
.sb-line-h5:hover ~ .sb-line-h4,
.sb-line-h5:hover ~ .sb-line-h5,
.sb-line-h5:hover ~ .sb-line-h6,
.sb-line-h6:hover ~ .sb-line-h1,
.sb-line-h6:hover ~ .sb-line-h2,
.sb-line-h6:hover ~ .sb-line-h3,
.sb-line-h6:hover ~ .sb-line-h4,
.sb-line-h6:hover ~ .sb-line-h5,
.sb-line-h6:hover ~ .sb-line-h6 {
  opacity: 0;
}


```

1. https://chatgpt.com/share/68fd0e6f-19d8-8010-95b8-c0f80a829e9b

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

```style
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

```style
html[data-theme="dark"] {
  /* H1：冷蓝紫 */
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: #9ec5ff !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #9ec5ff, transparent) 1;
  }

  /* H2：天蓝青 */
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: #7ddfff !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #7ddfff, transparent) 1;
  }

  /* H3：青绿 */
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: #7fffd4 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #7fffd4, transparent) 1;
  }

  /* H4：青黄过渡 */
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: #d7ff7f !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #d7ff7f, transparent) 1;
  }

  /* H5：金黄 */
  .sb-line-h5 {
    font-size: 1em !important;
    color: #ffd966 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #ffd966, transparent) 1;
  }

  /* H6：暖橙红 */
  .sb-line-h6 {
    font-size: 1em !important;
    color: #ff9966 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #ff9966, transparent) 1;
  }
}

html[data-theme="light"] {
  /* H1：深蓝紫 */
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: #3050c8 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #3050c8, transparent) 1;
  }

  /* H2：蔚蓝 */
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: #1a89d9 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #1a89d9, transparent) 1;
  }

  /* H3：青绿 */
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: #22b7a3 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #22b7a3, transparent) 1;
  }

  /* H4：浅橄榄绿 */
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: #b5c239 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #b5c239, transparent) 1;
  }

  /* H5：金黄 */
  .sb-line-h5 {
    font-size: 1em !important;
    color: #e6b800 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #e6b800, transparent) 1;
  }

  /* H6：暖橙红 */
  .sb-line-h6 {
    font-size: 1em !important;
    color: #e67339 !important;
    border-bottom: 2px solid;
    border-image: linear-gradient(to right, #e67339, transparent) 1;
  }
}

```

```style
:root {
  /* Dark theme 颜色变量 */
  --h1-color-dark: #e6b3ff;
  --h2-color-dark: #b8b0ff;
  --h3-color-dark: #89b4ff;
  --h4-color-dark: #8fe1b5;
  --h5-color-dark: #f0e68c;
  --h6-color-dark: #ffbb66;

  --h1-underline-dark: linear-gradient(to right, #e6b3ff, #d699ff);
  --h2-underline-dark: linear-gradient(to right, #b8b0ff, #a090ff);
  --h3-underline-dark: linear-gradient(to right, #89b4ff, #66a3ff);
  --h4-underline-dark: linear-gradient(to right, #8fe1b5, #6ad0a3);
  --h5-underline-dark: linear-gradient(to right, #f0e68c, #ffeaa7);
  --h6-underline-dark: linear-gradient(to right, #ffbb66, #ff9966);

  --h1-glow-dark: 0 0 4px #d699ffaa;
  --h2-glow-dark: 0 0 3.5px #a090ffaa;
  --h3-glow-dark: 0 0 3px #66a3ffaa;
  --h4-glow-dark: 0 0 2.5px #6ad0a3aa;
  --h5-glow-dark: 0 0 2px #ffeaa7aa;
  --h6-glow-dark: 0 0 1.5px #ff9966aa;

  /* Light theme 颜色变量 */
  --h1-color-light: #7a3fbf;
  --h2-color-light: #4b4bb8;
  --h3-color-light: #1a73e8;
  --h4-color-light: #008c6f;
  --h5-color-light: #b59b00;
  --h6-color-light: #e67e22;

  --h1-underline-light: linear-gradient(to right, #7a3fbf, #b366ff);
  --h2-underline-light: linear-gradient(to right, #4b4bb8, #7a7aff);
  --h3-underline-light: linear-gradient(to right, #1a73e8, #66a3ff);
  --h4-underline-light: linear-gradient(to right, #008c6f, #00c19b);
  --h5-underline-light: linear-gradient(to right, #b59b00, #ffd54f);
  --h6-underline-light: linear-gradient(to right, #e67e22, #ffb366);

  --h1-glow-light: 0 0 2px #b366ffaa;
  --h2-glow-light: 0 0 1.8px #7a7affaa;
  --h3-glow-light: 0 0 1.5px #66a3ffaa;
  --h4-glow-light: 0 0 1.2px #00c19baa;
  --h5-glow-light: 0 0 1px #ffd54faa;
  --h6-glow-light: 0 0 0.8px #ffb366aa;
}

html[data-theme="dark"] {
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: var(--h1-color-dark) !important;
    border-bottom: 3px solid transparent !important;
    border-image: var(--h1-underline-dark) 1;
    text-shadow: var(--h1-glow-dark);
  }
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: var(--h2-color-dark) !important;
    border-bottom: 2.5px solid transparent !important;
    border-image: var(--h2-underline-dark) 1;
    text-shadow: var(--h2-glow-dark);
  }
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: var(--h3-color-dark) !important;
    border-bottom: 2px solid transparent !important;
    border-image: var(--h3-underline-dark) 1;
    text-shadow: var(--h3-glow-dark);
  }
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: var(--h4-color-dark) !important;
    border-bottom: 1.8px solid transparent !important;
    border-image: var(--h4-underline-dark) 1;
    text-shadow: var(--h4-glow-dark);
  }
  .sb-line-h5 {
    font-size: 1em !important;
    color: var(--h5-color-dark) !important;
    border-bottom: 1.5px solid transparent !important;
    border-image: var(--h5-underline-dark) 1;
    text-shadow: var(--h5-glow-dark);
  }
  .sb-line-h6 {
    font-size: 1em !important;
    color: var(--h6-color-dark) !important;
    border-bottom: 1.2px solid transparent !important;
    border-image: var(--h6-underline-dark) 1;
    text-shadow: var(--h6-glow-dark);
  }
}

html[data-theme="light"] {
  .sb-line-h1 {
    font-size: 1.8em !important;
    color: var(--h1-color-light) !important;
    border-bottom: 3px solid transparent !important;
    border-image: var(--h1-underline-light) 1;
    text-shadow: var(--h1-glow-light);
  }
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: var(--h2-color-light) !important;
    border-bottom: 2.5px solid transparent !important;
    border-image: var(--h2-underline-light) 1;
    text-shadow: var(--h2-glow-light);
  }
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: var(--h3-color-light) !important;
    border-bottom: 2px solid transparent !important;
    border-image: var(--h3-underline-light) 1;
    text-shadow: var(--h3-glow-light);
  }
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: var(--h4-color-light) !important;
    border-bottom: 1.8px solid transparent !important;
    border-image: var(--h4-underline-light) 1;
    text-shadow: var(--h4-glow-light);
  }
  .sb-line-h5 {
    font-size: 1em !important;
    color: var(--h5-color-light) !important;
    border-bottom: 1.5px solid transparent !important;
    border-image: var(--h5-underline-light) 1;
    text-shadow: var(--h5-glow-light);
  }
  .sb-line-h6 {
    font-size: 1em !important;
    color: var(--h6-color-light) !important;
    border-bottom: 1.2px solid transparent !important;
    border-image: var(--h6-underline-light) 1;
    text-shadow: var(--h6-glow-light);
  }
}

```

```style
:root {
  /* Dark theme 颜色变量 */
  --h1-color-dark: #e6b3ff;
  --h2-color-dark: #b8b0ff;
  --h3-color-dark: #89b4ff;
  --h4-color-dark: #8fe1b5;
  --h5-color-dark: #f0e68c;
  --h6-color-dark: #ffbb66;

  --h1-underline-dark: linear-gradient(to right, #e6b3ff, transparent);
  --h2-underline-dark: linear-gradient(to right, #b8b0ff, transparent);
  --h3-underline-dark: linear-gradient(to right, #89b4ff, transparent);
  --h4-underline-dark: linear-gradient(to right, #8fe1b5, transparent);
  --h5-underline-dark: linear-gradient(to right, #f0e68c, transparent);
  --h6-underline-dark: linear-gradient(to right, #ffbb66, transparent);

  --h1-glow-dark: 0 0 4px #d699ffaa;
  --h2-glow-dark: 0 0 3.5px #a090ffaa;
  --h3-glow-dark: 0 0 3px #66a3ffaa;
  --h4-glow-dark: 0 0 2.5px #6ad0a3aa;
  --h5-glow-dark: 0 0 2px #ffeaa7aa;
  --h6-glow-dark: 0 0 1.5px #ff9966aa;

  /* Light theme 颜色变量 */
  --h1-color-light: #7a3fbf;
  --h2-color-light: #4b4bb8;
  --h3-color-light: #1a73e8;
  --h4-color-light: #008c6f;
  --h5-color-light: #b59b00;
  --h6-color-light: #e67e22;

  --h1-underline-light: linear-gradient(to right, #7a3fbf, transparent);
  --h2-underline-light: linear-gradient(to right, #4b4bb8, transparent);
  --h3-underline-light: linear-gradient(to right, #1a73e8, transparent);
  --h4-underline-light: linear-gradient(to right, #008c6f, transparent);
  --h5-underline-light: linear-gradient(to right, #b59b00, transparent);
  --h6-underline-light: linear-gradient(to right, #e67e22, transparent);

  --h1-glow-light: 0 0 2px #b366ffaa;
  --h2-glow-light: 0 0 1.8px #7a7affaa;
  --h3-glow-light: 0 0 1.5px #66a3ffaa;
  --h4-glow-light: 0 0 1.2px #00c19baa;
  --h5-glow-light: 0 0 1px #ffd54faa;
  --h6-glow-light: 0 0 0.8px #ffb366aa;
}

/* Dark Theme */
html[data-theme="dark"] {
  .sb-line-h1, .sb-line-h2, .sb-line-h3,
  .sb-line-h4, .sb-line-h5, .sb-line-h6 {
    border-bottom-style: solid;
    border-bottom-width: 2px;
    border-image-slice: 1;
    transition: text-shadow 0.2s, border-image 0.2s;
  }

  .sb-line-h1 {
    font-size: 1.8em !important;
    color: var(--h1-color-dark) !important;
    border-image: var(--h1-underline-dark) 1;
    text-shadow: var(--h1-glow-dark);
  }
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: var(--h2-color-dark) !important;
    border-image: var(--h2-underline-dark) 1;
    text-shadow: var(--h2-glow-dark);
  }
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: var(--h3-color-dark) !important;
    border-image: var(--h3-underline-dark) 1;
    text-shadow: var(--h3-glow-dark);
  }
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: var(--h4-color-dark) !important;
    border-image: var(--h4-underline-dark) 1;
    text-shadow: var(--h4-glow-dark);
  }
  .sb-line-h5 {
    font-size: 1em !important;
    color: var(--h5-color-dark) !important;
    border-image: var(--h5-underline-dark) 1;
    text-shadow: var(--h5-glow-dark);
  }
  .sb-line-h6 {
    font-size: 1em !important;
    color: var(--h6-color-dark) !important;
    border-image: var(--h6-underline-dark) 1;
    text-shadow: var(--h6-glow-dark);
  }

  /* Hover / 选中 glow 增强 */
  .sb-line-h1:hover, .sb-line-h1:focus { text-shadow: 0 0 6px #d699ffaa; }
  .sb-line-h2:hover, .sb-line-h2:focus { text-shadow: 0 0 5px #a090ffaa; }
  .sb-line-h3:hover, .sb-line-h3:focus { text-shadow: 0 0 4px #66a3ffaa; }
  .sb-line-h4:hover, .sb-line-h4:focus { text-shadow: 0 0 3px #6ad0a3aa; }
  .sb-line-h5:hover, .sb-line-h5:focus { text-shadow: 0 0 2.5px #ffeaa7aa; }
  .sb-line-h6:hover, .sb-line-h6:focus { text-shadow: 0 0 2px #ff9966aa; }
}

/* Light Theme */
html[data-theme="light"] {
  .sb-line-h1, .sb-line-h2, .sb-line-h3,
  .sb-line-h4, .sb-line-h5, .sb-line-h6 {
    border-bottom-style: solid;
    border-bottom-width: 2px;
    border-image-slice: 1;
    transition: text-shadow 0.2s, border-image 0.2s;
  }

  .sb-line-h1 {
    font-size: 1.8em !important;
    color: var(--h1-color-light) !important;
    border-image: var(--h1-underline-light) 1;
    text-shadow: var(--h1-glow-light);
  }
  .sb-line-h2 {
    font-size: 1.6em !important;
    color: var(--h2-color-light) !important;
    border-image: var(--h2-underline-light) 1;
    text-shadow: var(--h2-glow-light);
  }
  .sb-line-h3 {
    font-size: 1.4em !important;
    color: var(--h3-color-light) !important;
    border-image: var(--h3-underline-light) 1;
    text-shadow: var(--h3-glow-light);
  }
  .sb-line-h4 {
    font-size: 1.2em !important;
    color: var(--h4-color-light) !important;
    border-image: var(--h4-underline-light) 1;
    text-shadow: var(--h4-glow-light);
  }
  .sb-line-h5 {
    font-size: 1em !important;
    color: var(--h5-color-light) !important;
    border-image: var(--h5-underline-light) 1;
    text-shadow: var(--h5-glow-light);
  }
  .sb-line-h6 {
    font-size: 1em !important;
    color: var(--h6-color-light) !important;
    border-image: var(--h6-underline-light) 1;
    text-shadow: var(--h6-glow-light);
  }

  /* Hover / 选中 glow 增强 */
  .sb-line-h1:hover, .sb-line-h1:focus { text-shadow: 0 0 3px #b366ffaa; }
  .sb-line-h2:hover, .sb-line-h2:focus { text-shadow: 0 0 2.5px #7a7affaa; }
  .sb-line-h3:hover, .sb-line-h3:focus { text-shadow: 0 0 2px #66a3ffaa; }
  .sb-line-h4:hover, .sb-line-h4:focus { text-shadow: 0 0 1.8px #00c19baa; }
  .sb-line-h5:hover, .sb-line-h5:focus { text-shadow: 0 0 1.5px #ffd54faa; }
  .sb-line-h6:hover, .sb-line-h6:focus { text-shadow: 0 0 1px #ffb366aa; }
}

```

```style
:root {
  /* 全局 hover glow 强度控制，默认 1，可调 0~2 */
  --hover-glow-scale: 2;

  /* Dark theme 颜色变量 */
  --h1-color-dark: #e6b3ff;
  --h2-color-dark: #b8b0ff;
  --h3-color-dark: #89b4ff;
  --h4-color-dark: #8fe1b5;
  --h5-color-dark: #f0e68c;
  --h6-color-dark: #ffbb66;

  --h1-underline-dark: linear-gradient(to right, #e6b3ff, transparent);
  --h2-underline-dark: linear-gradient(to right, #b8b0ff, transparent);
  --h3-underline-dark: linear-gradient(to right, #89b4ff, transparent);
  --h4-underline-dark: linear-gradient(to right, #8fe1b5, transparent);
  --h5-underline-dark: linear-gradient(to right, #f0e68c, transparent);
  --h6-underline-dark: linear-gradient(to right, #ffbb66, transparent);

  --h1-glow-dark-px: 4px;
  --h2-glow-dark-px: 3.5px;
  --h3-glow-dark-px: 3px;
  --h4-glow-dark-px: 2.5px;
  --h5-glow-dark-px: 2px;
  --h6-glow-dark-px: 1.5px;

  --h1-glow-dark-color: #d699ffaa;
  --h2-glow-dark-color: #a090ffaa;
  --h3-glow-dark-color: #66a3ffaa;
  --h4-glow-dark-color: #6ad0a3aa;
  --h5-glow-dark-color: #ffeaa7aa;
  --h6-glow-dark-color: #ff9966aa;

  /* Light theme 颜色变量 */
  --h1-color-light: #7a3fbf;
  --h2-color-light: #4b4bb8;
  --h3-color-light: #1a73e8;
  --h4-color-light: #008c6f;
  --h5-color-light: #b59b00;
  --h6-color-light: #e67e22;

  --h1-underline-light: linear-gradient(to right, #7a3fbf, transparent);
  --h2-underline-light: linear-gradient(to right, #4b4bb8, transparent);
  --h3-underline-light: linear-gradient(to right, #1a73e8, transparent);
  --h4-underline-light: linear-gradient(to right, #008c6f, transparent);
  --h5-underline-light: linear-gradient(to right, #b59b00, transparent);
  --h6-underline-light: linear-gradient(to right, #e67e22, transparent);

  --h1-glow-light-px: 2px;
  --h2-glow-light-px: 1.8px;
  --h3-glow-light-px: 1.5px;
  --h4-glow-light-px: 1.2px;
  --h5-glow-light-px: 1px;
  --h6-glow-light-px: 0.8px;

  --h1-glow-light-color: #b366ffaa;
  --h2-glow-light-color: #7a7affaa;
  --h3-glow-light-color: #66a3ffaa;
  --h4-glow-light-color: #00c19baa;
  --h5-glow-light-color: #ffd54faa;
  --h6-glow-light-color: #ffb366aa;
}

/* 公共 H1–H6 样式 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-image-slice: 1;
  text-shadow: none; /* 初始无 glow */
  transition: text-shadow 0.2s, border-image 0.2s;
}

/* Dark Theme */
html[data-theme="dark"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; border-image:var(--h1-underline-dark) 1; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; border-image:var(--h2-underline-dark) 1; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; border-image:var(--h3-underline-dark) 1; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; border-image:var(--h4-underline-dark) 1; }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-dark)!important; border-image:var(--h5-underline-dark) 1; }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-dark)!important; border-image:var(--h6-underline-dark) 1; }

  /* Hover / focus glow */
  .sb-line-h1:hover, .sb-line-h1:focus { text-shadow: 0 0 calc(var(--h1-glow-dark-px) * var(--hover-glow-scale)) var(--h1-glow-dark-color); }
  .sb-line-h2:hover, .sb-line-h2:focus { text-shadow: 0 0 calc(var(--h2-glow-dark-px) * var(--hover-glow-scale)) var(--h2-glow-dark-color); }
  .sb-line-h3:hover, .sb-line-h3:focus { text-shadow: 0 0 calc(var(--h3-glow-dark-px) * var(--hover-glow-scale)) var(--h3-glow-dark-color); }
  .sb-line-h4:hover, .sb-line-h4:focus { text-shadow: 0 0 calc(var(--h4-glow-dark-px) * var(--hover-glow-scale)) var(--h4-glow-dark-color); }
  .sb-line-h5:hover, .sb-line-h5:focus { text-shadow: 0 0 calc(var(--h5-glow-dark-px) * var(--hover-glow-scale)) var(--h5-glow-dark-color); }
  .sb-line-h6:hover, .sb-line-h6:focus { text-shadow: 0 0 calc(var(--h6-glow-dark-px) * var(--hover-glow-scale)) var(--h6-glow-dark-color); }
}

/* Light Theme */
html[data-theme="light"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; border-image:var(--h1-underline-light) 1; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; border-image:var(--h2-underline-light) 1; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; border-image:var(--h3-underline-light) 1; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; border-image:var(--h4-underline-light) 1; }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-light)!important; border-image:var(--h5-underline-light) 1; }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-light)!important; border-image:var(--h6-underline-light) 1; }

  /* Hover / focus glow */
  .sb-line-h1:hover, .sb-line-h1:focus { text-shadow: 0 0 calc(var(--h1-glow-light-px) * var(--hover-glow-scale)) var(--h1-glow-light-color); }
  .sb-line-h2:hover, .sb-line-h2:focus { text-shadow: 0 0 calc(var(--h2-glow-light-px) * var(--hover-glow-scale)) var(--h2-glow-light-color); }
  .sb-line-h3:hover, .sb-line-h3:focus { text-shadow: 0 0 calc(var(--h3-glow-light-px) * var(--hover-glow-scale)) var(--h3-glow-light-color); }
  .sb-line-h4:hover, .sb-line-h4:focus { text-shadow: 0 0 calc(var(--h4-glow-light-px) * var(--hover-glow-scale)) var(--h4-glow-light-color); }
  .sb-line-h5:hover, .sb-line-h5:focus { text-shadow: 0 0 calc(var(--h5-glow-light-px) * var(--hover-glow-scale)) var(--h5-glow-light-color); }
  .sb-line-h6:hover, .sb-line-h6:focus { text-shadow: 0 0 calc(var(--h6-glow-light-px) * var(--hover-glow-scale)) var(--h6-glow-light-color); }
}

```

```style
:root {
  /* 全局 hover glow 强度控制，默认 1，可调 0~2 */
  --hover-glow-scale: 1;

  /* Dark theme 颜色变量（暖→冷） */
  --h1-color-dark: #ffeb99;
  --h2-color-dark: #ffcc88;
  --h3-color-dark: #99cc88;
  --h4-color-dark: #66cc99;
  --h5-color-dark: #66aaaa;
  --h6-color-dark: #77bbcc;

  --h1-underline-dark: rgba(255,235,153,0.6);
  --h2-underline-dark: rgba(255,204,136,0.6);
  --h3-underline-dark: rgba(153,204,136,0.6);
  --h4-underline-dark: rgba(102,204,153,0.6);
  --h5-underline-dark: rgba(102,170,170,0.6);
  --h6-underline-dark: rgba(119,187,204,0.6);

  --h1-glow-dark-px: 4px;
  --h2-glow-dark-px: 3.5px;
  --h3-glow-dark-px: 3px;
  --h4-glow-dark-px: 2.5px;
  --h5-glow-dark-px: 2px;
  --h6-glow-dark-px: 1.5px;

  --h1-glow-dark-color: #ffeebb88;
  --h2-glow-dark-color: #ffcc8888;
  --h3-glow-dark-color: #99cc8888;
  --h4-glow-dark-color: #66cc9988;
  --h5-glow-dark-color: #66aaaa88;
  --h6-glow-dark-color: #77bbcc88;

  /* Light theme 颜色变量（暖→冷） */
  --h1-color-light: #996600;
  --h2-color-light: #994d00;
  --h3-color-light: #336633;
  --h4-color-light: #008066;
  --h5-color-light: #006666;
  --h6-color-light: #005577;

  --h1-underline-light: rgba(153,102,0,0.6);
  --h2-underline-light: rgba(153,77,0,0.6);
  --h3-underline-light: rgba(51,102,51,0.6);
  --h4-underline-light: rgba(0,128,102,0.6);
  --h5-underline-light: rgba(0,102,102,0.6);
  --h6-underline-light: rgba(0,85,119,0.6);

  --h1-glow-light-px: 2px;
  --h2-glow-light-px: 1.8px;
  --h3-glow-light-px: 1.5px;
  --h4-glow-light-px: 1.2px;
  --h5-glow-light-px: 1px;
  --h6-glow-light-px: 0.8px;

  --h1-glow-light-color: #99660088;
  --h2-glow-light-color: #994d0088;
  --h3-glow-light-color: #33663388;
  --h4-glow-light-color: #00806688;
  --h5-glow-light-color: #00666688;
  --h6-glow-light-color: #00557788;
}

/* 公共 H1–H6 样式 */
.sb-line-h1, .sb-line-h2, .sb-line-h3,
.sb-line-h4, .sb-line-h5, .sb-line-h6 {
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-image-slice: 1;
  text-shadow: none; /* 初始无 glow */
  transition: text-shadow 0.2s, box-shadow 0.2s;
  position: relative;
}

/* 下划线 blur */
.sb-line-h1::after, .sb-line-h2::after, .sb-line-h3::after,
.sb-line-h4::after, .sb-line-h5::after, .sb-line-h6::after {
  content: '';
  position: absolute;
  left: 0; bottom: 0;
  width: 100%;
  height: 2px;
  pointer-events: none;
  border-radius: 1px;
  filter: blur(1.5px);
}

/* Dark Theme */
html[data-theme="dark"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-dark)!important; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-dark)!important; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-dark)!important; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-dark)!important; }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-dark)!important; }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-dark)!important; }

  .sb-line-h1::after { background: linear-gradient(to right, var(--h1-underline-dark), transparent); }
  .sb-line-h2::after { background: linear-gradient(to right, var(--h2-underline-dark), transparent); }
  .sb-line-h3::after { background: linear-gradient(to right, var(--h3-underline-dark), transparent); }
  .sb-line-h4::after { background: linear-gradient(to right, var(--h4-underline-dark), transparent); }
  .sb-line-h5::after { background: linear-gradient(to right, var(--h5-underline-dark), transparent); }
  .sb-line-h6::after { background: linear-gradient(to right, var(--h6-underline-dark), transparent); }

  /* Hover / focus glow */
  .sb-line-h1:hover, .sb-line-h1:focus { text-shadow: 0 0 calc(var(--h1-glow-dark-px) * var(--hover-glow-scale)) var(--h1-glow-dark-color); }
  .sb-line-h2:hover, .sb-line-h2:focus { text-shadow: 0 0 calc(var(--h2-glow-dark-px) * var(--hover-glow-scale)) var(--h2-glow-dark-color); }
  .sb-line-h3:hover, .sb-line-h3:focus { text-shadow: 0 0 calc(var(--h3-glow-dark-px) * var(--hover-glow-scale)) var(--h3-glow-dark-color); }
  .sb-line-h4:hover, .sb-line-h4:focus { text-shadow: 0 0 calc(var(--h4-glow-dark-px) * var(--hover-glow-scale)) var(--h4-glow-dark-color); }
  .sb-line-h5:hover, .sb-line-h5:focus { text-shadow: 0 0 calc(var(--h5-glow-dark-px) * var(--hover-glow-scale)) var(--h5-glow-dark-color); }
  .sb-line-h6:hover, .sb-line-h6:focus { text-shadow: 0 0 calc(var(--h6-glow-dark-px) * var(--hover-glow-scale)) var(--h6-glow-dark-color); }
}

/* Light Theme */
html[data-theme="light"] {
  .sb-line-h1 { font-size:1.8em !important; color:var(--h1-color-light)!important; }
  .sb-line-h2 { font-size:1.6em !important; color:var(--h2-color-light)!important; }
  .sb-line-h3 { font-size:1.4em !important; color:var(--h3-color-light)!important; }
  .sb-line-h4 { font-size:1.2em !important; color:var(--h4-color-light)!important; }
  .sb-line-h5 { font-size:1em !important; color:var(--h5-color-light)!important; }
  .sb-line-h6 { font-size:1em !important; color:var(--h6-color-light)!important; }

  .sb-line-h1::after { background: linear-gradient(to right, var(--h1-underline-light), transparent); }
  .sb-line-h2::after { background: linear-gradient(to right, var(--h2-underline-light), transparent); }
  .sb-line-h3::after { background: linear-gradient(to right, var(--h3-underline-light), transparent); }
  .sb-line-h4::after { background: linear-gradient(to right, var(--h4-underline-light), transparent); }
  .sb-line-h5::after { background: linear-gradient(to right, var(--h5-underline-light), transparent); }
  .sb-line-h6::after { background: linear-gradient(to right, var(--h6-underline-light), transparent); }

  /* Hover / focus glow */
  .sb-line-h1:hover, .sb-line-h1:focus { text-shadow: 0 0 calc(var(--h1-glow-light-px) * var(--hover-glow-scale)) var(--h1-glow-light-color); }
  .sb-line-h2:hover, .sb-line-h2:focus { text-shadow: 0 0 calc(var(--h2-glow-light-px) * var(--hover-glow-scale)) var(--h2-glow-light-color); }
  .sb-line-h3:hover, .sb-line-h3:focus { text-shadow: 0 0 calc(var(--h3-glow-light-px) * var(--hover-glow-scale)) var(--h3-glow-light-color); }
  .sb-line-h4:hover, .sb-line-h4:focus { text-shadow: 0 0 calc(var(--h4-glow-light-px) * var(--hover-glow-scale)) var(--h4-glow-light-color); }
  .sb-line-h5:hover, .sb-line-h5:focus { text-shadow: 0 0 calc(var(--h5-glow-light-px) * var(--hover-glow-scale)) var(--h5-glow-light-color); }
  .sb-line-h6:hover, .sb-line-h6:focus { text-shadow: 0 0 calc(var(--h6-glow-light-px) * var(--hover-glow-scale)) var(--h6-glow-light-color); }
}

```
