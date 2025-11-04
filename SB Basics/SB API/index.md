
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
