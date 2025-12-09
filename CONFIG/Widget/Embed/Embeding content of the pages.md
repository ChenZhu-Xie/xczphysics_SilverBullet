
1. https://community.silverbullet.md/t/embeding-content-of-the-pages-in-an-index-page/3405

${template.each(
query[[
  from index.tag "page" 
 where table.includes(tags, "SB_itself")
 select {
   name = _.name,
   ref = _.ref,
   content = index.extractFrontmatter(space.readPage(name), {
     removeFrontMatterSection = true,
     removeTags = true
   }).text
}]],
template.new [==[- [[${ref}]] ${content}
]==])}
