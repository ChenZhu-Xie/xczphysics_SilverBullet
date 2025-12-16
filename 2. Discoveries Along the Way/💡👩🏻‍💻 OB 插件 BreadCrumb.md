#💡 #👩🏻‍💻

[CONTEXT:我在搜寻 OB 的 BreadCrumb 插件（向竞争对手学习）时，发现它的逻辑和 SiYuan的 BreadCrumb 插件不一样，有自己独特的 edge 属性]

- [Implied Edge Builders](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Implied+Edge+Builders) #publish #obsidian
- 比树形系统 更自由，但也更 manual：需要 手动维护 非 implied 的 edge
- ==题外话==：OB 的

# 边 edge = 节点与节点 之间的 连接(算符)
 - 是个箭头，有方向（有向图？）
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
c 节点[children:{[[a 节点]], [[b 节点]]}]
会自动填充 1 个对应属性（但这个属性含有 1 个包含 2 个 child 的 list）
- 即 `[[c 节点]]` is the parent of `[[a 节点]]` and `[[b 节点]]`
- 或 `[[a 节点]]` and `[[b 节点]]` is the children of `[[c 节点]]`

也就是说 ${latex.inline[[a,b \xrightarrow[]{\text{'s parent is}} c]]} 或 ${latex.inline[[c \xrightarrow[]{\text{is the parent of}} a,b]]}
→ 推断出 ${latex.inline[[c \xrightarrow[]{\text{'s children is}} a,b]]} 或 ${latex.inline[[a,b \xrightarrow[]{\text{is the children of}} c]]}

## 关系还能 传递/运算

[Transitive Implied Relations](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Transitive+Implied+Relations) #publish #obsidian
- parent^2^ = grandparent

### 多级/深度 推理

[Implied Relation Rounds](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Implied+Relation+Rounds) #publish #obsidian
- 已知：a 是 c 的儿子，b 是 c 的儿子
- 那么至少需要 2 层推理，得出 a,b 互为兄弟关系：
  1. c 是 a 的父亲，b 是 c 的儿子
  2. 父亲的儿子是兄弟，所以：b的父亲c的儿子a，是b的兄弟

# 但实际上 wiki 中的上下文，正是边

然后 前向链接对象（出口）的 反向链接 又展示了 其相对于入口关系，
那么 这个功能似乎 也已经有了...
那么 ...似乎 OB 的这个插件，
- 除了能更直观地看出 diagram（类似 AnyType 或 Mermain 或 Tikz 含箭头的流程图 = upgraded graph view）外，没有其他太多的帮助？


${embed.youtube "https://www.youtube.com/watch?v=DXXB7fHcArg&t=897s"}


