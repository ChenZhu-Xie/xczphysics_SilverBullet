
1. [issues](https://github.com/silverbulletmd/silverbullet/issues/1690) #github

- Sun dried tomatoes [id: sd tomato][stores: [ACME, other]] #ingredient

${widgets.inlineItemLink("ingredient","sd tomato")}

```space-lua
function widgets.inlineItemLink(tagName,linkID,linkAlias)
  -- Query the object, assuming linkID is unique
  local obj = (query[[
    from index.tag(tagName)
    where id == linkID
    limit 1
  ]])[1]

  -- Change the link alias to the one supplied if set
  if linkAlias then
    obj.name = linkAlias or obj.name
  else
    obj.name = obj.name:trimStart() -- trim leading spaces if any
  end

  -- Return a widget that displays the link inline
  return widget.new{
    markdown = template.new([==[[[${ref}|${name}]]]==])(obj)
  }
end
```

