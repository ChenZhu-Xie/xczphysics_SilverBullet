---
githubUrl: "https://github.com/Mr-xRed/silverbullet-libraries/blob/main/Custom_Width_and_Color_Tables.md"
---

1. based oSTYLE/Color/Table/Colorful with Tag Tag]] STYLE/Color/Table/Colorful on PagePage]]

# Custom Width & Colored Tables

## Usage:
* drop the tag with the theme-color or percentage tag anywhere in the table:

Color theme tags
#silver #sea #mint #hazel #maroon #burgundy #wine #grape 

Table percentage tags
#t30p #t40p #t50p #t60p #t70p #t80p #t90p 

Use it Like this:

\| Header    | Header   #mint #t30p|
\|-----------|---------------------|
\|   Cell    |        Cell         |
\|   Cell    |        Cell         |


## Color Themes:

### Standard (no tag)
| Header A | Header B |
|----------|----------|
| Cell A | Cell B |
| Cell X | Cell Y |
| Cell I | Cell II |

### Silver
| ID #silver #t30p | Name        | Status     |
|----|--------------|------------|
| 1  | Alice Smith  | Active     |
| 2  | Bob Johnson  | Inactive   |
| 3  | Carol Davis  | Pending    |

### Sea
| Product #sea #t40p| Category   | Price | In Stock |
|----------|-------------|-------|-----------|
| Widget A | Tools       | $12.99 | Yes       |
| Widget B | Hardware    | $8.50  | No        |
| Widget C | Accessories | $5.75  | Yes       |

### Mint
| ID #mint #t50p| First Name | Last Name | Department | Role          |
|----|-------------|------------|-------------|----------------|
| 101 | John       | Miller     | Sales       | Manager        |
| 102 | Sarah      | Brown      | IT          | Developer      |
| 103 | Luke       | Green      | HR          | Recruiter      |

### Hazel
| Order ID #hazel #t60p| Date       | Customer    | Product     | Quantity | Total   |
|-----------|-------------|-------------|--------------|-----------|----------|
| 001       | 2025-10-15  | Alice Smith | Widget A     | 3         | $38.97   |
| 002       | 2025-10-16  | Bob Johnson | Widget B     | 1         | $8.50    |
| 003       | 2025-10-17  | Carol Davis | Widget C     | 5         | $28.75   |

### Maroon
| ID #maroon #t70p| Name | Email | Department | Role | Start Date | Status |
|----|------|--------|-------------|-------|-------------|----------|
| 1  | Alice Smith | alice@example.com | Sales | Manager | 2023-04-12 | Active |
| 2  | Bob Johnson | bob@example.com | IT | Developer | 2022-11-05 | Inactive |
| 3  | Carol Davis | carol@example.com | HR | Recruiter | 2024-02-19 | Pending |

### Burgundy
| ID #burgundy #t80p| Name | Email | Phone | Country | Department | Role | Status |
|----|------|--------|--------|----------|-------------|--------|---------|
| 1  | Alice | alice@example.com | +1-555-1234 | USA | Sales | Manager | Active |
| 2  | Bob   | bob@example.com   | +44-555-5678 | UK  | IT    | Engineer | Inactive |
| 3  | Carol | carol@example.com | +49-555-9012 | DE  | HR    | Analyst  | Pending  |

### Wine
| ID #wine #t90p| First Name | Last Name | Email | Phone | Department | Role | Country | Status |
|----|-------------|------------|--------|--------|-------------|--------|----------|----------|
| 1  | Alice | Smith | alice@example.com | +1-555-1000 | Sales | Manager | USA | Active |
| 2  | Bob | Johnson | bob@example.com | +44-555-2000 | IT | Developer | UK | Inactive |
| 3  | Carol | Davis | carol@example.com | +49-555-3000 | HR | Analyst | Germany | Pending |

### Grape
| ID #grape| Name | Email | Phone | Country | City | Department | Role | Hire Date | Status |
|----|------|--------|--------|----------|--------|-------------|--------|-------------|----------|
| 1  | Alice Smith | alice@example.com | +1-555-1234 | USA | New York | Sales | Manager | 2023-04-12 | Active |
| 2  | Bob Johnson | bob@example.com | +44-555-5678 | UK | London | IT | Developer | 2022-11-05 | Inactive |
| 3  | Carol Davis | [carol@example.com](carol@example.com) | +49-555-9012 | Germany | Berlin | HR | Recruiter | 2024-02-19 | Pending |

## Implementation

### Color Themes
```space-style
/*   Adds a rounded corner to the tables   */
/* table { border-radius: 15px; overflow: hidden;} */

/* Hide specific colour tags inside tables */
table .sb-hashtag[data-tag-name="wine"],
table .sb-hashtag[data-tag-name="sea"],
table .sb-hashtag[data-tag-name="silver"],
table .sb-hashtag[data-tag-name="mint"],
table .sb-hashtag[data-tag-name="burgundy"],
table .sb-hashtag[data-tag-name="grape"],
table .sb-hashtag[data-tag-name="hazel"],
table .sb-hashtag[data-tag-name="maroon"] {
  display: none !important;
}

/* Universal table row hover effect - 提高优先级 */
table tbody tr:hover,
table thead tr:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transition: background-color 0.2s ease !important;
  position: relative !important;
  z-index: 1 !important;
}

html[data-theme="light"] table tbody tr:hover,
html[data-theme="light"] table thead tr:hover {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

html[data-theme="dark"]{
/* ---------- wine (粉红酒红色 - 偏粉) ---------- */
table:has(.sb-hashtag[data-tag-name="wine"]) {
  thead { background-color: #4a2c3a !important; color: #e8d4db !important;}
  tbody tr:nth-child(even) { background-color: #352029 !important; color: #dcc7d1 !important;}
  tbody tr:nth-child(odd) { background-color: #3e2430 !important; color: #e0ccd6 !important;}
  border: 1px solid #5a3848 !important;
  --editor-wiki-link-page-color: #ff6b9d !important;
}

/* Wine hover effects - 确保覆盖默认颜色 */
table:has(.sb-hashtag[data-tag-name="wine"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="wine"]) thead tr:hover {
  background-color: rgba(255, 107, 157, 0.2) !important;
}

/* ---------- burgundy (深酒红色 - 偏紫) ---------- */
table:has(.sb-hashtag[data-tag-name="burgundy"]) {
  thead { background-color: #3d1a2e !important; color: #e6d0db !important;}
  tbody tr:nth-child(even) { background-color: #2e1424 !important; color: #d9c2ce !important;}
  tbody tr:nth-child(odd) { background-color: #351829 !important; color: #ddc7d3 !important;}
  border: 1px solid #4d2538 !important;
  --editor-wiki-link-page-color: #c44569 !important;
}

table:has(.sb-hashtag[data-tag-name="burgundy"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="burgundy"]) thead tr:hover {
  background-color: rgba(196, 69, 105, 0.2) !important;
}

/* --------- maroon (栗色 - 偏棕橙) ---------- */
table:has(.sb-hashtag[data-tag-name="maroon"]) {
  thead { background-color: #4a2618 !important; color: #e8d6cc !important;}
  tbody tr:nth-child(even) { background-color: #351c12 !important; color: #dcc9be !important;}
  tbody tr:nth-child(odd) { background-color: #3e2015 !important; color: #e0cdbd !important;}
  border: 1px solid #5a3020 !important;
  --editor-wiki-link-page-color: #ff8a50 !important;
}

table:has(.sb-hashtag[data-tag-name="maroon"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="maroon"]) thead tr:hover {
  background-color: rgba(255, 138, 80, 0.2) !important;
}

/* ---------- sea ---------- */
table:has(.sb-hashtag[data-tag-name="sea"]) {
  thead { background-color: #1e3a5f !important; color: #d1e0f0 !important;}
  tbody tr:nth-child(even) { background-color: #182d47 !important; color: #c7d8ea !important;}
  tbody tr:nth-child(odd) { background-color: #1b3152 !important; color: #cbdced !important;}
  border: 1px solid #2a4870 !important;
  --editor-wiki-link-page-color: #4fc3f7 !important;
}

table:has(.sb-hashtag[data-tag-name="sea"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="sea"]) thead tr:hover {
  background-color: rgba(79, 195, 247, 0.2) !important;
}

/* ---------- silver ---------- */
table:has(.sb-hashtag[data-tag-name="silver"]) {
  thead { background-color: #3a3f47 !important; color: #e2e6ea !important;}
  tbody tr:nth-child(even) { background-color: #30353c !important; color: #d8dde2 !important;}
  tbody tr:nth-child(odd) { background-color: #353a41 !important; color: #dde2e7 !important;}
  border: 1px solid #4a5058 !important;
  --editor-wiki-link-page-color: #b0bec5 !important;
}

table:has(.sb-hashtag[data-tag-name="silver"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="silver"]) thead tr:hover {
  background-color: rgba(176, 190, 197, 0.2) !important;
}

/* ---------- mint ---------- */
table:has(.sb-hashtag[data-tag-name="mint"]) {
  thead { background-color: #1e4a3a !important; color: #d0e8df !important;}
  tbody tr:nth-child(even) { background-color: #183829 !important; color: #c6e0d4 !important;}
  tbody tr:nth-child(odd) { background-color: #1b3f31 !important; color: #cae4d9 !important;}
  border: 1px solid #2a5a48 !important;
  --editor-wiki-link-page-color: #66bb6a !important;
}

table:has(.sb-hashtag[data-tag-name="mint"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="mint"]) thead tr:hover {
  background-color: rgba(102, 187, 106, 0.2) !important;
}

/* ---------- grape ---------- */
table:has(.sb-hashtag[data-tag-name="grape"]) {
  thead { background-color: #2d1b4e !important; color: #e0d4f0 !important;}
  tbody tr:nth-child(even) { background-color: #241539 !important; color: #d6c7e8 !important;}
  tbody tr:nth-child(odd) { background-color: #291941 !important; color: #dacbec !important;}
  border: 1px solid #3d2b5e !important;
  --editor-wiki-link-page-color: #ab47bc !important;
}

table:has(.sb-hashtag[data-tag-name="grape"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="grape"]) thead tr:hover {
  background-color: rgba(171, 71, 188, 0.2) !important;
}

/* ---------- hazel ---------- */
table:has(.sb-hashtag[data-tag-name="hazel"]) {
  thead{ background-color: #4a3d1e !important; color: #e8e0d1 !important;}
  tbody tr:nth-child(even) { background-color: #352e18 !important; color: #ddd6c7 !important;}
  tbody tr:nth-child(odd) { background-color: #3e351b !important; color: #e1dacb !important;}
  border: 1px solid #5a4d2a !important;
  --editor-wiki-link-page-color: #ffca28 !important;
}

table:has(.sb-hashtag[data-tag-name="hazel"]) tbody tr:hover,
table:has(.sb-hashtag[data-tag-name="hazel"]) thead tr:hover {
  background-color: rgba(255, 202, 40, 0.2) !important;
}
}

html[data-theme="light"] {
  /* ---------- wine (粉红酒红色 - 偏粉) ---------- */
  table:has(.sb-hashtag[data-tag-name="wine"]) {
    --editor-wiki-link-page-color: #e91e63 !important;
    thead { background-color: #f8e1eb !important; color: #6a1b3a !important;}
    tbody tr:nth-child(even) { background-color: #fdf4f7 !important; color: #7d1f42 !important;}
    tbody tr:nth-child(odd) { background-color: #fbedf2 !important; color: #8e2449 !important;}
    border: 1px solid #f48fb1 !important;
  }

  table:has(.sb-hashtag[data-tag-name="wine"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="wine"]) thead tr:hover {
    background-color: rgba(233, 30, 99, 0.15) !important;
  }

  /* ---------- burgundy (深酒红色 - 偏紫) ---------- */
  table:has(.sb-hashtag[data-tag-name="burgundy"]) {
    --editor-wiki-link-page-color: #8e24aa !important;
    thead { background-color: #f3e5f5 !important; color: #4a148c !important;}
    tbody tr:nth-child(even) { background-color: #faf4fc !important; color: #6a1b9a !important;}
    tbody tr:nth-child(odd) { background-color: #f6e9f8 !important; color: #7b1fa2 !important;}
    border: 1px solid #ce93d8 !important;
  }

  table:has(.sb-hashtag[data-tag-name="burgundy"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="burgundy"]) thead tr:hover {
    background-color: rgba(142, 36, 170, 0.15) !important;
  }

  /* ---------- maroon (栗色 - 偏棕橙) ---------- */
  table:has(.sb-hashtag[data-tag-name="maroon"]) {
    --editor-wiki-link-page-color: #ff5722 !important;
    thead { background-color: #fff3e0 !important; color: #bf360c !important;}
    tbody tr:nth-child(even) { background-color: #fffaf7 !important; color: #d84315 !important;}
    tbody tr:nth-child(odd) { background-color: #fff6f0 !important; color: #e64a19 !important;}
    border: 1px solid #ffab91 !important;
  }

  table:has(.sb-hashtag[data-tag-name="maroon"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="maroon"]) thead tr:hover {
    background-color: rgba(255, 87, 34, 0.15) !important;
  }

  /* ---------- sea ---------- */
  table:has(.sb-hashtag[data-tag-name="sea"]) {
    --editor-wiki-link-page-color: #1976d2 !important;
    thead { background-color: #e1f5fe !important; color: #01579b !important;}
    tbody tr:nth-child(even) { background-color: #f0fcff !important; color: #0277bd !important;}
    tbody tr:nth-child(odd) { background-color: #e8f8ff !important; color: #0288d1 !important;}
    border: 1px solid #81d4fa !important;
  }

  table:has(.sb-hashtag[data-tag-name="sea"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="sea"]) thead tr:hover {
    background-color: rgba(25, 118, 210, 0.15) !important;
  }

  /* ---------- silver ---------- */
  table:has(.sb-hashtag[data-tag-name="silver"]) {
    --editor-wiki-link-page-color: #616161 !important;
    thead { background-color: #f5f5f5 !important; color: #212121 !important;}
    tbody tr:nth-child(even) { background-color: #fdfdfb !important; color: #424242 !important;}
    tbody tr:nth-child(odd) { background-color: #f8f8f8 !important; color: #616161 !important;}
    border: 1px solid #e0e0e0 !important;
  }

  table:has(.sb-hashtag[data-tag-name="silver"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="silver"]) thead tr:hover {
    background-color: rgba(97, 97, 97, 0.15) !important;
  }

  /* ---------- mint ---------- */
  table:has(.sb-hashtag[data-tag-name="mint"]) {
    --editor-wiki-link-page-color: #388e3c !important;
    thead { background-color: #e8f5e8 !important; color: #1b5e20 !important;}
    tbody tr:nth-child(even) { background-color: #f1faf1 !important; color: #2e7d32 !important;}
    tbody tr:nth-child(odd) { background-color: #edf7ed !important; color: #388e3c !important;}
    border: 1px solid #a5d6a7 !important;
  }

  table:has(.sb-hashtag[data-tag-name="mint"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="mint"]) thead tr:hover {
    background-color: rgba(56, 142, 60, 0.15) !important;
  }

  /* ---------- grape ---------- */
  table:has(.sb-hashtag[data-tag-name="grape"]) {
    --editor-wiki-link-page-color: #7b1fa2 !important;
    thead { background-color: #f3e5f5 !important; color: #4a148c !important;}
    tbody tr:nth-child(even) { background-color: #faf4fc !important; color: #6a1b9a !important;}
    tbody tr:nth-child(odd) { background-color: #f6e9f8 !important; color: #7b1fa2 !important;}
    border: 1px solid #ce93d8 !important;
  }

  table:has(.sb-hashtag[data-tag-name="grape"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="grape"]) thead tr:hover {
    background-color: rgba(123, 31, 162, 0.15) !important;
  }

  /* ---------- hazel ---------- */
  table:has(.sb-hashtag[data-tag-name="hazel"]) {
    --editor-wiki-link-page-color: #f57c00 !important;
    thead { background-color: #fff8e1 !important; color: #e65100 !important;}
    tbody tr:nth-child(even) { background-color: #fffcf5 !important; color: #ef6c00 !important;}
    tbody tr:nth-child(odd) { background-color: #fffaeb !important; color: #f57c00 !important;}
    border: 1px solid #ffcc02 !important;
  }

  table:has(.sb-hashtag[data-tag-name="hazel"]) tbody tr:hover,
  table:has(.sb-hashtag[data-tag-name="hazel"]) thead tr:hover {
    background-color: rgba(245, 124, 0, 0.15) !important;
  }
}
```

### Table Width with Tag
```space-style
table .sb-hashtag[data-tag-name="t30p"],
table .sb-hashtag[data-tag-name="t40p"],
table .sb-hashtag[data-tag-name="t50p"],
table .sb-hashtag[data-tag-name="t60p"],
table .sb-hashtag[data-tag-name="t70p"],
table .sb-hashtag[data-tag-name="t80p"], 
table .sb-hashtag[data-tag-name="t90p"]{
  display: none !important;
}
table:has(.sb-hashtag[data-tag-name="t30p"]) {width:30% !important;}
table:has(.sb-hashtag[data-tag-name="t40p"]) {width:40% !important;}
table:has(.sb-hashtag[data-tag-name="t50p"]) {width:50% !important;}
table:has(.sb-hashtag[data-tag-name="t60p"]) {width:60% !important;}
table:has(.sb-hashtag[data-tag-name="t70p"]) {width:70% !important;}
table:has(.sb-hashtag[data-tag-name="t80p"]) {width:80% !important;}
table:has(.sb-hashtag[data-tag-name="t90p"]) {width:90% !important;}
```


### Optional only  (adds color to the matching tags)

```
html[data-theme="dark"]{
  .sb-hashtag {
      background: #1c2430 !important;
      color: #d8e1ef !important;
      border: 1px solid #2a3648 !important; /* 同色系略亮边框 */
      border-radius: 6px;
      padding: 0 4px;
  }
}

html[data-theme="light"] {
.sb-hashtag {
    background: #e8edf5 !important;
    color: #1a1a1a !important;
    border: 1px solid #d4dce7 !important; /* 同色系略深边框 */
    border-radius: 6px;
    padding: 0 4px;
  }
}

/* -------------------------------------------
   OPTIONAL: HASHTAG APPEARANCE (neutral tone)
------------------------------------------- */
html[data-theme="dark"] .sb-hashtag {
  background: #262a33 !important;
  color: #d8dee9 !important;
  border: 1px solid #2e3440 !important;
  border-radius: 6px;
  padding: 0 4px;
}

html[data-theme="light"] .sb-hashtag {
  background: #f1f3f6 !important;
  color: #2e3440 !important;
  border: 1px solid #d7dce3 !important;
  border-radius: 6px;
  padding: 0 4px;
}
```

```space-style
html[data-theme="dark"]{
.sb-hashtag[data-tag-name="silver"]{color: #444444 !important; border: 1px solid #444444 !important;}
.sb-hashtag[data-tag-name="sea"]{color: #4569a2 !important; border: 1px solid #4569a2 !important;}
.sb-hashtag[data-tag-name="mint"]{color: #336633 !important; border: 1px solid #336633 !important;}
.sb-hashtag[data-tag-name="hazel"]{color: #6b561a !important; border: 1px solid #6b561a !important;}
.sb-hashtag[data-tag-name="maroon"]{color: #6b361a !important; border: 1px solid #6b361a !important;}
.sb-hashtag[data-tag-name="burgundy"]{color: #4d1a1a !important; border: 1px solid #4d1a1a !important;}
.sb-hashtag[data-tag-name="wine"]{color: #6b1a3b !important; border: 1px solid #6b1a3b !important;}
.sb-hashtag[data-tag-name="grape"]{color: #341b51 !important; border: 1px solid #341b51 !important;}
}

html[data-theme="light"] {
.sb-hashtag[data-tag-name="silver"]{color: #f5f5f5 !important; border: 1px solid #f5f5f5 !important;}
.sb-hashtag[data-tag-name="sea"]{color: #e3f0ff !important; border: 1px solid #e3f0ff !important;}
.sb-hashtag[data-tag-name="mint"]{color: #e1f8e1 !important; border: 1px solid #e1f8e1 !important;}
.sb-hashtag[data-tag-name="hazel"]{color: #fcf8df !important; border: 1px solid #fcf8df !important;}
.sb-hashtag[data-tag-name="maroon"]{color: #f9e2da !important; border: 1px solid #f9e2da !important;}
.sb-hashtag[data-tag-name="burgundy"]{color: #f9c6c6 !important; border: 1px solid #f9c6c6 !important;}
.sb-hashtag[data-tag-name="wine"]{color: #fbd9e5 !important; border: 1px solid #fbd9e5 !important;}
.sb-hashtag[data-tag-name="grape"]{color: #e9e0fc !important; border: 1px solid #e9e0fc !important;}
}
```


## Discussions to this space-style
* [SilverBullet Community](https://community.silverbullet.md/t/custom-colorful-table-styles-for-dark-theme/1620?u=mr.red)