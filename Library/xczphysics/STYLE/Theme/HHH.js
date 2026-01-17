// Library/xczphysics/STYLE/Theme/HHH.js
// HHH v12 - 分列 + 悬浮展开
// 1. Feature: 超过半屏高度时自动分列
// 2. Feature: 标题初始宽度限制，悬浮展开

const STATE_KEY = "__xhHighlightState_v12";

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
    if (text === this.lastText && this.headings.length > 0) return;

    this.lastText = text;
    this.headings = [];
    
    if (!text) return;

    // 1. 预先扫描所有代码块的范围
    const codeBlockRanges = [];
    const codeBlockRegex = /```[\s\S]*?```/gm;
    let blockMatch;
    while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
      codeBlockRanges.push({
        start: blockMatch.index,
        end: blockMatch.index + blockMatch[0].length
      });
    }

    // 2. 扫描标题
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

  /**
   * 将项目列表分成多列
   */
  splitIntoColumns(items, itemHeight = 26) {
    const maxHeight = window.innerHeight * 0.45;
    const maxItemsPerCol = Math.max(3, Math.floor(maxHeight / itemHeight));
    
    const columns = [];
    for (let i = 0; i < items.length; i += maxItemsPerCol) {
      columns.push(items.slice(i, i + maxItemsPerCol));
    }
    return columns;
  },

  /**
   * 创建可悬浮展开的标题项
   */
  createHeadingItem(h, baseLevel = 1) {
    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;
    
    // 截断显示文本
    const maxLen = 20;
    const shortText = h.text.length > maxLen ? h.text.substring(0, maxLen) + "…" : h.text;
    const fullText = h.text;
    
    div.textContent = shortText;
    div.title = fullText;
    div.dataset.fullText = fullText;
    div.dataset.shortText = shortText;
    
    div.style.margin = "1px 0";
    div.style.cursor = "pointer";
    
    // 缩进
    if (baseLevel > 0) {
      const indent = (h.level - baseLevel) * 10;
      if (indent > 0) {
        div.style.marginLeft = `${indent}px`;
      }
    }
    
    // 悬浮展开
    div.addEventListener("mouseenter", () => {
      if (fullText !== shortText) {
        div.textContent = fullText;
        div.classList.add("sb-frozen-expanded");
      }
    });
    
    div.addEventListener("mouseleave", () => {
      div.textContent = shortText;
      div.classList.remove("sb-frozen-expanded");
    });
    
    // 点击导航
    div.onclick = (e) => {
      e.stopPropagation();
      if (window.client) {
        const pagePath = client.currentPath();
        client.navigate({
          path: pagePath,
          details: { type: "header", header: h.text }
        });
      }
    };
    
    return div;
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

    // 分列
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

      columnItems.forEach(h => {
        col.appendChild(this.createHeadingItem(h, 1));
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

    // 分列
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

      columnItems.forEach(h => {
        col.appendChild(this.createHeadingItem(h, baseLevel));
      });

      el.appendChild(col);
    });
  },

  applyHighlights(container, activeIndices) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    visibleHeadings.forEach(el => {
      try {
        const pos = view.posAtDOM(el);
        const idx = DataModel.findHeadingIndexByPos(pos + 1);
        
        if (idx !== -1 && activeIndices.has(idx)) {
          const h = DataModel.headings[idx];
          if (pos >= h.start - 50 && pos <= h.end + 50) {
            el.classList.add("sb-active");
            if (idx === window[STATE_KEY].currentIndex) {
              el.classList.add("sb-active-current");
            } else {
              const mainIdx = window[STATE_KEY].currentIndex;
              const currentLevel = DataModel.headings[mainIdx].level;
              if (idx < mainIdx && DataModel.headings[idx].level < currentLevel) {
                el.classList.add("sb-active-anc");
              } else {
                el.classList.add("sb-active-desc");
              }
            }
          }
        }
      } catch (e) {}
    });
  }
};

// ==========================================
// 3. Controller: 事件控制
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
          if (idx !== window[STATE_KEY].currentIndex || !document.querySelector(".sb-active")) {
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
      updateState(idx);
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }
    
    const mo = new MutationObserver((mutations) => {
      if (window[STATE_KEY].currentIndex !== -1) {
        const activeEl = container.querySelector(".sb-active");
        if (!activeEl) {
          const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
          View.applyHighlights(container, familyIndices);
        }
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

    console.log("[HHH] v12 Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}