
1. [conflicted pages widget diff viewer](https://community.silverbullet.md/t/conflicted-pages-widget-diff-viewer/2332/6?u=chenzhu-xie) #community #silverbullet

## Widget

```space-lua
widgets = widgets or {}

-- Widget to detect and display links to conflicted page versions
function widgets.conflicts(options)
  options = options or {}

  -- Get the current page name, and strip off any `.conflicted.<number>` suffix
  local pageName = editor.getCurrentPage()
  if pageName:match("^.+%.conflicted:[0-9]+$") then
    pageName = pageName:gsub("%.conflicted:[0-9]+", "")
  end

  -- Query all conflicted versions of the current page
  local result = query[[
    from index.tag "page"
    where name:match("^" .. pageName .. "%.conflicted:[0-9]+$")
    select {name=name}
  ]]

  if #result == 0 then
    return -- No conflicts found
  end

  -- Build a markdown widget listing the conflicted versions
  local markdown = "# ⚠️ Other Versions Detected\n"
  markdown = markdown .. "* Page: [[" .. pageName .. "]]\n"

  for _, item in ipairs(result) do
    local baseName = item.name:gsub("^%./", "")
    baseName = baseName:gsub("%.md$", "")
    markdown = markdown .. "* Diff: [[diff:" .. baseName .. "|" .. baseName .. "]]\n"
  end

  return widget.new {
    markdown = markdown
  }
end

-- Register widget to render at the top of the page
event.listen {
  name = "hooks:renderTopWidgets",
  run = function(e)
    return widgets.conflicts()
  end
}
```

## Diff Page

```space-lua
event.listen {
  name = "editor:pageCreating",
  run = function(e)
    if not e.data.name:startsWith("diff:") then
      return
    end

    -- Extract names from the diff page
    local pageName = e.data.name:sub(#"diff:" + 1)
    local originalName = pageName:gsub("%.conflicted:[0-9]+", "")

    -- Compute the diff
    local diff_result = shell.run("diff", {pageName .. ".md", originalName .. ".md"})

    -- Generate interactive markdown content
    local text = "## Diff\n"
    text = text .. "`>`: [[" .. originalName .. "]]\n"
    text = text .. "`<`: [[" .. pageName .. "]]\n\n"
    text = text .. "${widgets.button(\"❌ Delete diff\", function() space.deletePage(\"" .. pageName .. "\"); editor.navigate(\"" .. originalName .. "\") end)}  "
    text = text .. "${widgets.button(\"✅ Use diff\", function() local content = space.readPage(\"" .. pageName .. "\"); space.writePage(\"" .. originalName .. "\", content); space.deletePage(\"" .. pageName .. "\");editor.navigate(\"" .. originalName .. "\") end)}\n\n"

    if diff_result.stdout ~= "" then
      text = text .. "```diff\n" .. diff_result.stdout .. "\n```\n"
    else
      text = text .. "_No differences found._\n"
    end

    return {
      text = text,
      perm = "ro"
    }
  end
}
```
