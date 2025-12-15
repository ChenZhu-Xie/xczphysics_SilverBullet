
[CONTEXT:我在搜寻 OB 的 BreadCrumb 插件（向竞争对手学习）时，发现它的逻辑和 SiYuan的 BreadCrumb 插件不一样，有自己独特的 edge 属性]

- [Implied Edge Builders](https://publish.obsidian.md/breadcrumbs-docs/Implied+Edge+Builders/Implied+Edge+Builders) #publish #obsidian
- 比树形系统 更自由，但也更 manual：需要 手动维护 非 implied 的 edge

# 边 edge = 节点与节点 之间的 连接(算符)
 - 是个箭头，有方向
 - 是个函数，有反函数
 - 是个矩阵，有逆矩阵
 - 是个称呼，有对应称呼

## 比如 

a 节点 [parent:[[c 节点]]]
b 节点 [parent:[[c 节点]]]

那么无须显式指定地，
c 节点[children:{[[a 节点]], [[b 节点]]}]
会自动填充 1 个对应属性（但这个属性含有 1 个包含 2 个 child 的 list）

也就是说 ${latex.inline[[a,b \ c]]}

${embed.youtube "https://www.youtube.com/watch?v=DXXB7fHcArg&t=897s"}


