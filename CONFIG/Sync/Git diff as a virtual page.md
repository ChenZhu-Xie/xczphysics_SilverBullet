
1. [git diff as a virtual page](https://community.silverbullet.md/t/git-diff-as-a-virtual-page/3522?u=chenzhu-xie) #community #silverbullet

```space-lua
virtualPage.define {
  pattern = "gitdiff:(.+)",
  run = function(filename)
    local filepath
    if filename == "." then
      filepath = filename
    else
      filepath = filename .. ".md"
    end
    
    local result = {}
    table.insert(result, "````diff")
    table.insert(
      result,
      shell.run(
        "git",
        {"--no-pager", "diff", filepath}
      ).stdout
    )
    table.insert(result, "````")
    return table.concat(result, "\n")
  end
}

command.define {
  name = 'Git: Diff (this file)',
  run = function()
    editor.navigate("gitdiff:" .. editor.getCurrentPath())
  end
}

command.define {
  name = 'Git: Diff (entire space)',
  run = function()
    editor.navigate("gitdiff:.")
  end
}
```
