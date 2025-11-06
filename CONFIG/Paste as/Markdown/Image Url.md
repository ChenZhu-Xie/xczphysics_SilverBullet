---
recommend: ⭐⭐⭐⭐
githubUrl: "https://github.com/ChenZhu-Xie/xczphysics_SilverBullet/blob/main/CONFIG/Paste%20as/Markdown/Image%20Url.md"
udpateDate: 2025-10-27
---

# Paste: Smart URL

## Support More parsing format/syntax


```space-lua
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
      s = s:gsub("+", " ")
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
      info=true, me=true, tv=true, cc=true, ai=true, us=true, ca=true, au=true, in=true,
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