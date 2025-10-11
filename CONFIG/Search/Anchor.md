

```space-lua
-- Stable Cursor Reference Plugin v4 (Custom Brackets Variant)
-- 1. Copy a stable reference at the cursor
-- 2. Render clickable references in the document for navigation

anchors = anchors or {}

-- Use custom full-width brackets to avoid built-in WikiLink
local refTemplate = template.new [==[
**⟦${_.page}@${_.id}⟧**
]==]

-- Command: Copy stable reference
command.define {
  name = "Cursor: Copy Stable Reference",
  run = function()
    -- Get current page
    local pageName = editor.getCurrentPage()
    if not pageName then
      editor.flashNotification("Failed to get current page name", "error")
      return
    end

    -- Get cursor position (number)
    local pos = editor.getCursor()
    if type(pos) ~= "number" then
      editor.flashNotification("Cursor position is not a number", "error")
      return
    end

    -- Generate unique anchor ID
    local anchorId = string.format("anchor_%d_%d", os.time(), pos)

    -- Register anchor in SB index
    index.tag("anchor", {
      page = pageName,
      pos = pos,
      id = anchorId
    })

    -- Optional in-memory map
    anchors[anchorId] = { page = pageName, pos = pos }

    -- Build and copy reference text using custom brackets
    local refString = string.format("⟦%s@%s⟧", pageName, anchorId)
    local ok, err = pcall(function() editor.copyToClipboard(refString) end)
    if ok then
      editor.flashNotification("Copied stable reference: " .. refString, "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}

-- Widget: Render clickable references at bottom of page
widgets = widgets or {}
function widgets.stableReferences(pageName)
  pageName = pageName or editor.getCurrentPage()

  -- Parameterized query to avoid DSL scope issues
  local refs = query[[
    from index.tag "anchor"
    where _.page == pageName
    order by pos
  ]]

  if not refs or #refs == 0 then return end

  return widget.new {
    markdown = "# Stable References\n" .. template.each(refs, refTemplate)
  }
end

-- Hook: render bottom widgets
event.listen {
  name = "hooks:renderBottomWidgets",
  run = function()
    return widgets.stableReferences()
  end
}

-- Helper: robustly extract ⟦Page@anchor⟧ (fallback to [[Page@anchor]])
local function extractCustomAnchorAtPos(pos)
  -- Prefer line-based extraction to avoid word boundary issues
  local lineStart, lineEnd
  if editor.getLineRangeAtPos then
    local ok, a, b = pcall(editor.getLineRangeAtPos, pos)
    if ok then lineStart, lineEnd = a, b end
  end

  if lineStart and lineEnd and editor.getText then
    local ok, line = pcall(editor.getText, lineStart, lineEnd)
    if ok and line and #line > 0 then
      local rel = math.max(1, (pos - lineStart) + 1)
      -- find nearest ⟦ ... ⟧ around cursor
      local leftIdx
      do
        local prefix = line:sub(1, rel)
        local i = 0
        while true do
          local j = prefix:find("⟦", i + 1, true)
          if not j then break end
          leftIdx = j
          i = j
        end
      end
      if leftIdx then
        local rightIdx = line:find("⟧", rel, true)
        if rightIdx then
          local token = line:sub(leftIdx, rightIdx)
          local pageName, anchorId = token:match("⟦([^@]+)@([^⟧]+)⟧")
          if pageName and anchorId then
            pageName = pageName:gsub("^%s+", ""):gsub("%s+$", "")
            anchorId = anchorId:gsub("^%s+", ""):gsub("%s+$", "")
            return pageName, anchorId
          end
        end
      end
    end
  end

  -- Fallback: word-based extraction
  if editor.getWordAtPos then
    local word = editor.getWordAtPos(pos)
    if word and #word > 0 then
      local pageName, anchorId = word:match("⟦([^@]+)@([^⟧]+)⟧")
      if pageName and anchorId then return pageName, anchorId end
      pageName, anchorId = word:match("%[%[([^@]+)@([^%]]+)%]%]")
      if pageName and anchorId then return pageName, anchorId end
    end
  end
end

-- Event: click on reference text to navigate
event.listen {
  name = "page:click",
  run = function(e)
    local pos = (e and e.data and e.data.pos) or (e and e.pos)
    if not pos then return end

    -- Prefer ⟦Page@anchor⟧; fallback to [[Page@anchor]]
    local pageName, anchorId = extractCustomAnchorAtPos(pos)
    if not pageName or not anchorId then return end

    -- Parameterized query for the anchor
    local results = query[[
      from index.tag "anchor"
      where _.page == pageName and _.id == anchorId
      order by pos
    ]]

    if not results or #results == 0 then
      editor.flashNotification("Anchor not found or removed", "error")
      return
    end

    local anchor = results[1]
    editor.navigate({
      kind = "page",
      page = anchor.page,
      pos = anchor.pos
    })
  end
}
```


