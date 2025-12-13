// Library/HierarchyHighlightHeadings.js
// HHH v9-Positional Refactored (UI Restored to Editor-Inside)
// Core: CodeMirror Position Mapping (No Fuzzy Matching)

const STATE_KEY = "__xhHighlightState_v9_Pos";

// ==========================================
// 1. Model: 全量数据与层级计算 (逻辑保持不变)
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

    const regex = /^(#{1,6})\s+([^\n]*)$/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      this.headings.push({
        index: this.headings.length,
        level: match[1].length,
        text: match[2].trim(),
        start: match.index,
        end: match.index + match[0].length
      });
    }
  },

  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    for (let i = this.headings.length - 1; i >= 0; i--) {
      if (this.headings[i].start <= pos) {
        if (pos <= this.headings[i].end + 1) { 
            return i; 
        }
        return -1;
      }
    }
    return -1;
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
  
  getBreadcrumbs(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const crumbs = [target];
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        crumbs.unshift(h);
        currentLevel = h.level;
      }
    }
    return crumbs;
  }
};

// ==========================================
// 2. View: 渲染与 DOM 操作 (UI 修改重点)
// ==========================================

const View = {
  containerId: "sb-frozen-container",

  // 修改：接收 container 参数，将元素放入编辑器内部
  getFrozenContainer(container) {
    let fc = document.getElementById(this.containerId);
    if (!fc) {
      fc = document.createElement("div");
      fc.id = this.containerId;
      
      // ============================================================
      // [样式自定义区域] 恢复旧代码样式的核心部分
      // ============================================================
      fc.style.position = "absolute"; // 回归编辑器内部定位
      fc.style.top = "10px";          // 距离编辑器顶部
      fc.style.left = "20px";         // 距离编辑器左侧
      fc.style.zIndex = "100";
      fc.style.display = "none";
      fc.style.flexDirection = "row";
      fc.style.gap = "5px";
      fc.style.pointerEvents = "none"; // 允许点击穿透

      // 容器外观 (使用 SB 变量以适应主题，或在此处填入具体颜色)
      fc.style.padding = "4px 8px";
      fc.style.borderRadius = "6px";
      fc.style.backgroundColor = "var(--sb-background-color)"; 
      fc.style.border = "1px solid var(--sb-border-color)";
      fc.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      
      // 如果需要特定的旧版颜色，请取消注释并修改下方代码：
      // fc.style.backgroundColor = "#ffffff"; 
      // fc.style.color = "#333333";

      // 关键：挂载到 container (编辑器) 而不是 body
      if (container) {
        container.appendChild(fc);
        // 确保父容器有定位上下文
        const style = window.getComputedStyle(container);
        if (style.position === 'static') {
            container.style.position = 'relative';
        }
      } else {
        document.body.appendChild(fc);
      }
    }
    return fc;
  },

  renderFrozenBar(targetIndex, container) {
    // 传递 container 以便挂载
    const fc = this.getFrozenContainer(container);
    
    if (targetIndex === -1) {
      fc.style.display = "none";
      return;
    }

    const crumbs = DataModel.getBreadcrumbs(targetIndex);
    if (crumbs.length === 0) {
      fc.style.display = "none";
      return;
    }

    fc.innerHTML = "";
    fc.style.display = "flex";
    
    crumbs.forEach((h, index) => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      
      // 子项样式 (面包屑)
      div.style.fontSize = "0.85em";
      div.style.fontFamily = "var(--sb-font-family-ui)";
      div.style.color = "var(--sb-primary-text-color)";
      div.style.opacity = "0.9";
      
      // 添加分隔符
      if (index < crumbs.length - 1) {
          div.style.marginRight = "4px";
          div.style.borderRight = "1px solid var(--sb-border-color)";
          div.style.paddingRight = "8px";
      }

      fc.appendChild(div);
    });

    // 移除旧代码中的 rect 计算，因为现在是 absolute inside container，位置自动固定
  },

  applyHighlights(container, activeIndices) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    visibleHeadings.forEach(el => {
      try {
        const pos = view.posAtDOM(el);
        const idx = DataModel.findHeadingIndexByPos(pos);

        if (activeIndices.has(idx)) {
          el.classList.add("sb-active");
          if (idx === window[STATE_KEY].currentIndex) {
            el.classList.add("sb-active-current");
          } else {
             const currentLevel = DataModel.headings[window[STATE_KEY].currentIndex].level;
             const thisLevel = DataModel.headings[idx].level;
             const thisIdx = idx;
             const mainIdx = window[STATE_KEY].currentIndex;
             
             if (thisIdx < mainIdx && thisLevel < currentLevel) el.classList.add("sb-active-anc");
             else el.classList.add("sb-active-desc");
          }
        }
      } catch (e) {}
    });
  }
};

// ==========================================
// 3. Controller: 事件与状态 (逻辑保持不变)
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
      cleanup: null
    };

    function updateState(targetIndex) {
      if (targetIndex === window[STATE_KEY].currentIndex) return;
      
      window[STATE_KEY].currentIndex = targetIndex;

      if (targetIndex === -1) {
        View.applyHighlights(container, null);
        View.renderFrozenBar(-1, container);
        return;
      }

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      View.applyHighlights(container, familyIndices);
      View.renderFrozenBar(targetIndex, container);
    }

    // --- Event Handlers ---

    function onPointerOver(e) {
      const target = e.target.closest(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
      if (!target || !container.contains(target)) return;

      try {
        const pos = client.editorView.posAtDOM(target);
        const idx = DataModel.findHeadingIndexByPos(pos);
        if (idx !== -1) {
          updateState(idx);
        }
      } catch (err) { console.warn(err); }
    }

    function onPointerOut(e) {
      const to = e.relatedTarget;
      if (!to || !container.contains(to)) {
        updateState(-1);
      }
    }

    let isScrolling = false;
    function handleScroll() {
      const viewportTopPos = client.editorView.viewport.from;
      DataModel.rebuildSync();
      
      let bestIdx = -1;
      for (let i = 0; i < DataModel.headings.length; i++) {
        if (DataModel.headings[i].start <= viewportTopPos + 100) {
          bestIdx = i;
        } else {
          break;
        }
      }

      if (!container.matches(":hover")) {
          updateState(bestIdx);
      }
      
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }
    
    const mo = new MutationObserver(() => {
        if (window[STATE_KEY].currentIndex !== -1) {
           const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
           View.applyHighlights(container, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true });

    container.addEventListener("mouseover", onPointerOver);
    container.addEventListener("mouseout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("mouseover", onPointerOver);
      container.removeEventListener("mouseout", onPointerOut);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      View.applyHighlights(container, null);
      const fc = document.getElementById(View.containerId);
      if (fc) fc.remove();
      DataModel.headings = [];
    };

    console.log("[HHH] v9-Positional (Inside Editor) Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
