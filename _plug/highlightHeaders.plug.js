export function initHighlightHeaders() {
  setTimeout(() => {
    const headers = Array.from(document.querySelectorAll(
      '.sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6'
    ));
    if (!headers.length) return;

    const headerTree = headers.map((h) => {
      const levelMatch = h.className.match(/sb-line-h(\d)/);
      const level = levelMatch ? parseInt(levelMatch[1]) : 1;
      return { el: h, level, parent: null };
    });

    headerTree.forEach((node, i) => {
      for (let j = i - 1; j >= 0; j--) {
        if (headerTree[j].level < node.level) { node.parent = headerTree[j]; break; }
      }
    });

    document.addEventListener('mousemove', e => {
      headers.forEach(h => h.classList.remove('sb-active'));
      let target = e.target;
      while (target && target !== document.body) {
        if (target.classList && (
          target.classList.contains('sb-line-h1') ||
          target.classList.contains('sb-line-h2') ||
          target.classList.contains('sb-line-h3') ||
          target.classList.contains('sb-line-h4') ||
          target.classList.contains('sb-line-h5') ||
          target.classList.contains('sb-line-h6')
        )) break;
        target = target.parentNode;
      }

      if (target) {
        let node = headerTree.find(n => n.el === target);
        while (node) {
          node.el.classList.add('sb-active');
          node = node.parent;
        }
      }
    });
  }, 50);
}
