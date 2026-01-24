
1. [liq for find all pages that link to this page](https://community.silverbullet.md/t/liq-for-find-all-pages-that-link-to-this-page/3555/2?u=chenzhu-xie) #community #silverbullet

`${query[[
  from index.tag "link"
  where _.toPage == editor.getCurrentPage()
  select _.page
]]}`


