
1. [virtual page recent journal entries](https://community.silverbullet.md/t/virtual-page-recent-journal-entries/3778?u=chenzhu-xie) #community #silverbullet

```space-lua
-- priority: 10
virtualPage.define {
    pattern = "Recent Journal Entries",
  run = function()
    local text = "# Recent Journal Entries - Last 30\n\n"

    -- Query for Journal pages with date pattern, sorted by name (newest first)
    local journalPages = query[[
      from index.tag "page"
      where name:startsWith("Journal/") and name:match("Journal/(%d%d%d%d%-%d%d%-%d%d)")
      order by name desc
      limit 30
    ]]

    if #journalPages == 0 then
      text = text .. "No journal entries found.\n"
    else
      for _, page in ipairs(journalPages) do
        text = text .. "## [[" .. page.name .. "]]\n\n"

        -- Read and include page content
        local content = space.readPage(page.name)
        if content then
          text = text .. content .. "\n\n---\n\n"
        end
      end
    end

    return text
  end
}

command.define {
  name = "Navigate: Recent Journal Entries",
  run = function()
    editor.navigate("Recent Journal Entries")
  end
}
```
