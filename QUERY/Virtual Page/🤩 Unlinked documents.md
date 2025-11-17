
2. [unlinked documents as a virtual page](https://community.silverbullet.md/t/unlinked-documents-as-a-virtual-page/3554) #community #silverbullet

${widgets.button("Unlinked Documents (" .. #unlinked_documents.get() .. ")", function() editor.navigate("udocs:Unlinked Documents") end)}

```space-lua
unlinked_documents = {}

function unlinked_documents.get()
  local all_docs = query[[
    from index.tag "document"
    where not name.match("js$")
    select name
  ]]

  local linked_docs = query[[
    from index.tag "link"
    where toFile
    select toFile
  ]]

  local linked_set = {}
  for _, doc in ipairs(linked_docs) do
    linked_set[doc] = true
  end

  local unlinked_docs = {}
  for _, doc in ipairs(all_docs) do
    if not linked_set[doc] then
      table.insert(unlinked_docs, doc)
    end
  end

  return unlinked_docs
end

virtualPage.define {
  pattern = "udocs:(.+)",
  run = function(_)
    local result = {"# Unlinked documents"}

    local unlinked_docs = unlinked_documents.get()
    for _, doc in ipairs(unlinked_docs) do
      local line = {}
      table.insert(line, "- [[")
      table.insert(line, doc)
      table.insert(line, "]]")
      table.insert(result, table.concat(line))
    end

    return table.concat(result, "\n")
  end
}
```

1. [unlinked documents as a virtual page](https://community.silverbullet.md/t/unlinked-documents-as-a-virtual-page/3554) #community #silverbullet

```
virtualPage.define {
  pattern = "udocs:(.+)",
  run = function(_)
    local result = {"# Unlinked documents"}

    local all_docs = query[[
      from index.tag "document"
      where not name.match("js$")
      select name
    ]]

    local linked_docs = query[[
      from index.tag "link"
      where toFile
      select toFile
    ]]

    local linked_set = {}
    for _, doc in ipairs(linked_docs) do
      linked_set[doc] = true
    end

    local unlinked_docs = {}
    for _, doc in ipairs(all_docs) do
      if not linked_set[doc] then
        table.insert(unlinked_docs, doc)
      end
    end
    for _, doc in ipairs(unlinked_docs) do
      local line = {}
      table.insert(line, "- [[")
      table.insert(line, doc)
      table.insert(line, "]]")
      table.insert(result, table.concat(line))
    end

    return table.concat(result, "\n")
  end
}
```
