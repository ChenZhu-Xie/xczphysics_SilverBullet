
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


