// PLUGS/xcz-highlight.ts
export const manifest = {
  name: "xcz-highlight",
  version: "0.2.0",
  description: "Self-contained heading highlight (no Library dependency)",
};

declare global {
  interface Window {
    xczHighlight?: {
      enable: (opts?: Partial<Options>) => void;
      disable: () => void;
      isEnabled: () => boolean;
    };
    __xhHighlightPlugState?: State;
  }
}

type Options = {
  containerSelector: string;
  headingSelector: string;
  groupSelector: string | null;
  debug: boolean;
};

type State = {
  root: Element;
  cleanup: () => void;
  options: Options;
};

const DEFAULTS: Options = {
  containerSelector: "#sb-main",
  headingSelector:
    ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6",
  groupSelector: ".sb-title-group", // 若不存在此分组容器，会回退到 container
  debug: false,
};

function getLevelFromClass(el: Element): number {
  for (let i = 1; i <= 6; i++) {
    if (el.classList.contains(`sb-line-h${i}`)) return i;
  }
  return 0;
}

function pickGroupRoot(
  startHeading: Element,
  containerRoot: Element,
  groupSelector: string | null
): Element {
  if (!groupSelector) return containerRoot;
  const g = (startHeading as HTMLElement).closest(groupSelector);
  return g || containerRoot;
}

function computeHighlightsByIndex(
  startHeading: Element,
  groupRoot: Element,
  headingSelector: string
): Element[] {
  const list = Array.from(groupRoot.querySelectorAll(headingSelector));
  const startIdx = list.indexOf(startHeading);
  if (startIdx === -1) return [];

  const result: Element[] = [startHeading];
  const startLevel = getLevelFromClass(startHeading);
  for (let i = startIdx + 1; i < list.length; i++) {
    const h = list[i];
    const lvl = getLevelFromClass(h);
    if (lvl <= startLevel) break; // 精确截断
    result.push(h);
  }
  return result;
}

function clearAllActive(root: Element) {
  root.querySelectorAll(".sb-active").forEach((el) => el.classList.remove("sb-active"));
}

function enableInternal(userOpts?: Partial<Options>) {
  const opts: Options = { ...DEFAULTS, ...(userOpts || {}) };

  // 若已启用则先清理（幂等）
  if (window.__xhHighlightPlugState?.cleanup) {
    try {
      window.__xhHighlightPlugState.cleanup();
    } catch {}
    window.__xhHighlightPlugState = undefined;
  }

  const bind = () => {
    const containerRoot = document.querySelector(opts.containerSelector);
    if (!containerRoot) {
      requestAnimationFrame(bind);
      return;
    }

    let lastHeading: Element | null = null;

    const onPointerOver = (e: Event) => {
      const target = e.target as Element | null;
      const h =
        target &&
        (target as HTMLElement).closest &&
        (target as HTMLElement).closest(opts.headingSelector);
      if (!h || !containerRoot.contains(h)) return;
      if (h === lastHeading) return;
      lastHeading = h as Element;

      const groupRoot = pickGroupRoot(h as Element, containerRoot, opts.groupSelector);
      clearAllActive(containerRoot);
      const highs = computeHighlightsByIndex(h as Element, groupRoot, opts.headingSelector);
      highs.forEach((el) => el.classList.add("sb-active"));

      if (opts.debug) {
        const txt = ((h as HTMLElement).textContent || "").trim().slice(0, 80);
        console.log("[xcz-highlight] heading:", txt, "level:", getLevelFromClass(h as Element), "count:", highs.length);
      }
    };

    const onPointerOut = (e: PointerEvent) => {
      const from =
        (e.target as HTMLElement)?.closest &&
        (e.target as HTMLElement).closest(opts.headingSelector);
      const to =
        (e.relatedTarget as HTMLElement | null)?.closest &&
        (e.relatedTarget as HTMLElement).closest(opts.headingSelector);
      if (from && (!to || !containerRoot.contains(to))) {
        lastHeading = null;
        clearAllActive(containerRoot);
      }
    };

    const onContainerLeave = () => {
      lastHeading = null;
      clearAllActive(containerRoot);
    };

    containerRoot.addEventListener("pointerover", onPointerOver);
    containerRoot.addEventListener("pointerout", onPointerOut);
    containerRoot.addEventListener("pointerleave", onContainerLeave);

    // 监听 DOM 变化，避免整块替换后状态失真（委托在 root，通常无需重绑）
    const mo = new MutationObserver(() => {
      lastHeading = null;
    });
    mo.observe(containerRoot, { childList: true, subtree: true });

    // 当 #sb-main 根节点被整体替换时，自动重绑
    const bodyMO = new MutationObserver(() => {
      const current = document.querySelector(opts.containerSelector);
      if (!current || current !== containerRoot) {
        // Root 被替换了：清理并重绑
        cleanup();
        enableInternal(opts);
      }
    });
    bodyMO.observe(document.body, { childList: true, subtree: true });

    const cleanup = () => {
      try {
        containerRoot.removeEventListener("pointerover", onPointerOver);
        containerRoot.removeEventListener("pointerout", onPointerOut);
        containerRoot.removeEventListener("pointerleave", onContainerLeave);
      } catch {}
      try {
        mo.disconnect();
      } catch {}
      try {
        bodyMO.disconnect();
      } catch {}
      clearAllActive(containerRoot);
    };

    window.__xhHighlightPlugState = { root: containerRoot, cleanup, options: opts };
    if (opts.debug) console.log("[xcz-highlight] enabled");
  };

  bind();
}

function disableInternal() {
  if (window.__xhHighlightPlugState?.cleanup) {
    try {
      window.__xhHighlightPlugState.cleanup();
    } catch {}
    window.__xhHighlightPlugState = undefined;
    console.log("[xcz-highlight] disabled");
  }
}

// 自动启动（仅在浏览器端）
if (typeof window !== "undefined") {
  const boot = () => {
    const root = document.querySelector(DEFAULTS.containerSelector);
    if (!root) return requestAnimationFrame(boot);
    enableInternal();
  };
  boot();

  // 暴露调试 API（可在浏览器控制台使用）
  window.xczHighlight = {
    enable: (opts?: Partial<Options>) => enableInternal(opts),
    disable: () => disableInternal(),
    isEnabled: () => !!window.__xhHighlightPlugState,
  };

  // 可选：快捷键切换（Ctrl/Cmd + Alt + H）
  window.addEventListener("keydown", (e) => {
    const mod = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey;
    if (mod && e.altKey && (e.key.toLowerCase() === "h")) {
      e.preventDefault();
      if (window.__xhHighlightPlugState) {
        disableInternal();
      } else {
        enableInternal();
      }
    }
  });
}