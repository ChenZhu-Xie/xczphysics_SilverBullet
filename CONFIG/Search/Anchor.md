

```space-lua
-- Stable Cursor Reference Plugin v2
-- 1. Copy a stable reference at the cursor
-- 2. Clickable references in documents jump to stable position

anchors = anchors or {}

-- Command: Copy stable reference
command.define {
  name = "Cursor: Copy Stable Reference",
  run = function()
    local pageName = editor.getCurrentPage()
    if not pageName then
      editor.flashNotification("Failed to get current page name", "error")
      return
    end

    local pos = editor.getCursor()
    if type(pos) ~= "number" then
      editor.flashNotification("Cursor position is not a number", "error")
      return
    end

    local anchorId = string.format("anchor_%d_%d", os.time(), pos)

    -- Register anchor in SB index
    index.tag("anchor", {
      page = pageName,
      pos = pos,
      id = anchorId
    })

    anchors[anchorId] = { page = pageName, pos = pos }

    local refString = string.format("[[%s@%s]]", pageName, anchorId)
    local ok, err = pcall(function() editor.copyToClipboard(refString) end)
    if ok then
      editor.flashNotification("Copied stable reference: " .. refString, "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}

-- Event: Clickable stable reference jump
event.listen {
  name = "page:click",
  run = function(e)
    local pos = e.data.pos
    local word = editor.getWordAtPos(pos)
    if not word then return end

    local pageName, anchorId = word:match("%[%[([^@]+)@([^%]]+)%]%]")
    if not pageName or not anchorId then return end

    -- Query SB index for this anchor
    local results = query[[
      from index.tag "anchor"
      where _.page == "]] .. pageName .. [[" and _.id == "]] .. anchorId .. [["
    ]]

    if #results == 0 then
      editor.flashNotification("Anchor not found or removed", "error")
      return
    end

    -- Navigate to latest anchor position
    local anchor = results[1]
    editor.navigate({
      kind = "page",
      page = anchor.page,
      pos = anchor.pos
    })
  end
}
```

