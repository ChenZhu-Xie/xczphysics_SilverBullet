
1. 如果你要用 Zotero，还是回到 LogSeq 吧
   - [[PKM/Apps/Tana|Tana]] Slack 上有人 (Ready) 似乎说过。

2. LogSeq.md is slow [tft performance interim results](https://www.goedel.io/p/tft-performance-interim-results) #goedel
  - [tft performance logseq](https://www.goedel.io/p/tft-performance-logseq) #goedel

# LogSeq db 的 emoji 竟加载在 #Tag 上
- 实例化的 instanced 节点 的 emoji，==继承== tag 的 emoji
- 要比 [[PKM/Apps/Tana]] 更抽象一点
  - [[PKM/Apps/Tana]] 的 emoji 加载在 #Tag 的 instance，即 节点 node 上

## LogSeq db 和 Tana 的初始 field logo 由其 field type 决定
- 但 Tana 不允许后续更改，LogSeq 却允许后续更改。
  - 这就很奇怪：
    - Tana 的  节点，作为实例化后的 Tag，允许更改 Logo；
      - Tag 本身的 logo 只能是 `#`, 且无法更改
    - 但 Tana 的 field，作为实例化后的 field type，不允许更改 Logo
    - LogSeq 的 节点，继承了 Tag 的 Logo，允许更改 Logo；
