


```space-lua
command.define {
  name = "Cursor: Copy Reference (robust)",
  run = function()
    local pageName = space.getCurrentPage()
    if not pageName then
      editor.flashNotification("无法获取页面名", "error")
      return
    end

    local cursor = editor.getCursor()
    local fullText = editor.getText() or ""

    -- 将各种可能的 cursor 形式转换为 1-based 字符偏移（number）
    local function cursorToOffset(cur, text)
      if type(cur) == "number" then
        return cur
      end
      if type(cur) ~= "table" then
        return nil
      end

      -- 尝试提取 line / row / 索引 与 ch / col / 第二元素
      local lineIdx = cur.line or cur.row or cur[1]
      local ch = cur.ch or cur.col or cur[2] or 0
      if not lineIdx then
        return nil
      end

      -- 把全文分成行（可靠处理末尾没有换行的情况）
      local lines = {}
      for line in (text .. "\n"):gmatch("(.-)\n") do
        table.insert(lines, line)
      end

      -- 有些 API 返回 0-based line，有些返回 1-based。尝试两种并取合理的 one.
      local chosenLine = nil
      if lineIdx >= 1 and lineIdx <= #lines then
        chosenLine = lineIdx -- 很可能是 1-based
      elseif (lineIdx + 1) >= 1 and (lineIdx + 1) <= #lines then
        chosenLine = lineIdx + 1 -- 可能是 0-based，转换为 1-based
      else
        -- 超出范围时做一个保守的裁剪
        chosenLine = math.min(math.max(1, tonumber(lineIdx) or 1), #lines)
      end

      local charInLine = tonumber(ch) or 0
      -- 不同实现 ch 可能 0-based 或 1-based：若看起来是 1-based（>=1）则转为 0-based
      if charInLine >= 1 then charInLine = charInLine - 1 end

      local offset = 0
      for i = 1, chosenLine - 1 do
        offset = offset + #lines[i] + 1 -- 加上每行内容长度和换行符
      end
      offset = offset + charInLine
      return offset + 1 -- 转为 1-based 字符偏移供 string.sub 使用
    end

    local pos = cursorToOffset(cursor, fullText)
    if not pos then
      editor.flashNotification("无法解析光标位置（格式未知）", "error")
      return
    end
    if pos < 1 then pos = 1 end

    -- 取光标前文本并计算行号
    local textBefore = fullText:sub(1, pos)
    local _, newlineCount = textBefore:gsub("\n", "")
    local lineNum = newlineCount + 1

    local ref = string.format("[[%s@%d]]", pageName, lineNum)

    -- 先尝试复制到剪贴板；若没有 clipboard API，则回退为在光标处插入并提示
    if system and system.clipboardWrite then
      system.clipboardWrite(ref)
      editor.flashNotification("Copied reference: " .. ref, "info")
    else
      editor.insertText(ref)
      editor.flashNotification("clipboardWrite 不可用，已插入引用: " .. ref, "warn")
    end
  end
}

```

