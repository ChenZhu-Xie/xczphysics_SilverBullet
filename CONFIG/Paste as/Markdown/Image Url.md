---
recommend: ⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Paste%20as/Markdown/Image%20Url.md"
udpateDate: 2025-10-27
---

# Paste: Smart URL

## Support More parsing format/syntax

### based on [[#regex split]], add a `if` branch to manipulate `cursor pos`

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=a6c74093b6

```space-lua
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    local input= js.window.navigator.clipboard.readText()

    -- Trim whitespace
    local clip = input:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("Empty content", "warn")
      return
    end

    -- Basic URL check: http/https, www., or data:image/
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- Add scheme for bare www.
    local function ensureScheme(u)
      if u:match("^www%.") then return "https://" .. u end
      return u
    end

    -- Image URL check: ignore ? / #; also allow data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?#]+") or u):lower()
      return path:match("%.png$") or path:match("%.jpe?g$") or
             path:match("%.gif$") or path:match("%.webp$") or
             path:match("%.bmp$") or path:match("%.tiff?$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("Not a URL", "warn")
      return
    end

    -- Helpers for title/tags
    local function urldecode(s)
      s = s:gsub("%+", " ")
      return (s:gsub("%%(%x%x)", function(h)
        local n = tonumber(h, 16)
        return n and string.char(n) or ("%%" .. h)
      end))
    end

    local function trim(s)
      return (s and s:match("^%s*(.-)%s*$")) or s
    end

    local function is_numeric(s) return s:match("^%d+$") ~= nil end

    local TLD_IGNORE = {
      com=true, org=true, net=true, io=true, md=true, app=true, dev=true, edu=true, gov=true,
      cn=true, uk=true, co=true, jp=true, de=true, fr=true, ru=true, nl=true, xyz=true,
      info=true, me=true, tv=true, cc=true, ai=true, us=true, ca=true, au=true, ["in"]=true,
      site=true, top=true, cloud=true, shop=true, blog=true,
      www=true  -- also ignore www label
    }

    local function split(str, pat)
      local t = {}
      str:gsub("([^" .. pat .. "]+)", function(c) t[#t+1] = c end)
      return t
    end

    local function parse_host(u)
      -- extract host from URL
      -- 1) Drop scheme
      local no_scheme = u:gsub("^[a-zA-Z][a-zA-Z0-9+.-]*://", "")
      -- 2) Stop at first / or ? or #
      local host = no_scheme:match("^([^/%?#]+)") or ""
      return host:lower()
    end

    local function build_tags_from_host(host)
      local parts = split(host, "%.")
      local out = {}
      local seen = {}
      for _, p in ipairs(parts) do
        local label = p:lower()
        if not TLD_IGNORE[label] and not seen[label] and label ~= "" then
          out[#out+1] = "#" .. label
          seen[label] = true
        end
      end
      return table.concat(out, " ")
    end

    local function last_non_numeric_segment(path_parts)
      for i = #path_parts, 1, -1 do
        local seg = path_parts[i]
        if seg and seg ~= "" and not is_numeric(seg) then
          return seg
        end
      end
      return nil
    end

    -- title_from_url:
    local function title_from_url(u)
      local path = (u:match("^https?://[^/%?#]+(/[^?#]*)")
                 or u:match("^www%.[^/%?#]+(/[^?#]*)")
                 or "") or ""
      local parts = {}
      for seg in path:gmatch("([^/]+)") do
        parts[#parts+1] = seg
      end
      local slug = last_non_numeric_segment(parts)

      if slug then
        slug = urldecode(slug or "")
        slug = slug:gsub("%-", " ")
        slug = trim((slug:gsub("%s+", " ")))
      else
        slug = ""
      end

      return slug
    end

    local url = ensureScheme(clip)

    -- Case 1: images -> keep original behavior
    if isImageUrl(url) then
      local snippet = string.format("![](%s)", url)

      -- Remember insertion position (selection-aware), insert, then move cursor inside []
      local sel = editor.getSelection and editor.getSelection() or nil
      local startPos = (sel and (sel.from or sel.start)) or editor.getCursor()
      editor.insertAtCursor(snippet, false)

      local targetPos = startPos + 2 -- "![](...)" -> '[' is the 2nd character
      if editor.moveCursor then
        editor.moveCursor(targetPos, false)
      elseif editor.setSelection then
        editor.setSelection(targetPos, targetPos)
      end
      editor.flashNotification("Inserted smart image link")
      return
    end

    -- Case 2: web URL -> build [title](url) + tags (highest priority for non-image)
    local host = parse_host(url)
    local tags = build_tags_from_host(host)       -- e.g. "#community #silverbullet" or "#tex #stackexchange"
    local title = title_from_url(url)

    local suffix = (tags ~= "" and (" " .. tags)) or ""
    local snippet = string.format("[%s](%s)%s", title, url, suffix)

    -- Remember insertion position (selection-aware), insert
    local sel = editor.getSelection and editor.getSelection() or nil
    local startPos = (sel and (sel.from or sel.start)) or editor.getCursor()
    editor.insertAtCursor(snippet, false)

    local function is_nonempty(s) return s and trim(s) ~= "" end
    local targetPos
    if is_nonempty(title) then
      targetPos = startPos + #snippet
    else
      targetPos = startPos + 1 + #title
    end

    if editor.moveCursor then
      editor.moveCursor(targetPos, false)
    elseif editor.setSelection then
      editor.setSelection(targetPos, targetPos)
    end

    editor.flashNotification("Inserted titled link with tags")
  end
}
```
### regex split

1. https://5113916f-2a63-4b56-a1bd-3cb9d938cbb7.pieces.cloud/?p=5ea34d9be6
2. https://chatgpt.com/share/690c9ac1-9d8c-8010-a29a-bf35735497d0

```lua
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    -- Ask the user to paste the URL into a prompt dialog
    local input = editor.prompt("Enter or paste URL", "")
    if not input then
      editor.flashNotification("Cancelled", "warn")
      return
    end

    -- Trim whitespace
    local clip = input:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("Empty content", "warn")
      return
    end

    -- Basic URL check: http/https, www., or data:image/
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- Add scheme for bare www.
    local function ensureScheme(u)
      if u:match("^www%.") then return "https://" .. u end
      return u
    end

    -- Image URL check: ignore ? / #; also allow data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?#]+") or u):lower()
      return path:match("%.png$") or path:match("%.jpe?g$") or
             path:match("%.gif$") or path:match("%.webp$") or
             path:match("%.bmp$") or path:match("%.tiff?$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("Not a URL", "warn")
      return
    end

    -- Helpers for title/tags
    local function urldecode(s)
      s = s:gsub("%+", " ")
      return (s:gsub("%%(%x%x)", function(h)
        local n = tonumber(h, 16)
        return n and string.char(n) or ("%%" .. h)
      end))
    end

    local function trim(s)
      return (s and s:match("^%s*(.-)%s*$")) or s
    end

    local function is_numeric(s) return s:match("^%d+$") ~= nil end

    local TLD_IGNORE = {
      com=true, org=true, net=true, io=true, md=true, app=true, dev=true, edu=true, gov=true,
      cn=true, uk=true, co=true, jp=true, de=true, fr=true, ru=true, nl=true, xyz=true,
      info=true, me=true, tv=true, cc=true, ai=true, us=true, ca=true, au=true, ["in"]=true,
      site=true, top=true, cloud=true, shop=true, blog=true,
      www=true  -- also ignore www label
    }

    local function split(str, pat)
      local t = {}
      str:gsub("([^" .. pat .. "]+)", function(c) t[#t+1] = c end)
      return t
    end

    local function parse_host(u)
      -- extract host from URL
      -- 1) Drop scheme
      local no_scheme = u:gsub("^[a-zA-Z][a-zA-Z0-9+.-]*://", "")
      -- 2) Stop at first / or ? or #
      local host = no_scheme:match("^([^/%?#]+)") or ""
      return host:lower()
    end

    local function build_tags_from_host(host)
      local parts = split(host, "%.")
      local out = {}
      local seen = {}
      for _, p in ipairs(parts) do
        local label = p:lower()
        if not TLD_IGNORE[label] and not seen[label] and label ~= "" then
          out[#out+1] = "#" .. label
          seen[label] = true
        end
      end
      return table.concat(out, " ")
    end

    local function last_non_numeric_segment(path_parts)
      for i = #path_parts, 1, -1 do
        local seg = path_parts[i]
        if seg and seg ~= "" and not is_numeric(seg) then
          return seg
        end
      end
      return nil
    end

    local function title_from_url(u)
      -- Take last non-numeric path segment as slug
      local path = (u:match("^https?://[^/%?#]+(/[^?#]*)") or u:match("^www%.[^/%?#]+(/[^?#]*)") or "") or ""
      local parts = {}
      for seg in path:gmatch("([^/]+)") do
        parts[#parts+1] = seg
      end
      local slug = last_non_numeric_segment(parts)
      if not slug then
        -- fallback: host name
        local host = parse_host(u)
        slug = host:gsub("^www%.", ""):gsub("%.%w+$", "") -- drop simple TLD at the end for fallback title
      end
      slug = slug or "untitled"

      -- Clean slug to human text
      slug = urldecode(slug)
      slug = slug:gsub("[_%-%s]+", " ")
      slug = trim(slug):lower()
      if slug == "" then slug = "untitled" end
      return slug
    end

    local url = ensureScheme(clip)

    -- Case 1: images -> keep original behavior
    if isImageUrl(url) then
      local snippet = string.format("![](%s)", url)

      -- Remember insertion position (selection-aware), insert, then move cursor inside []
      local sel = editor.getSelection and editor.getSelection() or nil
      local startPos = (sel and sel.from) or editor.getCursor()
      editor.insertAtCursor(snippet, false)

      local delta = 2 -- "![](...)" -> '[' is the 2nd character
      local targetPos = startPos + delta
      if editor.moveCursor then
        editor.moveCursor(targetPos, false)
      elseif editor.setSelection then
        editor.setSelection(targetPos, targetPos)
      end
      editor.flashNotification("Inserted smart image link")
      return
    end

    -- Case 2: web URL -> build [title](url) + tags (highest priority for non-image)
    local host = parse_host(url)
    local tags = build_tags_from_host(host)       -- e.g. "#community #silverbullet" or "#tex #stackexchange"
    local title = title_from_url(url)             -- e.g. "hint inflections of page titles" / "track changes in latex"

    local suffix = (tags ~= "" and (" " .. tags)) or ""
    local snippet = string.format("[%s](%s)%s", title, url, suffix)

    -- Remember insertion position (selection-aware), insert, then move cursor to end of title inside []
    local sel = editor.getSelection and editor.getSelection() or nil
    local startPos = (sel and sel.from) or editor.getCursor()
    editor.insertAtCursor(snippet, false)

    -- Cursor to the end of title inside []
    local targetPos = startPos + 1 + #title
    if editor.moveCursor then
      editor.moveCursor(targetPos, false)
    elseif editor.setSelection then
      editor.setSelection(targetPos, targetPos)
    end

    editor.flashNotification("Inserted titled link with tags")
  end
}
```

### function split

```lua
-- Paste: Smart URL (via Prompt)
-- Single command.define in this block. Helpers deduped and fixed.

-- ---- Helpers ----
local function trim(s)
  return (s and s:match("^%s*(.-)%s*$")) or s
end

local function urldecode(s)
  if not s then return s end
  s = s:gsub("%+", " ")
  return (s:gsub("%%(%x%x)", function(h)
    local n = tonumber(h, 16)
    return n and string.char(n) or ("%%" .. h)
  end))
end

local function isUrl(u)
  return u:match("^https?://")
      or u:match("^www%.")
      or u:match("^data:image/")
end

local function ensureScheme(u)
  if u:match("^www%.") then return "https://" .. u end
  return u
end

local function stripQueryFrag(u)
  return (u:match("^[^%?#]+") or u)
end

local function isImageUrl(u)
  if u:match("^data:image/") then return true end
  local path = stripQueryFrag(u):lower()
  return path:match("%.png$") or path:match("%.jpe?g$") or
         path:match("%.gif$") or path:match("%.webp$") or
         path:match("%.bmp$") or path:match("%.tiff?$") or
         path:match("%.svg$")
end

-- 解析 host
local function parse_host(u)
  local no_scheme = u:gsub("^[a-zA-Z][a-zA-Z0-9+.-]*://", "")
  local host = no_scheme:match("^([^/%?#]+)") or ""
  return host:lower()
end

-- 从 host 生成标签（忽略常见 TLD 与 www）
local TLD_IGNORE = {
  com=true, org=true, net=true, io=true, md=true, app=true, dev=true, edu=true, gov=true,
  cn=true, uk=true, co=true, jp=true, de=true, fr=true, ru=true, nl=true, xyz=true,
  info=true, me=true, tv=true, cc=true, ai=true, us=true, ca=true, au=true, ["in"]=true,
  site=true, top=true, cloud=true, shop=true, blog=true, www=true
}

local function build_tags_from_host(host)
  local seen, tags = {}, {}
  for label in host:gmatch("[^%.]+") do
    label = label:lower()
    if label ~= "" and not TLD_IGNORE[label] and not seen[label] then
      table.insert(tags, "#" .. label)
      seen[label] = true
    end
  end
  return table.concat(tags, " ")
end

local function is_numeric(s) return s and s:match("^%d+$") ~= nil end

local function last_non_numeric_segment(path_parts)
  for i = #path_parts, 1, -1 do
    local seg = path_parts[i]
    if seg and seg ~= "" and not is_numeric(seg) then
      return seg
    end
  end
  return nil
end

local function to_title_case(s)
  return (s:gsub("(%a)(%w*)", function(a,b)
    return a:upper() .. b:lower()
  end))
end

local function title_from_url(u)
  local path = (u:match("^https?://[^/%?#]+(/[^?#]*)")
              or u:match("^www%.[^/%?#]+(/[^?#]*)")
              or "") or ""
  local parts = {}
  for seg in path:gmatch("([^/]+)") do
    parts[#parts+1] = seg
  end
  local slug = last_non_numeric_segment(parts)
  if not slug or slug == "" then
    local host = parse_host(u)
    slug = host:gsub("^www%.", ""):gsub("%.%w+$", "")
  end
  slug = urldecode(slug or "untitled")
  slug = trim((slug:gsub("[_%+%-]+", " "))):gsub("%s+", " ")
  if slug == "" then slug = "untitled" end
  return to_title_case(slug)
end

-- Selection helpers (兼容不同 API 形态)
local function getSelectionText()
  if not editor.getSelection then return nil end
  local sel = editor.getSelection()
  if type(sel) == "string" then
    return sel ~= "" and sel or nil
  elseif type(sel) == "table" then
    if sel.text and sel.text ~= "" then return sel.text end
  end
  return nil
end

local function getCursorPos()
  local cur = editor.getCursor and editor.getCursor() or nil
  if type(cur) == "number" then return cur end
  if type(cur) == "table" then
    return cur.pos or cur.ch or cur.offset or nil
  end
  return nil
end

local function moveCaretTo(pos)
  if not pos then return end
  if editor.moveCursor then
    editor.moveCursor(pos, false)
  elseif editor.setSelection then
    editor.setSelection(pos, pos)
  end
end

-- ---- Command ----
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    local input = editor.prompt("Enter or paste URL", "")
    if not input then
      editor.flashNotification("Cancelled", "warn")
      return
    end

    local clip = trim(input or "")
    if clip == "" then
      editor.flashNotification("Empty content", "warn")
      return
    end

    if not isUrl(clip) then
      editor.flashNotification("Not a URL", "warn")
      return
    end

    local url = ensureScheme(clip)

    -- 图片：保持 ![]() 逻辑，光标置于 []
    if isImageUrl(url) then
      local snippet = string.format("![](%s)", url)
      local startPos = getCursorPos()
      editor.insertAtCursor(snippet, false)
      local delta = 2 -- "![](...)" -> '[' 是第 2 个字符
      if startPos then moveCaretTo(startPos + delta) end
      editor.flashNotification("Inserted smart image link")
      return
    end

    -- 非图片：构建 [title](url) + from host 的标签
    local host = parse_host(url)
    local tags = build_tags_from_host(host)
    local selected = getSelectionText()
    local title = trim(selected or title_from_url(url)) or "Untitled"

    local suffix = (tags ~= "" and (" " .. tags)) or ""
    local snippet = string.format("[%s](%s)%s", title, url, suffix)

    local startPos = getCursorPos()
    editor.insertAtCursor(snippet, false)

    -- 光标定位到 title 末尾（位于 [] 内部）
    if startPos then
      local targetPos = startPos + 1 + #title
      moveCaretTo(targetPos)
    end

    editor.flashNotification("Inserted titled link with tags")
  end
}
```

## Move Cursor Only Version

1. https://chatgpt.com/share/68f750a0-14a0-8010-925b-c0415b75e62a
2. https://community.silverbullet.md/t/plug-in-paste-smart-url/3431

```lua
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    -- Ask the user to paste the URL into a prompt dialog
    local input = editor.prompt("Enter or paste URL", "")
    if not input then
      editor.flashNotification("Cancelled", "warn")
      return
    end

    -- Trim whitespace
    local clip = input:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("Empty content", "warn")
      return
    end

    -- Basic URL check: http/https, www., or data:image/
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- Add scheme for bare www.
    local function ensureScheme(u)
      if u:match("^www%.") then return "https://" .. u end
      return u
    end

    -- Image URL check: ignore ? / #; also allow data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?#]+") or u):lower()
      return path:match("%.png$") or path:match("%.jpe?g$") or
             path:match("%.gif$") or path:match("%.webp$") or
             path:match("%.bmp$") or path:match("%.tiff?$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("Not a URL", "warn")
      return
    end

    local url = ensureScheme(clip)
    local snippet = isImageUrl(url) and string.format("![](%s)", url)
                                     or string.format("[](%s)",  url)

    -- Remember insertion position (selection-aware), insert, then move cursor inside []
    local sel = editor.getSelection and editor.getSelection() or nil
    local startPos = (sel and sel.from) or editor.getCursor()

    -- Avoid re-centering the view during insertion
    editor.insertAtCursor(snippet, false)

    -- If it's an image link, '[' is the 2nd char ("![](...)"); otherwise it's the 1st ("[](...)")
    local delta = (snippet:sub(1,1) == "!") and 2 or 1
    local targetPos = startPos + delta

    -- Move caret to inside the brackets without changing the view
    if editor.moveCursor then
      editor.moveCursor(targetPos, false)  -- center=false
    elseif editor.setSelection then
      editor.setSelection(targetPos, targetPos)
    end

    editor.flashNotification("Inserted smart link")
  end
}
```

## Navigate Cursor+View Version

```lua
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    -- Ask the user to paste the URL into a prompt dialog
    local input = editor.prompt("Enter or paste URL", "")
    if not input then
      editor.flashNotification("Cancelled", "warn")
      return
    end

    -- Trim whitespace
    local clip = input:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("Empty content", "warn")
      return
    end

    -- Basic URL check: http/https, www., or data:image/
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- Add scheme for bare www.
    local function ensureScheme(u)
      if u:match("^www%.") then return "https://" .. u end
      return u
    end

    -- Image URL check: ignore ? / #; also allow data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?#]+") or u):lower()
      return path:match("%.png$") or path:match("%.jpe?g$") or
             path:match("%.gif$") or path:match("%.webp$") or
             path:match("%.bmp$") or path:match("%.tiff?$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("Not a URL", "warn")
      return
    end

    local url = ensureScheme(clip)
    local snippet = isImageUrl(url) and string.format("![](%s)", url)
                                     or string.format("[](%s)",  url)

    -- Remember insertion position, insert, then move cursor inside the []
    local startPos = editor.getCursor()
    editor.insertAtCursor(snippet)

    -- If it's an image link, the '[' is the 2nd character ("![](...)"); otherwise it's the 1st ("[](...)")
    local delta = (snippet:sub(1,1) == "!") and 2 or 1
    local targetPos = startPos + delta

    -- Move caret to inside the brackets
    local page = editor.getCurrentPage() or nil
    if page then
      editor.navigate({ page = page, pos = targetPos })
    else
      editor.navigate({ pos = targetPos })
    end

    editor.flashNotification("Inserted smart link")
  end
}
```

1. https://community.silverbullet.md/t/how-to-open-specific-page-using-actionbutton/3420/3