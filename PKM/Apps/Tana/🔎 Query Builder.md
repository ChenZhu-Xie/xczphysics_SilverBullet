
#❓ Tana 的 query 似乎没办法嵌套
   - 第一个 query 产生的表格 无法作为 下一个 query 的输入

- [x] 如何不使用 [[PKM/Apps/Tana/🔎 Query Builder|Query Builder]]，而是（诸如）直接 paste `( (Date overlaps with INSTANCE) OR (Due Date overlaps with INSTANCE) OR (Do Date overlaps with INSTANCE) OR (consumed date overlaps with INSTANCE) OR` 查询语句 来完成 query 的构建？ [completed: 2025-12-29T17:51:35]
  - ==暂时不能==。
    - 不过只要像 [[PKM/Apps/LogSeq|]] 那样，持久化存在 + 复制粘贴（作为模板）也行
  - 这是区别于 [[PKM/Apps/SilverBullet|]] 的==另一种可编程==：只是==可搭积木==并不够。
    - 过于低代码了一点。
    - 这可能是 Tana 团队出于产品的安全考虑。
      - 正如 CSS 的注入都这么麻烦：他们似乎不希望开放太黑客的入口。
      - 也正如 [[Inbox/2025-12-27/23-32-42#Message 3|鼠标操作 多于键盘]] 的 背后原因，是基于同样的起源？

# Simple Query Knowledge

1. 引用单单一个 Node 到 Query Builder，默认是在找 它的所有后代 [QTnCqDKJNQk](https://youtu.be/QTnCqDKJNQk?t=3617) #youtube
