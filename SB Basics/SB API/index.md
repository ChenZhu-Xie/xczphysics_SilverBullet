
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

## However: take a test below ?

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

然而你一旦 `Client: wipe out`，就会发现没了。

除非你再执行一次
`${index.indexObjects("my page", {
    {tag = "mytask", ref="task1", content = "Buy groceries"},
    {tag = "mytask", ref="task2", content = "Write docs"}
})}`
以写入 indexdb 。

## 为什么 space-lua block 写的可以跨越 Client/IndexDB 周期呢?

因为 每次 login SB 后，除了 可能的 reindex，
Client 它还要把 每一个 space-lua 块 全都 加载一次的嘛！

## 为什么 [[CONFIG/Add Fields for Obj/Last Opened]] 中的 lastVisit 甚至重开 SB 就没了，生命周期 甚至 短于 indexDB

是因为 下述 新增的 attr 重开 SB 就没了么？

```space-lua
-- priority: -1
index.defineTag {
  name = "page",
  metatable = {
    __index = function(self, attr)
      if attr == "loudName" then
        return string.upper(self.name)
      end
    end
  }
}
```

${query[[from index.tag "page" select {name=_.name, loudName=_.loudName} limit 3]]}
肯定不是呀！你刷新后不还有么。

问题在这：每次加载 SB 后，[[CONFIG/Add Fields for Obj/Last Opened]] 中的 
```space-lua
local lastVisitStore = lastVisitStore or {}

```
会 `lastVisitStore = {}`，因为 刚开始 没有 lastVisitStore
一旦定义了 lastVisitStore，SB 跑着跑着就 往 lastVisitStore 里存values

那么，一旦这个问题（的根源）被描述清楚了，则：谜底写在谜面上
需要将 lastVisitStore 长久化储存，
或者直接 string.upper(self.name) 一样 依附于 另一个 attr。
