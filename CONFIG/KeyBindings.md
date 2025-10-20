---
pageDecoration:
    cssClasses:
        - wine-table
---

# Overall

${query[[from index.tag "space-lua" where string.match(_.script, "key = \"([^\n]+)\",") select {ref=_.ref, key=string.match(_.script, "key = \"([^\n]+)\",")}]]}

## In Page

| Target: | Operation | Ctrl | Shift | Alt | letter |
|----------|----------|------|-------|-----|--------|
| Cursor: | Copy Nearest Pattern | | | Alt | c |
| Cursor: | Copy reference | | Shift | Alt | c |
| Outine: | Move Up | | | Alt | ↑ |
| Outine: | Move down | | | Alt | ↓ |
| Outline/Header: | Toggle fold | | Shift | Alt | f |
| Header: | Toggle Level | Ctrl | | | 1 |

## On Page

| Target: | Operation | Ctrl | Shift | Alt | letter |
|----------|----------|------|-------|-----|--------|
| Widget: | Refresh All | | | Alt | q |
| Page: | Add | | Shift | Alt | n |
| Page: | Delete | | Shift | Alt | d |
| Tree View: | Toggle on/off | Ctrl | | Alt | b |

## Across Pages

| Operation: | Target | Ctrl | Shift | Alt | letter |
|----------|----------|------|-------|-----|--------|
| Navigate: | Home | Ctrl | | | h |
| Navigate: | Page Picker | Ctrl | | | l |
| Navigate: | Meta Page Picker | Ctrl | Shift | | l |
| Navigate: | Forward History | | | Alt | → |
| Navigate: | Backward History | | | Alt | ← |
| SilverSearch: | Search | Ctrl | | | s |
| SilverSearch: | Global Search | Ctrl | | Alt | f |
| SilverSearch: | Search Space | Ctrl | Shift | | f |
