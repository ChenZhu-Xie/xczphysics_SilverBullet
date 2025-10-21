
1. https://chatgpt.com/share/68f750a0-14a0-8010-925b-c0415b75e62a



```space-lua
command.define {
  name = "Paste: Smart URL",
  key = "Alt-v", -- 可按需修改快捷键
  run = function()
    local clip = editor.copyToClipboard()
    if not clip then
      editor.flashNotification("剪贴板为空", "warn")
      return
    end
    -- 去除前后空白
    clip = clip:match("^%s*(.-)%s*$")
    if clip == "" then
      editor.flashNotification("剪贴板为空", "warn")
      return
    end

    -- 是否是 URL（支持 http/https、www.、以及 data:image/）
    local function isUrl(u)
      return u:match("^https?://")
          or u:match("^www%.")
          or u:match("^data:image/")
    end

    -- 若是裸的 www.，补 https://；data: 或 http/https 保持不变
    local function ensureScheme(u)
      if u:match("^https?://") or u:match("^data:") then
        return u
      elseif u:match("^www%.") then
        return "https://" .. u
      else
        return u
      end
    end

    -- 判断是否为图片链接：检查扩展名（忽略查询/片段），或 data:image/
    local function isImageUrl(u)
      if u:match("^data:image/") then return true end
      local path = (u:match("^[^%?%#]+")) or u -- 去掉 ? 和 #
      path = path:lower()
      return path:match("%.png$") or
             path:match("%.jpg$") or
             path:match("%.jpeg$") or
             path:match("%.gif$") or
             path:match("%.webp$") or
             path:match("%.bmp$") or
             path:match("%.tif$") or
             path:match("%.tiff$") or
             path:match("%.svg$")
    end

    if not isUrl(clip) then
      editor.flashNotification("剪贴板内容不是 URL", "warn")
      return
    end

    local url = ensureScheme(clip)
    local snippet
    if isImageUrl(url) then
      snippet = string.format("![](%s)", url)
    else
      snippet = string.format("[](%s)", url)
    end

    editor.insertText(snippet)
    editor.flashNotification("已粘贴智能链接")
  end
}
```