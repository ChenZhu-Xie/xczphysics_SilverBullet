---
tags: {}
LastVisit: 2025-10-24 13:49:40
---
1. https://github.com/malys/silverbullet-libraries/blob/main/src/Utilities.md

```space-lua
utilities=utilities or {}

-- Embed external resources
function utilities.embedUrl(specOrUrl,w,h) 
  local width = w or "100%"
  local height = h or "400px"
  return widget.html(dom.iframe {
    src=specOrUrl,
    style="width: " .. width .. "; height: " .. height
  })
end
```

```space-lua
-- Convert meeting note title
function utilities.getmeetingTitle()
  local t=string.split(string.split(editor.getCurrentPage(),"/")[#string.split(editor.getCurrentPage(),"/")],"_")
  table.remove(t,1)
  t=table.concat(t, " ")
  return t
end
```

2. https://github.com/malys/silverbullet-libraries/blob/main/src/EmbedEditor.md

```space-lua
slashcommand.define {
  name = "luaeditor",
  description= "insert lua editor",
  run = function()
tpl=[[${utilities.embedUrl("https://glot.io/new/lua","100%","1000px")}]]
  editor.insertAtCursor(tpl, false, true)
  end
}

slashcommand.define {
  name = "plantumleditor",
  description= "insert plantuml editor",
  run = function()
tpl=[[${utilities.embedUrl("https://plantuml.online/uml/","100%","1000px")}]]
  editor.insertAtCursor(tpl, false, true)
  end
}
```