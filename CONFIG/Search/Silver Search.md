1. https://github.com/MrMugame/silversearch#silversearch

```lua
config.set("plugs", { -- 注意，第一个 config.set() 覆盖 第二个 config.set() 覆盖 config.set{}
  -- "silversearch.plug.js" -- 这个「本地相对路径」可以用
  -- "_plug/silversearch.plug.js"
  -- "file:/_plug/silversearch.plug.js"
  -- "file://.space/_plug/silversearch.plug.js"
  -- "ghr:MrMugame/silversearch" -- 这个也可以用，其他格式都不行
  -- "github:MrMugame/silversearch/silversearch.plug.js"
  -- "github:MrMugame/silversearch/releases/latest/download/silversearch.plug.js"
  })
```

```space-lua

```