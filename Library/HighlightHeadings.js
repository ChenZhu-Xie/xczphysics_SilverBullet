const STATE_KEY = "__xhHighlightState";

function getLevelFromClass(el) {
  for (let i = 1; i <= 6; i++) {
    if (el.classList.contains(`sb-line-h${i}`)) return i;
  }
  return 0;
}

function computeHighlights(startHeading, root, headingSelector) {
  const highlights = [];
  const startLevel = getLevelFromClass(startHeading);
  if (startLevel === 0) return highlights;

  highlights.push(startHeading);
  let node = startHeading.nextElementSibling;
  while (node) {
    // Only consider heading lines
    if (node.matches && node.matches(headingSelector)) {
      const lvl = getLevelFromClass(node);
      if (lvl === 0) {
        node = node.nextElementSibling;
        continue;
      }
      // stop on same or higher level
      if (lvl <= startLevel) break;
      highlights.push(node);
    }
    node = node.nextElementSibling;
  }
  return highlights;
}

function clearAllActive(root) {
  root.querySelectorAll(".sb-active").forEach(el => el.classList.remove("sb-active"));
}

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector =
    opts.headingSelector ||
    ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";

  const bind = () => {
    const root = document.querySelector(containerSelector);
    if (!root) {
      // Try again next frame until UI is ready
      requestAnimationFrame(bind);
      return;
    }

    // Idempotent: cleanup previous
    const prev = window[STATE_KEY];
    if (prev && prev.cleanup) prev.cleanup();

    let lastHeading = null;

    function onPointerOver(e) {
      const h = e.target && e.target.closest && e.target.closest(headingSelector);
      if (!h || !root.contains(h)) return;
      if (h === lastHeading) return;
      lastHeading = h;

      clearAllActive(root);
      // Highlight the heading and its descendants until next heading of equal/higher level
      computeHighlights(h, root, headingSelector).forEach(el => el.classList.add("sb-active"));
    }

    function onPointerOut(e) {
      // If leaving a heading to a non-heading (or outside), clear
      const from = e.target && e.target.closest && e.target.closest(headingSelector);
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(headingSelector);
      if (from && (!to || !root.contains(to))) {
        lastHeading = null;
        clearAllActive(root);
      }
    }

    function onContainerLeave() {
      lastHeading = null;
      clearAllActive(root);
    }

    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerout", onPointerOut);
    root.addEventListener("pointerleave", onContainerLeave);

    // Minimal observer — if the whole page content is swapped out, just forget lastHeading
    const mo = new MutationObserver(() => {
      lastHeading = null;
      // No need to rebind because we delegate on root
    });
    mo.observe(root, { childList: true });

    window[STATE_KEY] = {
      root,
      cleanup() {
        try {
          root.removeEventListener("pointerover", onPointerOver);
          root.removeEventListener("pointerout", onPointerOut);
          root.removeEventListener("pointerleave", onContainerLeave);
        } catch (e) {}
        try { mo.disconnect(); } catch (e) {}
        clearAllActive(root);
      }
    };
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) {
    st.cleanup();
    window[STATE_KEY] = null;
  }
}
