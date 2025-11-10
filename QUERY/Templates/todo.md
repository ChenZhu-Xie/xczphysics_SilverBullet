---
githubUrl: "https://github.com/MatthiasBenaets/silverbullet-library/blob/master/Templates/todo.md"
---
#template

Used to correctly list the aggregated tasks in [[SB Basics]].

```space-lua
templates.todoItem = template.new([==[
* [${state}] ${name}
]==])
```

For example:
${template.each(query[[
  from index.tag "task"
  where page:startsWith("SB Basics") and parent == nil
  select { name = text, state = state}
  order by page desc, pos
  limit 10
]], templates.todoItem)}
