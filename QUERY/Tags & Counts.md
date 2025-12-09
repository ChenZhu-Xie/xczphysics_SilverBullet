
1. [converting v1 query to v2](https://community.silverbullet.md/t/converting-v1-query-to-v2/3615/3?u=chenzhu-xie) #community #silverbullet

`${template.each( (function()
  local tb = query[[from index.tag "tag" order by _.name]]
  local counts = {}
  local counted = {}
  for _, it in ipairs(tb) do
      if counts[it.name] then counts[it.name] = counts[it.name] + 1
      else counts[it.name] = 1 end
  end
  for k, obj in pairs(counts) do
      table.insert(counted, {name = k, count = obj})
  end
  return counted
end)(), 
function(obj)
  return spacelua.interpolate([==[
 [[tag:${name}|#${name}]] (${count})
]==], obj)
end)}`

1. [converting v1 query to v2](https://community.silverbullet.md/t/converting-v1-query-to-v2/3615/6?u=chenzhu-xie) #community #silverbullet

${AlphabeticTagList()}

```space-lua
function AlphabeticTagList()

  local grouped = {}
  local counts = {}
  local sortedLetters = {}
  
  local inputTable = query[[
      from t = index.tag "tag"
      order by t.name 
      select {N = t.name, P = t.parent, PG = t.page}
  ]]

  -- group strings for first letters
    for _, str in ipairs(inputTable) do
        --local firstChar = str:sub(1, 1):upper() -- get first letter, set to uppercase
        local firstChar = string.sub(str.N,1, 1)
        firstChar = string.upper(firstChar)
      
        if not grouped[firstChar] then
            grouped[firstChar] = {}
        end
        table.insert(grouped[firstChar], str.N)
    end

    -- Create a sorted list of all letters

    for letter in pairs(grouped) do
        table.insert(sortedLetters, letter)
    end
    table.sort(sortedLetters) -- sort alphabetically
   
    -- create output in markdown format
    local output = ""
    for _, letter in ipairs(sortedLetters) do
        output = output .. "**" .. letter .. "**  :  " -- make the letters bold
        local uniqueWords = {}

        -- count the occurances 
        for _, word in ipairs(grouped[letter]) do

            if counts[word] then
                counts[word] = counts[word] + 1
            else
                counts[word] = 1
                table.insert(uniqueWords, word)
            end
        end

        -- add the single occurances
        for i, word in ipairs(uniqueWords) do

            output = output .. "[[tag:" .. word .. "|" .. word .. "]]"

            if counts[word] > 1 then
                output = output .. "(" .. counts[word] .. ")"
            end
            if i < #uniqueWords then
                output = output .. "  " -- set a space between words
            end
           -- print("COUNTB ", word, counts[word])
        end
        output = output .. "\n" 
    end

    return widget.new{
      markdown = output;
      display = "block";
      cssClasses={"taglist"}
    }
end
```

2. related: [[CONFIG/Widget/Tag-Page_Navigator]]
