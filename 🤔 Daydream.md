
# My recent thoughts

${query[[
    from index.tag "page"
    where _.name:startsWith("🤔 Daydream/")
    select {ref = _.ref, lastModified = string.sub(_.lastModified:gsub("T", " "), 1, -5)}
    order by _.lastModified desc
    limit 10
]]}

1. [query dateformat](https://community.silverbullet.md/t/query-dateformat/3839/2?u=chenzhu-xie) #community #silverbullet
   对 _.lastModified 日期格式 的 其他可能的 format
