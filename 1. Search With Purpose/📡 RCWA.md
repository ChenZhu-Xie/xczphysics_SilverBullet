
1. [ann transfermatrix jl a general 4 x 4 transfer matrix for optics of multilayer media](https://discourse.julialang.org/t/ann-transfermatrix-jl-a-general-4-x-4-transfer-matrix-for-optics-of-multilayer-media/89797/4) #discourse #julialang
   - 虽然可以从传输矩阵得到散射矩阵，但问题在于，如果传输矩阵是病态的，那么得到的散射矩阵可能非常不准确。
     - 更好的方法是使用雷德赫弗乘积逐层构建散射矩阵。
     - [ ] S 矩阵可以不通过 T 矩阵构建得到？
   - 传输矩阵的病态性 可以使用 S 矩阵避免？
     - [ ] 这意味着 线性晶体光学 Jordan 分解对应的 奇点 应该有救了？
     - 类似于 有篇文章说 n 中的 i 是正是负的问题，在无界或单侧边界条件的情况下，是无法解决的，但在 双侧边界条件 时，是自然解决的
   - [Redheffer_star_product](https://en.wikipedia.org/wiki/Redheffer_star_product) #en #wikipedia
   - https://math.mit.edu/~stevenj/
   - [Scombine.pdf](http://victorliu.info/pdfs/Scombine.pdf) #victorliu
   - [S4](https://web.stanford.edu/group/fan/S4/) #web #stanford
   - [694acc0c 1e18 8010 aa5a c024d1a187be](https://chatgpt.com/share/694acc0c-1e18-8010-aa5a-c024d1a187be) #chatgpt

2. 
