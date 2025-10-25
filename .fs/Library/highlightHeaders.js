// file: _plug/highlightHeaders.js
export function initHighlightHeaders() {
  // 延迟确保 DOM 渲染完成
  setTimeout(() => {
    const headers = Array.from(document.querySelectorAll('.sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6'));
    if (!headers.length) return; // DOM 还没渲染，直接返回

    // 构建标题层级树
    const headerTree = headers.map((h, idx) => {
      const level = parseInt(h.className.match(/sb-line-h(\d)/)[1]);
      return { el:h, level, idx, parent:null };
    });
    headerTree.forEach((node,i)=>{
      for(let j=i-1;j>=0;j--){
        if(headerTree[j].level<node.level){ node.parent = headerTree[j]; break; }
      }
    });

    document.addEventListener('mousemove', e=>{
      headers.forEach(h=>h.classList.remove('sb-active'));

      let target = e.target;
      while(target && target!==document.body){
        if(target.classList && (target.classList.contains('sb-line-h1') ||
           target.classList.contains('sb-line-h2') ||
           target.classList.contains('sb-line-h3') ||
           target.classList.contains('sb-line-h4') ||
           target.classList.contains('sb-line-h5') ||
           target.classList.contains('sb-line-h6'))){
          break;
        }
        target = target.parentNode;
      }

      if(target){
        let node = headerTree.find(n=>n.el===target);
        while(node){ node.el.classList.add('sb-active'); node = node.parent; }
      }
    });
  }, 100); // 等 100ms 确保 DOM 渲染
}
