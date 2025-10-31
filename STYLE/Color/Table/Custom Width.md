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

/* ==========================================================
   UNIVERSAL TABLE HOVER EFFECT
   所有表格（包括无标签）hover 时高亮整行与标题
========================================================== */
table:hover thead,
table tbody tr:hover {
  background: color-mix(in srgb, var(--ui-accent-color, #999) 20%, transparent);
  transition: background 0.25s ease, color 0.25s ease;
}

/* ==========================================================
   DARK MODE 柔和低亮度方案
========================================================== */
html[data-theme="dark"] {

  /* 通用默认表格风格（无标签） */
  table:not(:has(.sb-hashtag)) {
    thead { background: #2f2f33; color: #e0e0e0; }
    tbody tr:nth-child(even) { background: #252529; color: #d5d5d5; }
    tbody tr:nth-child(odd)  { background: #212124; color: #cfcfcf; }
    border: 1px solid #3b3b3f;
  }

  /* ===================== INDIVIDUAL THEMES ===================== */
  /* 每个主题定义 tone-bg / accent / text */
  /* ------------ RED系 ------------ */
  table:has(.sb-hashtag[data-tag-name="maroon"])   { --tone-bg:#3e2020; --tone-accent:#a35b5b; --tone-text:#f2dada; }
  table:has(.sb-hashtag[data-tag-name="burgundy"]) { --tone-bg:#3b2433; --tone-accent:#b36a8b; --tone-text:#f3dce7; }
  table:has(.sb-hashtag[data-tag-name="wine"])     { --tone-bg:#35293c; --tone-accent:#a27db2; --tone-text:#f0e0f2; }

  /* ------------ YELLOW / AMBER系 ------------ */
  table:has(.sb-hashtag[data-tag-name="amber"]) { --tone-bg:#3a3020; --tone-accent:#d3a859; --tone-text:#f5e9c5; }
  table:has(.sb-hashtag[data-tag-name="hazel"]) { --tone-bg:#2f2b1e; --tone-accent:#b4a072; --tone-text:#eee6cf; }

  /* ------------ GREEN系 ------------ */
  table:has(.sb-hashtag[data-tag-name="teal"])  { --tone-bg:#203532; --tone-accent:#5daea0; --tone-text:#d5f3ed; }
  table:has(.sb-hashtag[data-tag-name="green"]) { --tone-bg:#223726; --tone-accent:#66b36a; --tone-text:#daf3dc; }

  /* ------------ BLUE系 ------------ */
  table:has(.sb-hashtag[data-tag-name="cyan"])  { --tone-bg:#20373e; --tone-accent:#6ac2d1; --tone-text:#d5f2f7; }
  table:has(.sb-hashtag[data-tag-name="blue"])  { --tone-bg:#222f44; --tone-accent:#7aa7f0; --tone-text:#dbe8fb; }
  table:has(.sb-hashtag[data-tag-name="indigo"]) { --tone-bg:#2a274a; --tone-accent:#9a91e8; --tone-text:#e6e3f7; }

  /* ------------ PURPLE / PINK系 ------------ */
  table:has(.sb-hashtag[data-tag-name="violet"]) { --tone-bg:#342646; --tone-accent:#b78ce0; --tone-text:#f1e5f9; }
  table:has(.sb-hashtag[data-tag-name="grape"])  { --tone-bg:#39243d; --tone-accent:#c179b5; --tone-text:#f2e1ee; }
  table:has(.sb-hashtag[data-tag-name="pink"])   { --tone-bg:#3d1f2e; --tone-accent:#da84a8; --tone-text:#f7dfeb; }

  /* 通用规则套用变量 */
  table:has(.sb-hashtag) {
    thead { background: color-mix(in srgb, var(--tone-bg) 90%, black 10%) !important; color: var(--tone-text); }
    tbody tr:nth-child(even) { background: color-mix(in srgb, var(--tone-bg) 75%, black 25%); color: var(--tone-text); }
    tbody tr:nth-child(odd)  { background: color-mix(in srgb, var(--tone-bg) 55%, black 45%); color: var(--tone-text); }
    border: 1px solid var(--tone-accent);
  }
}

/* ==========================================================
   LIGHT MODE 明亮清新方案
========================================================== */
html[data-theme="light"] {

  /* 默认无标签表格 */
  table:not(:has(.sb-hashtag)) {
    thead { background: #f5f5f7; color: #333; }
    tbody tr:nth-child(even) { background: #fafafa; color: #333; }
    tbody tr:nth-child(odd)  { background: #f2f2f4; color: #333; }
    border: 1px solid #ddd;
  }

  /* ------------ RED系 ------------ */
  table:has(.sb-hashtag[data-tag-name="maroon"])   { --tone-bg:#f6e6e6; --tone-accent:#9b3939; --tone-text:#4b1010; }
  table:has(.sb-hashtag[data-tag-name="burgundy"]) { --tone-bg:#f5e6ec; --tone-accent:#8a2c56; --tone-text:#43162d; }
  table:has(.sb-hashtag[data-tag-name="wine"])     { --tone-bg:#f3e8f2; --tone-accent:#7c3f7c; --tone-text:#3b1e3d; }

  /* ------------ YELLOW / AMBER系 ------------ */
  table:has(.sb-hashtag[data-tag-name="amber"]) { --tone-bg:#fff8e8; --tone-accent:#c68a2b; --tone-text:#4b2d0b; }
  table:has(.sb-hashtag[data-tag-name="hazel"]) { --tone-bg:#f7f3e6; --tone-accent:#8d7a43; --tone-text:#3a331a; }

  /* ------------ GREEN系 ------------ */
  table:has(.sb-hashtag[data-tag-name="teal"])  { --tone-bg:#e8f5f3; --tone-accent:#2f867e; --tone-text:#143a36; }
  table:has(.sb-hashtag[data-tag-name="green"]) { --tone-bg:#e9f6eb; --tone-accent:#2f8a35; --tone-text:#133b18; }

  /* ------------ BLUE系 ------------ */
  table:has(.sb-hashtag[data-tag-name="cyan"])  { --tone-bg:#e8f7fa; --tone-accent:#318aa0; --tone-text:#13333b; }
  table:has(.sb-hashtag[data-tag-name="blue"])  { --tone-bg:#eaf1fa; --tone-accent:#3c73c8; --tone-text:#152945; }
  table:has(.sb-hashtag[data-tag-name="indigo"]) { --tone-bg:#ebe9f7; --tone-accent:#5a52b8; --tone-text:#1d184a; }

  /* ------------ PURPLE / PINK系 ------------ */
  table:has(.sb-hashtag[data-tag-name="violet"]) { --tone-bg:#f4eaf9; --tone-accent:#8456b8; --tone-text:#2e184b; }
  table:has(.sb-hashtag[data-tag-name="grape"])  { --tone-bg:#f6e8f3; --tone-accent:#a4508b; --tone-text:#381833; }
  table:has(.sb-hashtag[data-tag-name="pink"])   { --tone-bg:#f8e8ef; --tone-accent:#c04d82; --tone-text:#3d1528; }

  table:has(.sb-hashtag) {
    thead { background: color-mix(in srgb, var(--tone-bg) 95%, white 5%) !important; color: var(--tone-text); }
    tbody tr:nth-child(even) { background: color-mix(in srgb, var(--tone-bg) 90%, white 10%); color: var(--tone-text); }
    tbody tr:nth-child(odd)  { background: color-mix(in srgb, var(--tone-bg) 80%, white 20%); color: var(--tone-text); }
    border: 1px solid var(--tone-accent);
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