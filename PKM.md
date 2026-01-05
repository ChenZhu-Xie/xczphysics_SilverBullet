
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

[index.html](https://www.gnu.org/software/emacs/tour/index.html) #gnu [[emacs]] 或许也... 是 最终极的 PKM
- [[Vim]] + agent tools（操作文件们的手(脚架)） = [[emacs]] ?
  - [h1ixyxc](https://www.reddit.com/r/emacs/comments/nxxoeo/comment/h1ixyxc/?tl=zh-hans&utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) #reddit
- [emacs](https://emacs-china.org/t/emacs/9477/27) #emacs-china
- [logseq for code management](https://discuss.logseq.com/t/logseq-for-code-management/20743/3?u=xczphysics) #discuss #logseq
  - [[PKM/Apps/LogSeq|]] 里也可以运行 js 和 python [edit and run python code inside logseq itself](https://discuss.logseq.com/t/edit-and-run-python-code-inside-logseq-itself/20829?u=xczphysics) #discuss #logseq
  - 这有点像 SilverBullet 里可以运行 js 和 lua
  - 而 emacs 似乎可以在笔记中运行任何代码
    - 问题来了：我们需要在 笔记软件 里 造 IDE（像 LogSeq, SilverBullet 和 emacs）
    - 还是把 IDE 变成 笔记？（像 [author:Edison Qian] ）
