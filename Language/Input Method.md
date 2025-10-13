# 总览

https://urime.rika.link/
https://rime.im/download/
https://dieken.gitlab.io/posts/chinese-input-methods/
https://zhuanlan.zhihu.com/p/682623014
https://emacs-china.org/t/topic/17068/7?page=9
https://aituyaa.com/rime_jk-%E6%8C%87%E5%B0%96%E4%B8%8A%E7%9A%84%E6%97%8B%E5%BE%8B/
https://notes.tansongchen.com/%E6%B1%89%E5%AD%97%E4%BF%A1%E6%81%AF%E5%B7%A5%E7%A8%8B/
https://aituyaa.com/%E8%BE%93%E5%85%A5%E6%B3%95%E4%B9%8B%E4%B8%BA%E4%BB%80%E4%B9%88%E5%9C%A8%E6%89%93%E5%8D%95%E7%9A%84%E8%B7%AF%E4%B8%8A%E4%B8%80%E8%B7%AF%E7%8B%82%E5%A5%94/

## 纯形 (PPPP)
https://www.zhihu.com/question/1941614246552133827 纯形的劣势
https://input.tansongchen.com/philosophy.html 纯形的劣势
https://docs.qq.com/doc/DTGVmVVJrQW9Zb21x 纯形的劣势

  奕码
       https://yb6b.github.io/yima/
       https://yb6b.github.io/yima/easy-code/ime.html
  虎码
       https://www.tiger-code.com/
       https://www.tiger-code.com/docs/basicStrokes
       https://sspai.com/post/83376
       https://pwa.sspai.com/post/89733
       https://www.zhihu.com/question/66377726
       https://zhuanlan.zhihu.com/p/648413519
       https://zhuanlan.zhihu.com/p/1941970013050349228
  性能
       https://chaifen.app/501VZ6lBH/assembly
       https://chaifen.app/501VZ6lBH/statistics2
## 音形 (包括 S... SY..)
约定：==音码== 包含 ==音形== 和 ==音调== 
https://www.zhihu.com/question/1941614246552133827 音码的好处
https://input.tansongchen.com/philosophy.html 音码的好处
https://docs.qq.com/doc/DTGVmVVJrQW9Zb21x 音码的好处
### 声笔 (S...)
  优劣
       用了声笔就离开了双拼，也就离开了大词库/万象，比如墨奇
       但 S 紧跟的不是 Y 而是 P，则编码空间利用效率更高
  顶功
       似乎编码子方案，如 SPBB,SPB,SP,S、SBBB,SBB,SB 不同
       就可以在每个子方案接下一个任意子方案，都可以顶功：S 充当分隔 _
  
### 双拼 (SY..) +
最强双拼：乱序飞猫 https://macroxue.github.io/shuangpin/eval.html
https://plutotree.me/2024/07/introduction-to-hamster-and-multi-device-data-synchronization/
> 所有的四码上屏方案中，比如简单鹤的 媚 mwy 没有次选，但仍然 三码不上屏，为什么？
  - 因为不能够保证 后续第四码的加入，不会使得 mwyi 成为一个词（组）
    - 比如 mwyi 就是 “每一” 等等。
  - 实际上，只要 4 码内的有效填充率足够，是否 2,3 码就顶功，没区别。
    - 比如 qw 顶功后，就意味着后面没编码了：26^2^的排列组合就丢失了。
  - 但实际上，mwy<?> 的填充率并不高，所以如声笔输入法类似的顶功方案
    - 就直接丢弃最后一两码，3 码自动上屏。
    - 所以，声笔飞单的 21×21×5×5 本身是牺牲了编码范围来换取上屏速度？
#### 部首 (PP)
  官鹤
       https://www.flypy.cc/ix/?q=%25E7%25A6%25BA
       https://aituyaa.com/%E5%B0%8F%E9%B9%A4%E5%8F%8C%E6%8B%BC%E5%8F%8A%E9%9F%B3%E5%BD%A2/
  简单鹤
       https://flauver.github.io/jdh/
       https://github.com/rimeinn/rime-JDhe
       https://www.zhihu.com/question/549135035

#### 笔画 (BB..)
  星空键道
       https://xkinput.github.io/
       https://ispoto.github.io/KeySoul/
       https://github.com/wzxmer/xkjd6-rime#%E4%BA%8C%E4%BA%86%E8%A7%A3%E9%94%AE%E9%81%93 但竟用笔画！没部首！
       https://ding.tansongchen.com/tutorial/collection/mixed/sbfx#%E7%A6%BB%E6%95%A3%E8%83%BD%E5%8A%9B 两个笔画弱于一个部首！@飞单
       https://github.com/hugh7007/xmjd6-rere 有点像声笔的 aeuio
       https://www.zhihu.com/question/517260176/answer/2426589323
       https://book.xuesong.io/jiandao-primer/
  性能（非常好看 > 声笔 > 虎码 ≈ 简单鹤，whose 作者也曾入过虎码教）
       https://chaifen.app/HResG3qHm/assembly
       https://chaifen.app/HResG3qHm/statistics2
#### 任意 (BP)
  墨奇 双拼+辅码 混搭 + 大词库
       https://github.com/gaboolic/rime-shuangpin-fuzhuma
       https://moqiyinxing.chunqiujinjing.com/index/mo-qi-yin-xing-shuo-ming/fu-zhu-ma-shuo-ming/mo-qi-ma-chai-fen-shuo-ming
       https://moqiyinxing.chunqiujinjing.com/index/mo-qi-yin-xing-gao-ji-gong-neng/u-zhi-jie-shu-ru-unicode-zi-fu
       https://github.com/gaboolic/rime-shuangpin-fuzhuma/wiki/%E5%A2%A8%E5%A5%87%E7%A0%81%E6%8B%86%E5%88%86%E8%A7%84%E5%88%99
## 音调 (SỲ..) +
https://github.com/hugh7007/xmjd6-rere#%E6%98%9F%E7%8C%AB%E9%94%AE%E9%81%93%E5%88%9D%E8%A1%B7 音码劣势
### 龙码 (PP)
   汉心（3）- 像「飞猫」一样，「声、韵」都乱外，还加了乱「调」
       https://hanxinma.github.io/longma/
       https://github.com/rimeinn/rime-zrlong
### 冰雪 (..)
   奇缘（4+）
       https://github.com/rimeinn/rime-snow-pinyin 音码缺点
       https://input.tansongchen.com/snow
       https://input.tansongchen.com
       https://beta.input.tansongchen.com/snow-qingyun/basic
   性能
       https://input.tansongchen.com/snow4/evaluation
       https://chaifen.app/lVoqxYB3D/statistics2
       https://chaifen.app/lVoqxYB3D/assembly

## 形音 (...S)
https://chaifen.app/
https://www.zhihu.com/question/376022178/answer/3165035735


# 整句 1
> - 在当今信息社会，我们大家都需要使用输入法这一重要工具。

1. 声笔（飞单/飞码）
> - z\_ di jr xr xz sne hu , w\_ mr de jo dv xve yx sre yu scu rp fd zl y\_ zvu yx gh jbi .
- z_ dijr xrxz snhu , wm' dj' dv xy' sryu srfd zl_ y_ zvyx ghjba

2. 五笔
> - d\_ iv\_ wynb wy\_ thn\_ py\_ wf\_ , q\_ wu\_ dd\_ pe\_ ftjb fdm\_ s\_ wgkq et\_ lwg\_ ty\_ if\_ p\_ g\_ tgj\_ s\_ a\_ hw\_ .

3. 小鹤音形（字/词）
> - z\_ dh\_ jb\_ xbr\_ xiz\_ uep\_ hv\_ , w\_ mf\_ da\_ jxb\_ dz\_ xu\_ yc\_ uir\_ ys\_ uui\_ r\_ fa\_ v\_ y\_ isp\_ yc\_ gsa\_ juq\_ .
 - z_ dhjb xbxi uehv , womf dajx dz_ xuyc uiys urfa v_ y_ vsyc gsju

4. 墨奇（词/万象）
 - z_ dhjb xbxi uehv , womf dajx dzxu yc_ uiys urf. v_ y. vsyc gsju
 - zd dhjb xbxi uehv , womf dajx dzxu yc  uiysuurufave yi vsyc gsju

5. 简单鹤（词）
 - z_ dhjb xbxi uehv , womf dajx d x  y_  uiys urf. v_ y_ vsyc gsju

## 对比
> - z\_dijrxrxzsnehu,w\_mrdejodvxveyxsreyuscurpfdzly\_zvuyxghjbi.
> - d\_iv\_wynbwy\_thn\_py\_wf\_,q\_wu\_dd\_pe\_ftjbfdm\_s\_wgkqet\_lwg\_ty\_if\_p\_g\_tgj\_s\_a\_hw\_.
> - z\_dh\_jb\_xbr\_xiz\_uep\_hv\_,w\_mf\_da\_jxb\_dz\_xu\_yc\_uir\_ys\_uui\_r\_fa\_v\_y\_isp\_yc\_gsa\_juq\_.
 - 飞码 z_dijrxrxzsnhu,wm'dj'dvxy'sryusrfdzl_y_zvyxghjba
 - 小鹤 z_dhjbxbxiuehv,womfdajxdz_xuycuiysurfav_y_vsycgsju
 - 墨奇 z_dhjbxbxiuehv,womfdajxdzxuyc_uiysurf.v_y.vsycgsju
 - 万象 zddhjbxbxiuehv,womfdajxdzxuycuiysuurufaveyivsycgsju
 - 简单 z_dhjbxbxiuehv,womfdajxdxy_uiysurf.v_y_vsycgsju

# 整句 2 对比
>- P C  上 的 希 腊   字 母  和 数 学 符 号  怎么 打
- 飞单 si d\_ xjuluae zgamza h\_ swoxx fpuhke zxm' df_
- 飞码 si db xj lva  zg mz  h_ sw xx fp hk  zxms df_
- 小鹤 uh_d_ xi la   zi mu  h_ uu xt fu hc  zfme daf_
- 墨奇 uh de xi la   zi mu  h_ uu xt fu hc  zfme daf_
- 万象 uh de xi la   zi mu  he uu xt fu hc  zfme da
- 简单 u; d_ xi la   zi mu  h_ uu xt fu hc  zfme daj_

# 整句 3 对比
>- 充满希望的跋涉比到达目的地更能给人乐趣。
- 冰雪 ymxs;bveaaebiddaemdd\_gneegreolqaa.
- 简单 im;xw_d_baueb;dcdamdd;ggnggwrflequ
- 飞码 cmxwd_bzsdabh_d;emddtghnsgar_lxqz_

# 整句 4 对比
> - 床头柜上放着一只旧玩具熊，是我五岁生日时妈妈送我的。玩具熊是棕色的，身上的毛有些脱落了，眼睛也掉了一只，我用纽扣给它补上了。小时候，我每天都抱着玩具熊睡觉，不管去哪里，都要带着它。有次玩具熊不小心弄丢了，我哭了好久，最后爸爸在小区的草丛里找到了它，我抱着玩具熊，开心得不得了。后来我长大了，不再像小时候那样依赖玩具熊，却还是把它放在床头柜上。每次看到玩具熊，都能想起小时候的事情，想起妈妈送我玩具熊时的笑容，想起爸爸帮我找玩具熊的身影。这只旧玩具熊，是我童年的伙伴，陪伴我度过了很多快乐的时光，也见证了我的成长。
![[Language/Input Method/声笔飞码.jpeg]]

![[Language/Input Method/冰雪四拼.jpeg]]

![[Language/Input Method/简单鹤.jpeg]]

![[Language/Input Method/小鹤.jpeg]]

# 结论

选重：     冰雪四拼 ~ 小鹤 < 飞码 ~ 简单鹤
平均码长： 飞码 < 冰雪四拼 ~ 简单鹤 < 小鹤
拆字：     飞码 ~ 小鹤（左右上下）简单鹤（笔顺）
> 先拆:「这」飞码 ~ 小鹤「辶」简单鹤「文」

飞码、小鹤、墨奇的 字根有序，尽管飞码二码就会遇到 想字根的问题
简单鹤 的 乱序字根 很伤脑子，尽管    三码才会遇到 想字根的问题

飞码、小鹤、简单鹤 的作者，都有点偏执：飞码 < 简单鹤 ~ 小鹤
>       小鹤确实很强，说 实话  （但偏执的人的作品一般却很好）
> 小鹤  xnheqtuihfql，uo_uihx ← 由于四码定长的铁则 uuhx = 书画
  飞码  xihnqssghcqa，ssho_   ← SSS 三字词的第三码 S 非 B，因此非字

飞系  是先用常见字（声笔字、二简字、三简字）填满小空间，
      再去慢悠悠扩大字词编码，顺理成章字、词效率最高
>       但「慢悠悠」小鹤：myyz 赢，飞码 myyx_ 输
      
声笔的规则很多，所以不容易被自己的规则限制死：逢山开路
>                 sjyr ← 比如部首取大优先，即使部首「斤j人r」在后面
>     （小鹤好像也有该规则：视觉人性化，快速捕捉到关键特征）
      这使得它能够在自己的高容错规则下，最大程度上填满编码空间
>               ngu ← 三简字的编码 SPB 没用到，就分配给词了                                                以及合理化一切无理编码

声笔、墨奇 都 同时维护 多个方案，精力分散，但方案间容易取长补短
> 飞码 一旦学到 飞单 的 二码起顶，几乎就已经宣告天下 共  主
                                                     gbe zw
                                                     ↑ 三码顶的技术
       SPBS 肯定不是词 SPSP 而是字，所以自动断词分字为 SPB + S
>     （注意，其中的 P 也可能是 B）

冰雪四拼 和 


冰雪清韵 单字的 标准码 1，不是该字的 声母 S，而是字根的 S，这... 
冰雪清韵 词组的 标准编码，没什么大的变化，仍然是 SSS..。
https://beta.input.tansongchen.com/snow-qingyun/basic.html

