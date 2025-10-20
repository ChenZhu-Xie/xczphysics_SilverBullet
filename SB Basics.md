---
basic level: "kindergarden"
chain of thoughts:
- fere
- fsdfa -- inject this Front Matter (syntax = Yaml) as a snippet
---

# Quickly Cover the basics of SilverBullet
  - This page focuses on the basic operations in SB
  - ← [this is](https://silverbullet.md/Markdown/Basics) also a [Silver Bullet](https://youtu.be/bb1USz_cEBY?t=285) ;) #outline

# Key Bindings
  - [Search for Command](https://youtu.be/bb1USz_cEBY?t=252) along with its KeyBindings
  - Custum ∪ Core [[CONFIG/KeyBindings]]

# Format Syntax
## Emoji
  - [Generate a emoji](https://youtu.be/bb1USz_cEBY?t=492): `:laugh` 🤣
## Slash Commands
### Task
  * [ ] [Turn a Line into a Task](https://youtu.be/bb1USz_cEBY?t=455): ${Red("/task")}
  * [ ] [SB Feature: linked task](https://youtu.be/7hyLvEfw34w?t=827): Remember to Link [[CONFIG]] & [[STYLE]] to [[SB Basics]]
### Table
  - [Generate a markdown Table](https://youtu.be/bb1USz_cEBY?t=468): ${Red("/table")}
    | Header A | Header B |
|----------|----------|
| Cell A | Cell B |
### Date
  - [Generate a date](https://youtu.be/bb1USz_cEBY?t=573): ${Red("/today")} 2025-10-08
## Embed Objects
  - [Transclusion](https://youtu.be/bZ79-RbyNoU?t=639) of [[SB page]] ~ [[local file.md]] ≈ [[local document.pdf]]
     - Example: `![[SB page path]]`, `![[local file path.png]]`
  - Image: `![image name](url)`
  - test: [Objects that are `/query`ed OR `!\[transcluded\]]`, better not have widgets like `${Red("expression")}` in its name or body, otherwise might break the Table format](https://github.com/silverbulletmd/silverbullet/issues/1638#issuecomment-3416408442):
![[Language/Input Method/QQ 机器人]]

# Orgnizing Workflows

## Dir Tree
### Create Page alongside Current Folder
  1. ${Green("Ctrl + L")} - Navigate: Page Picker
  2. ${Green("Space")} - [Input: Current Folder](https://youtu.be/7hyLvEfw34w?t=172)
  3. Iput: “Page Name”
  4. ${Green("Shift + Enter")} - [Create (aspiring) Page](https://youtu.be/7hyLvEfw34w?t=240)
### Create Page inside Current Folder
#### if this_file.dir_level == top_1
  - follow [[SB Basics#Create Page alongside Current Folder]]
#### else
  1. ${Green("Ctrl + /")} - Navigate: Command Picker
  2. Input: “Page Copy” then ${Green("Enter")}
  3. Input: “/Page Name” then ${Green("Enter")}
  4. ${Green("Ctrl + A")} then ${Green("Backspace")}

## Wiki Web
### Rename a Page with its Backlinks
  1. ${Green("Ctrl + Enter")} or ${Green("Click")} to enter [[the (aspiring) page]]
  2. [Rename its Title](https://youtu.be/7hyLvEfw34w?t=421) will automatically update its backlinks
### Navigate Cursors History
  1. [[Language/Input Method/声笔飞单]] → ${Green("Ctrl + Enter")} → ${Green("Alt + ←")}

## Tags (for aggregating Objs with the same tags)
> - #Tag itself is an Object as the __index.tag__ to be indexed.
  > - its name “__Tag__” looks like a “__Key without Value__”.
> - #Tag defines what the Object, e.g. Page/Line, is (about).
  > - it is one of the Object’s Properties (if obj has many Tags).
>   - Page Object itself implicitly has a #page (i)tag for **indexing**.
> - a #Tag is also a Class with a cluster of Instances = Objects = Rows in Table.
>   - So, Tag = Table
### Aggregation for future
  1. [ ] assign a #todo tag for every todo,
  2. then [Enter this ↑ Page to Filter all Todos](https://youtu.be/bZ79-RbyNoU?t=423)

## IndexDB Query
### Terminology Mapping
- [Database Term of SilverBullet](https://youtu.be/Of7zE0AVApc?t=222)
    | Database Term | SilverBullet |
|----------|----------|
| Table | Tag |
| Row | Object |
| Primary Key | Ref |
### Query with `${.lua}`
- Example: `${.space-lua}` on the ==index== (i.e. in the database)
  1. ${Red("/query")} [returns a table](https://youtu.be/Of7zE0AVApc?t=509)
     ${query[[
      from index.tag "page"
      where name:startsWith("Inbox/")
      order by lastModified desc
      select {ref=ref, lastModified=lastModified}
    ]]}
  2. modified ${Red("/query")} [returns a list](https://youtu.be/Of7zE0AVApc?t=701)
     ${template.each(query[[
      from index.tag "page"
      where name:startsWith("Inbox/")
      order by lastModified desc
    ]], templates.fullPageItem)}

## Fields / Metadata (for differentiating Objs with the same tags)
> - a Page itself is an Object as well, like #tag.
  > - it exists in the Table as Row
> - it too could have some Attributes/Properties,
  > - that is, __key-value pairs__ as __front matter__.
> - add Key:Value pairs for Page Object, on the Page's Front Matter
>   - using another Markup language: Yaml
> - fields are indexed in `${query[[from index.tag "Obj's Tag"]]}` Table
  > - Objs are Rows in the Table
  > - Keys are Columns in the first Row
  >   - are just names (whose types are all implictly "strings"?)
>   - Values are Columns in >= 2nd Rows
  >   - can be numbers, strings, booleans, lists
### [CustomAttribute:1️⃣]
${query[[from index.tag "SB_itself" select {ttest=_.CustomAttribute, name="[[" .. _.name .. "]]", emm="basic level", ref=_.ref, itags=_.itags}]]}
### [CustomAttribute:2️⃣]  [CustomAttribute2:ddd] 
${query[[from index.tag "header" where CustomAttribute]]}
### Query Objects beyond Page & Header: Item & Task
- Hello #like #tana [but:"custom"] [fields:do not belong to tags]
>   the ${Red("/query")} below... better not be in/alongside this item itself...
    ${query[[from index.tag "tana"]]}
* [x] Clean the floors [dueDate: 2025-10-16]
* [ ] Do the dishes [dueDate: 2025-10-18]
>   all ${Red("/queryed")} objs better not have `${Red("expression")}` in its name
    ${query[[from index.tag "task"]]}
#### Task Done State is live updating, but sync editing text is not,
${template.each(query[[from index.tag "task" where not done]], templates.taskItem)}
#### the `![transclusions]` is not “edit one place edit everywhere” as well
- https://youtu.be/cH9cs8fowhY?t=879

# Dive in SilverBullet itself
## a Page **becomes a meta Page**, when
>  - the page is tagged with #meta (either at the top or the bottem)
>  - meta Pages in Library/Std is inside SB, thus **not disk-visible, editable or Page Picker able**. They updates with SB itself.
  - [Logically speaking](https://youtu.be/qkLJ3viVq8I?t=1110), the ([[CONFIG]] + [[STYLE]]) (pages + folders) should be taged with #meta, and put under folder ${Blue("Library/User/")}
>   - rather than taged with #SB_itself, and put under ${Blue("space/")}
### ${Green("Ctrl + /")} and input: ${Red("Navigate: meta( Page) Picker")}

## ${Green("Ctrl + Shift + l")}, and search for
 - _Space Overview_
>   - in which ${Yellow("active space-lua scripts")} are indexed/listed in sequence and [excuted (constantly running) by priority](https://youtu.be/qkLJ3viVq8I?t=1398)
>   - [System Reload](https://youtu.be/qkLJ3viVq8I?t=1378) will ${Blue("ReRun")} all ${Yellow("existing space-lua scripts")}
  >   - See web brouser’s console - F12
>     - Print(“...”) is there
  - _table_
>   - like _table_ Page, turn a Page into a [[SB Basics#Slash Commands|Slash Commands]], by
>   - add a key-value ${Blue("tags: meta/template/slash")} in front matter
  - _Maintenance_
>   - collects all the ${Purple("aspiring pages")} (using ${Red("/query")})
>   - collects all the ${Purple("conflicting copies.md")}
>   - ...
  - Std
>   - collects all the [Page Templates](https://youtu.be/qkLJ3viVq8I?t=1632)
>   - collects all the [[SB Basics#Slash Commands|Slash Commands]]
>   - ...

## Custom Widgets built using space-lua
- ${embed.youtube "https://youtu.be/qkLJ3viVq8I?t=1850"}
  - ${Red("${embed.youtube 'url'}")} 's inplementation can be found in
    - ${Green("Ctrl + Shift + l")} → search for [[Library/Std/Widgets/Embed#Implementation]]
    - Note that it is a non-local **function** which defines this widget
### One usage of non-local function: called by Widgets
- Both ${Yellow("local varName = varValue")} and ${Yellow("local function end")} have their scopes confined to the `space-lua block` in which they are defined.
  - is a good way to ==not pollute== the global namespace too much
- non-local ${Yellow("varName = varValue")} and ${Yellow("function fn() end")} can be acquired
  - by subsequent space-lua code blocks following the executed order?
  - by widgets @ anywhere that call them
### Lua tricks
- https://www.lua.org/manual/5.3/
- table is actually the only data structure in Lua?
  - if a function takes ${Yellow("a table")} or ${Yellow("a string")} as its ${Yellow("single arg")},
    - then you can [omit ()](https://youtu.be/qkLJ3viVq8I?t=2420)
  - We have actually encountered this situation: [[CONFIG]] or https://silverbullet.md/API/config
* ${Yellow("local ok, message = pcall(function() ... end)")} is a Lua way of ${Yellow("try: catch/except")}
### Slash command list behave differently inside a code block
- generally, it [generate some ${Yellow("command.define")} templates](https://youtu.be/qkLJ3viVq8I?t=2539), e.g.:
```space-lua
slashCommand.define {
  name = "",
  run = function()
    editor.insertAtCursor("Hello |^| world!", false, true)
  end
}
```
  - similiar to “Quicker Movements Page switch between Apps”
### Some documents are @ https://silverbullet.md/API rather than @ Librabry/Std
- It seems that all those Apis which can be borrowed to use inside `space-lua blocks`, can also be directly called inside ${Red("${...}")}, which is to say: all widgets are global space-lua functions that are called
  - ${shell.run("ls", {"-l"})}
* ${Green("Win/CMD + click")} the called function will jump on its definition (across pages)
  * if the corresponding particular API is globally accessible and that this has been implemented in space Lua
    1. ${Yellow("toggleReadOnlyMode()")} inside [[CONFIG/Edit/ReadOnly]]
    2. ${Yellow("slashCommand.define")} in [[SB Basics#Slash command list behave differently inside a code block]]
      - ${Green("Win/CMD + click")} inside ${Yellow("d|e|f|i|n|e|")} is effective
      - but it is of no use to ${Green("Win/CMD + click")} the ${Yellow("slashCommand.")}
  - ${Green("Win/CMD + click")} called local functions seems not working

# Configuration SilverBullet

https://silverbullet.md/Space%20Lua/Lua%20Integrated%20Query

${query[[from index.tag "space-lua" select {ref=_.ref, key=string.match(_.script, "key = ([^\n]+)")}]]}

[[CONFIG]]
[[STYLE]]

#SB_itself
