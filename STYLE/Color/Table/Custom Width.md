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
   Modernized Colorful Tables — REFINED
   Dark background target: rgb(40,44,52)
   Light background target: rgb(255,255,255)
   Goal: 深色更暗、浅色更清新；Maroon/Burgundy/Wine 明显区分
   =========================================== */

/* ---------------------------
   把表内用于标记的 hashtag 隐藏（不显示标签文本）
----------------------------*/
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

/* ---------------------------
   宽度标签（保留） 
----------------------------*/
table:has(.sb-hashtag[data-tag-name="t30p"]) { width: 30% !important; }
table:has(.sb-hashtag[data-tag-name="t40p"]) { width: 40% !important; }
table:has(.sb-hashtag[data-tag-name="t50p"]) { width: 50% !important; }
table:has(.sb-hashtag[data-tag-name="t60p"]) { width: 60% !important; }
table:has(.sb-hashtag[data-tag-name="t70p"]) { width: 70% !important; }
table:has(.sb-hashtag[data-tag-name="t80p"]) { width: 80% !important; }
table:has(.sb-hashtag[data-tag-name="t90p"]) { width: 90% !important; }

/* ---------------------------
   全局表格基础（可按需微调）
   - 深模式背景接近 rgb(40,44,52)
   - 边角与间隔保持轻柔
----------------------------*/
table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
  font-family: inherit;
}

/* 轻微 hover 效果（淡亮） */
table tbody tr:hover {
  transform: none;
  filter: brightness(1.06);
  transition: filter 120ms linear;
}

/* ===========================================
   DARK THEME — 更暗、更接近背景 (rgb(40,44,52))
   我把所有主色在暗色模式中整体下调亮度并降低饱和度
=========================================== */
html[data-theme="dark"] {
  /* 可选：定义深色背景变量（仅说明，不影响实际外层背景） */
  --sb-dark-bg: rgb(40,44,52);
}

/* ---------- SILVER (neutral) ---------- */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="silver"]) {
  thead { background: #42444a !important; color: #e9ebee !important; } /* very muted */
  tbody tr:nth-child(even) { background: #2a2c31 !important; color: #d8dbe0 !important; }
  tbody tr:nth-child(odd)  { background: #26282d !important; color: #cfcfd3 !important; }
  border: 1px solid #3e4046 !important;
}

/* ---------- SEA (blue-muted) ---------- */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="sea"]) {
  thead { background: #335273 !important; color: #eaf3f9 !important; }
  tbody tr:nth-child(even) { background: #243544 !important; color: #d9e6ef !important; }
  tbody tr:nth-child(odd)  { background: #202e3f !important; color: #d1dfe9 !important; }
  border: 1px solid #3b516f !important;
}

/* ---------- MINT (green-muted) ---------- */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="mint"]) {
  thead { background: #2b6d58 !important; color: #eaf9f2 !important; }
  tbody tr:nth-child(even) { background: #173f33 !important; color: #cfeee0 !important; }
  tbody tr:nth-child(odd)  { background: #133527 !important; color: #c4e8d7 !important; }
  border: 1px solid #2e6f59 !important;
}

/* ---------- HAZEL (warm-muted) ---------- */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="hazel"]) {
  thead { background: #755734 !important; color: #fff6ea !important; }
  tbody tr:nth-child(even) { background: #46321f !important; color: #ead9bf !important; }
  tbody tr:nth-child(odd)  { background: #3f2b18 !important; color: #e1cfae !important; }
  border: 1px solid #74583e !important;
}

/* ---------- MAROON (distinct: 红棕) ----------
   目标：比之前更靠近深背景，偏红棕，低饱和 */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="maroon"]) {
  thead { background: #4a2523 !important; color: #f3e7e6 !important; }    /* 红棕偏暗 */
  tbody tr:nth-child(even) { background: #321615 !important; color: #e7d1d0 !important; }
  tbody tr:nth-child(odd)  { background: #2b1211 !important; color: #dcc3c3 !important; }
  border: 1px solid #5b3030 !important;
}

/* ---------- BURGUNDY (distinct: 紫红) ----------
   目标：偏紫红，比 maroon 更紫一点，且更暗 */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="burgundy"]) {
  thead { background: #412336 !important; color: #f4e9ee !important; }    /* 紫红偏暗 */
  tbody tr:nth-child(even) { background: #2a1722 !important; color: #e8d6db !important; }
  tbody tr:nth-child(odd)  { background: #24121c !important; color: #ddc6cc !important; }
  border: 1px solid #583446 !important;
}

/* ---------- WINE (distinct: 深紫灰) ----------
   目标：偏紫灰，比 burgundy 更冷、更深 */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="wine"]) {
  thead { background: #36232c !important; color: #f2e9ee !important; }    /* 更冷的紫灰 */
  tbody tr:nth-child(even) { background: #24171f !important; color: #e6d6dc !important; }
  tbody tr:nth-child(odd)  { background: #20141b !important; color: #dcc9d0 !important; }
  border: 1px solid #4a3843 !important;
}

/* ---------- GRAPE (muted purple) ---------- */
html[data-theme="dark"] table:has(.sb-hashtag[data-tag-name="grape"]) {
  thead { background: #453b66 !important; color: #f4f2fb !important; }
  tbody tr:nth-child(even) { background: #31284a !important; color: #e6e0f4 !important; }
  tbody tr:nth-child(odd)  { background: #2a213f !important; color: #dbd6ef !important; }
  border: 1px solid #574e80 !important;
}

/* ===========================================
   LIGHT THEME — 更清新、更明亮
=========================================== */
html[data-theme="light"] {

  /* ---------- SILVER ---------- */
  table:has(.sb-hashtag[data-tag-name="silver"]) {
    thead { background: #f5f6f7 !important; color: #1f2937 !important; }
    tbody tr:nth-child(even) { background: #ffffff !important; color: #374151 !important; }
    tbody tr:nth-child(odd)  { background: #f8f9fa !important; color: #4b5563 !important; }
    border: 1px solid #e2e6ea !important;
  }

  /* ---------- SEA ---------- */
  table:has(.sb-hashtag[data-tag-name="sea"]) {
    thead { background: #eaf4fb !important; color: #123047 !important; }
    tbody tr:nth-child(even) { background: #f8fdff !important; color: #173a57 !important; }
    tbody tr:nth-child(odd)  { background: #f0f8ff !important; color: #214a6b !important; }
    border: 1px solid #cfe7fb !important;
  }

  /* ---------- MINT ---------- */
  table:has(.sb-hashtag[data-tag-name="mint"]) {
    thead { background: #e8fbf2 !important; color: #114033 !important; }
    tbody tr:nth-child(even) { background: #f8fffb !important; color: #19533f !important; }
    tbody tr:nth-child(odd)  { background: #eef9f4 !important; color: #1f6a4f !important; }
    border: 1px solid #d0efe0 !important;
  }

  /* ---------- HAZEL ---------- */
  table:has(.sb-hashtag[data-tag-name="hazel"]) {
    thead { background: #fff7ef !important; color: #6a4726 !important; }
    tbody tr:nth-child(even) { background: #fffdf9 !important; color: #7a522f !important; }
    tbody tr:nth-child(odd)  { background: #fff6ee !important; color: #8a5936 !important; }
    border: 1px solid #f6dec0 !important;
  }

  /* ---------- MAROON (light) ---------- */
  table:has(.sb-hashtag[data-tag-name="maroon"]) {
    thead { background: #fff0ef !important; color: #632a28 !important; }  /* 红棕清新版 */
    tbody tr:nth-child(even) { background: #fff9f9 !important; color: #6f332f !important; }
    tbody tr:nth-child(odd)  { background: #fff3f2 !important; color: #7d3b37 !important; }
    border: 1px solid #f3c9c7 !important;
  }

  /* ---------- BURGUNDY (light) ---------- */
  table:has(.sb-hashtag[data-tag-name="burgundy"]) {
    thead { background: #fff1f6 !important; color: #55243a !important; }  /* 紫红清新版 */
    tbody tr:nth-child(even) { background: #fff8fb !important; color: #622a45 !important; }
    tbody tr:nth-child(odd)  { background: #fff3f7 !important; color: #6f3050 !important; }
    border: 1px solid #f4d3df !important;
  }

  /* ---------- WINE (light) ---------- */
  table:has(.sb-hashtag[data-tag-name="wine"]) {
    thead { background: #fff2f6 !important; color: #4a2734 !important; }  /* 深紫灰清新版 */
    tbody tr:nth-child(even) { background: #fff8fb !important; color: #583041 !important; }
    tbody tr:nth-child(odd)  { background: #fff4f8 !important; color: #65374f !important; }
    border: 1px solid #f1d6df !important;
  }

  /* ---------- GRAPE ---------- */
  table:has(.sb-hashtag[data-tag-name="grape"]) {
    thead { background: #f6f1fd !important; color: #3f2e6a !important; }
    tbody tr:nth-child(even) { background: #fbf9ff !important; color: #4b367f !important; }
    tbody tr:nth-child(odd)  { background: #f8f5fe !important; color: #5a43a1 !important; }
    border: 1px solid #e7ddfb !important;
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

/* ---------------------------
   OPTIONAL: hashtag 外观（可保留或移除）
   这里提供中性样式（不抢表格主题） 
----------------------------*/
html[data-theme="dark"] .sb-hashtag {
  background: #262a33 !important;
  color: #cfd6df !important;
  border: 1px solid #2e3440 !important;
  border-radius: 6px;
  padding: 0 6px;
  font-size: 0.85em;
}

html[data-theme="light"] .sb-hashtag {
  background: #f3f5f8 !important;
  color: #2b3440 !important;
  border: 1px solid #d8e0ea !important;
  border-radius: 6px;
  padding: 0 6px;
  font-size: 0.85em;
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