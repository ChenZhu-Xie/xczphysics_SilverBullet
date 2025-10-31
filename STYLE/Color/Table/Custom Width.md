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

html[data-theme="dark"]{
/* ---------- wine ---------- */
table:has(.sb-hashtag[data-tag-name="wine"]) {
  thead { background-color: #664155 !important; color: #f0e6eb !important;}
  tbody tr:nth-child(even) { background-color: #3d2c38 !important; color: #e8dde2 !important;}
  tbody tr:nth-child(odd) { background-color: #352831 !important; color: #e0d5da !important;}
  border: 1px solid #664155 !important;
  --editor-wiki-link-page-color: #e91e63 !important;
}

/* ---------- sea ---------- */
table:has(.sb-hashtag[data-tag-name="sea"]) {
  thead { background-color: #4a6fa5 !important; color: #e6f0ff !important;}
  tbody tr:nth-child(even) { background-color: #2d4963 !important; color: #dde9f7 !important;}
  tbody tr:nth-child(odd) { background-color: #254056 !important; color: #d5e3f3 !important;}
  border: 1px solid #4a6fa5 !important;
  --editor-wiki-link-page-color: #2196f3 !important;
}

/* ---------- silver ---------- */
table:has(.sb-hashtag[data-tag-name="silver"]) {
  thead { background-color: #6b7280 !important; color: #f3f4f6 !important;}
  tbody tr:nth-child(even) { background-color: #374151 !important; color: #e5e7eb !important;}
  tbody tr:nth-child(odd) { background-color: #2d3748 !important; color: #d1d5db !important;}
  border: 1px solid #6b7280 !important;
  --editor-wiki-link-page-color: #9ca3af !important;
}

/* ---------- mint ---------- */
table:has(.sb-hashtag[data-tag-name="mint"]) {
  thead { background-color: #10b981 !important; color: #ecfdf5 !important;}
  tbody tr:nth-child(even) { background-color: #064e3b !important; color: #d1fae5 !important;}
  tbody tr:nth-child(odd) { background-color: #053f32 !important; color: #a7f3d0 !important;}
  border: 1px solid #10b981 !important;
  --editor-wiki-link-page-color: #34d399 !important;
}

/* ---------- burgundy ---------- */
table:has(.sb-hashtag[data-tag-name="burgundy"]) {
  thead { background-color: #991b1b !important; color: #fef2f2 !important;}
  tbody tr:nth-child(even) { background-color: #450a0a !important; color: #fee2e2 !important;}
  tbody tr:nth-child(odd) { background-color: #3a0808 !important; color: #fecaca !important;}
  border: 1px solid #991b1b !important;
  --editor-wiki-link-page-color: #ef4444 !important;
}

/* ---------- grape ---------- */
table:has(.sb-hashtag[data-tag-name="grape"]) {
  thead { background-color: #7c3aed !important; color: #f5f3ff !important;}
  tbody tr:nth-child(even) { background-color: #3c1a78 !important; color: #ede9fe !important;}
  tbody tr:nth-child(odd) { background-color: #2d1465 !important; color: #ddd6fe !important;}
  border: 1px solid #7c3aed !important;
  --editor-wiki-link-page-color: #a855f7 !important;
}

/* ---------- hazel ---------- */
table:has(.sb-hashtag[data-tag-name="hazel"]) {
  thead{ background-color: #d97706 !important; color: #fffbeb !important;}
  tbody tr:nth-child(even) { background-color: #78350f !important; color: #fef3c7 !important;}
  tbody tr:nth-child(odd) { background-color: #5c2a0c !important; color: #fed7aa !important;}
  border: 1px solid #d97706 !important;
  --editor-wiki-link-page-color: #f59e0b !important;
}

/* --------- maroon ---------- */
table:has(.sb-hashtag[data-tag-name="maroon"]) {
  thead { background-color: #dc2626 !important; color: #fef2f2 !important;}
  tbody tr:nth-child(even) { background-color: #7f1d1d !important; color: #fee2e2 !important;}
  tbody tr:nth-child(odd) { background-color: #651717 !important; color: #fecaca !important;}
  border: 1px solid #dc2626 !important;
  --editor-wiki-link-page-color: #f87171 !important;
}
}

html[data-theme="light"] {
  /* ---------- wine ---------- */
  table:has(.sb-hashtag[data-tag-name="wine"]) {
    --editor-wiki-link-page-color: #c2185b !important;
    thead { background-color: #fce4ec !important; color: #880e4f !important;}
    tbody tr:nth-child(even) { background-color: #fdf2f8 !important; color: #9d174d !important;}
    tbody tr:nth-child(odd) { background-color: #fce7f3 !important; color: #a21caf !important;}
    border: 1px solid #f8bbd9 !important;
  }

  /* ---------- sea ---------- */
  table:has(.sb-hashtag[data-tag-name="sea"]) {
    --editor-wiki-link-page-color: #1565c0 !important;
    thead { background-color: #e3f2fd !important; color: #0d47a1 !important;}
    tbody tr:nth-child(even) { background-color: #f0f9ff !important; color: #0c4a6e !important;}
    tbody tr:nth-child(odd) { background-color: #e0f2fe !important; color: #0e7490 !important;}
    border: 1px solid #7dd3fc !important;
  }

  /* ---------- silver ---------- */
  table:has(.sb-hashtag[data-tag-name="silver"]) {
    --editor-wiki-link-page-color: #4b5563 !important;
    thead { background-color: #f9fafb !important; color: #1f2937 !important;}
    tbody tr:nth-child(even) { background-color: #ffffff !important; color: #374151 !important;}
    tbody tr:nth-child(odd) { background-color: #f3f4f6 !important; color: #4b5563 !important;}
    border: 1px solid #d1d5db !important;
  }

  /* ---------- mint ---------- */
  table:has(.sb-hashtag[data-tag-name="mint"]) {
    --editor-wiki-link-page-color: #059669 !important;
    thead { background-color: #ecfdf5 !important; color: #064e3b !important;}
    tbody tr:nth-child(even) { background-color: #f0fdf4 !important; color: #14532d !important;}
    tbody tr:nth-child(odd) { background-color: #dcfce7 !important; color: #166534 !important;}
    border: 1px solid #86efac !important;
  }

  /* ---------- burgundy ---------- */
  table:has(.sb-hashtag[data-tag-name="burgundy"]) {
    --editor-wiki-link-page-color: #dc2626 !important;
    thead { background-color: #fef2f2 !important; color: #7f1d1d !important;}
    tbody tr:nth-child(even) { background-color: #fffbfb !important; color: #991b1b !important;}
    tbody tr:nth-child(odd) { background-color: #fee2e2 !important; color: #b91c1c !important;}
    border: 1px solid #fca5a5 !important;
  }

  /* ---------- grape ---------- */
  table:has(.sb-hashtag[data-tag-name="grape"]) {
    --editor-wiki-link-page-color: #7c2d12 !important;
    thead { background-color: #f5f3ff !important; color: #581c87 !important;}
    tbody tr:nth-child(even) { background-color: #faf5ff !important; color: #6b21a8 !important;}
    tbody tr:nth-child(odd) { background-color: #ede9fe !important; color: #7c3aed !important;}
    border: 1px solid #c4b5fd !important;
  }

  /* ---------- hazel ---------- */
  table:has(.sb-hashtag[data-tag-name="hazel"]) {
    --editor-wiki-link-page-color: #c2410c !important;
    thead { background-color: #fffbeb !important; color: #9a3412 !important;}
    tbody tr:nth-child(even) { background-color: #fffef5 !important; color: #c2410c !important;}
    tbody tr:nth-child(odd) { background-color: #fef3c7 !important; color: #d97706 !important;}
    border: 1px solid #fed7aa !important;
  }

  /* ---------- maroon ---------- */
  table:has(.sb-hashtag[data-tag-name="maroon"]) {
    --editor-wiki-link-page-color: #b91c1c !important;
    thead { background-color: #fef2f2 !important; color: #7f1d1d !important;}
    tbody tr:nth-child(even) { background-color: #fffbfb !important; color: #991b1b !important;}
    tbody tr:nth-child(odd) { background-color: #fee2e2 !important; color: #dc2626 !important;}
    border: 1px solid #fca5a5 !important;
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