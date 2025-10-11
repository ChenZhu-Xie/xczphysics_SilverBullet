

```space-lua
-- Stable Cursor Reference Plugin
-- 1. Copy a stable reference at the cursor
-- 2. Render clickable references in the document for navigation

anchors = anchors or {}

-- Template for rendering clickable references (keeps WikiLink-like look)
local refTemplate = template.new [==[
**[[${_.page}@${_.id}]]**
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

    -- Register anchor in index
    index.tag("anchor", {
      page = pageName,
      pos = pos,
      id = anchorId
    })

    -- Optional in-memory map
    anchors[anchorId] = { page = pageName, pos = pos }

    -- Copy reference text
    local refString = string.format("[[%s@%s]]", pageName, anchorId)
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

  -- Query anchors for current page
  local refs = query[[
    from index.tag "anchor"
    where _.page == pageName
    order by pos
  ]]

  if #refs == 0 then return end

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

-- Event: click on reference text to navigate
event.listen {
  name = "page:click",
  run = function(e)
    -- Word under clicked position
    local pos = e.data and e.data.pos or e.pos
    if not pos then return end
    local word = editor.getWordAtPos(pos)
    if not word then return end

    -- Parse [[Page@anchorId]]
    local pageName, anchorId = word:match("%[%[([^@]+)@([^%]]+)%]%]")
    if not pageName or not anchorId then return end

    -- Query anchor by page and id (formatted exactly as requested)
    local results = query[[
      from index.tag "anchor"
      where _.page == pageName and _.id == anchorId
    ]]

    if #results == 0 then
      editor.flashNotification("Anchor not found or removed", "error")
      return
    end

    -- Navigate to stored position
    local anchor = results[1]
    editor.navigate({
      kind = "page",
      page = anchor.page,
      pos = anchor.pos
    })
  end
}
```


