
asdf
```space-lua
-- Stable Cursor Reference Plugin v6
-- Clipboard-only, dynamic cursor position reference
-- No bottom widget

anchors = anchors or {}

-- Command: Copy reference using cursor position
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

    -- Register anchor in SB index using cursor position
    index.tag("anchor", { page = pageName, pos = pos })
    anchors[pageName] = anchors[pageName] or {}
    anchors[pageName][pos] = true

    -- Build reference string
    local refString = string.format("[[%s@%d]]", pageName, pos)
    local ok, err = pcall(function() editor.copyToClipboard(refString) end)
    if ok then
      editor.flashNotification("Copied reference: " .. refString, "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}

-- Click navigation for references
event.listen {
  name = "page:click",
  run = function(e)
    local word = editor.getWordAtPos(e.data.pos)
    if not word then return end

    -- Parse [[PageName@pos]]
    local pageName, posStr = word:match("%[%[([^@]+)@([^%]]+)%]%]")
    if not pageName or not posStr then return end
    local pos = tonumber(posStr)
    if not pos then return end

    -- Parameterized query to find the anchor
    local results = query[[
      from index.tag "anchor"
      where _.page == pageName and _.pos == pos
    ]]

    if #results == 0 then
      editor.flashNotification("Reference not found", "error")
      return
    end

    local anchor = results[1]
    editor.navigate({ kind = "page", page = anchor.page, pos = anchor.pos })
  end
}

```


