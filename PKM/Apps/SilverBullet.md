
Tana #WX群 里我的发言 #按时间顺序

---
[强] 最近看了看 obsidian 的 breadcrumb 插件的逻辑 再和 silverbullet 的 topwidget 对比，也有这样的感觉

在 silverbullet 里给 tana 做笔记[捂脸]：[[PKM/Apps/Tana/Related Content]]

目录，breadcrumb，linked task，都是 query，只不过是某些事件自动触发的
silverbullet 会让你了解底层原理，因为 sb 是个毛坯房，得自己写 lua 代码装修[捂脸]

---
https://community.silverbullet.md/latest 论坛 和 https://silverbullet.md/ DOC 是最常用的 熟悉 SB 的 2 个渠道
SB 很小众，但 DOC 也还比较完善，实在不懂的可以通过 DEEP WIKI 问 https://deepwiki.com/silverbulletmd/silverbullet

恩，这 SB 很需要折腾的 -_-|| 如果有时间才去试试。

---
想尝鲜很简单，就下载 2 进制文件 命令行 ./silverbullet.exe your-path-to-sb-space 就行，所有文件都原封不动地在  your-path-to-sb-space 里
它像 ob 一样解析 .md，不像 tana siyuan 等以 Json 为主格式
主要是用于博客 Publish。拿来做 PKM 差了点意思
SB 最大的好处是，

1. SB 保持 .md 干净，不像 logseq 和 ob 那样精细的链接（通过 显式 id）会 破坏 .md 格式
  - 这使得迁移成本低、容易发布到网站（它自己就是个 网页app）、git 方便 因此 同步 和 存档容易
2. SB 的 内存占用和磁盘占用极低，应该是我见过的最低的 app 了，轻量
3. SB 自定义程度非常高，但出生时几乎是裸，JS CSS LUA 随时放 code block 随时生效，既是写文章的笔记本又是写代码的 IDE
![[PKM/Apps/3c94c6f8cf234cc4a84d9d332f3452c7.png]]
![[PKM/Apps/f30a676fab521eb6d12b31d2e17c6c59.png]]

轻，和 sublime 是一个量级，这样允许你在 服务器端 以最低成本 建设个人网页
