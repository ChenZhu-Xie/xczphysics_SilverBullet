

ddd
# Header Indent

#### etst
aasdfasdf

```space-lua
-- =========================================================
-- 辅助函数区域 (必须放在主逻辑之前)
-- =========================================================

-- 获取位置所在的行首 (0-based)
-- 修复：使用 string.find 反向查找换行符，避免 match 的陷阱
local function getLineStart(text, pos)
  -- 防御性检查
  if not text or not pos then return 0 end
  if pos <= 0 then return 0 end
  
  -- 从 pos 位置向前查找最近的换行符
  -- 我们需要检查 pos 之前（不含 pos）的内容
  local searchEnd = pos
  if searchEnd > #text then searchEnd = #text end
  
  -- 从后往前遍历查找换行符
  for i = searchEnd, 1, -1 do
    if text:sub(i, i) == "\n" then
      -- 找到换行符，行首是换行符的下一个字符
      -- 返回 0-based 索引，所以直接返回 i（Lua 1-based 的 i 等于 0-based 的 i-1，再 +1 等于 i）
      return i
    end
  end
  
  -- 没找到换行符，说明在第一行，行首是 0
  return 0
end

-- 获取位置所在的行尾 (0-based)，返回该行最后一个字符之后的位置（含换行符）
local function getLineEnd(text, pos)
  -- 防御性检查
  if not text or not pos then return 0 end
  if pos >= #text then return #text end
  
  -- 从 pos 位置向后查找最近的换行符
  local searchStart = pos + 1
  if searchStart < 1 then searchStart = 1 end
  
  for i = searchStart, #text do
    if text:sub(i, i) == "\n" then
      -- 找到换行符，返回包含换行符的位置
      return i
    end
  end
  
  -- 没找到换行符，说明在最后一行，返回文本末尾
  return #text
end

-- 获取扩展后的完整行边界
local function getFullLineBoundaries(sel, text)
  -- 防御性检查
  if not sel then return 0, #text end
  if not text or text == "" then return 0, 0 end
  
  local startPos = getLineStart(text, sel.from)
  
  -- 处理 "选区结尾刚好在行首" 导致的下跳 Bug
  local effectiveEnd = sel.to
  if sel.to > sel.from and sel.to > 0 then
    -- 检查 sel.to 位置的字符是否是换行符后的位置
    -- 即检查 sel.to 前一个字符是否为换行符
    if sel.to <= #text then
      local charBefore = text:sub(sel.to, sel.to)
      -- 如果当前位置是换行符，说明光标在行末
      -- 我们需要检查是否光标落在了新行的开头
      local lineStartAtTo = getLineStart(text, sel.to)
      if lineStartAtTo == sel.to and sel.to > sel.from then
        -- 光标刚好在新行开头，回退到上一行
        effectiveEnd = sel.to - 1
      end
    end
  end
  
  local endPos = getLineEnd(text, effectiveEnd)
  
  return startPos, endPos
end

-- =========================================================
-- 核心逻辑区域
-- =========================================================

-- 批量调整 Header 层级
-- delta: 1 (Indent/升级), -1 (Outdent/降级)
local function batchUpdateHeaders(delta)
  local sel = editor.getSelection()
  if not sel then return end
  
  local text = editor.getText()
  if not text or text == "" then return end
  
  -- 1. 获取扩展后的完整行范围
  local rangeStart, rangeEnd = getFullLineBoundaries(sel, text)
  
  -- 2. 防御性修复：确保是有效数字
  if type(rangeStart) ~= "number" then rangeStart = 0 end
  if type(rangeEnd) ~= "number" then rangeEnd = #text end
  
  -- 确保范围有效
  if rangeStart < 0 then rangeStart = 0 end
  if rangeEnd > #text then rangeEnd = #text end
  if rangeStart > rangeEnd then rangeStart, rangeEnd = rangeEnd, rangeStart end
  
  -- 3. 提取目标文本块
  -- Lua string.sub 使用 1-based 索引
  local textBlock = text:sub(rangeStart + 1, rangeEnd)
  
  -- 如果文本块为空，直接返回
  if not textBlock or textBlock == "" then return end
  
  local newLines = {}
  local modifiedCount = 0
  
  -- 4. 逐行处理
  for line in textBlock:gmatch("([^\n]*\n?)") do
    if line ~= "" then
      -- 检查是否为 Header 行 (以 # 开头，必须后跟空格)
      local hashes, rest = line:match("^(#+)%s(.*)")
      
      if hashes then
        local currentLevel = #hashes
        
        if delta > 0 then
          -- Indent: H1 -> H2
          if currentLevel < 6 then 
             line = "#" .. line
             modifiedCount = modifiedCount + 1
          end
        elseif delta < 0 then
          -- Outdent logic
          if currentLevel > 1 then
            -- 减少一个 #
            line = line:sub(2)
            modifiedCount = modifiedCount + 1
          elseif currentLevel == 1 then
            -- H1 -> 普通文本 (去掉 "# ")
            line = line:gsub("^#%s", "", 1)
            modifiedCount = modifiedCount + 1
          end
        end
      end
      -- 注意：如果不是 Header 行，保持原样（不做处理）
      table.insert(newLines, line)
    end
  end
  
  -- 5. 执行替换与重新选区
  if #newLines > 0 then
    local newText = table.concat(newLines)
    
    if newText ~= textBlock then
      editor.replaceRange(rangeStart, rangeEnd, newText)
    end
    
    -- 设置选区：精确覆盖新文本，防止下跳
    editor.setSelection(rangeStart, rangeStart + #newText)
  end
end

-- =========================================================
-- 命令注册区域
-- =========================================================

command.define {
  name = "Header: Indent Selected",
  key = "Ctrl-]",
  run = function() 
    batchUpdateHeaders(1) 
  end
}

command.define {
  name = "Header: Outdent Selected",
  key = "Ctrl-[",
  run = function() 
    batchUpdateHeaders(-1) 
  end
}
```

