

dd
## Header Indent

#### etst
aasdfasdf

```space-lua
-- 辅助函数：根据当前选区，获取包含这些选区的完整行的起始和结束位置 (0-based index)
local function getFullLineBoundaries(sel, text)
  -- 1. 寻找起始位置：从 sel.from 向前找最后一个换行符
  local startPos = 0
  if sel.from > 0 then
    -- 获取光标前的文本
    local pre = text:sub(1, sel.from)
    -- 匹配最后一个换行符的位置，如果找不到则说明在第一行（位置为0）
    -- 这里的 match(".*()\n") 会返回最后一个 \n 之后的位置（即下一行行首）
    -- Lua 索引是 1-based，API 是 0-based，需要仔细换算
    local lastNLPos = pre:match(".*()\n")
    if lastNLPos then
      startPos = lastNLPos - 1 -- 转换为 0-based
    else
      startPos = 0
    end
  end

  -- 2. 寻找结束位置：从 sel.to 向后找第一个换行符
  local endPos = #text
  local post = text:sub(sel.to + 1)
  local nextNLIndex = post:find("\n")
  
  if nextNLIndex then
    -- sel.to 是光标位置，加上找到的换行符偏移量
    endPos = sel.to + nextNLIndex
  end
  
  return startPos, endPos
end

-- 核心逻辑：批量调整 Header 层级
-- delta: 1 (Indent), -1 (Outdent)
local function batchUpdateHeaders(delta)
  local sel = editor.getSelection()
  if not sel then return end
  
  local text = editor.getText()
  
  -- 获取完整行的范围，确保正则匹配能正确识别行首的 #
  local rangeStart, rangeEnd = getFullLineBoundaries(sel, text)
  
  -- 提取目标文本块 (Lua string.sub 使用 1-based 索引)
  local textBlock = text:sub(rangeStart + 1, rangeEnd)
  
  local newLines = {}
  local modifiedCount = 0
  
  -- 遍历每一行 (保留换行符以维持结构)
  for line in textBlock:gmatch("([^\n]*\n?)") do
    if line ~= "" then
      -- 检查是否为 Header 行 (以 # 开头，后跟空格)
      -- 捕获 hashes (#...) 和剩余内容
      local hashes, content = line:match("^(#+)%s(.*)")
      
      if hashes then
        if delta > 0 then
          -- Indent: 在行首添加一个 #
          line = "#" .. line
          modifiedCount = modifiedCount + 1
        elseif delta < 0 then
          -- Outdent: 减少一个 #
          if #hashes > 1 then
            -- 如果层级 > 1，直接去掉第一个字符
            line = line:sub(2)
            modifiedCount = modifiedCount + 1
          elseif #hashes == 1 then
            -- 如果是 H1，降级为普通文本 (去掉 #，保留后续空格作为缩进，或视需求去掉)
            -- 这里逻辑为：去掉行首的 '#' 字符
            line = line:sub(2)
            modifiedCount = modifiedCount + 1
          end
        end
      end
      table.insert(newLines, line)
    end
  end
  
  -- 如果有内容被修改，执行替换
  if modifiedCount > 0 then
    local newText = table.concat(newLines)
    
    -- 替换文本
    editor.replaceRange(rangeStart, rangeEnd, newText)
    
    -- 重新选中修改后的文本块，方便连续操作
    editor.setSelection(rangeStart, rangeStart + #newText)
    
    -- 可选：简单的反馈
    -- editor.flashNotification("Updated " .. modifiedCount .. " headers")
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

