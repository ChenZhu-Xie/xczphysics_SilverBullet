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
       用了声笔就离开了双拼，也就离开了大词库/万象，比如墨奇
       但 S 紧跟的不是 Y 而是 P，则编码空间利用效率更高
  顶功
       似乎编码子方案，如 SPBB,SPB,SP,S、SBBB,SBB,SB 不同
       就可以在每个子方案接下一个任意子方案，都可以顶功
### 双拼 (SY..) +
https://www.zhihu.com/question/1941614246552133827
> 所有的四码上屏方案中，比如简单鹤的 媚 mwy 没有次选，但仍然 三码不上屏，为什么？
  - 因为不能够保证 后续第四码的加入，不会使得 mwyi 成为一个词（组）
    - 比如 mwyi 就是 “每一” 等等。
  - 实际上，只要 4 码内的有效填充率足够，是否 2,3 码就顶功，没区别。
    - 比如 qw 顶功后，就意味着后面没编码了：26^2^的排列组合就丢失了。
  - 但实际上，mwy<?> 的填充率并不高，所以如声笔输入法类似的顶功方案
    - 就直接丢弃最后一两码，3 码自动上屏。
    - 所以，声笔飞单的 21×21×5×5 本身是牺牲了编码范围来换取上屏速度
https://plutotree.me/2024/07/introduction-to-hamster-and-multi-device-data-synchronization/
       https://macroxue.github.io/shuangpin/eval.html
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
   汉心（3）
       https://hanxinma.github.io/longma/
       https://github.com/rimeinn/rime-zrlong
### 冰雪 (..)
   奇缘（4+）
       https://github.com/rimeinn/rime-snow-pinyin 音码缺点
       https://input.tansongchen.com/snow

## 形音 (...S)
https://chaifen.app/
https://www.zhihu.com/question/376022178/answer/3165035735
