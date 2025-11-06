
# Data

- One [mode: warm]
- Two [mode: cool]
- Three [mode: hot]
- Four [mode: hot]

## Effect

${buildList(query[[
  from index.tag "item"
  where _.page == editor.getCurrentPage()
  order by _.name
]])}
1. https://community.silverbullet.md/t/advanced-styling-of-liq-queries-beyond-basic-template-strings/3491/2

```space-lua
function buildList(q)
  local items = {}

  local function modeColor(mode)
    if mode == "hot" then
      return "red"
    elseif mode == "cool" then
      return "blue"
    elseif mode == "warm" then
      return "orange"
    else
      return "black"
    end
  end

  for r in q do
    table.insert(items,
      dom.div {
        style = "margin-bottom: 4px;",
        dom.span { r.name .. " with mode " },
        dom.span {
          style = "color: " .. modeColor(r.mode) .. "; font-weight: bold;",
          r.mode
        }
      }
    )
  end

  return widget.htmlBlock(dom.div {
    style = "font-family: sans-serif; font-size: 14px;",
    table.unpack(items)
  })
end
```