const STATE_KEY = "__xhHighlightState_v2";

function getLevel(el) {
  for (let i = 1; i <= 6; i++) {
    if (el.classList && el.classList.contains(`sb-line-h${i}`)) return i;
  }
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (/^h[1-6]$/.test(tag)) return Number(tag[1]);
  return 0;
}

function pickGroupRoot(start, container, groupSelector) {
  if (!groupSelector) return container;
  const g = start.closest(groupSelector);
  return g || container;
}

function listHeadings(root, headingSelector) {
  return Array.from(root.querySelectorAll(headingSelector));
}

function collectDescendants(startIndex, headings, startLevel) {
  const res = [];
  for (let i = startIndex + 1; i < headings.length; i++) {
    const lvl = getLevel(headings[i]);
    if (lvl <= startLevel) break;
    res.push(headings[i]);
  }
  return res;
}

function collectAncestors(startIndex, headings, startLevel) {
  const res = [];
  let minLevel = startLevel;
  for (let i = startIndex - 1; i >= 0; i--) {
    const lvl = getLevel(headings[i]);
    if (lvl < minLevel) {
      res.push(headings[i]);
      minLevel = lvl;
      if (minLevel === 1) break;
    }
  }
  return res;
}

function clearClasses(root) {
  root.querySelectorAll(".sb-active, .sb-active-anc, .sb-active-desc, .sb-active-current")
      .forEach(el => el.classList.remove("sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"));
}

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector = opts.headingSelector ||
    "h1, h2, h3, h4, h5, h6, .sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";
  const groupSelector = opts.groupSelector || ".sb-title-group";
  const debug = !!opts.debug;

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) { requestAnimationFrame(bind); return; }

    const prev = window[STATE_KEY];
    if (prev && prev.cleanup) prev.cleanup();

    function onPointerOver(e) {
      const h = e.target && e.target.closest && e.target.closest(headingSelector);
      if (!h || !container.contains(h)) return;

      const groupRoot = pickGroupRoot(h, container, groupSelector);
      const headings = listHeadings(groupRoot, headingSelector);
      const startIndex = headings.indexOf(h);
      if (startIndex === -1) return;

      clearClasses(container);

      const startLevel = getLevel(h);
      const descendants = collectDescendants(startIndex, headings, startLevel);
      const ancestors = collectAncestors(startIndex, headings, startLevel);

      h.classList.add("sb-active", "sb-active-current");
      descendants.forEach(el => el.classList.add("sb-active", "sb-active-desc"));
      ancestors.forEach(el => el.classList.add("sb-active", "sb-active-anc"));

      if (debug) {
        console.log(
          "[HHH] level", startLevel,
          "anc", ancestors.length,
          "desc", descendants.length,
          "text:", (h.textContent || "").trim().slice(0, 60)
        );
      }
    }

    function onPointerOut(e) {
      const from = e.target && e.target.closest && e.target.closest(headingSelector);
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(headingSelector);
      if (from && (!to || !container.contains(to))) {
        clearClasses(container);
      }
    }

    function onPointerLeave() {
      clearClasses(container);
    }

    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerout", onPointerOut);
    container.addEventListener("pointerleave", onPointerLeave);

    const mo = new MutationObserver(() => { clearClasses(container); });
    mo.observe(container, { childList: true, subtree: true });

    window[STATE_KEY] = {
      cleanup() {
        try {
          container.removeEventListener("pointerover", onPointerOver);
          container.removeEventListener("pointerout", onPointerOut);
          container.removeEventListener("pointerleave", onPointerLeave);
        } catch {}
        try { mo.disconnect(); } catch {}
        clearClasses(container);
      }
    };

    if (debug) console.log("[HHH] enabled");
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) st.cleanup();
  window[STATE_KEY] = null;
}