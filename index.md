
# Hello 👋
Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

# Last Modified
${query[[from index.tag "page" select {ref=_.ref, contentType=_.contentType} order by lastModified desc limit 5]]}

# Tags
`${query[[from index.tag "tag" select {name = '#' .. _.name} where not string.find(name, "meta")]]}`

1. https://community.silverbullet.md/t/graphview-plug-for-silverbullet/1651/22?u=chenzhu-xie
2. https://community.silverbullet.md/t/how-could-i-migrate-my-index-page-to-v2/3173/2?u=chenzhu-xie

# TAGS
${template.each(query[[from index.tag "tag" select {name = _.name} where not string.find(name, "meta")]], home.renderTag)}

# TASKS
${template.each(query[[from index.tag "task" select {currentPage = _.page} where not _.done]], template.new[==[
**[[${currentPage}]]** ${template.each(query[[from index.tag "tag" where _.page == currentPage]], home.renderTag)}
${template.each(query[[from index.tag "task" where _.page == currentPage and not _.done]], home.renderTask)}
]==])}

# LATEST
[[All pages|Show all]]

${template.each(query[[from index.tag "page" where not string.find(_.name,"Library") order by created desc limit 15]], home.renderPage)}

```space-lua
home = home or {}

home.renderTag = template.new[==[_[[tag:${name}|#${name}]]_ ]==]

home.renderTask = template.new[==[- ${text}
]==]

home.renderPage = template.new[==[### [[${name}]]
  ${created}

]==]
```