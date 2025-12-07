---
name: CONFIG/Nearest_Pattern/Delete
tags: meta/library
pageDecoration.prefix: 🪚
---

# Delete nearest Format around Cursor

1. [690f2a74 73b8 8010 acdf 730e593daf25](https://chatgpt.com/share/690f2a74-73b8-8010-acdf-730e593daf25) #chatgpt

## Page Version

```space-lua
command.define{
  name = "Cursor: Delete Nearest Pattern",
  description = "Delete the nearest and highest-priority formatted structure around the cursor",
  key = "Alt-d",
  run = function()
    local match = findNearestInlinePattern()
    if not match then
      editor.flashNotification("No pattern matched.")
      return
    end

    local sel = { from = match.start - 1, to = match.stop }
    editor.replaceRange(sel.from, sel.to, "")
    editor.flashNotification(match.name .. ": removed ✅")
    if not match.name == "Inline Code" then editor.flashNotification(match.text)
  end
}
```
