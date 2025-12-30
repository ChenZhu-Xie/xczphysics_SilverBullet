
1. [tft performance interim results](https://www.goedel.io/p/tft-performance-interim-results) #goedel #BenchMark

# 从 inbox 到 archive 的 两种范式

文档式    结构 -> 像是... “把东西 装   进来”
outline + 标签 -> 像是... “把东西 send 出去”

## 1.[[PKM/Apps/SilverBullet]] = “放在哪个文件夹下 最合适”

**摩擦在于**：跨文件夹 跳转和查询：关联对象们
- 相比 2. 不仅
  - 初始创建 的时候 难分类
  - 查询起来 也挺难（2. 低代码 般的 查询不难）。
    - 要知道... [[Library/xczphysics/CONFIG/Picker/Tags|Tags Picker]] 在 Tana 里... 用 [[PKM/Apps/Tana/Query Builder|query builder]] 非常容易实现，但...为此 我竟然需要在 SilverBullet 中 写那么长代码...

## 2.[[PKM/Apps/Tana]] = “打什么标签 最合适”

#Tag 也有 ==继承===[[PKM/Apps/SiYuan|]]的==子标签==`/`（即 dir 层级）关系
- 在 Tana 的 [[PKM/Apps/Tana/⭐📌 SuperTag|]] 的 `extend from` 配置 里
  - 用处：继承父标签的 fields
  - 且 #SuperTag 在 name 上，不需要 显示的 层级结构 `/`

---
**摩擦在于**：内容在 _视觉和概念_ 上的 ==上下级 过于平权了==
- 相比 1. 更容易查找到一堆关联的对象，但它们的显示权重却是同等的
  - 但在人脑子里，只对自己想最终查询的 目的地，的权重是最高的
  - 因此还得继续 filter 下去
 >     通过 _逻辑_, i.e. query builder 而不是 _视觉_ 分类

> **caution** Caution
> query 后的 table 让人（至少在第一时间）**分不清楚什么是重点**
>   - 政治正确：确实，在哲学上 这是正确的。
>   - 但是，这在人文上就很不 文艺复兴 了（对观众不友好）。

**导致的结果**：看官 audience + 作者 writer 都 无法集中精力 深度思考
作者进入 tab 心流倒是快，
- 但想回过头来看看自己写到哪了，写了哪些，一时半会儿还找不到...
需要配合 不断地 zoom in + Header 才能提醒 自己/观众

此外，不仅 Bullets 之间，Bullets 与 Bullets 的 Pattern 之间
也几乎是全同的（除了 Switch View 之外）....以至于...-_-||

---
**第二个摩擦** 也即 随之而来的：放弃肉身，科技飞升（神族）
传统的文章结构也没有了，以至于很难
 - 导出单个 .json
 - 并翻译 成 .md
 - 并稍改动后 放在博客上...

**这一点，反观 SilverBullet 就做得很好**：
这也是为什么 Zef 希望
- 保持 SilverBullet 干净的 .md 文档结构
- 易 github 同步、协作写作 + 分发、聚合库
- 以及 一键 publish 的原因。
>  - Tana 迫于压力也在做 publish，但它只是在秀肌肉 + 吸引客流...
>    - 要是真从用户角度考虑...就不会止步于此
>    - 要知道，Tana 官方也拒绝开放 CSS 自定义...
>    - Tana 的 YouTube 品牌代言人（高于 ambassador）的性格行为举止与 Tana 的产品哲学 高度类似（揉纸团丢掉！“不，我们不做这个功能”）

### Plain Node >> Wiki >> field of Tag >> Tag >> (inherit/extend from) PARENT/metaTag of Tag
Tana 群友问过 AI：#SuperTag 不应滥用。

# 要 残酷真相 json，还是要 舒适谎言 md ?

INTP 本尊是 接近 冰点的 json 的
- 但...它在机器人之外，又很温暖的人机...
- 于是我又试了试 SilverBullet 的 md...（*以及车妹）
