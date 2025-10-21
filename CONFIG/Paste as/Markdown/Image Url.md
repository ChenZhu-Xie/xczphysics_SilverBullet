
1. https://chatgpt.com/share/68f750a0-14a0-8010-925b-c0415b75e62a


https://community.silverbullet.md/uploads/default/original/2X/0/092ad6b30d4a5b2341b42dafaa26d73f342340ef.jpeg



```space-lua
command.define {
  name = "Paste: Smart URL (via Prompt)",
  key = "Alt-v",
  run = function()
    -- 让用户在弹窗中 Ctrl/Cmd+V 粘贴
    local input = editor.prompt("请输入或粘贴 URL", "")
    if not input then
      editor.flashNotification("已取消", "warn")
      return
    end

    -- 去除前后空白
    local clip = input:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("内容为空", "warn")
      return
    end

    -- 判断是否 URL（支持 http/https、www.、data:image/）
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- 裸 www. 补协议，其它保持
    local function ensureScheme(u)
      if u:match("^www%.") then return "https://" .. u end
      return u
    end

    -- 判断是否图片链接（忽略查询/片段），或 data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?#]+")) or u
      path = path:lower()
      return path:match("%.png$") or path:match("%.jpe?g$") or
             path:match("%.gif$") or path:match("%.webp$") or
             path:match("%.bmp$") or path:match("%.tiff?$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("内容不是 URL", "warn")
      return
    end

    local url = ensureScheme(clip)
    local snippet = isImageUrl(url) and string.format("![](%s)", url)
                                   or  string.format("[](%s)",  url)
    editor.insertText(snippet)
    editor.flashNotification("已插入智能链接")
  end
}
```