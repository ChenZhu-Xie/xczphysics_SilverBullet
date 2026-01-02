
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

### 总结

在 [[PKM/Apps/Tana]] 中：
1 `#Tag 的实例化对象` 能改 logo
但 3 #Tag, field, field type 均无法改 logo
然而，#Tag 有颜色且能更改颜色，并
- 既继承到 `#Tag 的实例化对象` 上（若其无 logo）、
- 又继承到 #Tag 的 field 和 field type 上（将属于该 #Tag 的这2染色）

这个看上去比 [[PKM/Apps/LogSeq]] 更科学：
> 再加上 LogSeq 是后来者，说明 LogSeq 只在模仿，却没有超越？
> LogSeq 的 标签 右对齐 这一点 做得还可以。
- 因为同一个 node 可以属于多个 #Tag 而被染上不同的混合颜色。
- 而 LogSeq 的 field 既看不出来是 node 自身的 field，也看不出来是 #Tag 的 field，更看不出来是哪一个 #Tag 的 field (如果有多个 #Tag)

在 LogSeq 中：
2 #Tag 和 `#Tag 的实例化对象` 能改 logo
- 但必须 同时改 logo
1 field 可以改 logo
1 field type 无法改 logo

### Tag 还有 Tag/`base type`，正如 field 有 field type
即 [[PKM/Apps/SilverBullet]] 的 tag 这个单值 attr（注意，{itags} = tag + {tags} ），用于区分 `#Tag 实例化对象` 的 数据结构/类型
- SB 的 page, table, item, task, paragraph, data, link, header, tag
  - 很==具象==（相对于 Tana 的 Meeting 等），最像 SiYuan，其次像 AnyType
  - 这三者的 `#Tag 的 实例化对象` 只能继承一个 `base type`
> 但 Tana 不是，Tana 的 `#Tag 的 实例化对象`，可以继承多个 Tags，因而可以继承多个 `base type`（每个 Tag 都可以选择一个 `base type`）
- Tana 的 Meeting, Task, Person, Event, Day, Location, Topic, Project

[[PKM/Apps/SilverBullet]], [[PKM/Apps/Obsidian]], [[PKM/Apps/SiYuan]], [[PKM/Apps/AnyType]] 四者 都在根据 ==实例化对象== (的 #Tag) 的基类，进行 外观漂亮的 CSS 调整，特别是 AnyType。

AnyType 竟然没有 #Tag 意义上的 #Tag...
> 确实有 tag，但...竟然是个 field ！其 value 为多选 list ！...天才..
- AnyType 的 building atom 直接就是 具象对象的基类 下的 具象对象本身，中间没有 #Tag 隔一层... 实例化对象 直接继承了 对象基类的 field... 这意味着 对象的基类，起到了 `#Tag (的 base type)` 的作用 
- ==另一种理解方式==：AnyType 有 #Tag 意义上的 #Tag:
  - 对象类型 object('s) type
    - 你点一下 sidebar 的类型，就 List 同类型下的 所有 ==实例化对象==。
  - 可以新建 对象类型，自定义 该类型对应的模板、默认属性
    - 
  - 任何一个对象，只能被分配到某一个 对象类型。


#### 一共有 6 = 3 + 3 种 东西：

1. #Tag 的 `base type`
2. #Tag    本身
3. `#Tag 的 实例化对象`

1. field type
2. field (key)
3. field (key) 的实例化对象：value

# LogSeq db 开启 Dev tool 很有用（哪怕你不是 Developer，而只是 user）
开启 Dev Tool 后，
右键 tag/field/block object，
可以 Show block/page data。
- 能提供比 Tana 这个闭源软件 更丰富的 Node 属性信息
  - 这个 Node 属性信息 可以用来 提供给 AI，并==更好地辅助你写 query==

LogSeq 的 #Tag 中，右键随便一个对象（包括其 field ），
>  右键 #Tag 的 ==实例化对象 的 field== 却没有任何反应。
- 弹出的菜单 最末，可拿到该 #Tag 的 `page data`

右键 `#Tag 的 实例化对象` 的 logo，可以查看 block 的 `block data`
