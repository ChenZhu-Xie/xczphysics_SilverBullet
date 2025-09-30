---
pageDecoration:
    cssClasses:
        - sea-table
---

| 左 | 中 | 右 |
| :--- | :---: | ---: |
| 内容1 | 内容2 | 内容3 |

1. https://community.silverbullet.md/t/custom-colorful-table-styles-for-dark-theme/1620?u=chenzhu-xie

```space-style
table { border-radius: 15px; overflow: hidden;}
html[data-theme="dark"]{
    /*----------------------------------------------------------------*/
    body.wine-table table {--editor-wiki-link-page-color: #e6a9c9;}
    body.wine-table thead {background-color: #4a0d26;}
    body.wine-table tbody tr:nth-child(even) {background-color: #6b1a3b;}
    body.wine-table tbody tr:nth-child(odd) {background-color: #5e1735;}
    /*----------------------------------------------------------------*/
    body.sea-table table {--editor-wiki-link-page-color: #ffe559;}
    body.sea-table thead {background-color: #26277b;}
    body.sea-table tbody tr:nth-child(even) {background-color: #4569a2;}
    body.sea-table tbody tr:nth-child(odd) {background-color: #658ac4;}
    /*----------------------------------------------------------------*/
    body.silver-table table {--editor-wiki-link-page-color: #d1d1d1;}
    body.silver-table thead {background-color: #333333;}
    body.silver-table tbody tr:nth-child(even) {background-color: #444444;}
    body.silver-table tbody tr:nth-child(odd) {background-color: #555555;}
    /*----------------------------------------------------------------*/
    body.mint-table table {--editor-wiki-link-page-color: #a8d5a2; }
    body.mint-table thead {background-color: #264d26;}
    body.mint-table tbody tr:nth-child(even) {background-color: #336633;}
    body.mint-table tbody tr:nth-child(odd) {background-color: #2b5b2b;}
    /*----------------------------------------------------------------*/
    body.burgundy-table table {--editor-wiki-link-page-color: #d19999; }
    body.burgundy-table thead {background-color: #330d0d;}
    body.burgundy-table tbody tr:nth-child(even) {background-color: #4d1a1a;}
    body.burgundy-table tbody tr:nth-child(odd) {background-color: #401515;}
    /*----------------------------------------------------------------*/
    body.grape-table table {--editor-wiki-link-page-color: #a799d1; }
    body.grape-table thead {background-color: #1a0d33;}
    body.grape-table tbody tr:nth-child(even) {background-color: #341b51;}
    body.grape-table tbody tr:nth-child(odd) {background-color: #261540;}
    /*----------------------------------------------------------------*/
    body.hazel-table table {--editor-wiki-link-page-color: #e6d899; }
    body.hazel-table thead {background-color: #4a3b0d;}
    body.hazel-table tbody tr:nth-child(even) {background-color: #6b561a;}
    body.hazel-table tbody tr:nth-child(odd) {background-color: #5e4e17;}
    /*----------------------------------------------------------------*/
    body.maroon-table table {--editor-wiki-link-page-color: #e6b899; }
    body.maroon-table thead {background-color: #4a230d;}
    body.maroon-table tbody tr:nth-child(even) {background-color: #6b361a;}
    body.maroon-table tbody tr:nth-child(odd) {background-color: #5e3017;}
}
```