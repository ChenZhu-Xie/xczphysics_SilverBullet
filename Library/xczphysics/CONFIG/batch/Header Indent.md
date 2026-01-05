

ddd
### Header Indent

##### etst
aasdfasdf

```space-lua
-- 核心逻辑：调整选中范围内所有标题的层级
local function modifySelectedHeaders(delta)
  local range = editor.getSelectionRange()
  local text = editor.getText(range.from, range.to)
  
  if not text or text == "" then
    return
  end

  local newLines = {}
  -- 这是一个计数器，用于记录字符长度的变化量
  local charCountDiff = 0 

  -- 遍历每一行
  for line in string.gmatch(text .. "\n", "(.-)\n") do
    local currentLevelStr = string.match(line, "^(#+)%s")
    
    if currentLevelStr then
      local currentLevel = #currentLevelStr
      
      if delta > 0 then
        -- Indent: 增加一个 #
        line = "#" .. line
        charCountDiff = charCountDiff + 1 -- 字符数 +1
      elseif delta < 0 then
        -- Outdent: 减少一个 #
        if currentLevel > 1 then
          line = string.sub(line, 2)
          charCountDiff = charCountDiff - 1 -- 字符数 -1
        elseif currentLevel == 1 then
          -- 如果是一级标题且不降级为文本，长度不变，不做操作
          -- 如果您之前修改了这里让 H1 变文本，请相应调整 charCountDiff
        end
      end
    end
    
    table.insert(newLines, line)
  end

  local newText = table.concat(newLines, "\n")
  
  -- 处理末尾换行符的一致性
  if string.sub(text, -1) ~= "\n" and string.sub(newText, -1) == "\n" then
      newText = string.sub(newText, 1, -2)
  end

  -- 1. 执行替换
  editor.replaceRange(range.from, range.to, newText)

  -- 2. 修正选区 (关键修复步骤)
  -- 新的结束位置 = 旧的结束位置 + 字符变化量
  -- 这样无论内容里是否有中文，因为我们只动了 # 号，计算都是准确的
  editor.setSelection(range.from, range.to + charCountDiff)
end

-- 注册命令部分保持不变
command.define {
  name = "Header: Indent Selected Headers",
  key = "Ctrl-Alt-]", 
  run = function() 
    modifySelectedHeaders(1) 
  end
}

command.define {
  name = "Header: Outdent Selected Headers",
  key = "Ctrl-Alt-[", 
  run = function() 
    modifySelectedHeaders(-1) 
  end
}

```

