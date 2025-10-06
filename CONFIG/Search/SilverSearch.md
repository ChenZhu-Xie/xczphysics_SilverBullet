
1. https://github.com/MrMugame/silversearch#silversearch

```space-lua
config.set("plugs", { -- 注意，哪怕是 config.set() 也会相互覆盖
  -- "silversearch.plug.js" -- 这个「本地相对路径」可以用
  -- "_plug/silversearch.plug.js"
  -- "file:/_plug/silversearch.plug.js"
  -- "file://.space/_plug/silversearch.plug.js"
  -- "ghr:MrMugame/silversearch" -- 这个也可以用
  -- "github:MrMugame/silversearch/silversearch.plug.js"
  -- "github:MrMugame/silversearch/releases/latest/download/silversearch.plug.js"
  })
```
