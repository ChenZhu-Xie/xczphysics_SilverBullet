#silverbullet #SiYuan #dir #tree

# SB - SiYuan

渲染方式：SilverBullet = 思源 v1
文档结构：SilverBullet = 思源

## SB, SiYuan 数据结构 file + folder tree

### folder 树 = Tana / RE,RR 的 无序列表

难道不是么？

### 不同的 file.suffix 后缀 对应不同的 对象

因此，相比 RR,RE 以及 Tana，
思源 和 SB 也更对象化一点，
但没有 Anytype 如此地对象化。

通过 标签 tag / 元标签 itag，
SB 以及 Tana、Logseq 也可以有自己的 对象们

### file.md 内 H1,H2 等标题结构 等价但优于 列表 

对人类的可读性，及几乎每一份 html，都证明了 Heading 结构的优势

所以...文件夹树状结构并不是那么不可取，对么？

==只是== Tana, Workflowy, Logseq, RoamResearch, RoamEdit 大纲 app 还原了 file 内 本身的 page 结构 的 性质：
与 file 外 其在 folder 结构 中 的相对位置 一样，都是 tree 状的==而已==。

有了（像这样自定义的）Heading 的颜色区分、Tree 状高亮，不必因 “只有 Heading 的 字体大小，所以无法像 缩进 那样 区分 层级结构”
而无奈只好被迫选择 Lists/Bullets 列表/大纲，作为 页面内视图。

# SB 的 优缺点

## SB 缺乏 页面以外对象 的 反链自动更新

比如，SiYuan 中的 Heading 可以自动更新其反链。

## SB 有 最小 Kernel 内核

| App | RAM | Tech |
|----------|----------|----------|
| SilverBullet | ~ 24 MB | Go + TS + Lua |
| RoamEdit | ~ 44 MB | Custom Web Stack ? |
| Workflowy | ~ 73 MB ? | Custom Web Stack ? |
| RoamResearch | - | Electron + ... |
| RemNote | - | Electron + ... |
| Tana | ~ 233 MB | Electron ? + ... |
| SiYuan | ~ 231 MB | Electron + Go + TS |
| AnyType | 170 ~ 330 MB | Electron + TS |
| LogSeq | ~ 230 MB | Electron + Clojure + TS |
| Orca | ~ 200 MB | Electron + ... |
| Obsidian | ~ 160 MB | Electron + TS ? |

# SiYuan 的 优缺点

## 思源的 Query

### 思源 缺乏 live query?

比如
- SB 的 query `${}` 或
- Tana 的 command node 

本体确实是缺乏的，但...有插件（准确地说是挂件）
- [widget query](https://github.com/Zuoqiu-Yingyi/widget-query) #github
- [dg0ln8](https://www.yuque.com/siyuannote/docs/dg0ln8) #yuque

#### 思源的插件是 js... 的

比如: https://github.com/OpaqueGlass/syplugin-fakeDocBreadcrumb
不像 SilverBullet 的插件，编译为了 TS，
但 SiYuan 本体用了很多 TS: https://github.com/siyuan-note/siyuan

### 思源的 全局 查询条件 “可保存” #类比

类似于 Orca、Logseq、SB、Tana、Anytype 的 查询块/节点

## 也可以 部署到 fly.io !

1. [siyuan](https://hub.docker.com/r/b3log/siyuan) #hub #docker
2. [20210725124311 ssp7qk4](https://www.yuque.com/siyuannote/docs/20210725124311-ssp7qk4) #yuque
3. [how_to_create_self_hosted_siyuan_to_enable_sync](https://www.reddit.com/r/selfhosted/comments/1fyepza/how_to_create_self_hosted_siyuan_to_enable_sync/) #reddit
   - [README.md](https://github.com/siyuan-note/siyuan/blob/master/README.md#docker-hosting) #github

- 内存占用 也很高（相对其自己的本地）
  - 相对 SB 应该超过了 fly.io 的免费 tier。
- 部署后，它暂时 不能被 只读地 查看

- 即这个不行：游客可以只读模式公开访问 (Siyuan 不行？RE 可以)
- 完整的内核功能，特别是反链（Siyuan RE 均可）
- 不同 node 不同 url (Siyuan 不行？RE 可以)

## 也有 git

1. [sy git sync plugin](https://github.com/xstarling/sy-git-sync-plugin/) #github

## 思源的 json 格式，尽管可以翻译为 md，但...

由于天生不是 .md，原样、实时地翻译为 html 的支持，没有 .md 好？ 
尽管 数据库 和 属性结构 层面，json 的表达能力和丰富程度要比 .md 好。

关于 ee2.. 加密的问题 [[github 同步 md 文件没有作用了，只能同步 SQLite 文件，但由于 SQLite 加密了⚓|github 同步 md 文件没有作用了，只能同步 SQLite 文件，但由于 SQLite 加密了🧑‍🤝‍🧑1]]${forthRef("github 同步 md 文件没有作用了，只能同步 SQLite 文件，但由于 SQLite 加密了")}${backRefs_noSelf("github 同步 md 文件没有作用了，只能同步 SQLite 文件，但由于 SQLite 加密了",1)}
- 思源全部开源，仅剩的可能的讨饭钱的方式：就靠这个赚钱呢！
- Logseq 即将推出的 DB 版，也是靠这个赚钱。
    - 尽管在自家 community 上，遭到自家用户的强烈反对，也反对无效。
- Tana 就不存在这个问题...因为它家全都是闭源的。
    - 从同步到数据格式再到...

Dinox 群里有提到 [[Daydream/IndexedDB Exporter v2.0.crx]] #crx <https://www.chajianxw.com/developer/57097.html> 可以解析 flomo 网页端 对应的 indexedDB，并导出 对应的 json 文件

linked to [how pass values input to a widget](https://community.silverbullet.md/t/how-pass-values-input-to-a-widget/3588/8?u=chenzhu-xie) #community #silverbullet
