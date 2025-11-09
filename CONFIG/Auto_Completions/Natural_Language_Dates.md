
1. https://community.silverbullet.md/t/natural-language-dates-autocompletion/3341
2. https://github.com/deepkn/silverbullet-nldates

1. Type `!!` followed by a natural language date
2. A completion popup appears with your parsed dates or quick options (today/tomorrow/yesterday)
3. Examples:
  * `!!tomorrow` → Shows tomorrow's date with `[tomorrow]` label
  * `!!next friday 2pm` → Shows next Friday at 2 PM with time
  * `!!next thu` → Parses to next Thursday, then typing `2pm` updates it
  * `!!in 3 weeks` → Shows date 3 weeks from now
  * `!!last monday` → Shows last Monday's date
  * `!!dec 25` → Shows December 25th of current year
  * `!!` (empty) → Shows today/tomorrow/yesterday options
4. Press `Enter` to insert the formatted date
5. Press `Escape` to cancel

* **Configurable Output**: Customize date/time format to your preference using CONFIG

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
