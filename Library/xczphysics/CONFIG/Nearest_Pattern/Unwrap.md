
# Unwrap and Copy Nearest Pattern


## Page Ver

```space-lua
-- 辅助函数：提取不同模式下的“核” (Content)
local function extractCore(name, text)
  if name == "Wiki Link" then
    -- 匹配 [[text]] 或 [[link|text]]，取最后的部分
    local core = text:match("%[%[([^%]]+)%]%]")
    if core and core:find("|") then core = core:match("|([^|]+)$") end
    return core
  elseif name == "Fields" then
    return text:match("%[[^:]+:([^%]]+)%]") -- 取 [key:value] 中的 value
  elseif name == "Image" then
    return text:match("!%[([^%]]*)%]") -- 取 alt 文字
  elseif name == "Markdown Link" then
    return text:match("%[([^%]]+)%]") -- 取 [text](url) 中的 text
  elseif name == "Color Func" then
    return text:match("%([\"\']([^\"\']+)[\"\']%)") -- 取 ${Color("value")} 中的 value
  elseif name == "Bold" then
    return text:match("%*%*([^\n%*]+)%*%*")
  elseif name == "Italic" then
    return text:match("_([^\n_]+)_")
  elseif name == "Sup" then
    return text:match("%^([^ \n%^]+)%^")
  elseif name == "Strikethrough" then
    return text:match("~~([^\n]+)~~")
  elseif name == "Sub" then
    return text:match("~([^ \n~]+)~")
  elseif name == "Marker" then
    return text:match("==([^\n]+)==")
  elseif name == "Inline Code" then
    return text:match("`([^\n`]+)`")
  elseif name == "Lua Block" or name == "Script Block" then
    return text:match("```%a+\n?(.*)```")
  elseif name == "Header" then
    return text:match("#+ (.*)")
  elseif name == "Tag" then
    return text:sub(2) -- 去掉前面的 #
  end
  return text -- 默认返回原样
end

command.define{
  name = "Cursor: Unwrap and Copy Nearest",
  description = "Remove the formatting of the nearest pattern, keep only the content, and copy it.",
  key = "Alt-Shift-C", -- 您可以根据需要修改快捷键
  run = function()
    local match = findNearestInlinePattern()
    if not match then
      editor.flashNotification("No pattern matched.")
      return
    end

    -- 1. 提取核心内容
    local core = extractCore(match.name, match.text)
    if not core then
      editor.flashNotification("Failed to extract core from " .. match.name)
      return
    end

    editor.copyToClipboard(core)
    editor.replaceRange(match.start, match.stop, core)

    editor.flashNotification("Unwrapped & Copied: " .. match.name)
  end
}

```
