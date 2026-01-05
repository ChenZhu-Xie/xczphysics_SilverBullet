
# Start from 🤖 Edison Qian

Tana #WX群 里 [author:Edison Qian] 说
- 最终极的 PKM 工具 和 工作流 应该就是 各种 files + [[Antigravity]] 这样的 agent tools + MCP servers integrated [[1. Search With Purpose/📑 IDEs|]]
  - 搜索它 搜索得快
    - 对象：无结构 纯文本
    - 工具：毕竟本身就是拿来写代码的
  - 编辑它 编辑得快（全文替换）
    - [[PKM/Apps/Obsidian|Obsidian]] 只有全库搜索 (支持正则)，没有全库替换 [author:Edison Qian] 
  - 读全库（应该没问题吧？如果能塞下大代码库的话，作为知识库的第二大脑又算得了什么呢）RAG 找联系 又厉害
    - 但不能读得太频繁了：如果每个 page 都类似 [[PKM/Apps/SilverBullet]] 的 `renderTopWidget` 那样读一次全库，找出 [[PKM/Apps/Tana/Related Content]]...
    - 这意味着 ==人造的 wiki== 仍然是 有用的
      - 作为 绝对关联路径 形成的 ==“图骨架”==
      - 作为 数据结构 近似 在内存中 连续分布，以使 查询成本 极低
  - 总结、联想等功能只需要说一说就可以生成...
虎鲸 #WX群 里也提到了类似的 #PKM 工具：[author:Wilfred]
  - [KnowNote](https://github.com/MrSibe/KnowNote) #github
  - [WitNote](https://github.com/hooosberg/WitNote) #github

## Ultimate PKM tool + method

### tool

[index.html](https://www.gnu.org/software/emacs/tour/index.html) #gnu [[emacs]] 或许也... 是 最终极的 PKM
- [[Vim]] + agent tools（操作文件们的手(脚架)） = [[emacs]] ?
  - [h1ixyxc](https://www.reddit.com/r/emacs/comments/nxxoeo/comment/h1ixyxc/?tl=zh-hans&utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) #reddit
- [emacs](https://emacs-china.org/t/emacs/9477/27) #emacs-china
- [logseq for code management](https://discuss.logseq.com/t/logseq-for-code-management/20743/3?u=xczphysics) #discuss #logseq
  - [[PKM/Apps/LogSeq|]] 里也可以运行 js 和 python [edit and run python code inside logseq itself](https://discuss.logseq.com/t/edit-and-run-python-code-inside-logseq-itself/20829?u=xczphysics) #discuss #logseq
  - 这有点像 SilverBullet 里可以运行 js 和 lua
  - 而 [[PKM/ecosystem/emacs|emacs]] 似乎可以在笔记中运行任何代码
    - 问题来了：我们需要在 笔记软件 里 造 [[1. Search With Purpose/📑 IDEs|IDE]]（像 LogSeq, SilverBullet 和 [[PKM/ecosystem/emacs|emacs]]）
    - 还是把 [[1. Search With Purpose/📑 IDEs|IDE]] 变成 笔记？（像 [author:Edison Qian] ）

### method

AI回答正文里的❓ → AI回答可以看做一种"AI推送" → 我在"AI推送"中获得灵感 → 提出新问题 → AI根据新问题继续推送 → 我不感兴趣的回答，就不会再提问，AI也就不会再"推送"
- 他这个 ==打嵌入笔记的❓来标记 ai 推送信息流 + Antigravity `ctrl I 直接更改选择的文本内容，并将 AI 生成的文本 用 ^[A]^ 来与自己手写的 内容 区分开来（便于提炼转换成自己的表述后，后续 清除 AI 内容？）`== 的 方法挺好
  - 1. 不需要（像 Github 和 Antigravity `ctrl L`）那样去手动选择范围 #L23-L32 ，而是用 一个（或 2 个）定界符（这就有点像 [[🤔 Daydream/‼️Non-MarkDown|]]）来标定 问句（的同时提供问句的上下文），来让 LLM 一次性回答多个问题，或关注/注意多个焦点/重点。
    2. 不需要 像 Antigravity `ctrl L` 将内容单独 多项选择到 聊天界面，然后将返回的聊天内容，再（多次）复制粘贴到 笔记.md 内部

agent回一次回答所有问题，实测问几十个问题，一次agent合起来回答个几万字都可以

#### 原则：正文里提问，正文里回答
写作时严格遵守原则，不能用右侧chat窗口或agent manager里直接提问

绿色提问和部分主要回答是人写的，提问必须以❓结尾，不含❓的内容AI全部忽略，红框是AI对❓的回答，

==系统提示词==与上述要求配套

就是如果用Antigravity打开Obsidian库的话，你提问，他会在Obsidian库里查参考你写过的笔记内容，至于像NotebookLM那种溯源到原文的链接，就要自己==系统提示词==里要求，默认是不放来源链接的

##### 在正文里用❓提问 → AI正文里回答
与在chat窗口提问 → AI在chat窗口回答，
- 其实回答内容差不多，主要区别是:

正文里的问题本身就是有树形结构的，回答(比喻为苹果吧)也是挂在相应问题的树枝下面，提问直接出文章，就可以发布到论坛/知乎/公众号/视频文案，

chat就是聊天流水账，给自己解惑可以，如果想变成正经文章发布，需要复制粘贴编辑，这极大的增加了写作摩擦力，结果就是我们用chat app(例如ChatGPT)大部分的chat，哪怕是很精彩的问答，都懒得整理成文章

chat严重违反"爽经济"力的"低摩擦爽"原则
- 参考那些爽应用(高多巴胺应用），摩擦力都非常低
- 例如抖音的摩擦力就是划一下

所以我坚持不用chat app，或者Antigravity里的chat窗口写作，
- 这种聊天，很容易人写的字数占比过低，一般只有1%~10%，甚至一篇文章除了标题都是AI写的，这种即质量平庸，发布了也没有成就感

###### 我研究试验自控力方法很多年，纯自由时间里，只有两个方法能有效对抗高多巴胺活动诱惑，

Ⓐ物理隔离，比如跑到小区户外/公园里，带个不装娱乐app的手机语音识别写作（用 Spokenly + Obsidian，tana 语音，voicenote 等 ）
这个方法简单有效，因为户外除了语音写作，基本啥也干不了

缺点：
严重受季节，天气，时段，地点影响，比如现在太冷了就不行，夏天太热也不行，夏天蚊子太多的地方也不行
只有写作，没有整理，手机那么小屏幕，能录长文就不错了，整理长文不现实

> **note** Note
> 物理隔离的本质就是打不过就躲，带个只语音识别app和笔记app的"准老年机"，别的啥也干不了。写语音笔记，总比啥也不干无聊有意思多了

Ⓑ最近开发的"AI爽写法"
这个方法基本原理就是与其他高多巴胺活动，正面硬刚
以毒攻毒，以爽战爽，以更高的多巴胺释放水平，战胜现有的高多巴胺活动(B站抖音等）

完全在相同的平台(电脑)上，硬把B站抖音怼下去
这与"Ⓐ方案物理隔离，躲的方法"虽然某个阶段可能结果相似，例如春秋季适合户外的时候
但心理感受是完全不同的，正面硬刚的胜利给人带来自信心爆棚，躲开对手的胜，其实下次遇到对手还是打怵


