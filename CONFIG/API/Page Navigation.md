
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


