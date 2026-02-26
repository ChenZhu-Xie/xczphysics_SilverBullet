---
author: Chenzhu-Xie
name: Library/xczphysics/CONFIG/Picker/File_Link
tags: meta/library
pageDecoration.prefix: "📄🔗 "
---

# Specific file type transclude

## Mp3/4
1. [local videos](https://community.silverbullet.md/t/local-videos/3911/3?u=chenzhu-xie) #community #silverbullet

## Pdf
1. [embedded pdfs are displayed in a weird way fix](https://community.silverbullet.md/t/embedded-pdfs-are-displayed-in-a-weird-way-fix/3915/2?u=chenzhu-xie) #community #silverbullet

```space-style
#sb-main .cm-editor .sb-lua-wrapper:has(object[type="application/pdf"]) .button-bar { top: -40px; padding:0; opacity:0.2; transition: all 0.5s ease; border-radius:10px;} 
#sb-main .cm-editor .sb-lua-wrapper:has(object[type="application/pdf"]) .button-bar:hover { opacity:1;}
#sb-main .cm-editor .sb-inline-content:has(object[type="application/pdf"]) { overflow: visible !important;}

.sb-lua-wrapper:has(object[type="application/pdf"]) div {width: fit-content;}
```

# File Link

1. [files link picker](https://community.silverbullet.md/t/files-link-picker/3608/3?u=chenzhu-xie) #community #silverbullet

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
    
    local sel = editor.filterBox("🔍 Select", FileLinks, "Choose a File Link...", "📄🔗 a File Link to GoTo")
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

1. 采用了 [[Library/xczphysics/CONFIG/Picker/Tags#Navigate: Tag Picker|Tag Picker]] ：从第一个 query 开始，就 创建 name 属性

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
