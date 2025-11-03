
# [API/editor](https://silverbullet.md/API/editor)

## editor.showPanel

`editor.showPanel("rhs", 1, "<h1>Hello</h1>")`
`editor.hidePanel("rhs")`

## editor.filterBox

`${editor.filterBox("Select:", {
    { name="Option 1", value="1" },
    { name="Option 2", value="2", description="More details about 2" }
})}`

## editor.setUiOption

`${editor.setUiOption("darkMode", true)}`
`${editor.setUiOption("darkMode", false)}`

`${editor.getUiOption("darkMode")}`
