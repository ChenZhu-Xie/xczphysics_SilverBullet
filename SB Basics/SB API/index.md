
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
上述看上去是永久的，哪怕你 `Client: wipe out`


