
# 

1. [how to list completed todos sorted by completion time](https://community.silverbullet.md/t/how-to-list-completed-todos-sorted-by-completion-time/3669/2?u=chenzhu-xie) #community #silverbullet

- [ ] done

```space-lua
event.listen {
  name = "task:stateChange",
  run = function(e)
    local data = e.data
    local text = data.text
    
    -- Safety check: ensure text exists to avoid 'nil value' errors
    if not text then return end

    -- CASE 1: Task marked as complete ('x')
    if data.newState == "x" then
      -- Check if timestamp already exists to prevent infinite loops/double-clicks
      if not string.find(text, "%[completed:") then
        -- Some sandboxes restrict os.date; we use a simple format
        local completedAt = os.date("%Y-%m-%dT%H:%M:%S")
        -- Append the timestamp at the end
        local newText = string.gsub(text, "%[%s*%]", "[x]") .. " [completed: " .. completedAt .. "]"
        
        editor.dispatch({
          changes = {
            from = data.from,
            to = data.to,
            insert = newText
          }
        })
      end

    -- CASE 2: Task marked as incomplete (' ')
    elseif data.newState == " " then
      -- Check if there is actually a timestamp to remove
      if string.find(text, "%[completed:") then        
        -- Remove the [completed: ...] tag and any leading space
        local cleanText = string.gsub(text, "%[[xX]%]", "[ ]")
        local newText = string.gsub(cleanText, "%s*%[completed: [^%]]+]", "")
        
        editor.dispatch({
          changes = {
            from = data.from,
            to = data.to,
            insert = newText
          }
        })
      end
    end
  end
}
```
