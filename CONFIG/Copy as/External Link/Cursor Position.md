
```space-lua
-- 外链复制：[[Page#Header]] -> http(s)://host/Page#Header
--           [[Page@pos]]    -> http(s)://host/Page@pos

local function replace_space_with_percent20(s)
  local parts = {}
  for i = 1, #s do
    local c = s:sub(i, i)
    if c == " " then
      parts[#parts+1] = "%20"
    else
      parts[#parts+1] = c
    end
  end
  return table.concat(parts)
end

-- your address:   "https://your-domain"
local BASE_URL = "http://127.0.0.1:3000"

local function build_page_url(pageName)
  local path = replace_space_with_percent20(pageName)
  return string.format("%s/%s", BASE_URL, path)
end

command.define {
  name = "Cursor: Copy Link",
  key = "Ctrl-Shift-c",
  run = function()
    local currentLine = editor.getCurrentLine().text
    local pageName = editor.getCurrentPage()
    local pos = editor.getCursor()
    local headerMarks, headerName = string.match(currentLine, "^(#+) +(.+)$")
    
    local pageUrl = build_page_url(pageName)
    local out
    if headerMarks and headerName and headerName:match("%S") then
      headerName = headerName:match("^%s*(.+)")
      headerName = replace_space_with_percent20(headerName)
      out = string.format("%s#%s", pageUrl, headerName)
      editor.flashNotification("Copied header external link: " .. out, "info")
    else
      out = string.format("%s@%d", pageUrl, pos)
      editor.flashNotification("Copied cursor external link: " .. out, "info")
    end
  
    editor.copyToClipboard(out)
  end
}
```
