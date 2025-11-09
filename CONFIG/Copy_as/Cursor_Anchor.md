#forward #object

1. an testing improvement from [[CONFIG/Copy as/Cursor Wiki]] 
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

