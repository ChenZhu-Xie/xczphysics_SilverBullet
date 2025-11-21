
# My recent thoughts

${query[[
    from index.tag "page"
    where _.name:startsWith("Daydream/")
    select {ref = _.ref, lastModified = string.sub(_.lastModified:gsub("T", " "), 1, -5)}
]]}
