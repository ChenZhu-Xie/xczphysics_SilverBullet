document.addEventListener("DOMContentLoaded", () => {
  const headings = document.querySelectorAll(
    ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6"
  );

  function getLevel(el) {
    for (let i = 1; i <= 6; i++) {
      if (el.classList.contains(`sb-line-h${i}`)) return i;
    }
    return 0;
  }

  headings.forEach((heading) => {
    heading.addEventListener("mouseenter", () => {
      const currentLevel = getLevel(heading);
      heading.classList.add("sb-active");

      // 高亮直属子标题
      let sibling = heading.nextElementSibling;
      while (sibling) {
        const siblingLevel = getLevel(sibling);
        if (siblingLevel === 0) { // 普通内容不改变
          sibling = sibling.nextElementSibling;
          continue;
        }
        if (siblingLevel <= currentLevel) break; // 遇到同级或更高级标题停止
        sibling.classList.add("sb-active");
        sibling = sibling.nextElementSibling;
      }
    });

    heading.addEventListener("mouseleave", () => {
      // 移除所有 sb-active
      headings.forEach((h) => h.classList.remove("sb-active"));
    });
  });
});
