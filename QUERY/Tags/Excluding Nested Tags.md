
1. https://community.silverbullet.md/t/wildcard-tag-exclusions/3448

```lua
${template.each(
  query[[
    from index.tag "task"
    where 
        not done
        and not due 
        and (pri > 1 and pri < 3 or not pri) 
        or string.find( table.concat( tags or {}, ","), "grossery" )
    order by pri desc
  ]], 
  templates.taskItemWithDuePri)}
```
