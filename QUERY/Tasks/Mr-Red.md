
# [[Library/Mr-xRed/TaskManager|]] related

1. [tag lost when editing through taskmanager](https://community.silverbullet.md/t/tag-lost-when-editing-through-taskmanager/3860/12?u=chenzhu-xie) #community #silverbullet
2. [todo task manager global interactive table sorter filtering](https://community.silverbullet.md/t/todo-task-manager-global-interactive-table-sorter-filtering/3767/15?u=chenzhu-xie) #community #silverbullet
3. [kanban integration with tasks](https://community.silverbullet.md/t/kanban-integration-with-tasks/925/15?u=chenzhu-xie) #community #silverbullet
   - [kanban integration with tasks](https://community.silverbullet.md/t/kanban-integration-with-tasks/925/29?u=chenzhu-xie) #community #silverbullet

## Remove ALL completed task across pages

1. [todo task manager global interactive table sorter filtering](https://community.silverbullet.md/t/todo-task-manager-global-interactive-table-sorter-filtering/3767/42?u=chenzhu-xie) #community #silverbullet

```space-lua
command.define {  
  name = "Task: Remove All Completed",  
  run = function()  
    -- Query all completed tasks across all pages  
    local completedTasks = query[[  
      from index.tag "task"  
      where _.done == true  
    ]]  
      
    local removedCount = 0  
      
    -- Group tasks by page to avoid reading the same page multiple times  
    local tasksByPage = {}  
    for _, task in ipairs(completedTasks) do  
      if not tasksByPage[task.page] then  
        tasksByPage[task.page] = {}  
      end  
      table.insert(tasksByPage[task.page], task)  
    end  
      
    -- Process each page  
    for pageName, pageTasks in pairs(tasksByPage) do  
      local text = space.readPage(pageName)  
        
      -- Sort tasks by position in reverse order to avoid offset issues  
      table.sort(pageTasks, function(a, b)  
        return (a.range and a.range[1] or a.pos) > (b.range and b.range[1] or b.pos)  
      end)  
        
      -- Remove each task from the page text  
      for _, task in ipairs(pageTasks) do  
        local startPos = task.range and task.range[1] or task.pos  
        local endPos = task.range and task.range[2] or task.pos  
          
        -- Remove the task line and the trailing newline in one swift motion
        text = text:sub(1, startPos) .. text:sub(endPos + 2)  
        removedCount = removedCount + 1  
      end  
        
      -- Write the modified page back  
      space.writePage(pageName, text)  
    end  
      
    editor.flashNotification("Removed " .. removedCount .. " completed tasks across all pages")  
  end  
}
```

