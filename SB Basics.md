
# This ‘Website’: SilverBullet README
  - This page focuses on the basic operations in SB
  - ← this is also a [Silver Bullet](https://youtu.be/bb1USz_cEBY?t=285) ;) #outline

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
  2. [Rename its Title](https://youtu.be/7hyLvEfw34w?t=421)

## Tag Attribute
### Aggregation for future
  1. [ ] assign a #todo tag for every todo,
  2. then [Enter this ↑ Page to Filter all Todos](https://youtu.be/bZ79-RbyNoU?t=423)

## IndexDB Query
### Terminology Mapping
- [Database Term of SilverBullet](https://youtu.be/Of7zE0AVApc?t=222)
    | Database Term | SilverBullet |
|----------|----------|
| table | tag |
| row | object |
| primary key | ref |
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

## Tag Alternative: Fields/Metadata


# Configuration
[[CONFIG]]
[[STYLE]]


#SB_itself
