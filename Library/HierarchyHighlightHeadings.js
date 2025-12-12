// Library/HierarchyHighlightHeadings.js
// HHH v8-Mixed Refactored
// Core: v8 (Clean Text/Source Mapping) + Triggers: v4 (Sticky/MutationObserver)
// Optimized for performance

const STATE_KEY = "__xhHighlightState_v8_Mixed";

// ==========================================
// 1. Model: 数据处理与缓存 (v8 Logic)
// ==========================================

const DataModel = {
  headings: [],
  lastText: null,

  // 获取全文 (CodeMirror)
  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) {
      console.warn("[HHH] getFullText failed:", e);
    }
    return "";
  },

  // 构建标题数据 (带缓存机制，避免滚动时重复解析)
  rebuildSync() {
    const text = this.getFullText();
    // 性能优化：如果文本未变，直接返回缓存
    if (text === this.lastText && this.headings.length > 0) {
      return;
    }

    this.lastText = text;
    if (!text) {
      this.headings = [];
      return;
    }

    const list = [];
    const regex = /^(#{1,6})\s+([^\n]*)$/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const rawText = match[2].trim();
      list.push({
        level: match[1].length,
        text: rawText,
        displayText: rawText // v8: Clean Text
      });
    }
    this.headings = list;
  },

  // 查找 DOM 对应的源码索引
  findIndexForDom(domH, domIndex) {
    this.rebuildSync(); // 确保数据最新

    // 1. 索引匹配 (假设顺序一致)
    if (domIndex >= 0 && domIndex < this.headings.length) {
      const candidate = this.headings[domIndex];
      const domLevel = DomUtils.getLevel(domH);
      if (candidate.level === domLevel) {
        return domIndex;
      }
    }

    // 2. 模糊匹配 (降级方案)
    const text = domH.innerText.trim();
    const level = DomUtils.getLevel(domH);
    for (let i = this.headings.length - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level === level) {
        if (h.text.includes(text) || text.includes(h.text)) return i;
      }
    }
    return -1;
  },

  // 获取面包屑分支
  getBranch(idx) {
    if (idx < 0 || idx >= this.headings.length) return null;
    const leaf = this.headings[idx];
    const ancestors = [];
    let currentLevel = leaf.level;

    for (let i = idx - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        ancestors.unshift(h);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }
    return { ancestors, leaf };
  }
};

// ==========================================
// 2. Utils: DOM 工具
// ==========================================

const DomUtils = {
  getLevel(el) {
    for (let i = 1; i <= 6; i++) {
      if (el.classList && el.classList.contains(`sb-line-h${i}`)) return i;
    }
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (/^h[1-6]$/.test(tag)) return Number(tag[1]);
    return 0;
  },

  listHeadings(root, selector) {
    // 过滤 Widget 内部标题
    const all = Array.from(root.querySelectorAll(selector));
    return all.filter(el => !el.closest(".sb-widget-array"));
  },

  collectAncestors(startIndex, headings, startLevel) {
    const res = [];
    let minLevel = startLevel;
    for (let i = startIndex - 1; i >= 0; i--) {
      const lvl = this.getLevel(headings[i]);
      if (lvl < minLevel) {
        res.unshift(headings[i]);
        minLevel = lvl;
        if (minLevel === 1) break;
      }
    }
    return res;
  },

  collectDescendants(startIndex, headings, startLevel) {
    const res = [];
    for (let i = startIndex + 1; i < headings.length; i++) {
      const lvl = this.getLevel(headings[i]);
      if (lvl <= startLevel) break;
      res.push(headings[i]);
    }
    return res;
  },

  findHeadingForElement(el, headings) {
    if (!el) return null;
    if (headings.includes(el)) return el;
    // v4: 从后往前找最近的上方标题
    for (let i = headings.length - 1; i >= 0; i--) {
      const h = headings[i];
      const pos = h.compareDocumentPosition(el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos === 0) {
        return h;
      }
    }
    return null;
  }
};

// ==========================================
// 3. View: 界面渲染 (v8 Logic)
// ==========================================

const View = {
  containerId: "sb-frozen-container",
  
  clearClasses(root) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    root.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));
  },

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

  clearFrozen() {
    const fc = document.getElementById(this.containerId);
    if (fc) {
      fc.innerHTML = "";
      fc.style.display = "none";
    }
  },

  updateFrozenBar(domHeading, domIndex, container) {
    const fc = this.getFrozenContainer();
    
    // 获取对应的数据源索引
    const idx = DataModel.findIndexForDom(domHeading, domIndex);

    if (idx === -1) {
      fc.style.display = "none";
      return;
    }

    const branch = DataModel.getBranch(idx);
    if (!branch) {
      fc.style.display = "none";
      return;
    }

    fc.innerHTML = "";
    fc.style.display = "flex";
    
    // 渲染面包屑
    [...branch.ancestors, branch.leaf].forEach(h => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.displayText; // Clean Text
      fc.appendChild(div);
    });
    
    // 定位处理
    if(container) {
        const cRect = container.getBoundingClientRect();
        fc.style.left = (cRect.left + 10) + "px";
    }
  }
};

// ==========================================
// 4. Controller: 主逻辑 (v4 Triggers)
// ==========================================

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector = opts.headingSelector || ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      requestAnimationFrame(bind);
      return;
    }

    // 清理旧实例
    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    // 状态管理
    let currentBranchInfo = null; 

    // 核心激活逻辑
    function setActiveBranch(headings, startIndex) {
      if (!headings || startIndex == null || startIndex < 0 || startIndex >= headings.length) {
        currentBranchInfo = null;
        View.clearClasses(container);
        View.clearFrozen();
        return;
      }

      const targetHeading = headings[startIndex];
      currentBranchInfo = { headings, startIndex };

      // 1. 计算 DOM 关系
      const level = DomUtils.getLevel(targetHeading);
      const ancestors = DomUtils.collectAncestors(startIndex, headings, level);
      const descendants = DomUtils.collectDescendants(startIndex, headings, level);

      // 2. 应用 CSS
      View.clearClasses(container);
      targetHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach(el => el.classList.add("sb-active", "sb-active-anc"));
      descendants.forEach(el => el.classList.add("sb-active", "sb-active-desc"));

      // 3. 渲染冻结栏 (v8)
      View.updateFrozenBar(targetHeading, startIndex, container);
    }

    // --- 事件监听 ---

    // 1. Hover
    function onPointerOver(e) {
      if (!e.target || !container.contains(e.target)) return;
      const headings = DomUtils.listHeadings(container, headingSelector);
      const h = DomUtils.findHeadingForElement(e.target, headings);
      
      if (!h) return;
      const startIndex = headings.indexOf(h);
      if (startIndex === -1) return;

      setActiveBranch(headings, startIndex);
    }

    // 2. Hover Out
    function onPointerOut(e) {
      const to = e.relatedTarget;
      if (!to || !container.contains(to)) {
        View.clearClasses(container);
        // 保留 v4 行为：不强制清除 Sticky Bar
      }
    }

    // 3. Scroll (Sticky Logic)
    let isScrolling = false;
    function handleScroll() {
      const headings = DomUtils.listHeadings(container, headingSelector);
      if (!headings.length) {
        View.clearFrozen();
        View.clearClasses(container);
        currentBranchInfo = null;
        isScrolling = false;
        return;
      }
    
      const triggerY = 40; 
      let currentIndex = -1;
    
      // 找到视口顶部的标题
      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= triggerY) {
          currentIndex = i;
        } else {
          if (currentIndex !== -1) break;
        }
      }
    
      if (currentIndex === -1) {
        View.clearFrozen();
        View.clearClasses(container);
        currentBranchInfo = null;
        isScrolling = false;
        return;
      }
    
      setActiveBranch(headings, currentIndex);
      isScrolling = false;
    }

    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // 4. MutationObserver
    const mo = new MutationObserver(() => {
        // DOM 变化时，强制刷新数据模型
        DataModel.rebuildSync(); 
        handleScroll();
    });
    mo.observe(container, { childList: true, subtree: true });

    // 绑定事件
    container.addEventListener("pointerover", onPointerOver);
    container.addEventListener("pointerout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    // 初始化
    handleScroll();

    // 注册销毁方法
    window[STATE_KEY] = {
      cleanup() {
        container.removeEventListener("pointerover", onPointerOver);
        container.removeEventListener("pointerout", onPointerOut);
        window.removeEventListener("scroll", onScroll);
        mo.disconnect();
        View.clearClasses(container);
        const fc = document.getElementById(View.containerId);
        if (fc) fc.remove();
        // 清理数据缓存
        DataModel.headings = [];
        DataModel.lastText = null;
      }
    };
    
    console.log("[HHH] v8-Mixed Refactored Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
