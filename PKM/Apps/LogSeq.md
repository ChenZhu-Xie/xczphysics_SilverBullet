
1. 如果你要用 Zotero，还是回到 LogSeq 吧
   - [[PKM/Apps/Tana|Tana]] Slack 上有人 (Ready) 似乎说过。

2. LogSeq.md is slow [tft performance interim results](https://www.goedel.io/p/tft-performance-interim-results) #goedel
  - [tft performance logseq](https://www.goedel.io/p/tft-performance-logseq) #goedel

# LogSeq db 的 emoji 竟加载在 #Tag 上
- 实例化的 instanced 节点 的 emoji，==继承== tag 的 emoji
- 要比 [[PKM/Apps/Tana]] 更抽象一点
  - [[PKM/Apps/Tana]] 的 emoji 加载在 #Tag 的 instance，即 节点 node 上

## LogSeq db 和 Tana 的初始 field logo 由其 field type 决定
LogSeq 和 Tana 的 field 的 key 的 初始 logo，以及 field type 
均由其 field/key 的 value （即将）要储存 什么样的 数据结构/类型 决定
有点像是大多数*静态/强类型语言*要求在使用变量之前必须声明数据类型
如 public `string` str 中的 `string`

- 但 Tana 不允许后续更改，LogSeq 却允许后续更改。
  - 这就很奇怪 ==Tana==：
    - Tana 的 node，作为实例化后的 #Tag, 允许更改 Logo；
      - #Tag 本身的 logo 只能是 `#`, 且无法更改
    - 但 Tana 的 field，作为实例化后的 field type，不允许更改 Logo
  - 这就很奇怪 ==LogSeq==：
    - LogSeq 的 block，继承了 #Tag 的 Logo，且允许和 #Tag 一起更改；
      - 实例本身的 logo 只能是 #Tag 的 logo, 无法 脱离于之 单独更改
    - LogSeq 的 field，作为实例化后的 field type，允许更改 Logo

# LogSeq db 
