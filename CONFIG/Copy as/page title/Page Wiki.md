---
tags:
  - forward
  - wiki
recommend: ⭐⭐⭐⭐⭐
udpateDate: 2025-11-08
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Copy%20as/page%20title/Page%20Wiki.md"
---
#forward #wiki

1. extracted from [[CONFIG/Copy as/Cursor Wiki]]

about `[[wiki link]]`
  1. [Help:Links](https://www.mediawiki.org/wiki/Help:Links) #mediawiki
  2. [how do i use wiki link syntax](https://community.telligent.com/community/13/a/user-documentation/UD1032/how-do-i-use-wiki-link-syntax) #community #telligent
- also known as `[[forward wiki]]`
  - or `@ref` (reference) in Tana
  - or `[[Quote (Block)]]` in SiYuan

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