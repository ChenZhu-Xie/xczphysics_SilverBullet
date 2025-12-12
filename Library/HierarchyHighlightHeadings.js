// Library/HierarchyHighlightHeadings.js
// HHH v9-Positional Refactored
// Core: CodeMirror Position Mapping (No Fuzzy Matching)
// Solves: Inconsistent highlighting due to virtual scrolling

const STATE_KEY = "__xhHighlightState_v9_Pos";

// ==========================================
// 1. Model: 全量数据与层级计算
// ==========================================

const DataModel = {
  headings: [], // { level, start, end, text }
  lastText: null,

  // 获取全文
  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) { console.warn(e); }
    return "";
  },

  // 解析 Markdown，记录每个标题的起始位置 (pos)
  rebuildSync() {
    const text = this.getFullText();
    if (text === this.lastText && this.headings.length > 0) return; // 缓存命中

    this.lastText = text;
    this.headings = [];
    
    if (!text) return;

    // 使用带有 'd' (indices) 标志的正则需要较新浏览器，这里用通用方法
    const regex = /^(#{1,6})\s+([^\n]*)$/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      this.headings.push({
        index: this.headings.length,
        level: match[1].length,
        text: match[2].trim(),
        start: match.index, // 关键：记录在文档中的绝对偏移量
        end: match.index + match[0].length
      });
    }
  },

  // 根据文档位置 (pos) 查找对应的标题索引
  // 算法：找到 start <= pos 的最后一个标题
  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    // 二分查找优化 (或者简单的反向遍历，因为标题通常不多)
    for (let i = this.headings.length - 1; i >= 0; i--) {
      if (this.headings[i].start <= pos) {
        // 简单的容错：如果 pos 离得太远（比如在正文中），需确认是否属于该标题段落
        // 这里简化逻辑：只要在该标题下方，且未遇到下一个标题，就算该标题的范围
        // 但为了高亮准确性，我们通常只匹配标题行本身
        // 如果 pos > end，说明是在正文里。
        // *本功能需求*：Hover 标题行触发。所以 pos 应该在 start 和 end 之间 (或附近)
        if (pos <= this.headings[i].end + 1) { 
            return i; 
        }
        return -1; // 在正文中，不触发
      }
    }
    return -1;
  },

  // 核心逻辑：计算需要高亮的所有索引 (Self + Ancestors + Descendants)
  getFamilyIndices(targetIndex) {
    const indices = new Set();
    if (targetIndex < 0 || targetIndex >= this.headings.length) return indices;

    const target = this.headings[targetIndex];
    indices.add(targetIndex);

    // 1. 找祖先 (向前找 level 更小的)
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        indices.add(i);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }

    // 2. 找后代 (向后找，直到遇到 level <= target.level)
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break;
      indices.add(i);
    }

    return indices;
  },
  
  // 获取面包屑数据
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
// 2. View: 渲染与 DOM 操作
// ==========================================

const View = {
  containerId: "sb-frozen-container",

  getFrozenContainer() {
    let fc = document.getElementById(this.containerId);
    if (!fc) {
      fc = document.createElement("div");
      fc.id = this.containerId;
      fc.style.display = "none";
      document.body.appendChild(fc);
    }
    return fc;
  },

  // 渲染面包屑
  renderFrozenBar(targetIndex, container) {
    const fc = this.getFrozenContainer();
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
    
    crumbs.forEach(h => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      fc.appendChild(div);
    });

    if (container) {
      const rect = container.getBoundingClientRect();
      fc.style.left = (rect.left + 10) + "px";
    }
  },

  // 应用高亮样式
  applyHighlights(container, activeIndices) {
    // 1. 清除旧样式
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    // 2. 遍历当前可见的 DOM 标题
    // 关键：利用 CodeMirror API 获取每个 DOM 对应的 pos，再反查 Index
    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    visibleHeadings.forEach(el => {
      try {
        // 获取 DOM 元素在文档中的位置
        const pos = view.posAtDOM(el);
        // 查找其对应的 Model Index
        const idx = DataModel.findHeadingIndexByPos(pos);

        if (activeIndices.has(idx)) {
          el.classList.add("sb-active");
          
          // 区分类型
          if (idx === window[STATE_KEY].currentIndex) {
            el.classList.add("sb-active-current");
          } else {
             // 简单的逻辑判断是祖先还是后代
             const currentLevel = DataModel.headings[window[STATE_KEY].currentIndex].level;
             const thisLevel = DataModel.headings[idx].level;
             const thisIdx = idx;
             const mainIdx = window[STATE_KEY].currentIndex;
             
             if (thisIdx < mainIdx && thisLevel < currentLevel) el.classList.add("sb-active-anc");
             else el.classList.add("sb-active-desc");
          }
        }
      } catch (e) {
        // posAtDOM 可能会失败，忽略
      }
    });
  }
};

// ==========================================
// 3. Controller: 事件与状态
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

    // 状态
    window[STATE_KEY] = {
      currentIndex: -1,
      cleanup: null
    };

    // 核心更新函数
    function updateState(targetIndex) {
      // 性能优化：索引未变则不重绘
      if (targetIndex === window[STATE_KEY].currentIndex) return;
      
      window[STATE_KEY].currentIndex = targetIndex;

      if (targetIndex === -1) {
        View.applyHighlights(container, null);
        View.renderFrozenBar(-1);
        return;
      }

      // 计算全量关系 (Model)
      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      
      // 应用到局部 DOM (View)
      View.applyHighlights(container, familyIndices);
      View.renderFrozenBar(targetIndex, container);
    }

    // --- Event Handlers ---

    // 1. Hover Logic
    function onPointerOver(e) {
      // 必须是标题元素
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
        // 移出容器，清除高亮 (可选：也可以选择保持最后状态)
        updateState(-1);
      }
    }

    // 2. Scroll Logic (Sticky Header)
    let isScrolling = false;
    function handleScroll() {
      // 滚动时，我们基于视口顶部的 DOM 元素来判断
      // 找到第一个在视口内的标题
      // 也可以直接用 editorView.viewport.from 获取当前视口起始位置
      
      const viewportTopPos = client.editorView.viewport.from;
      
      // 找到距离 viewportTopPos 最近的上方标题
      // 在 Model 中找：start <= viewportTopPos 的最大索引
      DataModel.rebuildSync();
      
      let bestIdx = -1;
      // 简单的线性查找，因为是 Sticky 效果，找的是视口最上方的那个上下文
      // 注意：这里逻辑稍微不同，我们想高亮的是"当前正文所属的标题"
      for (let i = 0; i < DataModel.headings.length; i++) {
        if (DataModel.headings[i].start <= viewportTopPos + 100) { // +100 容差
          bestIdx = i;
        } else {
          break;
        }
      }

      // 如果鼠标正在 hover，不要让滚动覆盖 hover 的效果 (可选，看个人喜好)
      // 这里设定：如果鼠标不在 container 内，则响应滚动；否则响应 hover
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
    
    // 3. Mutation (CodeMirror 重新渲染 DOM 时保持高亮)
    const mo = new MutationObserver(() => {
        // DOM 结构变化（如滚动加载新行），需要重新应用当前状态的高亮
        if (window[STATE_KEY].currentIndex !== -1) {
           const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
           View.applyHighlights(container, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true });

    // Bind
    container.addEventListener("mouseover", onPointerOver); // mouseover 冒泡，pointerover 也行
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

    console.log("[HHH] v9-Positional Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
