

ddd
# Header Indent

##### etst
aasdfasdf

```space-lua
-- 辅助函数：获取位置所在的行首 (0-based)
local function getLineStart(text, pos)
  if pos <= 0 then return 0 end
  -- 截取光标前的文本 (Lua索引为1-based，所以是1到pos)
  local pre = text:sub(1, pos)
  -- 查找最后一个换行符的位置
  -- ".*()\n" 这种写法在Lua模式匹配中用于定位最后一个换行符
  local lastNL = pre:match(".*()\n")
  
  if lastNL then
    -- 如果找到了换行符，行首就是换行符的下一个字符
    -- lastNL 返回的是 \n 的位置索引，因为 Lua 是 1-based，
    -- 但 SilverBullet API 是 0-based，且我们需要的是 \n 后面一个位置
    -- 换算逻辑：Lua index of \n == lastNL. 
    -- Start of line in 0-based = lastNL (因为 Lua index = 0-based index + 1)
    return lastNL
  else
    -- 没找到换行符，说明在第一行
    return 0
  end
end

-- 辅助函数：获取位置所在的行尾 (0-based)，包含换行符
local function getLineEnd(text, pos)
  if pos >= #text then return #text end
  -- 从 pos + 1 开始查找下一个换行符
  local post = text:sub(pos + 1)
  local nextNL = post:find("\n")
  
  if nextNL then
    -- pos 是起始偏移，nextNL 是相对于 post 的偏移
    return pos + nextNL
  else
    return #text
  end
end

-- 核心逻辑：获取扩展后的完整行边界
local function getFullLineBoundaries(sel, text)
  local startPos = getLineStart(text, sel.from)
  
  -- 处理 "选区包含下一行行首" 导致的下跳 Bug
  -- 如果选区非空 (sel.to > sel.from)，且 sel.to 刚好位于行首（即 text[sel.to] 前面是 \n），
  -- 此时我们应该认为用户选中的是 "上一行的末尾"，而不是 "下一行的开始"。
  local effectiveEnd = sel.to
  if sel.to > sel.from then
    -- 检查 sel.to 前一个字符是否为换行符
    -- 注意 Lua 1-based 转换：sel.to 对应的 Lua 索引是 sel.to
    local charBefore = text:sub(sel.to, sel.to)
    -- 如果光标在行首（实际上是在上一行的换行符之后），我们需要回退判定范围
    if charBefore == "\n" then
      -- 这是一个简化的判断，更严谨的方法是看 getLineStart(text, sel.to) 是否等于 sel.to
      -- 但通常只要 sel.to > sel.from 且停在行首，我们就应该排除这一行
      if getLineStart(text, sel.to) == sel.to then
         effectiveEnd = sel.to - 1
      end
    end
  end

  local endPos = getLineEnd(text, effectiveEnd)
  
  return startPos, endPos
end

-- 核心逻辑：批量调整 Header 层级
-- delta: 1 (Indent), -1 (Outdent)
local function batchUpdateHeaders(delta)
  local sel = editor.getSelection()
  if not sel then return end
  
  local text = editor.getText()
  
  -- 1. 获取扩展后的完整行范围
  local rangeStart, rangeEnd = getFullLineBoundaries(sel, text)
  
  -- 2. 提取目标文本块
  -- Lua sub 需要 1-based 索引，所以 start 要 +1
  local textBlock = text:sub(rangeStart + 1, rangeEnd)
  
  local newLines = {}
  local modifiedCount = 0
  
  -- 3. 逐行处理
  -- gmatch 匹配每一行，包含行末可能的换行符
  for line in textBlock:gmatch("([^\n]*\n?)") do
    if line ~= "" then
      -- 检查是否为 Header 行 (以 # 开头，必须后跟空格才是标准 Markdown Header)
      -- 捕获 hashes (#...) 和剩余内容 (rest)
      local hashes, rest = line:match("^(#+)%s(.*)")
      
      -- 如果不是 Header，但我们要增加层级，且该行有内容，可以变成 H1
      -- 这里为了稳健，暂时只处理已经是 Header 的行，或者你可以放开注释处理普通文本
      
      if hashes then
        local currentLevel = #hashes
        if delta > 0 then
          -- Indent: H1 -> H2
          if currentLevel < 6 then -- 限制最大 H6
             line = "#" .. line
             modifiedCount = modifiedCount + 1
          end
        elseif delta < 0 then
          -- Outdent: H2 -> H1 -> Text
          if currentLevel > 1 then
            -- 减少一个 #
            line = line:sub(2)
            modifiedCount = modifiedCount + 1
          elseif currentLevel == 1 then
            -- H1 -> 普通文本 (去掉 "# ")
            -- rest 包含了空格后的内容，但也包含了可能的换行符
            -- 简单处理：去掉第一个字符 (#) 和紧随的空格
            -- 正则匹配到的 rest 是不含换行符的吗？gmatch 的 pattern 可能会包含。
            -- 让我们用更安全的替换方式：只替换行首的 "# "
            line = line:gsub("^#%s", "", 1)
            modifiedCount = modifiedCount + 1
          end
        end
      else
        -- 可选：如果当前是普通文本，按 Indent 是否要变 H1？
        -- 如果你需要这个功能，取消下面注释
        if delta > 0 and line:match("%S") then -- 只有非空行才变
           line = "# " .. line
           modifiedCount = modifiedCount + 1
        end
      end
      table.insert(newLines, line)
    end
  end
  
  -- 4. 执行替换与重新选区
  if #newLines > 0 then -- 即使 modifiedCount 为 0，如果我们要扩展选区，也应该替换(或至少重置选区)
    local newText = table.concat(newLines)
    
    -- 仅当文本真正改变时才调用 replaceRange，避免不必要的历史记录
    if newText ~= textBlock then
        editor.replaceRange(rangeStart, rangeEnd, newText)
    end
    
    -- 关键修复：设置选区时，精确覆盖新生成的文本块
    -- 这样下次运行时，getFullLineBoundaries 会基于这个精确的块进行计算
    editor.setSelection(rangeStart, rangeStart + #newText)
  end
end

-- 注册命令：Indent (Ctrl-])
command.define {
  name = "Header: Indent Selected",
  key = "Ctrl-]",
  run = function() 
    batchUpdateHeaders(1) 
  end
}

-- 注册命令：Outdent (Ctrl-[)
command.define {
  name = "Header: Outdent Selected",
  key = "Ctrl-[",
  run = function() 
    batchUpdateHeaders(-1) 
  end
}
```

