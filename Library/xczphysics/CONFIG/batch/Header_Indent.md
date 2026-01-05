---
author: Chenzhu-Xie
name: Library/xczphysics/CONFIG/batch/Header_Indent
tags: meta/library
pageDecoration.prefix: "⏩ "
---

# Batch Header Indent

==`Ctrl-]`==
Add `Header: Indent Selected` to CMD
==`Ctrl-[`==
Add `Header: Outdent Selected` to CMD

```space-lua
-- =========================================================
-- Helpers
-- =========================================================

local function getLineStart(text, pos)
  if not text or not pos or pos <= 0 then return 0 end
  local searchEnd = pos
  if searchEnd > #text then searchEnd = #text end
  for i = searchEnd, 1, -1 do
    if text:sub(i, i) == "\n" then return i end
  end
  return 0
end

local function getLineEnd(text, pos)
  if not text or not pos or pos >= #text then return #text end
  local searchStart = pos + 1
  if searchStart < 1 then searchStart = 1 end
  for i = searchStart, #text do
    if text:sub(i, i) == "\n" then return i end
  end
  return #text
end

local function getFullLineBoundaries(sel, text)
  if not sel then return 0, #text end
  local startPos = getLineStart(text, sel.from)
  local effectiveEnd = sel.to
  if sel.to > sel.from and sel.to > 0 then
    if sel.to <= #text then
      if getLineStart(text, sel.to) == sel.to then
         effectiveEnd = sel.to - 1
      end
    end
  end
  return startPos, getLineEnd(text, effectiveEnd)
end

-- New Helper: Check if a position starts inside a code block by counting backticks
local function startsInsideCodeBlock(text, pos)
  local prefix = text:sub(1, pos)
  local _, count = prefix:gsub("```", "")
  return (count % 2) ~= 0
end

-- =========================================================
-- Core Logic
-- =========================================================

local function batchUpdateHeaders(delta)
  local sel = editor.getSelection()
  if not sel then return end
  
  local text = editor.getText()
  if not text or text == "" then return end
  
  local rangeStart, rangeEnd = getFullLineBoundaries(sel, text)
  local textBlock = text:sub(rangeStart + 1, rangeEnd)
  if not textBlock or textBlock == "" then return end

  -- Initialize state: are we already inside a code block before this selection?
  local inCodeBlock = startsInsideCodeBlock(text, rangeStart)
  
  local newLines = {}
  for line in textBlock:gmatch("([^\n]*\n?)") do
    if line ~= "" then
      -- 1. Toggle state if we hit a code block delimiter
      if line:match("^```") then
        inCodeBlock = not inCodeBlock
      end

      -- 2. Only process header logic if NOT inside a code block
      if not inCodeBlock then
        local hashes, rest = line:match("^(#+)%s(.*)")
        if hashes then
          local currentLevel = #hashes
          if delta > 0 then
            if currentLevel < 6 then line = "#" .. line end
          elseif delta < 0 then
            if currentLevel > 1 then
              line = line:sub(2)
            elseif currentLevel == 1 then
              line = line:gsub("^#%s", "", 1)
            end
          end
        end
      end
      
      table.insert(newLines, line)
    end
  end
  
  if #newLines > 0 then
    local newText = table.concat(newLines)
    if newText ~= textBlock then
      editor.replaceRange(rangeStart, rangeEnd, newText)
    end
    editor.setSelection(rangeStart, rangeStart + #newText)
  end
end

-- =========================================================
-- Command Registration
-- =========================================================

command.define {
  name = "Header: Indent Selected",
  key = "Ctrl-]",
  run = function() batchUpdateHeaders(1) end
}

command.define {
  name = "Header: Outdent Selected",
  key = "Ctrl-[",
  run = function() batchUpdateHeaders(-1) end
}
```

