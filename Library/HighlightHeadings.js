export function enableHighlight() {
  const headings = document.querySelectorAll(
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
        if (siblingLevel === 0) {
          sibling = sibling.nextElementSibling;
          continue;
        }
        if (siblingLevel <= currentLevel) break;
        sibling.classList.add("sb-active");
        sibling = sibling.nextElementSibling;
      }
    });

    h.addEventListener("pointerleave", () => {
      headings.forEach(hh => hh.classList.remove("sb-active"));
    });
  });
}
