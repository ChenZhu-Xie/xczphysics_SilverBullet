---
tags: {}
LastVisit: 2025-10-24 14:13:35
---

# Hello 👋
Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

# Last Modified ✏️

${query[[from index.tag "page" select {ref=_.ref, contentType=_.contentType} order by lastModified desc limit 5]]}

${query[[from index.tag "page" select {ref=_.ref, LastVisit=tostring(_.LastVisit)} order by tostring(LastVisit) desc limit 5]]}

# Time 🌄

${timeLeftBar()}