---
recommend: ⭐⭐⭐⭐⭐
udpateDate: 2025-11-08
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy%20as/page%20title/Page%20Ref.md"
---

1. extracted from [[CONFIG/Copy as/Forward Wiki/Cursor Ref]]

```space-lua
command.define {
  -- name = "Copy: Page Reference",
  name = "Page: Copy Wiki",
  key = "Shift-Alt-w",
  run = function()
    local ref = string.format("[[%s]]", editor.getCurrentPage())
    editor.copyToClipboard(ref)
    editor.flashNotification("Page Reference ✅", "info")
    editor.flashNotification(ref, "info")
  end
}
```