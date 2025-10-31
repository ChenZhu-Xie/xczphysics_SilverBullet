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

/* ===========================================
   MODERN COLORFUL TABLE SYSTEM (v2025)
   Designed for backgrounds:
   - Dark: rgb(40, 44, 52)
   - Light: rgb(255, 255, 255)
   =========================================== */

/* -------------------------------------------
   HIDE COLOR TAGS INSIDE TABLES
------------------------------------------- */
table .sb-hashtag[data-tag-name^="t"],
table .sb-hashtag[data-tag-name="silver"],
table .sb-hashtag[data-tag-name="sea"],
table .sb-hashtag[data-tag-name="mint"],
table .sb-hashtag[data-tag-name="hazel"],
table .sb-hashtag[data-tag-name="maroon"],
table .sb-hashtag[data-tag-name="burgundy"],
table .sb-hashtag[data-tag-name="wine"],
table .sb-hashtag[data-tag-name="grape"] {
  display: none !important;
}

/* -------------------------------------------
   TABLE WIDTH CONTROL (same as original)
------------------------------------------- */
table:has(.sb-hashtag[data-tag-name="t30p"]) { width: 30% !important; }
table:has(.sb-hashtag[data-tag-name="t40p"]) { width: 40% !important; }
table:has(.sb-hashtag[data-tag-name="t50p"]) { width: 50% !important; }
table:has(.sb-hashtag[data-tag-name="t60p"]) { width: 60% !important; }
table:has(.sb-hashtag[data-tag-name="t70p"]) { width: 70% !important; }
table:has(.sb-hashtag[data-tag-name="t80p"]) { width: 80% !important; }
table:has(.sb-hashtag[data-tag-name="t90p"]) { width: 90% !important; }

/* ===========================================
   DARK THEME STYLES
=========================================== */
html[data-theme="dark"] {

  /* ---------- SILVER ---------- */
  table:has(.sb-hashtag[data-tag-name="silver"]) {
    thead { background: #4b4f58 !important; color: #f2f3f5 !important; }
    tbody tr:nth-child(even) { background: #2f333b !important; color: #e3e5e8 !important; }
    tbody tr:nth-child(odd)  { background: #292d34 !important; color: #d9dbdf !important; }
    border: 1px solid #555a63 !important;
  }

  /* ---------- SEA ---------- */
  table:has(.sb-hashtag[data-tag-name="sea"]) {
    thead { background: #3e5f8a !important; color: #eaf2fa !important; }
    tbody tr:nth-child(even) { background: #2a3e56 !important; color: #dee6f1 !important; }
    tbody tr:nth-child(odd)  { background: #26394f !important; color: #d8e1ec !important; }
    border: 1px solid #4b6b96 !important;
  }

  /* ---------- MINT ---------- */
  table:has(.sb-hashtag[data-tag-name="mint"]) {
    thead { background: #317c66 !important; color: #e9fdf6 !important; }
    tbody tr:nth-child(even) { background: #1e4d40 !important; color: #d0f2e3 !important; }
    tbody tr:nth-child(odd)  { background: #214f43 !important; color: #c9ecdc !important; }
    border: 1px solid #3b8a72 !important;
  }

  /* ---------- HAZEL ---------- */
  table:has(.sb-hashtag[data-tag-name="hazel"]) {
    thead { background: #8a6533 !important; color: #fff8ef !important; }
    tbody tr:nth-child(even) { background: #5a4122 !important; color: #f4e1c9 !important; }
    tbody tr:nth-child(odd)  { background: #543a1d !important; color: #ebd7b8 !important; }
    border: 1px solid #9b7b4d !important;
  }

  /* ---------- MAROON ---------- */
  table:has(.sb-hashtag[data-tag-name="maroon"]) {
    thead { background: #813838 !important; color: #fdeaea !important; }
    tbody tr:nth-child(even) { background: #542121 !important; color: #f7dcdc !important; }
    tbody tr:nth-child(odd)  { background: #4b1b1b !important; color: #efcece !important; }
    border: 1px solid #995151 !important;
  }

  /* ---------- BURGUNDY ---------- */
  table:has(.sb-hashtag[data-tag-name="burgundy"]) {
    thead { background: #74314a !important; color: #fbeef2 !important; }
    tbody tr:nth-child(even) { background: #4a1f2e !important; color: #efd5dc !important; }
    tbody tr:nth-child(odd)  { background: #431b2a !important; color: #e6c8d2 !important; }
    border: 1px solid #884c60 !important;
  }

  /* ---------- WINE ---------- */
  table:has(.sb-hashtag[data-tag-name="wine"]) {
    thead { background: #6b3a4c !important; color: #fbeaf0 !important; }
    tbody tr:nth-child(even) { background: #452733 !important; color: #f1d8df !important; }
    tbody tr:nth-child(odd)  { background: #3d2230 !important; color: #e8cbd6 !important; }
    border: 1px solid #874e63 !important;
  }

  /* ---------- GRAPE ---------- */
  table:has(.sb-hashtag[data-tag-name="grape"]) {
    thead { background: #58477f !important; color: #f3f1fa !important; }
    tbody tr:nth-child(even) { background: #3b3059 !important; color: #e4e1f3 !important; }
    tbody tr:nth-child(odd)  { background: #342a52 !important; color: #d8d4eb !important; }
    border: 1px solid #6e5e97 !important;
  }
}

/* ===========================================
   LIGHT THEME STYLES
=========================================== */
html[data-theme="light"] {

  /* ---------- SILVER ---------- */
  table:has(.sb-hashtag[data-tag-name="silver"]) {
    thead { background: #f3f4f6 !important; color: #1f2937 !important; }
    tbody tr:nth-child(even) { background: #ffffff !important; color: #374151 !important; }
    tbody tr:nth-child(odd)  { background: #f9fafb !important; color: #4b5563 !important; }
    border: 1px solid #d1d5db !important;
  }

  /* ---------- SEA ---------- */
  table:has(.sb-hashtag[data-tag-name="sea"]) {
    thead { background: #e7f0fa !important; color: #15344f !important; }
    tbody tr:nth-child(even) { background: #f3f9ff !important; color: #1f3d5f !important; }
    tbody tr:nth-child(odd)  { background: #eaf4ff !important; color: #29456a !important; }
    border: 1px solid #b8d4f2 !important;
  }

  /* ---------- MINT ---------- */
  table:has(.sb-hashtag[data-tag-name="mint"]) {
    thead { background: #e6f7ef !important; color: #1c4532 !important; }
    tbody tr:nth-child(even) { background: #f3fcf9 !important; color: #204836 !important; }
    tbody tr:nth-child(odd)  { background: #eaf9f3 !important; color: #245a44 !important; }
    border: 1px solid #c3e8d6 !important;
  }

  /* ---------- HAZEL ---------- */
  table:has(.sb-hashtag[data-tag-name="hazel"]) {
    thead { background: #fcf4e3 !important; color: #7a4b13 !important; }
    tbody tr:nth-child(even) { background: #fffaf2 !important; color: #824f16 !important; }
    tbody tr:nth-child(odd)  { background: #fdf6ea !important; color: #945c1d !important; }
    border: 1px solid #f0d7aa !important;
  }

  /* ---------- MAROON ---------- */
  table:has(.sb-hashtag[data-tag-name="maroon"]) {
    thead { background: #fdecec !important; color: #6d2525 !important; }
    tbody tr:nth-child(even) { background: #fff6f6 !important; color: #7a2b2b !important; }
    tbody tr:nth-child(odd)  { background: #feeaea !important; color: #892f2f !important; }
    border: 1px solid #f4b8b8 !important;
  }

  /* ---------- BURGUNDY ---------- */
  table:has(.sb-hashtag[data-tag-name="burgundy"]) {
    thead { background: #fce9ee !important; color: #73283f !important; }
    tbody tr:nth-child(even) { background: #fff4f7 !important; color: #82304a !important; }
    tbody tr:nth-child(odd)  { background: #fae6ed !important; color: #943857 !important; }
    border: 1px solid #efb5c7 !important;
  }

  /* ---------- WINE ---------- */
  table:has(.sb-hashtag[data-tag-name="wine"]) {
    thead { background: #fae7f0 !important; color: #702f43 !important; }
    tbody tr:nth-child(even) { background: #fff2f7 !important; color: #7c344b !important; }
    tbody tr:nth-child(odd)  { background: #fbe8f1 !important; color: #8b3a53 !important; }
    border: 1px solid #ecb3c7 !important;
  }

  /* ---------- GRAPE ---------- */
  table:has(.sb-hashtag[data-tag-name="grape"]) {
    thead { background: #efe9fb !important; color: #433078 !important; }
    tbody tr:nth-child(even) { background: #f8f5ff !important; color: #4e358a !important; }
    tbody tr:nth-child(odd)  { background: #f2edfd !important; color: #5a3b9c !important; }
    border: 1px solid #d1c3f1 !important;
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