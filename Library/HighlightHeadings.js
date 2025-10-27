export function enableHighlight() {
  // 每次调用时动态选择 DOM，保证 SB UI 已渲染
  const container = document.querySelector("#sb-main"); 
  if (!container) return;

  const headings = container.querySelectorAll(
    ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6"
  );

  function getLevel(el) {
    for (let i = 1; i <= 6; i++) {
      if (el.classList.contains(`sb-line-h${i}`)) return i;
    }
    return 0;
  }

  headings.forEach(h => {
    h.addEventListener("pointerenter", () => {
      const currentLevel = getLevel(h);
      h.classList.add("sb-active");

      let sibling = h.nextElementSibling;
      while (sibling) {
        const siblingLevel = getLevel(sibling);
        if (siblingLevel === 0) { // 普通内容忽略
          sibling = sibling.nextElementSibling;
          continue;
        }
        if (siblingLevel <= currentLevel) break; // 遇到同级或更高级标题停止
        sibling.classList.add("sb-active");
        sibling = sibling.nextElementSibling;
      }
    });

    h.addEventListener("pointerleave", () => {
      headings.forEach(hh => hh.classList.remove("sb-active"));
    });
  });
}
