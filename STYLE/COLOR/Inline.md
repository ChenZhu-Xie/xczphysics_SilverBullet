
Colors ${Red("red")} and ${Green("green")} and ${Blue("blue!")}.

1. https://community.silverbullet.md/t/colors-for-individual-words-or-phrases/3058?u=chenzhu-xie

```lua
function Red(text)
  return widget.html(dom.span {
    style="color:red; font-weight: bold;",
    text
  })
end
function Green(text)
  return widget.html(dom.span {
    style="color:green; font-weight: bold;",
    text
  })
end
function Blue(text)
  return widget.html(dom.span {
    style="color:blue; font-weight: bold;",
    text
  })
end
```

1. https://community.silverbullet.md/t/colors-for-individual-words-or-phrases/3058/6?u=chenzhu-xie

```space-lua
local colors = {
  red    = "#E57373",
  green  = "#81C784",
  blue   = "#64B5F6",
  yellow = "#FFF176",
  purple = "#BAA7E5"
}

local function ColorText(text, color)
  return widget.html(dom.span {
    style = string.format("color:%s; font-weight: bold;", color),
    text
  })
end

function Red(text)    return ColorText(text, colors.red) end
function Green(text)  return ColorText(text, colors.green) end
function Blue(text)   return ColorText(text, colors.blue) end
function Yellow(text) return ColorText(text, colors.yellow) end
function Purple(text) return ColorText(text, colors.purple) end

function getSelectedText()
  local sel = editor.getSelection()
  if not sel or sel.from == sel.to then return nil end
  local text = editor.getText()
  return text:sub(sel.from + 1, sel.to)
end

function setSelectedText(newText)
  local sel = editor.getSelection()
  if not sel or sel.from == sel.to then return nil end
  editor.replaceRange(sel.from, sel.to, newText)
end

function moveToNewTextPos(suffixText)
  local pos = editor.getCursor()
  local newPos = pos - #suffixText
  editor.moveCursor(newPos, true)
end

local function wrapWithColor(fnName)
  local text = getSelectedText()
  if text and text ~= "" then
    local newText = string.format("${%s(\"%s\")}", fnName, text)
    setSelectedText(newText)
  else
    local insertText = string.format("${%s(\"\")}", fnName)
    editor.insertAtCursor(insertText, false)
    moveToNewTextPos("\")}")
  end
end

local colorNames = { "Red", "Green", "Blue", "Yellow", "Purple" }

for _, name in ipairs(colorNames) do
  local key = string.lower(string.sub(name, 1, 1))

  command.define {
    name = "Text: " .. name,
    category = "Style",
    key = "Alt-" .. key,
    description = string.format("Mark the text in a soft shade of %s", name),
    run = function()
      wrapWithColor(name)
    end
  }
end
```
