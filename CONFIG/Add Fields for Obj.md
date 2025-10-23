```space-lua
-- 在顶部 YAML front matter 中 upsert 键值：key: value
local function upsert_frontmatter(text, key, value)
  -- 已有 front matter（以 --- 起始）
  if text:sub(1, 3) == "---" then
    -- 找到 front matter 结束分隔线（第二个 --- 所在行）
    local fm_end = text:find("\n---%s*\n", 4) or text:find("\n---\n", 4)
    if fm_end then
      local fm = text:sub(1, fm_end)     -- 含首尾分隔线
      local body = text:sub(fm_end + 1)  -- 正文

      -- 已存在该 key：更新
      local pattern = "\n" .. key .. ":%s*[^\n]*"
      if fm:match(pattern) then
        fm = fm:gsub(pattern, "\n" .. key .. ": " .. value, 1)
      else
        -- 不存在该 key：在结束分隔线前插入
        fm = fm:gsub("\n---%s*\n$", "\n" .. key .. ": " .. value .. "\n---\n", 1)
      end
      return fm .. body
    end
  end
  -- 没有 front matter：补一个
  return ("---\n%s: %s\n---\n%s"):format(key, value, text)
end

-- 可选：跳过某些系统页，避免噪声写入
local function should_skip(docId)
  return docId:match("^CONFIG/") or docId:match("^LIB/") or docId:match("^INBOX/")
end

-- 写入 lastviewed（UTC ISO8601）
local function stamp_last_viewed(docId)
  if not docId or should_skip(docId) then return end
  local text = space.readPage(docId)
  if not text then return end
  local nowUtc = os.date("!%Y-%m-%dT%H:%M:%SZ")

  local newText = upsert_frontmatter(text, "lastviewed", nowUtc)
  if newText ~= text then
    space.writePage(docId, newText)
  end
end

-- 自动：页面打开时写入
event.on("doc:open", function(docId)
  stamp_last_viewed(docId)
end)

-- 手动命令（便于测试）
command.define({
  name = "Stamp LastViewed (Current)",
  run = function()
    local current = editor.currentDocId()
    if current then stamp_last_viewed(current) end
  end
})
```