---
name: Library/Hyph/Zotero Annotations and Metadata Importer
tags: meta/library
share.uri: "https://github.com/hihyph/SilverBullet---Zotero-Annotations-and-Metadata-Importer/blob/main/Library.md"
share.hash: 6e883cfb
share.mode: pull
---

# Zotero Annotations and Metadata Importer

Creates a command to import metadata and annotations from a Zotero item to a new page. 

> **note** Note
> Only annotations made using the Zotero built in pdf reader will be imported 

## Use

Once set up, run Zotero: Import Item, a window will pop up. 

Enter part or all of any title in your Zotero library

All matching items will show in list, choose item you want, and page will be created. You will be taken to the page automatically.

## Setup
To use, make sure you go to all of the ‘Edit this’ blocks and follow the instructions when setting up. make sure to also do a system reload at the end.

### Edit this: 

First put your Zotero User ID, API Key, and your preferred file path in the fields below and paste this as a **space-lua** block on your config page (or elsewhere in your space)

```lua
config.set("zoteroManager", {
  user_id = "123456",
  api_key = "123abc",
  file_path = "example/file/path"
})
```

Next, this is the utility code block that can just stay the same, but you’ll see it has **A Lot** of labels, this is because I’m very new to this type of thing so the labels are for my own sanity, but I kept them in for ease of making changes if you want to.

This block can stay here, no need to move it.

```space-lua

 --importing config set (from above) and making the command
command.define {
  name = "Zotero: Import Item",
  run = function()
    local cfg = config.get("zoteroManager") or {}
    local user_id = cfg.user_id or ""
    local api_key = cfg.api_key or ""
    local file_path = cfg.file_path or ""
 -- search prompt
    local search_term = editor.prompt("Search Zotero:")
    if not search_term then return end
 --putting together url, making request to zotero
    local search_url = "https://api.zotero.org/users/" .. user_id .. "/items?q=" .. string.gsub(search_term, " ", "+") .. "&itemType=-attachment"
    local search_response = net.proxyFetch(search_url, {
      method = "GET",
      headers = { ["Zotero-API-Key"] = api_key }
    })
    if not search_response.ok then
      editor.flashNotification("Zotero search failed: " .. tostring(search_response.status))
      return
    end
    local results = search_response.body
 --if no results, flash notification
    if #results == 0 then
      editor.flashNotification("No results found")
      return
    end
 --if results, put together list
    local options = {}
    for i, result in ipairs(results) do
      table.insert(options, {
        name = (result.data.title or "Untitled"),
        value = i,
        description = (result.meta.creatorSummary or "") .. " " .. (result.meta.parsedDate or "")
      })
    end
 -- select item from list, put together url for that item
    local selection = editor.filterBox("Select item:", options)
    if not selection then return end
 
    local item_key = results[selection.value].data.key
 
    local response = net.proxyFetch("https://api.zotero.org/users/" .. user_id .. "/items/" .. item_key, {
      method = "GET",
      headers = { ["Zotero-API-Key"] = api_key }
    })
    if not response.ok then
      editor.flashNotification("Failed to fetch item: " .. tostring(response.status))
      return
    end
    local item = response.body
    local data = item.data
 
    -- Extract all available fields
    local f_key = data.key or ""
    local f_title = data.title or "Untitled"
    local f_item_type = data.itemType or ""
    local f_abstract = data.abstractNote or ""
    local f_book_title = data.bookTitle or ""
    local f_series = data.series or ""
    local f_volume = data.volume or ""
    local f_edition = data.edition or ""
    local f_date = data.date or ""
    local f_year = (item.meta and item.meta.parsedDate and item.meta.parsedDate:sub(1,4)) or ""
    local f_publisher = data.publisher or ""
    local f_place = data.place or ""
    local f_pages = data.pages or ""
    local f_isbn = data.ISBN or ""
    local f_doi = data.DOI or ""
    local f_url = data.url or ""
    local f_short_title = data.shortTitle or ""
    local f_language = data.language or ""
    local f_creators = data.creators or {}
    local f_tags = data.tags or {}
 
    -- remove duplicate authors (sometimes authors listed as both author and editor, etc)
    local seen = {}
    local authors = {}
    for _, creator in ipairs(f_creators) do
      local name = (creator.firstName or "") .. " " .. (creator.lastName or "")
      if not seen[name] then
        seen[name] = true
        table.insert(authors, '  - "' .. name .. '"')
      end
    end
    local authors_yaml = table.concat(authors, "\n")
 
    -- Build tags
    local tags = {}
    for _, tag in ipairs(f_tags) do
      table.insert(tags, '  - "' .. tag.tag .. '"')
    end
    local tags_yaml = #tags > 0 and "\n" .. table.concat(tags, "\n") or " []"
 
    -- Fetch citation and strip HTML, this is in chicago rn because thats what i use but change it by changing where it says "chicago-fullnote-bibliography" to whatever you need (leave blank if fails)
    local citation = ""
    local cite_response = net.proxyFetch("https://api.zotero.org/users/" .. user_id .. "/items/" .. item_key .. "?format=bib&style=chicago-fullnote-bibliography", {
      method = "GET",
      headers = { ["Zotero-API-Key"] = api_key }
    })
    if cite_response.ok then
      local raw_citation = tostring(cite_response.body)
      citation = raw_citation:gsub("<[^>]+>", "")
      citation = citation:gsub("&#xF8;", "ø")
      citation = citation:gsub("&#x201C;", "\u{201C}")
      citation = citation:gsub("&#x201D;", "\u{201D}")
      citation = citation:gsub("&#x2013;", "–")
      citation = citation:gsub('"', "'")
      citation = citation:gsub("^%s*(.-)%s*$", "%1")
    end
 
    -- Fetch children to find PDF attachment (leave blank if fails)
    local attachment_key = nil
    local children_response = net.proxyFetch("https://api.zotero.org/users/" .. user_id .. "/items/" .. item_key .. "/children", {
      method = "GET",
      headers = { ["Zotero-API-Key"] = api_key }
    })
    if children_response.ok then
      local children = children_response.body
      for _, child in ipairs(children) do
        if child.data.itemType == "attachment" then
          attachment_key = child.data.key
          break
        end
      end
    end
 
    -- Fetch raw annotations (leave blank if fails)
    local annotations = {}
    if attachment_key then
      local ann_response = net.proxyFetch("https://api.zotero.org/users/" .. user_id .. "/items/" .. attachment_key .. "/children", {
        method = "GET",
        headers = { ["Zotero-API-Key"] = api_key }
      })
      if ann_response.ok then
        annotations = ann_response.body
      end
    end
   --pass data to page creator
    zotero_create_page(
      file_path,
      f_key, f_title, f_item_type, f_abstract, f_book_title,
      f_series, f_volume, f_edition, f_date, f_year,
      f_publisher, f_place, f_pages, f_isbn, f_doi,
      f_url, f_short_title, f_language,
      authors_yaml, tags_yaml, citation, annotations
    )
  end
}
```


### Edit this:
The page creator block below has all the bits that are fun to personalise, if you want to leave it as is that's fine, or, follow the instructions to make it your own and then past the full block into your config page. 

Either way, paste it as a **space-lua** block in your config page

```lua

 --expose data from zotero:import item
function zotero_create_page(
      file_path,
      f_key, f_title, f_item_type, f_abstract, f_book_title,
      f_series, f_volume, f_edition, f_date, f_year,
      f_publisher, f_place, f_pages, f_isbn, f_doi,
      f_url, f_short_title, f_language,
      authors_yaml, tags_yaml, citation, annotations
    )
 
  -- Sort and format annotations by highlight colour. I've created some template blocks for the types of info i use, feel free to use mine or make your own, then assign them colours 
  -- Available colours: #5fb236 (green), #2ea8e5 (blue), #a28ae5 (purple), #ffd400 (yellow), #ff6666 (red), #e56eee (magenta), #f19837 (orange), #aaaaaa (gray)

  --define any new template blocks here
  local people = {}
  local key_terms = {}
  local quotes = {}
  local follow_up = {}
 
  for _, ann in ipairs(annotations) do
    local d = ann.data
    local text = d.annotationText or ""
    local note = d.annotationComment or ""
    local page_num = d.annotationPageLabel or ""
    local color = d.annotationColor or ""
 
  --Person (example uses green)
    if color == "#5fb236" then
      local entry = "* " .. text
      if note ~= "" then entry = entry .. " — " .. note end
      entry = entry .. " (p. " .. page_num .. ")"
      table.insert(people, entry)
 --Key terms (blue)
    elseif color == "#2ea8e5" then
      local entry = "* **" .. text .. ":**"
      if note ~= "" then entry = entry .. " " .. note end
      entry = entry .. " (p. " .. page_num .. ")"
      table.insert(key_terms, entry)
 --quote (purple)
    elseif color == "#a28ae5" then
      local entry = '> "' .. text .. '" (p. ' .. page_num .. ")\n - *" .. note .. "*"
      table.insert(quotes, entry)
 --something you want to follow up (yellow)
    elseif color == "#ffd400" then
      local entry = "* [ ] " .. text
      if note ~= "" then entry = entry .. " - *" .. note .. "*" end
      entry = entry .. " (p. " .. page_num .. ")"
      table.insert(follow_up, entry)
    end
  end
 --I've shown examples of how these will print towards the end of this library
  
  local function section(items)
    return #items > 0 and "\n" .. table.concat(items, "\n") or ""
  end

  --this is your page title
  local page_name = file_path .. "/" .. f_title
 --and finally, the actual template for your page! this is mine, change it up however you like, a full table of possible fields at the bottom 
  local content = "---\n"
    .. 'title: "' .. f_title .. '"\n'
    .. "zotero-key: " .. f_key .. "\n"
    .. 'citation: "' .. citation .. '"\n'
    .. "tags:" .. tags_yaml .. "\n"
    .. "authors:\n" .. authors_yaml .. "\n"
    .. "url: " .. f_url .. "\n"
    .. "---\n\n"
    .. "## Understanding prior to reading\n\n"
    .. "## Core argument\n"
    .. "*In one or two sentences, what is the author actually claiming? Write this in your own words.*\n\n"
    .. "## Structure / content map\n"
    .. "*Brief outline of what the piece covers.*\n\n"
    .. "## How they get there\n"
    .. "*Key moves in the argument: evidence used, case studies, theoretical framework, methodology.*\n\n"
    .. "## Key terms and definitions\n"
    .. section(key_terms) .. "\n\n"
    .. "## Where I disagree / questions raised\n\n"
    .. "## Connections\n\n"
    .. "## People\n"
    .. section(people) .. "\n\n"
    .. "## Mentioned Texts\n\n"
    .. "## Quotes worth keeping\n"
    .. section(quotes) .. "\n\n"
    .. "## Things to come back to\n"
    .. section(follow_up) .. "\n"
 --and then this last bit is just sending you to the page, or a notification that it didnt work
  if not space.pageExists(page_name) then
    space.writePage(page_name, content)
    editor.flashNotification("Page created: " .. f_title)
  else
    editor.flashNotification("Page already exists: " .. f_title)
  end
 
  editor.navigate(page_name)
end
```

## Useful Stuff 

#### Template block Examples

```lua
--Person (example uses green)
    if color == "#5fb236" then
      local entry = "* " .. text
      if note ~= "" then entry = entry .. " — " .. note end
      entry = entry .. " (p. " .. page_num .. ")"
      table.insert(people, entry)
```
* Highlighted text - note (p. 00)

So, for example, 

* Zef Hemel - saved us all by making silverbullet, the key to my productivity and waster of all my time (p. 00)

```lua
 --Key terms (blue)
    elseif color == "#2ea8e5" then
      local entry = "* **" .. text .. ":**"
      if note ~= "" then entry = entry .. " " .. note end
      entry = entry .. " (p. " .. page_num .. ")"
      table.insert(key_terms, entry)
```
* **Highlighted text** - note (p. 00)

Example:

* **Silverbullet** - a note-taking application optimized for people with a [hacker mindset](https://en.wikipedia.org/wiki/Hacker).  (p. 00)

```lua
 --quote (purple)
    elseif color == "#a28ae5" then
      local entry = '> "' .. text .. '" (p. ' .. page_num .. ")\n - *" .. note .. "*"
      table.insert(quotes, entry)
```

> “Highlighted text” (p. 00)
 - *note* 

> “Welcome to the wonderful world of SilverBullet. The goal of this manual is to give you a broad sense of how to use this tool and what it’s capable of. However, its full capabilities are yet to be discovered.” (p. 00)
- *An omen, am I going to get sucked into playing around and not actually do my reading? You are a humanities student you do not need to know how to code!!*

```lua
 --something you want to follow up (yellow)
    elseif color == "#ffd400" then
      local entry = "* [ ] " .. text
      if note ~= "" then entry = entry .. " - *" .. note .. "*" end
      entry = entry .. " (p. " .. page_num .. ")"
      table.insert(follow_up, entry)
``` 
* [ ] Highlighted text - *note* (p. 00)

example

* [ ] However, its full capabilities are yet to be discovered - *blow off everything and create the perfect silverbullet system* (p. 00)

#### Possible data types: 

| Variable | Description |
|---|---|
| `f_key` | Zotero's unique identifier for the item (e.g. M72KNRVJ) |
| `f_title` | Full title of the work |
| `f_item_type` | Type of item (e.g. journalArticle, bookSection, book) |
| `f_abstract` | Abstract or summary |
| `f_book_title` | Title of the book the item appears in (for book sections and chapters) |
| `f_series` | Series name |
| `f_volume` | Volume number |
| `f_edition` | Edition number |
| `f_date` | Full date string as stored in Zotero (may be freeform, e.g. "2018-09-24") |
| `f_year` | Year only, extracted from Zotero's parsed date |
| `f_publisher` | Publisher name |
| `f_place` | Place of publication |
| `f_pages` | Page range (e.g. 1-18) |
| `f_isbn` | ISBN |
| `f_doi` | DOI |
| `f_url` | URL |
| `f_short_title` | Short or abbreviated title |
| `f_language` | Language code (e.g. en) |
| `authors_yaml` | All authors/editors formatted as a YAML list, ready to paste into front matter |
| `tags_yaml` | All Zotero tags formatted as a YAML list, ready to paste into front matter |
| `citation` | Formatted Chicago citation string |
| `annotations` | Raw array of all annotations — processed in block 2 into colour-coded sections |