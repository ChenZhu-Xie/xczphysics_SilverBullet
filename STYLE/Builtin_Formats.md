---
name: STYLE/Builtin_Formats
tags: meta/library
pageDecoration.prefix: "🔤 "
---

# (Missing) Builtin Formats

## Command Define

1. [690f2cab c814 8010 a9f3 9b1f3c77938d](https://chatgpt.com/share/690f2cab-c814-8010-a9f3-9b1f3c77938d) #chatgpt

```space-lua
-- =========================
-- Inline Formatting Commands
-- =========================

-- acquire current text 获取
function getSelectedText()
  local sel = editor.getSelection()
  if not sel or sel.from == sel.to then return nil end
  local text = editor.getText()
  return text:sub(sel.from + 1, sel.to)
end

-- replace current text
function setSelectedText(newText)
  local sel = editor.getSelection()
  if not sel or sel.from == sel.to then return nil end
  editor.replaceRange(sel.from, sel.to, newText)
end

-- cursor pos to center 
function moveToNewTextPos(suffixText)
  local pos = editor.getCursor()
  local newPos = pos - #suffixText
  editor.moveCursor(newPos, false)
end

-- universal wrapper
function wrapText(prefix, suffix)
  local text = getSelectedText()
  if text and text ~= "" then
    setSelectedText(prefix .. text .. suffix)
  else
    local insertText = prefix .. suffix
    editor.insertAtCursor(insertText, false)
    moveToNewTextPos(suffix)
  end
end
```

### Inline code: `code`

```space-lua
-- 1. Inline code: `code`
command.define {
  name = "Text: Inline Code",
  category = "Format",
  key = "Alt-`",
  description = "Wrap selection or insert inline code block",
  run = function()
    wrapText("`", "`")
  end
}
```

### Lua widget: `${ ... }`

```space-lua
-- 2. Lua widget: ${ ... }
command.define {
  name = "Text: Lua Widget",
  category = "Format",
  key = "Alt-[",
  description = "Wrap selection or insert Lua widget expression",
  run = function()
    wrapText("${", "}")
  end
}
```

### Superscript: ^sup^

```space-lua
-- 3. Superscript: ^sup^
command.define {
  name = "Text: Superscript",
  category = "Format",
  key = "Alt-6",
  description = "Wrap selection or insert superscript text",
  run = function()
    wrapText("^", "^")
  end
}
```

### Subscript: ~sub~

```space-lua
-- 4. Subscript: ~sub~
command.define {
  name = "Text: Subscript",
  category = "Format",
  key = "Ctrl-`",
  description = "Wrap selection or insert subscript text",
  run = function()
    wrapText("~", "~")
  end
}
```

## Command Update

### Strike through: ~~strike~~

```space-lua
-- 5. Strike through: ~~strike~~
command.update {
  name = "Text: Strikethrough",
  key = "Ctrl-alt-`",
  mac = "Ctrl-alt-`",
  priority = 1,
}
```

### Marker: ==text==

```space-lua
-- 6. Marker: ==text==
command.update {
  name = "Text: Marker",
  key = "Alt-=",
  mac = "Alt-=",
  priority = 1,
}
```

### Listify Selection: * text

```space-lua
-- 7. Listify Selection: * text
-- no bug: 行末 可以 触发
command.update {
  name = "Text: Listify Selection",
  key = "Alt-8",
  mac = "Alt-8",
  priority = 1,
}
```

### Number Listify Selection: 1. text

1. [issues](https://github.com/silverbulletmd/silverbullet/issues/1673#issue-3602995726) #github

```space-lua
-- 8. Number Listify Selection: 1. text
-- bug: 行末 无法 触发
command.update {
  name = "Text: Number Listify Selection",
  key = "Alt-n",
  mac = "Alt-n",
  priority = 1,
}
```

### Quote Selection: > ...

```space-lua
-- 9. Quote Selection: | ...
-- bug: 行末 无法 触发
command.update {
  name = "Text: Quote Selection",
  key = "Alt-\\",
  mac = "Alt-\\",
  priority = 1,
}
```

