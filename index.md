# Hello 👋
Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

# Last Modified
${query[[from index.tag "page" select {ref=_.ref, contentType=_.contentType} order by lastModified desc limit 5]]}

# Tags
${query[[from index.tag "tag" where not string.find(name, "meta")]]}

# TASKS
${template.each(query[[from index.tag "task" select {currentPage = _.page} where not _.done]], template.new[==[
**[[${currentPage}]]** ${template.each(query[[from index.tag "tag" where _.page == currentPage]], home.renderTag)}
${template.each(query[[from index.tag "task" where _.page == currentPage and not _.done]], home.renderTask)}
]==])}
