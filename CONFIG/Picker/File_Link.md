---
name: CONFIG/Picker/File_Link
tags: meta/library
pageDecoration.prefix: "📄 "
---

# File Link

## Picker

### Inplementation 2

```space-lua
command.define {
  name = "Navigate: File Link Picker",
  key = "Alt-f",
  priority = 1,
  run = function()
    local FileLinks = getFileLinks()
    if not FileLinks or #FileLinks == 0 then
      editor.flashNotification("No File Links found.")
      return
    end
    
    local sel = editor.filterBox("🔍 Select", FileLinks, "Choose a File Link...", "a File Link to GoTo")
    if not sel then return end
    editor.navigate(sel.ref)
    editor.invokeCommand("Navigate: Center Cursor")
  end
}
```

### Inplementation 1

```lua
function navigateToPos(ref)
  if ref then
    editor.navigate(ref)
    editor.invokeCommand("Navigate: Center Cursor")
    return true
  end
  return false
end

command.define {
  name = "Navigate: File Link Picker",
  key = "Alt-f",
  priority = 1,
  run = function()
    local FileLinks = getFileLinks()
    if not FileLinks or #FileLinks == 0 then
      editor.flashNotification("No File Links found.")
      return
    end

    local items = {}
    for _, r in ipairs(FileLinks) do
      table.insert(items, {
        name = r.snippet,
        description = string.format("%s @ %d", r.page, r.pos),
        ref = r.ref,
        page = r.page,
        pos = r.pos
      })
    end
    
    local sel = editor.filterBox("🔍 Select", items, "Choose a File Link...", "a File Link to GoTo")
    if not sel then return end

    if not navigateToPos(sel.ref) then
      editor.flashNotification("Failed to navigate to selected File Link.")
    end
  end
}
```

---
```lua
function navigateToPos(ref)
  if ref then
    editor.navigate(ref)
    editor.invokeCommand("Navigate: Center Cursor")
    return true
  end
  return false
end

function navigateToPos(ref, pos)
  if ref then
    editor.navigate(ref)
    if pos then
      editor.moveCursor(tonumber(pos), true)
    end
    -- editor.invokeCommand("Navigate: Center Cursor")
    return true
  end
  return false
end

function navigateToPos(page, pos)
  if page and pos then
    editor.navigate(page .. "@" .. pos)
    editor.moveCursor(tonumber(pos), true)
    return true
  end
  return false
end
```

## Query

`[[Language/Input Method/冰雪清韵・字根图.png]]`
`[[Daydream/神经.png|300]]`

`${query[[
    from index.tag "link"
    where page == _CTX.currentPage.name 
  ]]}`

`${getFileLinks()}`

### Inplementation 2

```space-lua
function getFileLinks()
  return query[[
    from index.tag "link"
    where _.toFile
    select{
      name = _.snippet,
      description = string.format("%s @ %d", _.page, _.pos),
      ref = _.ref,
    }
    order by _.page, _.pos
  ]]
end
```

### Inplementation 1

```lua
function getFileLinks()
  return query[[
    from index.tag "link"
    where _.toFile
    select{
      ref = _.ref,
      snippet = _.snippet,
      page = _.page,
      pos = _.pos,
    }
    order by _.page, _.pos
  ]]
end
```
