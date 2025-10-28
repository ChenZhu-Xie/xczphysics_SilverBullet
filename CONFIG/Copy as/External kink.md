
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

-- 按需修改为你的 SilverBullet 访问地址
-- 例如本机: "http://127.0.0.1:3000"
-- 或公网:   "https://your-domain"
local BASE_URL = "http://127.0.0.1:3000"

local function build_page_url(pageName)
  -- 仅对“页面链接”的空格做 %20 替换
  local path = replace_space_with_percent20(pageName)
  return string.format("%s/%s", BASE_URL, path)
end

local function copy_external_ref()
  local lineObj = editor.getCurrentLine()
  local currentLine = (lineObj.textWithCursor or lineObj.text or "")
  -- 原代码的清理逻辑保留
  currentLine = currentLine:gsub("|%^|", "")

  local pageName = editor.getCurrentPage()
  local pos = editor.getCursor()

  local headerMarks, headerName = string.match(currentLine, "^(#+)%s+(.+)$")
  local pageUrl = build_page_url(pageName)

  local out
  if headerMarks and headerName and headerName:match("%S") then
    headerName = headerName:match("^%s*(.-)%s*$")  -- 去首尾空白
    -- 如需标题中空格也替换为 %20，可启用下一行：
    -- headerName = replace_space_with_percent20(headerName)

    out = string.format("%s#%s", pageUrl, headerName)
    editor.flashNotification("Copied header external link: " .. out, "info")
  else
    -- 这里假设 editor.getCursor() 返回数值位置；若是表结构，可按需改为 pos.pos 或 pos.ch/pos.line 等
    out = string.format("%s@%d", pageUrl, tonumber(pos) or 0)
    editor.flashNotification("Copied cursor external link: " .. out, "info")
  end

  editor.copyToClipboard(out)
end

-- 用同一实现同时绑定两个快捷键
command.define {
  name = "Cursor: Copy Reference",
  key = "Shift-Alt-c",
  run = copy_external_ref
}

command.define {
  name = "Cursor: Copy Reference (External)",
  key = "Ctrl-Shift-c",
  run = copy_external_ref
}
```
