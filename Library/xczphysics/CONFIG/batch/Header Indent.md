

ddd
# Header Indent

##### etst
aasdfasdf

```space-lua
-- =========================================================
-- 辅助函数区域 (必须放在主逻辑之前)
-- =========================================================

-- 获取位置所在的行首 (0-based)
local function getLineStart(text, pos)
  if not pos or pos <= 0 then return 0 end
  
  -- 截取光标前的文本
  local pre = text:sub(1, pos)
  
  -- 查找最后一个换行符的位置
  -- ".*()\n" 用于定位最后一个 \n 之后的位置（即下一行行首）
  local lastNL = pre:match(".*()\n")
  
  if lastNL then
    -- Lua index (1-based) 转换为 API index (0-based)
    -- lastNL 返回的是 \n 后面那个字符在 Lua 中的位置
    -- 对应到 0-based 系统，数值正好相等 (e.g. Lua 5 -> 0-based 5)
    return lastNL
  else
    -- 没找到换行符，说明在第一行
    return 0
  end
end

-- 获取位置所在的行尾 (0-based)
local function getLineEnd(text, pos)
  if not pos or pos >= #text then return #text end
  
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

-- 获取扩展后的完整行边界
local function getFullLineBoundaries(sel, text)
  -- 防御性检查
  if not sel then return 0, 0 end
  
  local startPos = getLineStart(text, sel.from) or 0
  
  -- 处理 "选区包含下一行行首" 导致的下跳 Bug
  local effectiveEnd = sel.to
  if sel.to > sel.from then
    local charBefore = text:sub(sel.to, sel.to)
    if charBefore == "\n" then
      -- 如果光标刚好停在换行符后（新行行首），判定回退一行
      if getLineStart(text, sel.to) == sel.to then
         effectiveEnd = sel.to - 1
      end
    end
  end

  local endPos = getLineEnd(text, effectiveEnd) or #text
  
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
  
  local text = editor.getText() or ""
  
  -- 1. 获取扩展后的完整行范围
  local rangeStart, rangeEnd = getFullLineBoundaries(sel, text)
  
  -- 2. 提取目标文本块 (防御性修复：确保是数字)
  rangeStart = rangeStart or 0
  rangeEnd = rangeEnd or #text
  
  -- Lua string.sub 使用 1-based 索引，所以 start 要 +1
  local textBlock = text:sub(rangeStart + 1, rangeEnd)
  
  local newLines = {}
  local modifiedCount = 0
  
  -- 3. 逐行处理
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
      else
        -- 这是一个普通行。如果需要 "普通文本 -> H1" 的功能，取消下面注释：
        -- if delta > 0 and line:match("%S") then 
        --    line = "# " .. line
        --    modifiedCount = modifiedCount + 1
        -- end
      end
      table.insert(newLines, line)
    end
  end
  
  -- 4. 执行替换与重新选区
  -- 即使 modifiedCount 为 0，如果我们要修正选区范围（扩展到整行），也建议执行
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

