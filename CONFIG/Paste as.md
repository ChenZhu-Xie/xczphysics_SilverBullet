
1. https://chatgpt.com/share/68f750a0-14a0-8010-925b-c0415b75e62a

```space-lua
command.define {
  name = "Paste: Smart URL",
  key = "Alt-v",
  run = function()
    local clip = system.getClipboard() or ""
    clip = clip:match("^%s*(.-)%s*$")  -- 去除前后空白

    if clip == "" then
      editor.flashNotification("剪贴板为空", "warn")
      return
    end

    -- 判断是否是 URL
    local is_url = clip:match("^https?://[%w%-%._~:/%?#%[%]@!$&'()*+,;%%=]+$")
    if not is_url then
      editor.flashNotification("剪贴板内容不是 URL", "warn")
      return
    end

    -- 判断是否是图片链接
    local is_image = clip:match("%.png$") or clip:match("%.jpg$")
      or clip:match("%.jpeg$") or clip:match("%.gif$")
      or clip:match("%.webp$") or clip:match("%.svg$")
      or clip:match("%.bmp$") or clip:match("%.tiff$")

    local text
    if is_image then
      text = string.format("![](%s)", clip)
    else
      text = string.format("[](%s)", clip)
    end

    editor.insertText(text)
    editor.flashNotification("已粘贴智能链接", "info")
  end
}
```