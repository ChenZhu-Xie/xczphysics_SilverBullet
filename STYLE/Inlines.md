
# (Missing) Inline Commands

## Command Define

```space-lua
-- =========================
-- Inline Formatting Commands
-- =========================

-- 通用：获取选中文本
local function getSelectedText()
  local sel = editor.getSelection()
  if not sel or sel.from == sel.to then return nil end
  local text = editor.getText()
  return text:sub(sel.from + 1, sel.to)
end

-- 通用：替换选中文本
local function setSelectedText(newText)
  local sel = editor.getSelection()
  if not sel or sel.from == sel.to then return nil end
  editor.replaceRange(sel.from, sel.to, newText)
end

-- 通用：光标移动到中间位置
local function moveToNewTextPos(suffixText)
  local pos = editor.getCursor()
  local newPos = pos - #suffixText
  editor.moveCursor(newPos, false)
end

-- 通用包裹函数
local function wrapText(prefix, suffix)
  local text = getSelectedText()
  if text and text ~= "" then
    setSelectedText(prefix .. text .. suffix)
  else
    local insertText = prefix .. suffix
    editor.insertAtCursor(insertText, false)
    moveToNewTextPos(suffix)
  end
end

-- ==============
-- 各种格式命令
-- ==============

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

-- 2. Lua widget: ${ ... }
command.define {
  name = "Text: Lua Widget",
  category = "Format",
  key = "Alt-4",
  description = "Wrap selection or insert Lua widget expression",
  run = function()
    wrapText("${", "}")
  end
}

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

```space-lua
-- 5. Strike through: ~~strike~~
command.update {
  name = "Text: Strikethrough",
  key = "Ctrl-alt-`",
  mac = "Ctrl-alt-`",
  priority = 1,
}

-- 6. Listify Selection: * text
-- no bug: 行末 可以 触发
command.update {
  name = "Text: Listify Selection",
  key = "Alt-8",
  mac = "Alt-8",
  priority = 1,
}

-- 7. Number Listify Selection: 1. text
-- bug: 行末 无法 触发
command.update {
  name = "Text: Number Listify Selection",
  key = "Alt-n",
  mac = "Alt-n",
  priority = 1,
}

-- 8. Quote Selection: | ...
-- bug: 行末 无法 触发
command.update {
  name = "Text: Quote Selection",
  key = "Alt-.",
  mac = "Alt-.",
  priority = 1,
}
```


