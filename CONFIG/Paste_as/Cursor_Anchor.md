---
recommend: ⭐⭐⭐⭐
udpateDate: 2025-11-10
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy_as/Cursor_Anchor.md"
---
#forward #object

## here we go

[[asdf➖|]]${backrefStat("asdf")}*ᵀ*🔙${backRefs("asdf")}

[[asdf➕|]]~1~🔜${backrefStat("asdf")}*ᵀ*${forthRef("asdf")}

==~t~==1

1==^t^==

```space-lua
function usrPrompt(hinText)
  local input = editor.prompt(hinText, "")
  if not input then
    editor.flashNotification("Cancelled", "warn")
  end
  return input
end

local suffixFlabel = "➖" -- "🗨"
local suffixBlabel = "➕" -- "🗯"
local F = "🔜" -- »
local B = "🔙" -- «

-- =========== Forth Anchor + Back Refs ==================

local function tableBack(Flabel)
  local aspiringPageBack = Flabel .. suffixBlabel
  return query[[
    from index.tag "link"
    where toPage and toPage:find(aspiringPageBack, 1, true) -- no Regex
    order by _.thBlabel
    select {ref=_.ref, thBlabel=_.thBlabel}
  ]]
end

function backrefStat(Flabel)
  return (tableBack(Flabel)).length
end

function backRefs(Flabel)
  local str = template.each(tableBack(Flabel), template.new[==[​*№*${_.thBlabel}​[[${_.ref}]]​]==])
  if #str == 0 then return "No BackRef" end
  return str
end

command.define {
  name = "insert: Forthanchor + Backrefs",
  key = "Ctrl-,",
  run = function()
    local Flabel = usrPrompt('Enter: label (to be Referred)')
    if not Flabel then return end
    local aspiringPageForth = Flabel .. suffixFlabel
    local forthAnchor = "[[" .. aspiringPageForth .. "||^|]]"
    local backrefStat = '${backrefStat("' .. Flabel .. '")}*ᵀ*'
    local backRefs = '${backRefs("' .. Flabel .. '")}'
    local fullText = forthAnchor .. backrefStat .. B .. backRefs
    editor.insertAtPos(fullText, editor.getCursor(), true)
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
  name = "insert: Backanchor + Forthref",
  key = "Ctrl-.",
  run = function()
    local Flabel = usrPrompt('Jump to: label')
    if not Flabel then return end
    local aspiringPageBack = Flabel .. suffixBlabel
    local backAnchor = "[[" .. aspiringPageBack .. "||^|]]"
    local thBlabel = "==№==" .. (tableBack(Flabel)).length + 1
    local backrefStat = '${backrefStat("' .. Flabel .. '")}*ᵀ*'
    local forthRef = '${forthRef("' .. Flabel .. '")}'
    local fullText = backAnchor .. thBlabel .. F .. backrefStat .. forthRef
    editor.insertAtPos(fullText, editor.getCursor(), true)
  end
}

index.defineTag {
  name = "link",
  metatable = {
    __index = function(self, attr)
      if attr == "thBlabel" then
        return tonumber(string.match(self.snippet, "%*([^%*]+)%*"))
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

