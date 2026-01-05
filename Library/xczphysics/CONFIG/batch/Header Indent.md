
# Batch Header Indent

## test
aasdfasdf

```space-lua
-- =========================================================
-- Helpers (must be defined before core logic)
-- =========================================================

-- Find 0-based line start index
local function getLineStart(text, pos)
  if not text or not pos or pos <= 0 then return 0 end
  
  local searchEnd = pos
  if searchEnd > #text then searchEnd = #text end
  
  -- Iterate backward to find the nearest newline
  for i = searchEnd, 1, -1 do
    if text:sub(i, i) == "\n" then
      -- Return 0-based index of the character following \n
      return i
    end
  end
  return 0
end

-- Find 0-based line end index (including trailing \n)
local function getLineEnd(text, pos)
  if not text or not pos or pos >= #text then return #text end
  
  local searchStart = pos + 1
  if searchStart < 1 then searchStart = 1 end
  
  -- Iterate forward to find the nearest newline
  for i = searchStart, #text do
    if text:sub(i, i) == "\n" then
      return i
    end
  end
  return #text
end

-- Expand selection to cover full lines
local function getFullLineBoundaries(sel, text)
  if not sel then return 0, #text end
  if not text or text == "" then return 0, 0 end
  
  local startPos = getLineStart(text, sel.from)
  local effectiveEnd = sel.to

  -- Prevent 'jump-down' bug: if cursor is at the start of a new line, retreat to previous line
  if sel.to > sel.from and sel.to > 0 then
    if sel.to <= #text then
      if getLineStart(text, sel.to) == sel.to then
         effectiveEnd = sel.to - 1
      end
    end
  end
  
  return startPos, getLineEnd(text, effectiveEnd)
end

-- =========================================================
-- Core Logic
-- =========================================================

-- Batch adjust header levels: delta 1 (Indent), -1 (Outdent)
local function batchUpdateHeaders(delta)
  local sel = editor.getSelection()
  if not sel then return end
  
  local text = editor.getText()
  if not text or text == "" then return end
  
  -- 1. Get full line range
  local rangeStart, rangeEnd = getFullLineBoundaries(sel, text)
  
  -- 2. Validate indices
  rangeStart = tonumber(rangeStart) or 0
  rangeEnd = tonumber(rangeEnd) or #text
  if rangeStart < 0 then rangeStart = 0 end
  if rangeEnd > #text then rangeEnd = #text end
  if rangeStart > rangeEnd then rangeStart, rangeEnd = rangeEnd, rangeStart end
  
  -- 3. Extract target text block (1-based Lua sub)
  local textBlock = text:sub(rangeStart + 1, rangeEnd)
  if not textBlock or textBlock == "" then return end
  
  local newLines = {}
  
  -- 4. Process line-by-line
  for line in textBlock:gmatch("([^\n]*\n?)") do
    if line ~= "" then
      local hashes, rest = line:match("^(#+)%s(.*)")
      
      if hashes then
        local currentLevel = #hashes
        if delta > 0 then
          -- Indent: Increase header level (max H6)
          if currentLevel < 6 then 
             line = "#" .. line
          end
        elseif delta < 0 then
          -- Outdent: Decrease level or convert H1 to plain text
          if currentLevel > 1 then
            line = line:sub(2)
          elseif currentLevel == 1 then
            line = line:gsub("^#%s", "", 1)
          end
        end
      end
      table.insert(newLines, line)
    end
  end
  
  -- 5. Execute replacement and reset selection to prevent drift
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
  run = function() 
    batchUpdateHeaders(1) 
  end
}

command.define {
  name = "Header: Outdent Selected",
  key = "Ctrl-[",
  run = function() 
    batchUpdateHeaders(-1) 
  end
}
```

