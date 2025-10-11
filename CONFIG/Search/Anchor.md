

```space-lua
-- Stable Cursor Reference Plugin (clipboard only, cursor position)
-- 1. Copy reference at cursor
-- 2. Clickable navigation in document
-- No bottom widget

-- Command: Copy reference using cursor position
command.define {
  name = "Cursor: Copy Reference (pos only)",
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

    -- Register anchor using pos directly
    index.tag("anchor", { page = pageName, pos = pos })

    -- Build reference string
    local refString = string.format("[[%s@%d]]", pageName, pos)
    editor.copyToClipboard(refString)
    editor.flashNotification("Copied reference: " .. refString, "info")
  end
}

-- Click navigation for references
event.listen {
  name = "page:click",
  run = function(e)
    local word = editor.getWordAtPos(e.data.pos)
    if not word then return end

    local pageName, posStr = word:match("%[%[([^@]+)@([^%]]+)%]%]")
    if not pageName or not posStr then return end
    local pos = tonumber(posStr)

    -- Parameterized query to safely get anchor
    local results = query[[
      from index.tag "anchor"
      where _.page == pageName and _.pos == pos
    ]]

    if #results == 0 then
      editor.flashNotification("Reference not found", "error")
      return
    end

    editor.navigate({ kind="page", page=pageName, pos=pos })
  end
}

```

