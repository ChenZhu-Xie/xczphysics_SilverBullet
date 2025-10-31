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
  thead { background-color: #4a0d26 !important;}
  tbody tr:nth-child(odd) { background-color: #5e1735 !important;}
}
  --editor-wiki-link-page-color: #e6a9c9 !important;
/* ---------- sea ---------- */
table:has(.sb-hashtag[data-tag-name="sea"]) {
  thead { background-color: #0048f2 !important;}
  tbody tr:nth-child(even) { background-color: #658ac4 !important;}
  tbody tr:nth-child(odd) { background-color: #4569a2 !important;}
  --editor-wiki-link-page-color: #ffe559 !important;
}
/* ---------- silver ---------- */
table:has(.sb-hashtag[data-tag-name="silver"]) {
  thead { background-color: #333333 !important;}
  tbody tr:nth-child(even) { background-color: #555555 !important;}
  tbody tr:nth-child(odd) { background-color: #444444 !important;}
  --editor-wiki-link-page-color: #d1d1d1 !important;
}
/* ---------- mint ---------- */
table:has(.sb-hashtag[data-tag-name="mint"]) {
  thead { background-color: #264d26 !important;}
  tbody tr:nth-child(even) { background-color: #336633 !important;}
  tbody tr:nth-child(odd) { background-color: #2b5b2b !important;}
  --editor-wiki-link-page-color: #a8d5a2 !important;
}
/* ---------- burgundy ---------- */
table:has(.sb-hashtag[data-tag-name="burgundy"]) {
  thead { background-color: #330d0d !important;}
  tbody tr:nth-child(even) { background-color: #4d1a1a !important;}
  tbody tr:nth-child(odd) { background-color: #401515 !important;}
  --editor-wiki-link-page-color: #d19999 !important;
}
/* ---------- grape ---------- */
table:has(.sb-hashtag[data-tag-name="grape"]) {
  thead { background-color: #1a0d33 !important;}
  tbody tr:nth-child(even) { background-color: #341b51 !important; }
  tbody tr:nth-child(odd) { background-color: #261540 !important;}
  --editor-wiki-link-page-color: #a799d1 !important;
}
/* ---------- hazel ---------- */
table:has(.sb-hashtag[data-tag-name="hazel"]) {
  thead{ background-color: #4a3b0d !important;}
  tbody tr:nth-child(even) { background-color: #6b561a !important;}
  tbody tr:nth-child(odd) { background-color: #5e4e17 !important;}
  --editor-wiki-link-page-color: #e6d899 !important;
}
/* --------- maroon ---------- */
  table:has(.sb-hashtag[data-tag-name="maroon"]) {
  thead { background-color: #4a230d !important; }
  tbody tr:nth-child(even) { background-color: #6b361a !important; }
  tbody tr:nth-child(odd) { background-color: #5e3017 !important; }
    --editor-wiki-link-page-color: #e6b899 !important;
 }
}

html[data-theme="light"] {
  /* ---------- wine ---------- */
  table:has(.sb-hashtag[data-tag-name="wine"]) {
    --editor-wiki-link-page-color: #bf4664 !important;
    thead { background-color: #f7c1d0 !important; }
    tbody tr:nth-child(even) { background-color: #fbd9e5 !important; }
    tbody tr:nth-child(odd) { background-color: #f9b7cf !important; }
  }

  /* ---------- sea ---------- */
  table:has(.sb-hashtag[data-tag-name="sea"]) {
    --editor-wiki-link-page-color: #0033b2 !important;
    thead { background-color: #c3dbff !important; }
    tbody tr:nth-child(even) { background-color: #e3f0ff !important; }
    tbody tr:nth-child(odd) { background-color: #b7d1ff !important; }
  }

  /* ---------- silver ---------- */
  table:has(.sb-hashtag[data-tag-name="silver"]) {
    --editor-wiki-link-page-color: #777777 !important;
    thead { background-color: #e0e0e0 !important; }
    tbody tr:nth-child(even) { background-color: #f5f5f5 !important; }
    tbody tr:nth-child(odd) { background-color: #ececec !important; }
  }

  /* ---------- mint ---------- */
  table:has(.sb-hashtag[data-tag-name="mint"]) {
    --editor-wiki-link-page-color: #3b803b !important;
    thead { background-color: #c8eac6 !important; }
    tbody tr:nth-child(even) { background-color: #e1f8e1 !important; }
    tbody tr:nth-child(odd) { background-color: #b8e5b8 !important; }
  }

  /* ---------- burgundy ---------- */
  table:has(.sb-hashtag[data-tag-name="burgundy"]) {
    --editor-wiki-link-page-color: #a01a1a !important;
    thead { background-color: #f2a1a1 !important; }
    tbody tr:nth-child(even) { background-color: #f9c6c6 !important; }
    tbody tr:nth-child(odd) { background-color: #f6b0b0 !important; }
  }

  /* ---------- grape ---------- */
  table:has(.sb-hashtag[data-tag-name="grape"]) {
    --editor-wiki-link-page-color: #361a70 !important;
    thead { background-color: #d5c1f3 !important; }
    tbody tr:nth-child(even) { background-color: #e9e0fc !important; }
    tbody tr:nth-child(odd) { background-color: #dfd1f9 !important; }
  }

  /* ---------- hazel ---------- */
  table:has(.sb-hashtag[data-tag-name="hazel"]) {
    --editor-wiki-link-page-color: #7c5f1a !important;
    thead { background-color: #f5f0cc !important; }
    tbody tr:nth-child(even) { background-color: #fcf8df !important; }
    tbody tr:nth-child(odd) { background-color: #f1e8b5 !important; }
  }

  /* ---------- maroon ---------- */
  table:has(.sb-hashtag[data-tag-name="maroon"]) {
    --editor-wiki-link-page-color: #862f18 !important;
    thead { background-color: #f4c6b8 !important; }
    tbody tr:nth-child(even) { background-color: #f9e2da !important; }
    tbody tr:nth-child(odd) { background-color: #f6cfc3 !important; }
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