```space-lua
-- 在 YAML front matter 中 upsert 键值
local function upsert_frontmatter(text, key, value)
  if text:sub(1, 3) == "---" then
    local fm_end = text:find("\n---%s*\n", 4) or text:find("\n---\n", 4)
    if fm_end then
      local fm = text:sub(1, fm_end)
      local body = text:sub(fm_end + 1)
      local pattern = "\n" .. key .. ":%s*[^\n]*"
      if fm:match(pattern) then
        fm = fm:gsub(pattern, "\n" .. key .. ": " .. value, 1)
      else
        fm = fm:gsub("\n---%s*\n$", "\n" .. key .. ": " .. value .. "\n---\n", 1)
      end
      return fm .. body
    end
  end
  return ("---\n%s: %s\n---\n%s"):format(key, value, text)
end

local function should_skip(docId)
  return docId:match("^LIB/") or docId:match("^INBOXXX/")
end

local function stamp_last_viewed(docId)
  if not docId or should_skip(docId) then return end
  local text = space.readPage(docId)
  if not text then return end
  local nowUtc = os.date("!%Y-%m-%dT%H:%M:%SZ")
  local newText = upsert_frontmatter(text, "lastviewed", nowUtc)
  if newText ~= text then space.writePage(docId, newText) end
end

-- 打开页面时自动写入（docId 来自事件参数）
event.on("doc:open", function(docId)
  stamp_last_viewed(docId)
end)

-- 手动命令：用 editor.getCurrentPage() 拿当前页的 docId
command.define({
  name = "Stamp LastViewed (Current)",
  run = function()
    local docId = editor.getRecentlyOpenedPages()
    editor.flashNotification(docId)
    -- if docId then stamp_last_viewed(docId) end
  end
})
```