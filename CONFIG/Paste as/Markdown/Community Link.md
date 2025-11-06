
```space-lua
command.define {
  name = "Insert: SB Community Link",
  key = "Shift-Alt-v",
  run = function()
    -- 1️⃣ 从剪贴板获取内容
    local clip = editor.getClipboardText and editor.getClipboardText() or ""
    clip = clip:match("^%s*(.-)%s*$")  -- 去除空白

    if clip == "" then
      editor.flashNotification("Clipboard is empty", "warn")
      return
    end

    -- 2️⃣ 简单检测是否是 community 链接
    if not clip:match("^https?://community%.silverbullet%.md/") then
      editor.flashNotification("Not a SilverBullet community link", "warn")
      return
    end

    -- 3️⃣ 提取 slug：t/<slug>/ 或 t/<slug>?
    local slug = clip:match("/t/([^/%?]+)/?")
    if not slug or slug == "" then
      editor.flashNotification("Cannot extract slug", "warn")
      return
    end

    -- 4️⃣ 将 slug 转为可读标题
    local title = slug
      :gsub("%-", " ")         -- - → 空格
      :gsub("^%l", string.lower)  -- 首字母小写（可去掉此行保持原样）

    -- 5️⃣ 构造 Markdown 链接
    local snippet = string.format("[%s](%s) #SB_Community", title, clip)

    -- 6️⃣ 插入到光标处
    editor.insertAtCursor(snippet, false)
    editor.flashNotification("Inserted SB community link")
  end
}
```
