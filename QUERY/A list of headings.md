
# A list of headings

${template.each(query[[
  from tags.header
  where _.page == editor.getCurrentPage()
]], template.new([==[
-- [[${ref}|${name}]]
]==]))}

1. https://community.silverbullet.md/t/how-to-get-a-list-of-headings/3412
