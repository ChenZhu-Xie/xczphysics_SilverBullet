
# Command Button with Title Alias does not work in Table

1. https://community.silverbullet.md/t/command-button-with-title-alias-does-not-work-in-table/1701/4?u=chenzhu-xie
- using cmd https://community.silverbullet.md/t/command-in-space-lua-to-set-page-attributes/1696
  - related to [[CONFIG/Plug_dev/Github_Url]]

```lua
command.define {
  name = "Page: Set Attribute",
  run = function(a)
    local data = a[1]
    local mypath = data.page or _CTX.currentPage.name
    local myattr = data.attribute or "foo"
    local myvalue = data.value or 0
    local mychange = data.change or 0
    local mypage = space.read_page(mypath)
    local oldline = "[%[]%s*" .. myattr .. "%s*:%s*%w+%s*]"
    local oldval = nil
    local newline = "[" .. myattr .. ":" .. myvalue .. "]"
    local newpage = ""
    local matches = string.match(mypage,oldline).values
    if matches[1] then
      local oldval = tonumber(string.match(matches[1],"%d+").values[1])
      if oldval and mychange != 0 then
        newline = "["..myattr .. ":" .. oldval+mychange .. "]"
      end 
      newpage = string.gsub(mypage,oldline,newline,1)
    else
      newpage = mypage.."\n"..newline
    end
    space.write_page(mypath,newpage)
    codeWidget.refreshAll()
    if mypath == _CTX.currentPage.name then
      editor.set_text(newpage)
    end
  end
}
```
