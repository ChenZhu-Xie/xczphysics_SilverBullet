#💡 #PKM #🧠 

[CONTEXT:我在搜寻 OB 的 BreadCrumb 插件（向竞争对手学习）时，发现它的逻辑和 SiYuan 的 BreadCrumb 插件不一样，有自己独特的 edge 属性]

尽管该插件所用的 attr 像 SB 一样，是页面层级的，且该插件年久失修
- 但概念上（对我来说）是新颖的，且很容易拓展到 行/块/bullet 层级。

- [Implied Edge Builders](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Implied+Edge+Builders) #publish #obsidian
- 比树形系统 更自由，但也更 manual：需要 手动维护 非 implied 的 edge
- ==题外话==
  - OB 部署后缺失了 SB 和 Logseq 的 CMDs
    - 因此 deploy 后像是个经典的静态网页，而不是应用 app
  - OB 部署后，鼠标移到链接上的预览，与 Logseq 一样都有，且无限深度
    - SB 是不是 因为 CodeMirror6 而丢失了此功能？
      - 不应该，因为 OB 也用 CodeMirror（5 正在升级到 6）

# 边 edge = 节点与节点 之间的 连接(算符)
 - 是个箭头，有方向（像 AnyType 的 graph，最终构成一张 [[有向图]]）
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
     - 1 页面 ${latex.inline[[\xleftarrow[]{\text{1 key}}]]} query 到的 多values
2. ==批量起点==：给 按规则过滤 后的页面们，批量添加显式边（暂做不到？）
   - query 到的 多页面 ${latex.inline[[\xrightarrow[]{\text{1 key}}]]} 1 value
   - 这个 SB 似乎也容易做到（通过 CMDs），但为什么不
3. 不通过 page attr，而通过 页面内的 [文本内容(如 list)](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/List+Notes) 来构建 显示边
   - 或者 通过 [页面名](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Dendron+Notes)、[文件夹结构](https://publish.obsidian.md/breadcrumbs-docs/Explicit+Edge+Builders/Folder+Notes) 构建显示边


# 但实际上 wiki 中的上下文，正是边

然后 前向链接对象（出口）的 反向链接 又展示了 其相对于入口关系，
那么 这个功能似乎 也已经有了... 即 页面底部的 反链，已经够了？
那么 ...似乎 OB 的这个插件，
- 除了能更直观地看出 diagram（类似 AnyType 或 Mermain 或 Tikz 含箭头的流程图 = upgraded graph view）外，没有其他太多的帮助？


${embed.youtube "https://www.youtube.com/watch?v=DXXB7fHcArg&t=897s"}


