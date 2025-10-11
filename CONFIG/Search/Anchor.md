

```space-lua
-- Stable Cursor Reference Plugin v4 (no-WikiLink variant)
anchors = anchors or {}

-- 用自定义括号，避免触发内置 WikiLink
local refTemplate = template.new [==[
**⟦${_.page}@${_.id}⟧**
]==]

command.define {
  name = "Cursor: Copy Stable Reference",
  run = function()
    local pageName = editor.getCurrentPage()
    if not pageName then
      editor.flashNotification("Failed to get current page name", "error")
      return
    end

    local pos = editor.getCursor()
    if type(pos) ~= "number" then
      editor.flashNotification("Cursor position is not a number", "error")
      return
    end

    local anchorId = string.format("anchor_%d_%d", os.time(), pos)

    -- 将锚点注册到索引
    index.tag("anchor", {
      page = pageName,
      pos = pos,
      id = anchorId
    })
    anchors[anchorId] = { page = pageName, pos = pos }

    -- 生成自定义记号（非 WikiLink）
    local refString = string.format("⟦%s@%s⟧", pageName, anchorId)
    local ok, err = pcall(function() editor.copyToClipboard(refString) end)
    if ok then
      editor.flashNotification("Copied stable reference: " .. refString, "info")
    else
      editor.flashNotification("Clipboard copy failed: " .. tostring(err), "error")
    end
  end
}

widgets = widgets or {}
function widgets.stableReferences(pageName)
  pageName = pageName or editor.getCurrentPage()
  local refs = query([[
    from index.tag "anchor"
    where _.page == ?
    order by pos
  ]], pageName)

  if not refs or #refs == 0 then return end

  return widget.new {
    markdown = "# Stable References\n" .. template.each(refs, refTemplate)
  }
end

event.listen {
  name = "hooks:renderBottomWidgets",
  run = function()
    return widgets.stableReferences()
  end
}

event.listen {
  name = "page:click",
  run = function(e)
    local pos = e.data and e.data.pos or e.pos
    if not pos then return end

    local word = editor.getWordAtPos(pos)
    if not word then return end

    -- 匹配 ⟦Page@anchor⟧
    local pageName, anchorId = word:match("⟦([^@]+)@([^⟧]+)⟧")
    if not pageName or not anchorId then return end

    -- 参数化查询，避免作用域问题
    local results = query([[
      from index.tag "anchor"
      where _.page == ? and _.id == ?
      order by pos
    ]], pageName, anchorId)

    if not results or #results == 0 then
      editor.flashNotification("Anchor not found or removed", "error")
      return
    end

    local anchor = results[1]
    editor.navigate({
      kind = "page",
      page = anchor.page,
      pos = anchor.pos
    })
  end
}
```


