
${tasksByPage()}

1. https://community.silverbullet.md/t/tasks-by-page/3481

```space-lua
local pageTasksTemplate = template.new[==[
# [[${pageName}]]
${template.each(tasks, templates.taskItem)}
]==]

function tasksByPage()
  -- Aggregate tasks per page
  local pageTasks = {}
  for task in query[[
      from index.tag 'task' 
      where not done 
      and dueDate != nil
      order by dueDate
    ]] do
    if not pageTasks[task.page] then
      pageTasks[task.page] = {}
    end
    table.insert(pageTasks[task.page], task)
  end

  -- Build up the markdown
  local md = ""
  for pageName, tasks in pairs(pageTasks) do
    md = md .. pageTasksTemplate({
      pageName = pageName,
      tasks = tasks
    })
  end
  return md
end
```
