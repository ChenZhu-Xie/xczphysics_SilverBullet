---
name: CONFIG/Paste_as/Cursor_Anchor
tags: meta/library
pageDecoration.prefix: "📎 "
---
#forward #object

# Bi-directional Linking System @ Cursor

## here we go


### Less Index Overhead 4.2

==Update==
1. no text display if no forward-label/backrefs/siblings found 
2. switch emoji 🧑‍🤝‍🧑,➡️
3. add auto reindex `alt+q` (refresh widgets)
4. 4 commands for different input
 - Ctrl-<>       for manual input
 - Ctrl-Shift-<> for quick  input

|     ​    | Ctrl- | Ctrl-Shift- |
|----------|----------|----------|
| , (<) | `[[prompt|(select)C]]`, copy:L | `[[select (or prompt)|C]]`, copy:L |
| . (>) | `[[prompt|(select)C]]`, copy:L | `[[paste (or prompt)|(select)C]]`, copy:L |

```space-lua
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

function usrPrompt(hinText, iniText)
  local iniText = iniText or ""
  local input = editor.prompt(hinText, iniText)
  if not input then
    editor.flashNotification("Cancelled", "warn")
  end
  return input
end

local anchorSymbol = "⚓"
local suffixFlabel = "🧑‍🤝‍🧑"
local suffixBlabel = "🔙"
local siblings = "➡️"

-- =========== Forth Anchor + Back Refs ==================

local function tableBack(Flabel)
  local aspiringPage = Flabel .. anchorSymbol
  return query[[
    from index.tag "link"
    where toPage == aspiringPage and alias:find(suffixFlabel, 1, true)
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backRefs(Flabel)
  local str = template.each(tableBack(Flabel), template.new[==[​[[${_.ref}|${_.thBlabel}]]​]==])
  if #str == 0 then return "​" end
  return str
end

command.define {
  name = "Insert: ForthAnchor + BackRefs (sel: label)",
  key = "Ctrl-Shift-,",
  run = function()
    local iniText = getSelectedText() or ""
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Enter: label (to be Referred)', '')
    end
    if not Flabel then return end
    local aspiringPage = Flabel .. anchorSymbol
    local forthAnchor = "[[" .. aspiringPage .. "||^|" .. suffixBlabel .. "]]"
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backRefs
    if iniText and iniText ~= "" then setSelectedText("") end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
    editor.invokeCommand("Widgets: Refresh All")
  end
}

command.define {
  name = "Insert: ForthAnchor + BackRefs (sel: alias)",
  key = "Ctrl-,",
  run = function()
    local alias = getSelectedText() or ""
    local Flabel = usrPrompt('Enter: label (to be Referred)', '')
    if not Flabel then return end
    local aspiringPage = Flabel .. anchorSymbol
    local forthAnchor = "[[" .. aspiringPage .. "||^|" .. suffixBlabel .. "]]"
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backRefs
    if alias and alias ~= "" then setSelectedText("") end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
    editor.invokeCommand("Widgets: Refresh All")
  end
}

-- =========== Back Anchor + Forth Ref ==================

local function tableBack_noSelf(Flabel, thBlabelNum)
  local aspiringPage = Flabel .. anchorSymbol
  return query[[
    from index.tag "link"
    where toPage == aspiringPage and alias:find(suffixFlabel, 1, true) and thBlabelNum ~= _.thBlabel
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backRefs_noSelf(Flabel, thBlabelNum)
  local str = template.each(tableBack_noSelf(Flabel, thBlabelNum), template.new[==[​[[${_.ref}|${_.thBlabel}]]​]==])
  if #str == 0 then return "​" end
  return str
end

local function tableForth(Flabel)
  local aspiringPage = Flabel .. anchorSymbol
  return query[[
    from index.tag "link"
    where toPage == aspiringPage and alias:find(suffixBlabel, 1, true)
    select {ref=_.ref}
  ]]
end

function forthRef(Flabel)
  local str = template.each(tableForth(Flabel), template.new("[[${_.ref}|​" .. siblings .. "​]]"))
  if #str == 0 then return "​" end
  return str
end

command.define {
  name = "Insert: BackAnchor + ForthRef (label: input)",
  key = "Ctrl-.",
  run = function()
    local alias = getSelectedText() or ""
    local Flabel = usrPrompt('Jump to: label', '')
    if not Flabel then return end
    local thBlabelNum = #tableBack(Flabel) + 1
    local aspiringPage = Flabel .. anchorSymbol
    local backAnchor = "[[" .. aspiringPage .. "||^|" .. suffixFlabel .. thBlabelNum .. "]]"
    local forthRef = '${forthRef("' .. Flabel .. '")}'
    local backRefs_noSelf = '${backRefs_noSelf("' .. Flabel .. '",' .. thBlabelNum .. ')}'
    local fullText = backAnchor .. forthRef .. backRefs_noSelf
    if alias and alias ~= "" then setSelectedText("") end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
    editor.invokeCommand("Widgets: Refresh All")
  end
}

command.define {
  name = "Insert: BackAnchor + ForthRef (label: clip)",
  key = "Ctrl-Shift-.",
  run = function()
    local alias = getSelectedText() or ""
    local iniText = js.window.navigator.clipboard.readText()
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Jump to: label', '')
    end
    if not Flabel then return end
    local thBlabelNum = #tableBack(Flabel) + 1
    local aspiringPage = Flabel .. anchorSymbol
    local backAnchor = "[[" .. aspiringPage .. "||^|" .. suffixFlabel .. thBlabelNum .. "]]"
    local forthRef = '${forthRef("' .. Flabel .. '")}'
    local backRefs_noSelf = '${backRefs_noSelf("' .. Flabel .. '",' .. thBlabelNum .. ')}'
    local fullText = backAnchor .. forthRef .. backRefs_noSelf
    if alias and alias ~= "" then setSelectedText("") end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
    editor.invokeCommand("Widgets: Refresh All")
  end
}

index.defineTag {
  name = "link",
  metatable = {
    __index = function(self, attr)
      if attr == "thBlabel" then
        return tonumber(string.match(self.alias, suffixFlabel .. "([0-9]+)"))
      end
    end
  }
}
```

### backup 3.2

[[oiuweqr➡️|🔙]]${backRefs("oiuweqr")}
[[oiuweqr🔙1|➡️]]${forthRef("oiuweqr",1)}🧑‍🤝‍🧑${backRefs_noSelf("oiuweqr",1)}
[[oiuweqr🔙2|➡️]]${forthRef("oiuweqr",2)}🧑‍🤝‍🧑${backRefs_noSelf("oiuweqr",2)}

${query[[
    from index.tag "link"
    where toPage and toPage:find("oiuweqr➡️", 1, true)
  ]]}
${query[[
    from index.tag "aspiring-page"
    where name and name:find("oiuweqr➡️", 1, true)
  ]]}

```lua
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

function usrPrompt(hinText, iniText)
  local iniText = iniText or ""
  local input = editor.prompt(hinText, iniText)
  if not input then
    editor.flashNotification("Cancelled", "warn")
  end
  return input
end

local suffixFlabel = "➡️"
local suffixBlabel = "🔙"
local siblings = "🧑‍🤝‍🧑"

-- =========== Forth Anchor + Back Refs ==================

local function tableBack(Flabel)
  local aspiringPageBack = Flabel .. suffixBlabel
  return query[[
    from index.tag "link"
    where toPage and toPage:find(aspiringPageBack, 1, true)
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backRefs(Flabel)
  local str = template.each(tableBack(Flabel), template.new[==[​[[${_.ref}|${_.thBlabel}]]​]==])
  if #str == 0 then return "No BackRef" end
  return str
end

command.define {
  name = "Insert: ForthAnchor + BackRefs",
  key = "Ctrl-,",
  run = function()
    local iniText = getSelectedText()
    -- local Flabel = usrPrompt('Enter: label (to be Referred)', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Enter: label (to be Referred)', '')
    end
    if not Flabel then return end
    local aspiringPageForth = Flabel .. suffixFlabel
    local forthAnchor = "[[" .. aspiringPageForth .. "|" .. suffixBlabel .. "|^|]]"
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backRefs
    if iniText and iniText ~= "" then
      setSelectedText("") -- Delete selected iniText
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
  end
}

-- =========== Back Anchor + Forth Ref ==================

local function tableBack_noSelf(Flabel, thBlabelNum)
  local aspiringPageBack = Flabel .. suffixBlabel
  return query[[
    from index.tag "link"
    where toPage and toPage:find(aspiringPageBack, 1, true) and thBlabelNum ~= _.thBlabel
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backRefs_noSelf(Flabel, thBlabelNum)
  local str = template.each(tableBack_noSelf(Flabel, thBlabelNum), template.new[==[​[[${_.ref}|${_.thBlabel}]]​]==])
  if #str == 0 then return "No Sibling" end
  return str
end

local function tableForth(Flabel)
  local aspiringPageForth = Flabel .. suffixFlabel
  return query[[
    from index.tag "link"
    where toPage == aspiringPageForth
    select {ref=_.ref}
  ]]
end

function forthRef(Flabel, thBlabelNum)
  local str = template.each(tableForth(Flabel), template.new("[[${_.ref}|​" .. thBlabelNum .. "​]]"))
  if #str == 0 then return "No such Anchor" end
  return str
end

command.define {
  name = "Insert: BackAnchor + ForthRef",
  key = "Ctrl-.",
  run = function()
    local alias = getSelectedText()
    local iniText = js.window.navigator.clipboard.readText()
    -- local Flabel = usrPrompt('Jump to: label', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Jump to: label', '')
    end
    if not Flabel then return end
    local thBlabelNum = #tableBack(Flabel) + 1
    local aspiringPageBack = Flabel .. suffixBlabel .. thBlabelNum
    local backAnchor = "[[" .. aspiringPageBack .. "||^|" .. suffixFlabel .. "]]"
    local forthRef = '${forthRef("' .. Flabel .. '",' .. thBlabelNum .. ')}'
    local backRefs_noSelf = '${backRefs_noSelf("' .. Flabel .. '",' .. thBlabelNum .. ')}'
    local fullText = backAnchor .. forthRef .. siblings .. backRefs_noSelf
    if alias and alias ~= "" then
      setSelectedText("") -- Delete selected alias
    else
      alias = ''
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
  end
}

index.defineTag {
  name = "link",
  metatable = {
    __index = function(self, attr)
      if attr == "thBlabel" then
        return tonumber(string.match(self.toPage, ".+" .. suffixBlabel .. "([0-9]+)"))
      end
    end
  }
}
```

### backup 3.1

[[mdn➡️|🔙]]${backRefs("mdn")}
[[mdn🔙1|➡️]]${forthRef("mdn",1)}
[[mdn🔙2|➡️]]${forthRef("mdn",2)}

```lua
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

function usrPrompt(hinText, iniText)
  local iniText = iniText or ""
  local input = editor.prompt(hinText, iniText)
  if not input then
    editor.flashNotification("Cancelled", "warn")
  end
  return input
end

local suffixFlabel = "➡️"
local suffixBlabel = "🔙"

-- =========== Forth Anchor + Back Refs ==================

local function tableBack(Flabel)
  local aspiringPageBack = Flabel .. suffixBlabel
  return query[[
    from index.tag "link"
    where toPage and toPage:find(aspiringPageBack, 1, true)
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backRefs(Flabel)
  local str = template.each(tableBack(Flabel), template.new[==[​[[${_.ref}|${_.thBlabel}]]​]==])
  if #str == 0 then return "No BackRef" end
  return str
end

command.define {
  name = "Insert: ForthAnchor + BackRefs",
  key = "Ctrl-,",
  run = function()
    local iniText = getSelectedText()
    -- local Flabel = usrPrompt('Enter: label (to be Referred)', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Enter: label (to be Referred)', '')
    end
    if not Flabel then return end
    local aspiringPageForth = Flabel .. suffixFlabel
    local forthAnchor = "[[" .. aspiringPageForth .. "||^|" .. suffixBlabel .. "]]"
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backRefs
    if iniText and iniText ~= "" then
      setSelectedText("") -- Delete selected iniText
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
  end
}

-- =========== Back Anchor + Forth Ref ==================

local function tableForth(Flabel)
  local aspiringPageForth = Flabel .. suffixFlabel
  return query[[
    from index.tag "link"
    where toPage == aspiringPageForth
    select {ref=_.ref}
  ]]
end

function forthRef(Flabel, thBlabelNum)
  local str = template.each(tableForth(Flabel), template.new("[[${_.ref}|​" .. thBlabelNum .. "​]]"))
  if #str == 0 then return "No such Anchor" end
  return str
end

command.define {
  name = "Insert: BackAnchor + ForthRef",
  key = "Ctrl-.",
  run = function()
    local alias = getSelectedText()
    local iniText = js.window.navigator.clipboard.readText()
    -- local Flabel = usrPrompt('Jump to: label', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Jump to: label', '')
    end
    if not Flabel then return end
    local thBlabelNum = #tableBack(Flabel) + 1
    local aspiringPageBack = Flabel .. suffixBlabel .. thBlabelNum
    local backAnchor = "[[" .. aspiringPageBack .. "||^|" .. suffixFlabel .. "]]"
    local forthRef = '${forthRef("' .. Flabel .. '",' .. thBlabelNum .. ')}'
    local fullText = backAnchor .. forthRef
    if alias and alias ~= "" then
      setSelectedText("") -- Delete selected alias
    else
      alias = ''
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
  end
}

index.defineTag {
  name = "link",
  metatable = {
    __index = function(self, attr)
      if attr == "thBlabel" then
        return tonumber(string.match(self.toPage, ".+" .. suffixBlabel .. "([0-9]+)"))
      end
    end
  }
}
```

### backup 2.2

[[aaa🔵|🔵]]${backrefStat("aaa")}🔙${backRefs("aaa")}
[[aaa🟣1|🟣]]${forthRef("aaa",1)}➡️${backrefStat("aaa")}
[[aaa🟣2|🟣]]${forthRef("aaa",2)}➡️${backrefStat("aaa")}

```lua
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

function usrPrompt(hinText, iniText)
  local iniText = iniText or ""
  local input = editor.prompt(hinText, iniText)
  if not input then
    editor.flashNotification("Cancelled", "warn")
  end
  return input
end

local suffixFlabel = "🔵"
local suffixBlabel = "🟣"
local F = '➡️'
local B = '🔙'

-- =========== Forth Anchor + Back Refs ==================

local function tableBack(Flabel)
  local aspiringPageBack = Flabel .. suffixBlabel
  return query[[
    from index.tag "link"
    where toPage and toPage:find(aspiringPageBack, 1, true)
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backrefStat(Flabel)
  return #tableBack(Flabel)
end

function backRefs(Flabel)
  local str = template.each(tableBack(Flabel), template.new[==[​[[${_.ref}|${_.thBlabel}]]​]==])
  if #str == 0 then return "No BackRef" end
  return str
end

command.define {
  name = "Insert: ForthAnchor + BackRefs",
  key = "Ctrl-,",
  run = function()
    local iniText = getSelectedText()
    -- local Flabel = usrPrompt('Enter: label (to be Referred)', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Enter: label (to be Referred)', '')
    end
    if not Flabel then return end
    local aspiringPageForth = Flabel .. suffixFlabel
    local forthAnchor = "[[" .. aspiringPageForth .. "||^|" .. suffixFlabel .. "]]"
    local backrefStat = '${backrefStat("' .. Flabel .. '")}'
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backrefStat .. B .. backRefs
    if iniText and iniText ~= "" then
      setSelectedText("") -- Delete selected iniText
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
  end
}

-- =========== Back Anchor + Forth Ref ==================

local function tableForth(Flabel)
  local aspiringPageForth = Flabel .. suffixFlabel
  return query[[
    from index.tag "link"
    where toPage == aspiringPageForth
    select {ref=_.ref}
  ]]
end

function forthRef(Flabel, thBlabelNum)
  local str = template.each(tableForth(Flabel), template.new("[[${_.ref}|​" .. thBlabelNum .. "​]]"))
  if #str == 0 then return "No such Anchor" end
  return str
end

command.define {
  name = "Insert: BackAnchor + ForthRef",
  key = "Ctrl-.",
  run = function()
    local alias = getSelectedText()
    local iniText = js.window.navigator.clipboard.readText()
    -- local Flabel = usrPrompt('Jump to: label', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Jump to: label', '')
    end
    if not Flabel then return end
    local thBlabelNum = backrefStat(Flabel) + 1
    local aspiringPageBack = Flabel .. suffixBlabel .. thBlabelNum
    local backAnchor = "[[" .. aspiringPageBack .. "||^|" .. suffixBlabel .. "]]"
    local forthRef = '${forthRef("' .. Flabel .. '",' .. thBlabelNum .. ')}'
    local backrefStat = '${backrefStat("' .. Flabel .. '")}'
    local fullText = backAnchor .. forthRef .. F .. backrefStat
    if alias and alias ~= "" then
      setSelectedText("") -- Delete selected alias
    else
      alias = ''
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
  end
}

index.defineTag {
  name = "link",
  metatable = {
    __index = function(self, attr)
      if attr == "thBlabel" then
        return tonumber(string.match(self.toPage, ".+" .. suffixBlabel .. "([0-9]+)"))
      end
    end
  }
}
```

### backup 2.1

```lua
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

function usrPrompt(hinText, iniText)
  local iniText = iniText or ""
  local input = editor.prompt(hinText, iniText)
  if not input then
    editor.flashNotification("Cancelled", "warn")
  end
  return input
end

local suffixFlabel = "🔵"
local suffixBlabel = "🟣"
local F = '➡️'
local B = '🔙'

-- =========== Forth Anchor + Back Refs ==================

local function tableBack(Flabel)
  local aspiringPageBack = Flabel .. suffixBlabel
  return query[[
    from index.tag "link"
    where toPage and toPage:find(aspiringPageBack, 1, true)
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backrefStat(Flabel)
  return #tableBack(Flabel)
end

function backRefs(Flabel)
  local str = template.each(tableBack(Flabel), template.new[==[​[[${_.ref}|${_.thBlabel}]]​]==])
  if #str == 0 then return "No BackRef" end
  return str
end

command.define {
  name = "Insert: ForthAnchor + BackRefs",
  key = "Ctrl-,",
  run = function()
    local iniText = getSelectedText()
    -- local Flabel = usrPrompt('Enter: label (to be Referred)', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Enter: label (to be Referred)', '')
    end
    if not Flabel then return end
    local aspiringPageForth = Flabel .. suffixFlabel
    local forthAnchor = "[[" .. aspiringPageForth .. "||^|" .. suffixFlabel .. "]]"
    local backrefStat = '${backrefStat("' .. Flabel .. '")}'
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backrefStat .. B .. backRefs
    if iniText and iniText ~= "" then
      setSelectedText("") -- Delete selected iniText
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
  end
}

-- =========== Back Anchor + Forth Ref ==================

local function tableForth(Flabel)
  local aspiringPageForth = Flabel .. suffixFlabel
  return query[[
    from index.tag "link"
    where toPage == aspiringPageForth
    select {ref=_.ref}
  ]]
end

function forthRef(Flabel)
  local str = template.each(tableForth(Flabel), template.new("[[${_.ref}|​" .. backrefStat(Flabel) .. "​]]"))
  if #str == 0 then return "No such Anchor" end
  return str
end

command.define {
  name = "Insert: BackAnchor + ForthRef",
  key = "Ctrl-.",
  run = function()
    local alias = getSelectedText()
    local iniText = js.window.navigator.clipboard.readText()
    -- local Flabel = usrPrompt('Jump to: label', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Jump to: label', '')
    end
    if not Flabel then return end
    local thBlabelNum = backrefStat(Flabel) + 1
    local aspiringPageBack = Flabel .. suffixBlabel .. thBlabelNum
    local backAnchor = "[[" .. aspiringPageBack .. "||^|" .. suffixBlabel .. "]]"
    local forthRef = '${forthRef("' .. Flabel .. '")}'
    local fullText = backAnchor .. thBlabelNum .. F .. forthRef
    if alias and alias ~= "" then
      setSelectedText("") -- Delete selected alias
    else
      alias = ''
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
  end
}

index.defineTag {
  name = "link",
  metatable = {
    __index = function(self, attr)
      if attr == "thBlabel" then
        return tonumber(string.match(self.toPage, ".+" .. suffixBlabel .. "([0-9]+)"))
      end
    end
  }
}
```

### backup 1

[[simpler🔵|]]${backrefStat("simpler")} 🔙 ${backRefs("simpler")}

[[simpler🟣2|simpler🟣]]~2~ ➡️ ${forthRef("simpler")}${backrefStat("simpler")}
1. [[simpler🟣3|simpler🟣]]~3~ ➡️ ${forthRef("simpler")}${backrefStat("simpler")}
[[simpler🟣1|simpler🟣]]~1~ ➡️ ${forthRef("simpler")}${backrefStat("simpler")}

| Header A | Header B |
|----------|----------|
| Cell A | [[simpler🟣4|simpler🟣]]~4~ ➡️ ${forthRef("simpler")}${backrefStat("simpler")} Cell B |

* [ ] [[simpler🟣5|simpler🟣]]~5~ ➡️ ${forthRef("simpler")}${backrefStat("simpler")}

```lua
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

function usrPrompt(hinText, iniText)
  local iniText = iniText or ""
  local input = editor.prompt(hinText, iniText)
  if not input then
    editor.flashNotification("Cancelled", "warn")
  end
  return input
end

local suffixFlabel = "🔵"
local suffixBlabel = "🟣"
local F = " ➡️ "
local B = " 🔙 "

-- =========== Forth Anchor + Back Refs ==================

local function tableBack(Flabel)
  local aspiringPageBack = Flabel .. suffixBlabel
  return query[[
    from index.tag "link"
    where toPage and toPage:find(aspiringPageBack, 1, true)
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backrefStat(Flabel)
  return #tableBack(Flabel)
end

function backRefs(Flabel)
  local str = template.each(tableBack(Flabel), template.new[==[​[[${_.ref}]]~${_.thBlabel}~]==])
  if #str == 0 then return "No BackRef" end
  return str
end

command.define {
  name = "Insert: ForthAnchor + BackRefs",
  key = "Ctrl-,",
  run = function()
    local iniText = getSelectedText()
    -- local Flabel = usrPrompt('Enter: label (to be Referred)', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Enter: label (to be Referred)', '')
    end
    if not Flabel then return end
    local aspiringPageForth = Flabel .. suffixFlabel
    local forthAnchor = "[[" .. aspiringPageForth .. "||^|]]"
    local backrefStat = '${backrefStat("' .. Flabel .. '")}'
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backrefStat .. B .. backRefs
    if iniText and iniText ~= "" then
      setSelectedText("") -- Delete selected iniText
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.copyToClipboard(Flabel)
  end
}

-- =========== Back Anchor + Forth Ref ==================

local function tableForth(Flabel)
  local aspiringPageForth = Flabel .. suffixFlabel
  return query[[
    from index.tag "link"
    where toPage == aspiringPageForth
    select {ref=_.ref}
  ]]
end

function forthRef(Flabel)
  local str = template.each(tableForth(Flabel), template.new[==[​[[${_.ref}]]​]==])
  if #str == 0 then return "No such Anchor" end
  return str
end

command.define {
  name = "Insert: BackAnchor + ForthRef",
  key = "Ctrl-.",
  run = function()
    local alias = getSelectedText()
    local iniText = js.window.navigator.clipboard.readText()
    -- local Flabel = usrPrompt('Jump to: label', iniText)
    local Flabel
    if iniText and iniText ~= "" then
      Flabel = iniText
    else
      Flabel = usrPrompt('Jump to: label', '')
    end
    if not Flabel then return end
    local thBlabelNum = backrefStat(Flabel) + 1
    local aspiringPageBack = Flabel .. suffixBlabel .. thBlabelNum
    local backAnchor = "[[" .. aspiringPageBack .. "||^|]]"
    local theBlabel = "~" .. thBlabelNum .."~"
    local forthRef = '${forthRef("' .. Flabel .. '")}'
    local backrefStat = '${backrefStat("' .. Flabel .. '")}'
    local fullText = backAnchor .. theBlabel .. F .. forthRef .. backrefStat
    if alias and alias ~= "" then
      setSelectedText("") -- Delete selected alias
    else
      alias = Flabel .. suffixBlabel -- alias = ''
    end
    editor.insertAtPos(fullText, editor.getCursor(), true)
    editor.insertAtCursor(alias, false) -- scrollIntoView?
  end
}

index.defineTag {
  name = "link",
  metatable = {
    __index = function(self, attr)
      if attr == "thBlabel" then
        return tonumber(string.match(self.toPage, ".+" .. suffixBlabel .. "([0-9]+)"))
      end
    end
  }
}
```

## first attempt

1. an testing improvement from [[CONFIG/Copy_as/Cursor_Wiki]] 
2. https://community.silverbullet.md/t/generate-link-cursor-position/3372/2?u=chenzhu-xie

```lua
-- Stable Cursor Reference Plugin
-- Author: Expert
-- Description:
--   Provides a command to copy a reference at the current cursor position,
--   formatted as [[PageName@position]], which automatically stays valid
--   even after the document is edited.
--   This works by using SilverBullet’s built-in "link" index, which updates
--   cursor positions whenever the page content changes.
--   No widgets or extra rendering logic are required.

command.define {
  name = "Cursor: Copy Auto-updating Reference",
  key = "Alt-C",
  run = function()
    -- Step 1: Get the current page name
    local pageName = editor.getCurrentPage()
    if not pageName then
      editor.flashNotification("Failed to get current page name", "error")
      return
    end

    -- Step 2: Get the current cursor position (as a numeric offset)
    local pos = editor.getCursor()
    if type(pos) ~= "number" then
      editor.flashNotification("Cursor position is not numeric", "error")
      return
    end

    -- Step 3: Register a standard "link" tag in the SilverBullet index
    -- The built-in "link" index is automatically re-computed whenever
    -- the document changes, ensuring the link position stays accurate.
    index.tag("link", {
      page = pageName,     -- The page where this reference originates
      toPage = pageName,   -- The target page (self-reference)
      pos = pos            -- The current cursor offset in the file
    })

    -- Step 4: Build the actual wiki-style reference string
    local ref = string.format("[[%s@%d]]", pageName, pos)

    -- Step 5: Copy it to the clipboard
    local ok, err = pcall(function()
      editor.copyToClipboard(ref)
    end)

    if ok then
      editor.flashNotification("Copied auto-updating reference: " .. ref, "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}

```

