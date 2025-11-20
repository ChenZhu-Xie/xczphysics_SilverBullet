
# Some of my thoughts

${query[[
    from index.tag "page"
    where _.name:startsWith("Daydream/")
    select {ref = _.ref}
]]}
