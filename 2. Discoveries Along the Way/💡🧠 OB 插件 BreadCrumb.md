#💡 #PKM #🧠 

[CONTEXT:我在搜寻 OB 的 BreadCrumb 插件（向竞争对手学习）时，发现它的逻辑和 SiYuan 的 BreadCrumb 插件不一样，有自己独特的 edge 属性]

尽管该插件所用的 attr 像 SB 一样，是页面层级的，且该插件年久失修
- 但概念上（对我来说）是新颖的，且很容易拓展到 行/块/bullet 层级。

- [Implied Edge Builders](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Implied+Edge+Builders) #publish #obsidian
- 比树形系统 更自由，但也更 manual：需要 手动维护 非 implied 的 edge
- ==题外话==
  - OB 部署后缺失了 SB 和 Logseq 的 CMDs
    - 因此 deploy 后像是个经典的静态网页，而不是应用 app?
  - OB 部署后，鼠标移到链接上的预览，与 Logseq 一样都有，且无限深度
    - SB 是不是 因为 CodeMirror6 而丢失了此功能？
      - 不应该，因为 OB 也用 CodeMirror（5 正在升级到 6）

# 边 edge = 节点与节点 之间的 连接(算符)
 - 是个箭头/单射，有方向（像 AnyType 的 graph，最终构成一张 [[Wikipedia/有向图]]）
 - 是个函数，有反函数
 - 是个矩阵，有逆矩阵
 - 是个称呼，有对应称呼

## 它可以通过 attr:value 的方式来实施，比如 

a 节点 [parent:[[c 节点]]] 
- 即 `[[c 节点]]` is the parent of `[[a 节点]]`
- 或 `[[a 节点]]` is the child of `[[c 节点]]`
b 节点 [parent:[[c 节点]]]

## 自动推断 缺失且互反/逆的 隐式关系 attr及值

那么无须显式指定地，
c 节点[children:{[[a 节点]], [[b 节点]]}] 会自动填充 1 个
对应属性，及其值（但这个 属性:值 含有一个包含 2 个 child 的 list）
- 即 `[[c 节点]]` is the parent of `[[a 节点]]` and `[[b 节点]]`
- 或 `[[a 节点]]` and `[[b 节点]]` is the children of `[[c 节点]]`

也就是说 ${latex.inline[[a,b \xrightarrow[]{\text{'s parent is}} c]]} 或 ${latex.inline[[c \xrightarrow[]{\text{is the parent of}} a,b]]}
→ 推断出 ${latex.inline[[c \xrightarrow[]{\text{'s children is}} a,b]]} 或 ${latex.inline[[a,b \xrightarrow[]{\text{is the children of}} c]]}

> **note** Note
> 顺着箭头的方向 最好应该用 主动式语法 来解读，比如：
> a 的父母是（is 谓语）b
> a 推出了（及物动词 vt.）b
> a 

## 关系还能 传递/运算

[Transitive Implied Relations](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Transitive+Implied+Relations) #publish #obsidian
- parent^2^ = grandparent
- the day after tomorrow
  - 类似 SB 的 [[CONFIG/Auto_Completions/Natural_Language_Dates]] 

### 多级/深度 推理

[Implied Relation Rounds](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Implied+Relation+Rounds) #publish #obsidian
- 已知：a 是 c 的儿子，b 是 c 的儿子
- 那么至少需要 2 层推理，得出 a,b 互为兄弟关系：
  1. c 是 a 的父亲，b 是 c 的儿子
  2. 父亲的儿子是兄弟，所以：b的父亲c的儿子a，是b的兄弟

### 还有一些 值得借鉴的东西

除了 [手动添加显式边](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Typed+Links) 外，可以按规则
自动添加显式边：[Explicit Edge Builders](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Explicit+Edge+Builders) #publish #obsidian
- 在 fields 中，除了 implied 边可以根据 [设计的规则](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Transitive+Implied+Relations#Options)，进行自动推导外，
1. 显式边也可以 [自动补全属性名](https://publish.obsidian.md/breadcrumbs-docs/Suggesters/Metadata+Field+Suggester)，和 [自动添加属性值(比如通过 tag)](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Tag+Notes)
   - ==批量终点==：属性值一般是 [按规则过滤后的页面对象们](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Regex+Notes)，是箭头的终点
     - 在当前笔记中添加，query 到的笔记们，作为边的终点 = attr 的值
     - 每一个 page 都在按自己的规则(不止一条)，自动找它的朋友们#类比
       - use its own rule to forward link to its own friends...
       - 当然，更 meta 一点是，根据 folder 的 path/fields/tags 自动生成它的 matching rule...
       - 该概念 ==每一个 Page 自动按其 rules 去执行不同的 queries ==
         - #💡 #类比 [[PKM/Apps/Tana]] 的 [[PKM/Apps/Tana/Related Content|related content]] [QTnCqDKJNQk](https://youtu.be/QTnCqDKJNQk?t=3057) #youtube
         - ==== 相比于 [[PKM/Apps/Tana/🔎 Search Node|search node]] 似乎更 live query (即 自动更新)？
         - #💡 #类比 ==Search Node== 被 convert to [[PKM/Apps/Tana/🗣 Command Node|command node]] 后，就是 silverbullet 的自定义的 各种 picker 命令了...
     - 1 页面（对象）${latex.inline[[\xleftarrow[]{\text{的 1 key:}}]]} query 到的 多values（as `[[pages]]`）
       - query 对象后 + add 对象至 key:对应的 value 的动作
         - 可以被安排发生在 hook:render-top-widget 的事件中
     - 相比手动 建立 forward wiki，这就更 “自动收集器” 一点了
       - 尽管也是在 自动建立 forward wikis...
         - 然后通过 auto-backlinks + [[#自动推断 缺失且互反/逆的 隐式关系 attr及值]]，实现 逆过程的自动补全。
       - 自动收集完了 forward wikis as key:value 后
         - 再通过 refresh/rebuild 的 key:values 自动展示/render 该页面所参与链接的图谱
2. ==批量起点==：给 按规则过滤 后的页面们，批量添加显式边（暂做不到？）
   - query 到的 多页面（对象）${latex.inline[[\xrightarrow[]{\text{的 1 key:}}]]} 1 value（as `[[page]]`）
   - 这个 SB 似乎也容易做到（通过 CMDs），但为什么不通过 ==批量终点/出链== 配合 hook:render-top-widget + auto-backlinks + [[#自动推断 缺失且互反/逆的 隐式关系 attr及值]] 来自动实现这个逆过程呢？
     - 可能这也是为什么...这个 OB 插件的作者，没有做类似的功能的原因?
3. 不通过 page attr，而通过 页面内的 [文本内容(如 list)](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/List+Notes) 来构建 显示边
4. 或者 通过 [页面名](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Dendron+Notes)、[文件夹结构](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Folder+Notes) 构建显示边

### 反思：Tana 的 SuperTag

这个 OB 插件，单纯只对 fields 进行解析，tag 只用于 filter values。
  - 甚至也没有对 fields 进行自动修改？
    - 显式构造边的 values 都是查询条件
      - （而不是查询结果：页面对象作为value）
    - 隐式构造边的 key 和 values 都只在 render 后的结果中出现，甚至都不出现在 frontmatter 中

反观 #Tana,它虽然自动添加 fields 甚至 keys，但得有 SuperTag 标记节点
- Tana 的 fields 总是从属地、次要的。但也允许单独给节点加 fields。
- OB 的机制、Tana 的机制，两种逻辑能共存么？哪个更好？还是说可以融合成一个更大的 picture?
  - 这或许能在 SilverBullet 中得到回答：到底 fields 应不应该继承自 SuperTag

# 但实际上 wiki 中的上下文，正是边

然后 前向链接对象（出口）的 反向链接 又展示了 其相对于入口关系
，如果包含 context 即 [field_or_key:snippet] 的话。
如果不包括 context 即 [field_or_key:snippet]，则 只是个 [[Library/xczphysics/CONFIG/Picker/Tags/Philosophy#1. 连接的本质：隐式 vs 显式|星形拓扑]] 结构的 #Tag 网
>  “在目标文档中显示的所有“反向链接”，都可以暂时视为该文档的“逻辑子文档”。- [article](https://ld246.com/article/1739206311467#:~:text=%E5%9C%A8%E7%9B%AE%E6%A0%87%E6%96%87%E6%A1%A3%E4%B8%AD%E6%98%BE%E7%A4%BA%E7%9A%84%E6%89%80%E6%9C%89%E2%80%9C%E5%8F%8D%E5%90%91%E9%93%BE%E6%8E%A5%E2%80%9D%EF%BC%8C%E9%83%BD%E5%8F%AF%E4%BB%A5%E6%9A%82%E6%97%B6%E8%A7%86%E4%B8%BA%E8%AF%A5%E6%96%87%E6%A1%A3%E7%9A%84%E2%80%9C%E9%80%BB%E8%BE%91%E5%AD%90%E6%96%87%E6%A1%A3%E2%80%9D%E3%80%82) #ld246
> - 同一个 [author:Frostime]（在 ==1017854502== qq 群里叫 ==抑郁 2 号机==） 写的其他文章：[article](https://ld246.com/article/1739206311467#:~:text=在目标文档中显示的所有“反向链接”，都可以暂时视为该文档的“逻辑子文档”。) #ld246
>   - 上述都来自于 [sy f misc](https://github.com/frostime/sy-f-misc) #github

那么 这个功能似乎 也已经有了... 即 页面底部的 反链，已经够了？
那么 ...似乎 OB 的这个插件，
- 除了能更直观地看出 diagram（类似 AnyType 或 Mermain 或 Tikz 含箭头的流程图 = upgraded graph view）外，没有其他太多的帮助？

${embed.youtube "https://www.youtube.com/watch?v=DXXB7fHcArg&t=897s"}

# Trillium 里有该插件的祖先？

1. [article](https://ld246.com/article/1739105383323) #ld246

