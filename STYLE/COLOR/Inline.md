
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

-- 获取选中文本
function getSelectedText()
  local sel = editor.getSelection()
  if not sel or sel.from == sel.to then return nil end
  local text = editor.getText()
  return text:sub(sel.from + 1, sel.to), sel
end

-- 核心函数：用指定颜色函数包裹选中内容
local function wrapWithColor(fnName)
  local text, sel = getSelectedText()
  if text and text ~= "" then
    -- 替换选中文本
    local newText = string.format("{{%s(%q)}}", fnName, text)
    editor.replaceRange(sel.from, sel.to, newText)
  else
    -- 无选区时插入模板并定位光标
    local insertText = string.format("{{%s(\"\")}}", fnName)
    local pos = editor.getCursor()
    editor.insertAtCursor(insertText, true)
    -- 将光标移动到引号内
    local newPos = pos + #string.format("{{%s(\"", fnName))
    editor.moveCursor(newPos, false)
  end
end

-- 注册 5 个命令
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
