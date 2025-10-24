---
tags: {}
LastVisit: 2025-10-24 14:21:08
---

# Hello 👋
Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

# Last Modified ✏️

${query[[from index.tag "page" select {ref=_.ref, contentType=_.lastModified} order by lastModified desc limit 5]]}

${query[[from index.tag "page" where _.LastVisit select {ref=_.ref, LastVisit=_.LastVisit} order by LastVisit desc limit 5]]}

# Time 🌄

${timeLeftBar()}