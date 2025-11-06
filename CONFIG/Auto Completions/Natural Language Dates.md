
1. https://community.silverbullet.md/t/natural-language-dates-autocompletion/3341
2. https://github.com/deepkn/silverbullet-nldates

```space-lua
config.set (
  "nldates", {
    -- Output format for dates (using Unicode date format patterns)
    -- Default: "yyyy-MM-dd"
    dateFormat = "yyyy-MM-dd",
    -- Include time in output if parsed (default: true)
    includeTime = false,
    -- Timezone (default: system timezone)
    timezone = "Chinese/Nan_Chang",
  }
)
```
