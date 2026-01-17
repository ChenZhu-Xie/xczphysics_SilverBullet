// Library/xczphysics/STYLE/Theme/HHH.js
// HHH v13 - 修复缩进 + 删除小方格

const STATE_KEY = "__xhHighlightState_v13";

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

  /**
   * 生成树状结构前缀
   * @param {number} level - 当前标题层级
   * @param {number} baseLevel - 基础层级
   * @param {boolean} isLast - 是否是该层级最后一个
   * @param {Array} parentIsLast - 父级是否为最后一个的数组
   */
  generateTreePrefix(level, baseLevel, isLast, parentIsLast = []) {
    if (level <= baseLevel) return "";
    
    let prefix = "";
    const depth = level - baseLevel;
    
    // 使用不间断空格确保宽度一致
    const SPACE = "\u00A0\u00A0"; // 两个不间断空格
    
    for (let i = 0; i < depth - 1; i++) {
      if (parentIsLast[i]) {
        prefix += SPACE + SPACE; // 父级是最后一个，用空白
      } else {
        prefix += "│" + SPACE; // 父级不是最后一个，用竖线
      }
    }
    
    // 最后一个连接符
    prefix += isLast ? "└─" : "├─";
    
    return prefix;
  },

  /**
   * 创建可悬浮展开的标题项
   */
  createHeadingItem(h, baseLevel, isLast, parentIsLast, index, total) {
    const wrapper = document.createElement("div");
    wrapper.className = "sb-frozen-item-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "2px";
    
    // 树状前缀
    const treePrefix = this.generateTreePrefix(h.level, baseLevel, isLast, parentIsLast);
    if (treePrefix) {
      const prefixSpan = document.createElement("span");
      prefixSpan.className = "sb-frozen-tree-prefix";
      prefixSpan.textContent = treePrefix;
      prefixSpan.style.fontFamily = "monospace";
      prefixSpan.style.fontSize = "10px";
      prefixSpan.style.opacity = "0.5";
      prefixSpan.style.whiteSpace = "pre"; // 保持空格
      wrapper.appendChild(prefixSpan);
    }
    
    // 标题按钮
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
    
    // 层级指示器（左下角小字）
    const levelIndicator = document.createElement("span");
    levelIndicator.className = "sb-frozen-level-indicator";
    levelIndicator.textContent = `H${h.level}`;
    div.appendChild(levelIndicator);
    
    // 悬浮展开
    div.addEventListener("mouseenter", () => {
      if (fullText !== shortText) {
        // 保留层级指示器
        div.childNodes[0].textContent = fullText;
        div.classList.add("sb-frozen-expanded");
      }
    });
    
    div.addEventListener("mouseleave", () => {
      div.childNodes[0].textContent = shortText;
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
    
    wrapper.appendChild(div);
    return wrapper;
  },

  /**
   * 计算 parentIsLast 数组
   */
  computeParentIsLast(items, index, baseLevel) {
    const currentLevel = items[index].level;
    const result = [];
    
    for (let lvl = baseLevel + 1; lvl < currentLevel; lvl++) {
      // 检查在这个层级，当前项之后是否还有同级或更高级的项
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

  /**
   * 检查是否是同级中的最后一个
   */
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
    const baseLevel = 0; // ancestors 从 1 级开始

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

    console.log("[HHH] v13 Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}