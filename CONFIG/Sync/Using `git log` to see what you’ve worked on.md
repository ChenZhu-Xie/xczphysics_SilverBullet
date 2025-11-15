
[[log:recent]]

1. [using git log to see what youve worked on](https://community.silverbullet.md/t/using-git-log-to-see-what-youve-worked-on/3439) #community #silverbullet

```
virtualPage.define {
  pattern = "log:(.+)",
  run = function(afterDate)
    local secondsInAWeek= 7 * 24 * 60 * 60
    local date = string.len(afterDate) == 10 
        and afterDate
        or os.date('%Y-%m-%d', os.time() - secondsInAWeek)

    local args = { 'log', '--name-only', '--after', date }
    local result = shell.run('git', args)
    local result = result .code == 0 and result.stdout or result.stderr

    local outputWithLinks = string.gsub(result, '\n?(.*[.]md)\n', function(path) return '[' .. path .. '](' .. path .. ')\n' end)
    outputWithLinks = string.gsub(outputWithLinks, '\n?(commit.*)\n', function (header)
      return '### ' .. header .. '\n'
    end)

    return outputWithLinks
  end
}
```
