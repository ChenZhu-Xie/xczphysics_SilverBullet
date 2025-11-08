---
recommend: ⭐⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Nearest%20Pattern/Copy.md"
udpateDate: 2025-11-08
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

    -- 通过 selection 替换为空字符串
    local sel = { from = match.start - 1, to = match.stop }  -- editor API 多为0基，减1安全
    editor.replaceRange(sel.from, sel.to, "")
    editor.flashNotification(match.name .. ": removed ✅")
    editor.flashNotification(match.text)
  end
}
```
