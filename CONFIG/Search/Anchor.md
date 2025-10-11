

```space-lua
-- Stable Cursor Reference Plugin
-- Provides:
-- 1. Copy a stable reference of the current cursor to the clipboard
-- 2. Clickable references in documents that jump to the stable position

-- Initialize global tables
anchors = anchors or {}

-- Template for rendering clickable stable references
local refTemplate = template.new [==[
**[[${_.page}@${_.id}]]**
]==]

-- Command: Copy stable reference at cursor
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

    -- Generate unique anchor ID
    local anchorId = string.format("anchor_%d_%d", os.time(), pos)

    -- Register in SB index/tag system
    index.tag("anchor", {
      page = pageName,
      pos = pos,
      id = anchorId
    })

    -- Optionally store in global table for plugin
    anchors[anchorId] = {
      page = pageName,
      pos = pos
    }

    -- Build reference string and copy
    local refString = string.format("[[%s@%s]]", pageName, anchorId)
    local ok, err = pcall(function() editor.copyToClipboard(refString) end)
    if ok then
      editor.flashNotification("Copied stable reference: " .. refString, "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}

-- Event: Listen for clicks on references and jump
event.listen {
  name = "page:click",
  run = function(e)
    local pos = e.data.pos
    local word = editor.getWordAtPos(pos)
    if not word then return end

    -- Parse [[Page@anchorId]]
    local pageName, anchorId = word:match("%[%[([^@]+)@([^%]]+)%]%]")
    if not pageName or not anchorId then return end

    -- Query index for this anchor
    local results = query([[
      from index.tag "anchor"
      where _.page == "]] .. pageName .. [[" and _.id == "]] .. anchorId .. [["
    ]])

    if #results == 0 then
      editor.flashNotification("Anchor not found or removed", "error")
      return
    end

    -- Navigate to anchor position
    local anchor = results[1]
    editor.navigate({
      kind = "page",
      page = anchor.page,
      pos = anchor.pos
    })
  end
}

```