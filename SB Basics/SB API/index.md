
# Client level

`Client level` means

    if not `Client: wipe out`, no erase; if so, erase.

```space-lua
local objects = {
    {tag = "mytask", ref="task1", content = "Buy groceries"},
    {tag = "mytask", ref="task2", content = "Write docs"}
}
index.indexObjects("my page", objects)
```

${index.queryLuaObjects("mytask", {limit=3})}
${index.getObjectByRef("my page", "mytask", "task1")}
上述看上去是永久的，哪怕你 `Client: wipe out`。

  ddfasdf

但：如果你 只运行一次
`${index.indexObjects("my page", {
    {tag = "mytask", ref="task1", content = "Buy groceries"},
    {tag = "mytask", ref="task2", content = "Write docs"}
})}`
然后删除这段。

再运行一次
`${index.queryLuaObjects("mytask", {limit=3})}`
你会发现有你想要的 table。
但仍然删除这段。

然后关闭 SB，再打开，你发现还是有，说明已经写入 indexdb 里了。
只要 indexdb 里有，且有 indexdb，那就是有。

然而你一旦 `Client: wipe out`，就会发现没了。除非你再执行一次


