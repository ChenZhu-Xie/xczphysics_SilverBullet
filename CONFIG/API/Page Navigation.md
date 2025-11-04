
# List of Page Navigation Functions



## page.parents(path)

```space-lua
-- Returns a table with the list of parent pages.
page = page or {}
function page.parents(path)
  local path = path or editor.getCurrentPage()
  local livelli = string.split(path, "/")
  local genitori = {}
  local pathParziale = ""

  for i = 1, #livelli - 1 do
    pathParziale = (i == 1) and livelli[i] or (pathParziale .. "/" .. livelli[i])
    table.insert(genitori, pathParziale)
  end
  return genitori
end
```

## page.sister()

```space-lua
-- Collection of “sister” pages at the same level.
page = page or {}
function page.sister()
  local pa = query[[from index.tag "page"
  where string.startsWith(name, page.up() .. "/") 
  and not string.match(name, page.up() .. "/.+/")
  ]]
  return pa
end
```

## page.prec()

```space-lua
-- Returns the previous page at the same level.  
-- Returns an empty string if no page is found.
page = page or {}
function page.prec()
  local filtro1 = page.up() .. "/"
  local filtro2 = page.up() .. "/.+/"
  local paa = editor.getCurrentPage()
  local pa = query[[from index.tag "page"
              where string.startsWith(name, filtro1) 
              and not string.match(name, filtro2)
              and name < paa
              order by name desc
              limit 1]]
  -- Se pa è nil o vuota, restituisce una stringa vuota
  if not pa or #pa == 0 then
    return ""
  end 

  return pa[1].name
end
```

## page.succ()

```space-lua
-- Returns the next page at the same level.  
-- Returns an empty string if no page is found.
page = page or {}
function page.succ()
  local filtro1 = page.up() .. "/"
  local filtro2 = page.up() .. "/.+/"
  local paa = editor.getCurrentPage()
  local pa = query[[from index.tag "page"
              where string.startsWith(name, filtro1) 
              and not string.match(name, filtro2)
              and name > paa
              order by name 
              limit 1]]
    -- Se pa è nil o vuota, restituisce una stringa vuota
    if not pa or #pa == 0 then
      return ""
    end
    return pa[1].name
end
```

## page.up()

```space-lua
-- Returns the parent page.
page = page or {}
function page.up(path)
  local path = path or editor.getCurrentPage()
  local parts = {}
  
  -- Suddivide il percorso in segmenti
  for part in string.split(path, "/") do
    table.insert(parts, part)
  end
  for i = 1, #parts - 1 do
    if i == 1 then
      currentPath = parts[i]
    else
      currentPath = currentPath .. "/" .. parts[i]
    end
  end
  return currentPath
end
```

## page.child(path)

```space-lua
page = page or {}
function page.child(path)
  local path = path or editor.getCurrentPage()
  local parts = {}
  local pa = query[[from index.tag "page"
    where string.startsWith(name, path .. "/") 
    and not string.match(name, path .. "/.+/")
    ]]
  
  if not pa or #pa == 0 then
    -- "😮 Nessuna pagina."
    -- Returns `nil` if no pages are found. (“😮 No pages.”)
    return nil 
  end 

  return pa
end
```

## page.lev()

```space-lua
-- Calculates the number of levels in the path.
page = page or {}
function page.lev(path)
  local path = path or editor.getCurrentPage()
  return #string.split(path, "/")
end
```

## page.meta(where)

```space-lua
-- Returns metadata of the specified page (or current page if omitted).  
page = page or {}
function page.meta(where)
  local where = where or editor.getCurrentPage()
  local meta = query[[
    from index.tag "page" 
    where name == where
    ]]
  return meta or Null
end
```

## page.nome()

```space-lua
page = page or {}
-- Extracts the final part of the path as the page name.  
-- If the last part contains an ISO date, returns only the date.  

function page.nome(path)
  -- Extracts the last part after the final “/”.    

  local lastPart = path:match(".*/(.*)$") or path
  -- Searches for an ISO-formatted date (YYYY-MM-DD).  

  local dateISO = lastPart:match("(%d%d%d%d%-%d%d%-%d%d)")
  if dateISO then return dateISO end

  local cleaned = lastPart:gsub("_", " ")
  -- Replaces underscores with spaces.  
  -- Decodes URL-encoded characters (e.g. %27 → ').
  cleaned = cleaned:gsub("%%(%x%x)", function(hex)
    return string.char(tonumber(hex, 16))
  end)

  return cleaned
end
```

## page.title(“path”)

```space-lua
-- Returns the first H1 header as the page title; 
-- if none exists, uses `page.nome()`.

page = page or {} -- function page.title(pagina)
function page.title(pagina)
  pagina = pagina or editor.getCurrentPage()
  -- Searches for a level-1 header.
  local titolo = query[[
      from index.tag "header" where
        page == pagina and
        level == 1
        order by pos
        limit 1
    ]]
  if titolo then
    return tostring(titolo[1].name)
  else
    return page.nome(pagina)
  end
end
```



