

# A list of headings

1. https://community.silverbullet.md/t/how-to-get-a-list-of-headings/3412

${template.each( query[[from tags.header where _.page == editor.getCurrentPage()]], template.new[==[ * [[${ref}|${name}]] ]==] )}