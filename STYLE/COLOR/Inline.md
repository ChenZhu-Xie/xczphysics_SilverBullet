
Colors ${Red("red")} and ${Green("green")} and ${Blue("blue!")}.

1. https://community.silverbullet.md/t/custom-css-for-ttrpg-statblocks/2509/9

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
function Gray(text)   return ColorText(text, colors.gray) end

local function wrapWithColor(fnName)
  local text = editor.getSelection()
  editor.flashNotification(text, "info")
  if text and text ~= "" then
    editor.replaceSelection(string.format("{{%s(%q)}}", fnName, text))
  else
    local insertText = string.format("{{%s(\"\")}}", fnName)
    local pos = editor.getCursor()
    editor.insertText(insertText)
    editor.setCursor(pos + #string.format("{{%s(\"", fnName))
  end
end

local colorNames = { "Red", "Green", "Blue", "Yellow", "Purple" }

for _, name in ipairs(colorNames) do
  local key = string.lower(string.sub(name, 1, 1))

  command.define {
    name = "Text: " .. name,
    category = "Style",
    key = "Alt-" .. key,
    description = string.format("将文本标记为柔和%s色", name),
    run = function()
      wrapWithColor(name)
    end
  }
end
```
