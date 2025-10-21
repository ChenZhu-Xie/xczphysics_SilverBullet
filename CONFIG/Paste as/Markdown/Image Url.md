
1. https://chatgpt.com/share/68f750a0-14a0-8010-925b-c0415b75e62a
2. https://community.silverbullet.md/t/plug-in-paste-smart-url/3431

# Move Cursor Only Version

```space-lua
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    -- Ask the user to paste the URL into a prompt dialog
    local input = editor.prompt("Enter or paste URL", "")
    if not input then
      editor.flashNotification("Cancelled", "warn")
      return
    end

    -- Trim whitespace
    local clip = input:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("Empty content", "warn")
      return
    end

    -- Basic URL check: http/https, www., or data:image/
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- Add scheme for bare www.
    local function ensureScheme(u)
      if u:match("^www%.") then return "https://" .. u end
      return u
    end

    -- Image URL check: ignore ? / #; also allow data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?#]+") or u):lower()
      return path:match("%.png$") or path:match("%.jpe?g$") or
             path:match("%.gif$") or path:match("%.webp$") or
             path:match("%.bmp$") or path:match("%.tiff?$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("Not a URL", "warn")
      return
    end

    local url = ensureScheme(clip)
    local snippet = isImageUrl(url) and string.format("![](%s)", url)
                                     or string.format("[](%s)",  url)

    -- Remember insertion position (selection-aware), insert, then move cursor inside []
    local sel = editor.getSelection and editor.getSelection() or nil
    local startPos = (sel and sel.from) or editor.getCursor()

    -- Avoid re-centering the view during insertion
    editor.insertAtCursor(snippet, false)

    -- If it's an image link, '[' is the 2nd char ("![](...)"); otherwise it's the 1st ("[](...)")
    local delta = (snippet:sub(1,1) == "!") and 2 or 1
    local targetPos = startPos + delta

    -- Move caret to inside the brackets without changing the view
    if editor.moveCursor then
      editor.moveCursor(targetPos, false)  -- center=false
    elseif editor.setSelection then
      editor.setSelection(targetPos, targetPos)
    end

    editor.flashNotification("Inserted smart link")
  end
}
```

# Navigate Cursor+View Version

```lua
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    -- Ask the user to paste the URL into a prompt dialog
    local input = editor.prompt("Enter or paste URL", "")
    if not input then
      editor.flashNotification("Cancelled", "warn")
      return
    end

    -- Trim whitespace
    local clip = input:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("Empty content", "warn")
      return
    end

    -- Basic URL check: http/https, www., or data:image/
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- Add scheme for bare www.
    local function ensureScheme(u)
      if u:match("^www%.") then return "https://" .. u end
      return u
    end

    -- Image URL check: ignore ? / #; also allow data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?#]+") or u):lower()
      return path:match("%.png$") or path:match("%.jpe?g$") or
             path:match("%.gif$") or path:match("%.webp$") or
             path:match("%.bmp$") or path:match("%.tiff?$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("Not a URL", "warn")
      return
    end

    local url = ensureScheme(clip)
    local snippet = isImageUrl(url) and string.format("![](%s)", url)
                                     or string.format("[](%s)",  url)

    -- Remember insertion position, insert, then move cursor inside the []
    local startPos = editor.getCursor()
    editor.insertAtCursor(snippet)

    -- If it's an image link, the '[' is the 2nd character ("![](...)"); otherwise it's the 1st ("[](...)")
    local delta = (snippet:sub(1,1) == "!") and 2 or 1
    local targetPos = startPos + delta

    -- Move caret to inside the brackets
    local page = editor.getCurrentPage and editor.getCurrentPage() or nil
    if page then
      editor.navigate({ page = page, pos = targetPos })
    else
      editor.navigate({ pos = targetPos })
    end

    editor.flashNotification("Inserted smart link")
  end
}
```

1. https://community.silverbullet.md/t/how-to-open-specific-page-using-actionbutton/3420/3