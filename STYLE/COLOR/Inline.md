
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
  purple = "#BAA7E5",
  gray   = "#B0BEC5"
}

local function ColorText(text, color)
  return widget.html(dom.span {
    style = string.format("color:%s; font-weight:600; font-family:sans-serif;", color),
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
  if text and text ~= "" then
    editor.replaceSelection(string.format("{{%s(%q)}}", fnName, text))
  else
    local insertText = string.format("{{%s(\"\")}}", fnName)
    local pos = editor.getCursor()
    editor.insertText(insertText)
    editor.setCursor(pos + #string.format("{{%s(\"", fnName))
  end
end

local colorNames = { "Red", "Green", "Blue", "Yellow", "Purple", "Gray" }

for _, name in ipairs(colorNames) do
  command.define {
    name = "Color: " .. name .. " Text",
    category = "Style",
    description = string.format("将文本标记为柔和%s色", name),
    execute = function()
      wrapWithColor(name)
    end
  }
end
```

```space-lua
-- 🟥 Ctrl-1 柔和红
command.define {
  name = "Text: Red",
  key = "Ctrl-1",
  run = function()
    wrapWithColor("Red")
  end
}

-- 🟩 Ctrl-2 柔和绿
command.define {
  name = "Text: Green",
  key = "Ctrl-2",
  run = function()
    wrapWithColor("Green")
  end
}

-- 🟦 Ctrl-3 柔和蓝
command.define {
  name = "Text: Blue",
  key = "Ctrl-3",
  run = function()
    wrapWithColor("Blue")
  end
}

-- 🟨 Ctrl-4 柔和黄
command.define {
  name = "Text: Yellow",
  key = "Ctrl-4",
  run = function()
    wrapWithColor("Yellow")
  end
}

-- 🟪 Ctrl-5 柔和紫
command.define {
  name = "Text: Purple",
  key = "Ctrl-5",
  run = function()
    wrapWithColor("Purple")
  end
}

-- ⚪ Ctrl-6 柔和灰
command.define {
  name = "Text: Gray",
  key = "Ctrl-6",
  run = function()
    wrapWithColor("Gray")
  end
}
```