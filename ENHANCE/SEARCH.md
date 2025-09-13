
```space-lua
   ---- https://community.silverbullet.md/t/fixing-silver-bullets-chinese-search-gap-a-space-lua-global-search-implementation/3157
  
-- Escape regular expression special characters in keywords
local function escapeKeyword(keyword)
    -- List of regular expression special characters: . ^ $ * + ? ( ) [ ] { } | \
    local specialChars = {
        ["."] = "%.",
        ["^"] = "%^",
        ["$"] = "%$",
        ["*"] = "%*",
        ["+"] = "%+",
        ["?"] = "%?",
        ["("] = "%(",
        [")"] = "%)",
        ["["] = "%[",
        ["]"] = "%]",
        ["{"] = "%{",
        ["}"] = "%}",
        ["|"] = "%|",
        ["\\"] = "\\\\"
    }
    -- Replace special characters in the keyword with their escaped versions
    return string.gsub(keyword, ".", function(char)
        return specialChars[char] or char
    end)
end

-- Extract 10 characters before and after the keyword (handles cases with fewer than 10 characters)
-- Parameters: content (content to search), keyword (keyword to search for)
-- Returns: Iterator (each iteration returns a match result in the format: prefix + keyword + suffix)
local function extractKeywordContext(content, keyword)
    -- 1. Escape the keyword (handle special characters)
    local escapedKeyword = escapeKeyword(keyword)
    -- 2. Build regular expression pattern (0-10 characters before + keyword + 0-10 characters after)
    local pattern = ".{0,10}" .. escapedKeyword .. ".{0,10}"
    -- 3. Use string.gmatch to iterate through matches and concatenate results
    return string.gmatch(content, pattern)
end

local function searchGlobal(keyword)
    local result = ""
    local pages = space.listPages()
    for i, page in ipairs(pages) do
        local matchs = ""
        local content = space.readPage(page.name)
        for match in extractKeywordContext(content, keyword) do
            matchs = matchs .. "* " .. match .. '\n'
        end
        if #matchs > 0 then
            result = result .. "## [[" .. page.name .. "]]\n" .. matchs
        end
    end
    return result
end

command.define {
  name = "Global Search",
  run = function()
    local keyword = editor.prompt("Keyword","")
    if #keyword then
      local res = searchGlobal(keyword)
      if #res > 0 then
        editor.showPanel('rhs', 1, markdown.markdownToHtml(res))
      else
        editor.flashNotification('not found', 'warn')
      end
    end
  end,
  key = "Ctrl-Alt-f",
  mac = "Cmd-Alt-f",
  priority = 0
}

command.define {
  name = "close Global Search",
  run = function()
    editor.hidePanel('rhs')
  end
}
```