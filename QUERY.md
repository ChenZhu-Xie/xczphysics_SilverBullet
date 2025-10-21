
# Knowledge about QUERY

`ref`: a globally unique *identifier*, often represented as a pointer to the place (page, position) in your space where the object is defined. For instance, a *page* object will use the page name as its `ref` attribute, and a `task` will use `page@pos` (where `pos` is the location the task appears in `page`).

1. https://community.silverbullet.md/t/confused-by-getobjectbyref/3315/3



# A list of headings

${template.each(query[[
  from tags.header
  where _.page == editor.getCurrentPage()
]], template.new([==[
-- [[${ref}|${name}]]
]==]))}

1. https://community.silverbullet.md/t/how-to-get-a-list-of-headings/3412

# Find tags that exist in other page but not in current page

${template.each(query[[
  from index.tag "tag" 
  where parent == "page" 
    and not table.includes(
      editor.getCurrentPageMeta().tags, 
      name
    )
  select {name=name}
]], template.new([==[
#${name}
]==]))}

1. https://community.silverbullet.md/t/find-tags-that-exist-in-other-page-but-not-in-current-page/3423