
# Header Indent

```space-lua
-- 核心逻辑：调整选中范围内所有标题的层级
-- delta: 1 代表增加一级 (# -> ##), -1 代表减少一级 (## -> #)
local function modifySelectedHeaders(delta)
  -- 获取当前选区范围
  local range = editor.getSelectionRange()
  -- 获取选区内的文本
  local text = editor.getText(range.from, range.to)
  
  -- 如果没有选中内容，则不执行
  if not text or text == "" then
    return
  end

  local newLines = {}
  -- 遍历每一行文本
  -- 注意：这里通过追加 "\n" 确保最后一行也能被 gmatch 捕获
  for line in string.gmatch(text .. "\n", "(.-)\n") do
    -- 检测当前行是否为标题 (以 # 开头，后跟至少一个空格)
    local currentLevelStr = string.match(line, "^(#+)%s")
    
    if currentLevelStr then
      local currentLevel = #currentLevelStr
      
      if delta > 0 then
        -- 增加标题层级：在行首添加一个 #
        line = "#" .. line
      elseif delta < 0 then
        -- 减少标题层级：移除第一个 #
        -- 只有当层级大于1时才减少，避免将 H1 变成普通文本（根据需求可调整）
        if currentLevel > 1 then
          line = string.sub(line, 2)
        elseif currentLevel == 1 then
           -- 如果是 H1 且需要降级，这里保留为 H1，或者您可以选择变成普通文本：
           -- line = string.sub(line, 3) -- 去掉 "# "
        end
      end
    end
    
    table.insert(newLines, line)
  end

  -- 将处理后的行重新组合成文本
  local newText = table.concat(newLines, "\n")
  
  -- 处理末尾可能多出的换行符（取决于原文是否以换行结尾）
  if string.sub(text, -1) ~= "\n" and string.sub(newText, -1) == "\n" then
      newText = string.sub(newText, 1, -2)
  end

  -- 替换选区内容
  editor.replaceRange(range.from, range.to, newText)
end

-- 注册命令：批量增加标题层级 (Indent)
command.define {
  name = "Header: Indent Selected Headers",
  key = "Ctrl-Alt-]", -- 建议快捷键，可根据习惯修改
  run = function() 
    modifySelectedHeaders(1) 
  end
}

-- 注册命令：批量减少标题层级 (Outdent)
command.define {
  name = "Header: Outdent Selected Headers",
  key = "Ctrl-Alt-[", -- 建议快捷键，可根据习惯修改
  run = function() 
    modifySelectedHeaders(-1) 
  end
}

```

