
```space-lua
function custom.dayOfDate(date)
    local year, month, day = date:match("^(%d%d%d%d)%-(%d%d)%-(%d%d)$")
    if not (year and month and day) then
        -- failed to parse date
        return os.date("%A")
    else
        return os.date("%A", os.time({year = year, month = month, day = day}))
    end
end
```

${template.each(query[[
  from index.tag "task"
  where page == "Tasks" and deadline >= date.today('%Y-%m-%d') and deadline != nil and done == false
  order by deadline]],
  template.new [==[
    - [${state}] ${custom.dayOfDate(deadline)} ...
]==]
)}
* [ ] Tuesday 2025-05-20 This is a Task #task | Ref
* [ ] 2025-05-20 This is a Task #task | Ref
* [ ] 2025-05-21 Next day's Task #task | Ref
* [ ] 2025-05-21 Another Task #task | Ref


