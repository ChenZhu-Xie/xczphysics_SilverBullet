
# Hello 👋
Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

# Last Modified ✏️

${query[[from index.tag "page" select {ref=_.ref, lastModified=_.lastModified} order by lastModified desc limit 5]]}

# Last Visit 👀

${query[[from index.tag "page" where _.lastVisit select {ref=_.ref, lastVisit=_.lastVisit} order by _.lastVisit desc limit 5]]}

# Time 🌄

${timeLeftBar()}