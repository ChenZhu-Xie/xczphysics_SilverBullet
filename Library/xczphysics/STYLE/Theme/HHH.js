// Library/xczphysics/STYLE/Theme/HHH.js
// HHH v13.1 - 修复高亮闪烁与点击变暗问题

const STATE_KEY = "__xhHighlightState_v13";

// ==========================================
// 辅助函数
// ==========================================

async function centerCursor() {
  await new Promise(resolve => setTimeout(resolve, 50));
  try {
    if (globalThis.silverbullet && typeof globalThis.silverbullet.syscall === 'function') {
      await globalThis.silverbullet.syscall("editor.invokeCommand", "Navigate: Center Cursor");
      return true;
    }
  } catch (e) {}

  try {
    if (window.client && client.editorView) {
      const view = client.editorView;
      const cursorPos = view.state.selection.main.head;
      const coords = view.coordsAtPos(cursorPos);
      if (coords) {
        const viewRect = view.dom.getBoundingClientRect();
        const viewHeight = viewRect.height;
        const currentScrollTop = view.scrollDOM.scrollTop;
        const cursorRelativeY = coords.top - viewRect.top + currentScrollTop;
        const targetScrollTop = cursorRelativeY - viewHeight / 2;

        view.scrollDOM.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'instant'
        });
      }
      return true;
    }
  } catch (e) {}
  return false;
}

function navigateAndCenter(options) {
  if (!window.client) return;
  client.navigate(options);
  setTimeout(() => centerCursor(), 50);
}

// ==========================================
// 1. Model: 数据模型
// ==========================================

const DataModel = {
  headings: [],
  lastText: null,

  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) { console.warn(e); }
    return "";
  },

  rebuildSync() {
    const text = this.getFullText();
    // 即使文本变了，如果标题结构没变，我们在Controller层会做进一步判断
    // 这里主要负责解析
    if (text === this.lastText && this.headings.length > 0) return;

    this.lastText = text;
    this.headings = [];

    if (!text) return;

    const codeBlockRanges = [];
    const codeBlockRegex = /```[\s\S]*?```/gm;
    let blockMatch;
    while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
      codeBlockRanges.push({
        start: blockMatch.index,
        end: blockMatch.index + blockMatch[0].length
      });
    }

    const regex = /^(#{1,6})\s+([^\n]*)$/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const isInsideCodeBlock = codeBlockRanges.some(range =>
        matchIndex >= range.start && matchIndex < range.end
      );

      if (isInsideCodeBlock) continue;

      this.headings.push({
        index: this.headings.length,
        level: match[1].length,
        text: match[2].trim(),
        start: matchIndex,
        end: matchIndex + match[0].length
      });
    }
  },

  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    let bestIndex = -1;
    for (let i = 0; i < this.headings.length; i++) {
      if (this.headings[i].start <= pos) {
        bestIndex = i;
      } else {
        break;
      }
    }
    return bestIndex;
  },

  getFamilyIndices(targetIndex) {
    const indices = new Set();
    if (targetIndex < 0 || targetIndex >= this.headings.length) return indices;

    const target = this.headings[targetIndex];
    indices.add(targetIndex);

    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        indices.add(i);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }

    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break;
      indices.add(i);
    }

    return indices;
  },

  getAncestors(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [target];
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        list.unshift(h);
        currentLevel = h.level;
      }
    }
    return list;
  },

  getDescendants(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [];

    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break;
      list.push(h);
    }
    return list;
  }
};

// ==========================================
// 2. View: 视图渲染
// ==========================================

const View = {
  topContainerId: "sb-frozen-container-top",
  bottomContainerId: "sb-frozen-container-bottom",

  getContainer(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = "sb-frozen-container";
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.display = "none";
      el.style.pointerEvents = "auto";
      document.body.appendChild(el);
    }
    return el;
  },

  splitIntoColumns(items, itemHeight = 26) {
    const maxHeight = window.innerHeight * 0.45;
    const maxItemsPerCol = Math.max(3, Math.floor(maxHeight / itemHeight));

    const columns = [];
    for (let i = 0; i < items.length; i += maxItemsPerCol) {
      columns.push(items.slice(i, i + maxItemsPerCol));
    }
    return columns;
  },

  generateTreePrefix(level, baseLevel, isLast, parentIsLast = []) {
    if (level <= baseLevel) return "";
    let prefix = "";
    const depth = level - baseLevel;
    const SPACE = "\u00A0\u00A0";
    for (let i = 0; i < depth - 1; i++) {
      if (parentIsLast[i]) {
        prefix += "\u00A0" + SPACE;
      } else {
        prefix += "│" + SPACE;
      }
    }
    prefix += isLast ? "└─" : "├─";
    return prefix;
  },

  createHeadingItem(h, baseLevel, isLast, parentIsLast, index, total) {
    const wrapper = document.createElement("div");
    wrapper.className = "sb-frozen-item-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "2px";

    const treePrefix = this.generateTreePrefix(h.level, baseLevel, isLast, parentIsLast);
    if (treePrefix) {
      const prefixSpan = document.createElement("span");
      prefixSpan.className = "sb-frozen-tree-prefix";
      prefixSpan.textContent = treePrefix;
      prefixSpan.style.fontFamily = "monospace";
      prefixSpan.style.fontSize = "10px";
      prefixSpan.style.opacity = "0.5";
      prefixSpan.style.whiteSpace = "pre";
      wrapper.appendChild(prefixSpan);
    }

    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;

    const maxLen = 20;
    const shortText = h.text.length > maxLen ? h.text.substring(0, maxLen) + "…" : h.text;
    const fullText = h.text;

    div.textContent = shortText;
    div.title = fullText;
    div.dataset.fullText = fullText;
    div.dataset.shortText = shortText;

    div.style.cursor = "pointer";
    div.style.position = "relative";

    const levelIndicator = document.createElement("span");
    levelIndicator.className = "sb-frozen-level-indicator";
    levelIndicator.textContent = `H${h.level}`;
    div.appendChild(levelIndicator);

    div.addEventListener("mouseenter", () => {
      if (fullText !== shortText) {
        div.childNodes[0].textContent = fullText;
        div.classList.add("sb-frozen-expanded");
      }
    });

    div.addEventListener("mouseleave", () => {
      div.childNodes[0].textContent = shortText;
      div.classList.remove("sb-frozen-expanded");
    });

    div.onclick = (e) => {
      e.stopPropagation();
      if (window.client) {
        const pagePath = client.currentPath();
        navigateAndCenter({
          path: pagePath,
          details: { type: "header", header: h.text }
        });
      }
    };

    wrapper.appendChild(div);
    return wrapper;
  },

  computeParentIsLast(items, index, baseLevel) {
    const currentLevel = items[index].level;
    const result = [];
    for (let lvl = baseLevel + 1; lvl < currentLevel; lvl++) {
      let isLastAtThisLevel = true;
      for (let j = index + 1; j < items.length; j++) {
        if (items[j].level <= lvl) {
          isLastAtThisLevel = false;
          break;
        }
      }
      result.push(isLastAtThisLevel);
    }
    return result;
  },

  isLastSibling(items, index) {
    const currentLevel = items[index].level;
    for (let j = index + 1; j < items.length; j++) {
      if (items[j].level === currentLevel) return false;
      if (items[j].level < currentLevel) return true;
    }
    return true;
  },

  renderTopBar(targetIndex, container) {
    const el = this.getContainer(this.topContainerId);
    if (targetIndex === -1) {
      el.style.display = "none";
      return;
    }
    const list = DataModel.getAncestors(targetIndex);
    if (list.length === 0) {
      el.style.display = "none";
      return;
    }
    if (container) {
      const rect = container.getBoundingClientRect();
      el.style.left = (rect.left + 45) + "px";
      el.style.top = (rect.top + 30) + "px";
    }
    el.innerHTML = "";
    el.style.display = "flex";
    el.style.flexDirection = "row";
    el.style.gap = "8px";
    el.style.alignItems = "flex-start";

    const columns = this.splitIntoColumns(list);
    const baseLevel = 0;

    columns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-frozen-col";
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.alignItems = "flex-start";
      col.style.gap = "2px";

      if (colIndex === 0) {
        const label = document.createElement("div");
        label.textContent = "Context:";
        label.style.fontSize = "10px";
        label.style.opacity = "0.5";
        label.style.marginBottom = "2px";
        label.style.pointerEvents = "none";
        col.appendChild(label);
      } else {
        const spacer = document.createElement("div");
        spacer.textContent = "·";
        spacer.style.fontSize = "10px";
        spacer.style.opacity = "0.3";
        spacer.style.marginBottom = "2px";
        col.appendChild(spacer);
      }

      columnItems.forEach((h, idx) => {
        const globalIdx = colIndex * Math.ceil(list.length / columns.length) + idx;
        const isLast = this.isLastSibling(list, globalIdx);
        const parentIsLast = this.computeParentIsLast(list, globalIdx, baseLevel);
        col.appendChild(this.createHeadingItem(h, baseLevel, isLast, parentIsLast, idx, columnItems.length));
      });
      el.appendChild(col);
    });
  },

  renderBottomBar(targetIndex, container) {
    const el = this.getContainer(this.bottomContainerId);
    if (targetIndex === -1) {
      el.style.display = "none";
      return;
    }
    const list = DataModel.getDescendants(targetIndex);
    if (list.length === 0) {
      el.style.display = "none";
      return;
    }
    if (container) {
      const rect = container.getBoundingClientRect();
      el.style.left = (rect.left + 45) + "px";
      el.style.bottom = "30px";
      el.style.top = "auto";
    }
    el.innerHTML = "";
    el.style.display = "flex";
    el.style.flexDirection = "row";
    el.style.gap = "8px";
    el.style.alignItems = "flex-end";

    const baseLevel = DataModel.headings[targetIndex]?.level || 1;
    const columns = this.splitIntoColumns(list);

    columns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-frozen-col";
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.alignItems = "flex-start";
      col.style.gap = "2px";

      if (colIndex === 0) {
        const label = document.createElement("div");
        label.textContent = "Sub-sections:";
        label.style.fontSize = "10px";
        label.style.opacity = "0.5";
        label.style.marginBottom = "2px";
        label.style.pointerEvents = "none";
        col.appendChild(label);
      } else {
        const spacer = document.createElement("div");
        spacer.textContent = "·";
        spacer.style.fontSize = "10px";
        spacer.style.opacity = "0.3";
        spacer.style.marginBottom = "2px";
        col.appendChild(spacer);
      }

      columnItems.forEach((h, idx) => {
        const globalIdx = colIndex * Math.ceil(list.length / columns.length) + idx;
        const isLast = this.isLastSibling(list, globalIdx);
        const parentIsLast = this.computeParentIsLast(list, globalIdx, baseLevel);
        col.appendChild(this.createHeadingItem(h, baseLevel, isLast, parentIsLast, idx, columnItems.length));
      });
      el.appendChild(col);
    });
  },

  // 核心修复：使用 Diff 逻辑而非暴力重置，消除闪烁
  applyHighlights(container, activeIndices) {
    if (!window.client || !client.editorView) return;

    // 1. 计算当前时刻所有【应该】被高亮的元素及其对应的 Class
    const shouldBeActiveMap = new Map(); // Element -> Array<string> (classes)

    if (activeIndices && activeIndices.size > 0) {
      const view = client.editorView;
      // 查找视口内的所有标题元素
      const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");

      visibleHeadings.forEach(el => {
        try {
          const pos = view.posAtDOM(el);
          // +1 是为了确保落入标题范围内
          const idx = DataModel.findHeadingIndexByPos(pos + 1);

          if (idx !== -1 && activeIndices.has(idx)) {
            const h = DataModel.headings[idx];
            // 简单的位置校验，防止错位
            if (pos >= h.start - 50 && pos <= h.end + 50) {
              const classes = ["sb-active"];
              if (idx === window[STATE_KEY].currentIndex) {
                classes.push("sb-active-current");
              } else {
                const mainIdx = window[STATE_KEY].currentIndex;
                const currentLevel = DataModel.headings[mainIdx].level;
                if (idx < mainIdx && DataModel.headings[idx].level < currentLevel) {
                  classes.push("sb-active-anc");
                } else {
                  classes.push("sb-active-desc");
                }
              }
              shouldBeActiveMap.set(el, classes);
            }
          }
        } catch (e) {}
      });
    }

    // 2. 清理：找到当前有 sb-active 但【不应该】有的元素，移除 Class
    const currentActiveElements = container.querySelectorAll(".sb-active");
    currentActiveElements.forEach(el => {
      if (!shouldBeActiveMap.has(el)) {
        el.classList.remove("sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current");
      }
    });

    // 3. 应用：对【应该】高亮的元素，确保 Class 正确
    // 这样做避免了先 remove 再 add 造成的视觉闪烁
    shouldBeActiveMap.forEach((classes, el) => {
      // 先移除所有可能的状态子类，确保状态切换（如从 current 变为 anc）时正确
      el.classList.remove("sb-active-anc", "sb-active-desc", "sb-active-current");
      // 添加基础类和具体状态类
      el.classList.add(...classes);
    });
  }
};

// ==========================================
// 3. Controller
// ==========================================

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container || !window.client || !client.editorView) {
      requestAnimationFrame(bind);
      return;
    }

    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    window[STATE_KEY] = {
      currentIndex: -1,
      cleanup: null,
      updateTimeout: null
    };

    function updateState(targetIndex) {
      window[STATE_KEY].currentIndex = targetIndex;

      if (targetIndex === -1) {
        View.applyHighlights(container, null);
        View.renderTopBar(-1, container);
        View.renderBottomBar(-1, container);
        return;
      }

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      View.applyHighlights(container, familyIndices);
      View.renderTopBar(targetIndex, container);
      View.renderBottomBar(targetIndex, container);
    }

    function onPointerOver(e) {
      if (!container.contains(e.target)) return;
      try {
        const pos = client.editorView.posAtCoords({x: e.clientX, y: e.clientY});
        if (pos != null) {
          const idx = DataModel.findHeadingIndexByPos(pos);
          // 优化：只有当索引改变，且当前没有高亮时才触发（避免鼠标微动导致的重绘）
          // 但为了响应性，这里保留 idx 检查即可
          if (idx !== window[STATE_KEY].currentIndex) {
            updateState(idx);
          }
        }
      } catch (err) { }
    }

    function onCursorActivity(e) {
      if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
      window[STATE_KEY].updateTimeout = setTimeout(() => {
        try {
          const state = client.editorView.state;
          const pos = state.selection.main.head;
          const idx = DataModel.findHeadingIndexByPos(pos);

          // 核心修复：如果索引没有变化，不要强制刷新 UI
          // 这解决了点击高亮行时（光标移动但仍在同一行）发生的“变暗-变亮”闪烁
          if (idx === window[STATE_KEY].currentIndex) {
             // 即使索引没变，可能 DOM 被 CodeMirror 重绘了，
             // MutationObserver 会处理 DOM 丢失高亮的问题，所以这里直接返回
             return;
          }

          updateState(idx);
        } catch (e) {}
      }, 50);
    }

    let isScrolling = false;
    function handleScroll() {
      if (container.matches(":hover")) {
        isScrolling = false;
        return;
      }
      const viewportTopPos = client.editorView.viewport.from;
      const idx = DataModel.findHeadingIndexByPos(viewportTopPos + 50);

      // 滚动时同样增加检查，减少不必要的重绘
      if (idx !== window[STATE_KEY].currentIndex) {
        updateState(idx);
      }
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // MutationObserver 负责处理 CodeMirror 编辑导致的 DOM 重置
    const mo = new MutationObserver((mutations) => {
      // 只有在已经有激活索引时才检查
      if (window[STATE_KEY].currentIndex !== -1) {
        // 由于 applyHighlights 现在是增量更新（Diff），调用它是安全的且低成本的
        // 它会发现 CodeMirror 新生成的 DOM 节点没有 class，并补上，
        // 同时不会触碰那些未被修改的 DOM 节点，从而彻底解决编辑时的闪烁
        const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
        View.applyHighlights(container, familyIndices);
      }
    });
    mo.observe(container, { childList: true, subtree: true, attributes: false });

    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("click", onCursorActivity);
    container.addEventListener("keyup", onCursorActivity);
    window.addEventListener("scroll", onScroll, { passive: true });

    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("pointerover", onPointerOver);
      container.removeEventListener("click", onCursorActivity);
      container.removeEventListener("keyup", onCursorActivity);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);

      View.applyHighlights(container, null);
      const top = document.getElementById(View.topContainerId);
      const bot = document.getElementById(View.bottomContainerId);
      if (top) top.remove();
      if (bot) bot.remove();
      DataModel.headings = [];
    };

    console.log("[HHH] v13.1 Enabled (Flicker Fix)");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
