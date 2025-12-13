// Library/HierarchyHighlightHeadings.js
// HHH v10-FullScope Refactored
// Features: 
// 1. Works on any text block (paragraph/list/etc), not just headings.
// 2. Top-Left: Ancestors (Breadcrumbs).
// 3. Bottom-Left: Descendants (Subtree).
// 4. Supports Hover, Click, and Typing (Cursor position).

const STATE_KEY = "__xhHighlightState_v10";

// ==========================================
// 1. Model: 数据与层级计算
// ==========================================

const DataModel = {
  headings: [], // { index, level, start, end, text }
  lastText: null,

  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) { console.warn(e); }
    return "";
  },

  // 解析 Markdown，记录标题位置
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

  // 核心修改：查找 pos 所属的标题范围（包含正文）
  // 逻辑：找到 start <= pos 的最后一个标题
  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    // 倒序查找，找到第一个在该位置之前的标题
    for (let i = this.headings.length - 1; i >= 0; i--) {
      if (this.headings[i].start <= pos) {
        return i;
      }
    }
    return -1; // 文档开头，无标题
  },

  // 获取高亮索引集合 (Self + Ancestors + Descendants)
  getFamilyIndices(targetIndex) {
    const indices = new Set();
    if (targetIndex < 0 || targetIndex >= this.headings.length) return indices;

    const target = this.headings[targetIndex];
    indices.add(targetIndex);

    // 1. 祖先
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        indices.add(i);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }

    // 2. 后代 (仅当前子树)
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break; // 遇到同级或更高级，停止
      indices.add(i);
    }

    return indices;
  },
  
  // 获取祖先链 (用于左上角)
  getAncestors(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [target];
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        list.unshift(h); // 放在前面
        currentLevel = h.level;
      }
    }
    return list;
  },

  // 获取子孙树 (用于左下角)
  getDescendants(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [];
    
    // 向下遍历，直到遇到 level <= target.level
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
        const h = this.headings[i];
        if (h.level <= target.level) break;
        list.push(h);
    }
    return list;
  }
};

// ==========================================
// 2. View: 渲染与 DOM 操作
// ==========================================

const View = {
  topContainerId: "sb-frozen-container",
  bottomContainerId: "sb-toc-container",

  // 创建或获取容器
  getContainer(id, isBottom) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.display = "none";
      el.style.position = "fixed";
      el.style.zIndex = "999";
      el.style.flexDirection = "column";
      el.style.alignItems = "flex-start";
      
      if (isBottom) {
          el.style.bottom = "10px";
          el.style.left = "10px";
          // 限制最大高度，防止挡住太多，允许滚动
          el.style.maxHeight = "40vh";
          el.style.overflowY = "auto";
          // 稍微透明一点背景，防止文字重叠看不清
          el.style.backgroundColor = "rgba(var(--bg-color), 0.8)";
          el.style.padding = "5px";
          el.style.borderRadius = "5px";
          el.style.pointerEvents = "none"; // 让鼠标穿透，不影响点击底部内容
      } else {
          // Top container logic is usually handled relative to parent in original script, 
          // but fixed is safer for "Left Top" requirement.
          el.style.top = "10px"; 
          el.style.left = "10px"; // 默认位置，会被 render 覆盖
      }
      
      document.body.appendChild(el);
    }
    return el;
  },

  // 渲染列表项
  renderItems(container, items) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
        container.style.display = "none";
        return;
    }
    container.style.display = "flex";
    
    items.forEach(h => {
      const div = document.createElement("div");
      // 复用原有样式
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      container.appendChild(div);
    });
  },

  // 主渲染入口
  renderPanels(targetIndex, mainContainer) {
    const topC = this.getContainer(this.topContainerId, false);
    const botC = this.getContainer(this.bottomContainerId, true);

    if (targetIndex === -1) {
      topC.style.display = "none";
      botC.style.display = "none";
      return;
    }

    // 1. 左上角：祖先
    const ancestors = DataModel.getAncestors(targetIndex);
    this.renderItems(topC, ancestors);
    
    // 定位左上角 (如果需要跟随容器)
    if (mainContainer) {
       const rect = mainContainer.getBoundingClientRect();
       topC.style.left = (rect.left + 10) + "px";
       topC.style.top = (rect.top + 10) + "px";
    }

    // 2. 左下角：子孙
    const descendants = DataModel.getDescendants(targetIndex);
    this.renderItems(botC, descendants);
    if (mainContainer) {
       const rect = mainContainer.getBoundingClientRect();
       botC.style.left = (rect.left + 10) + "px";
    }
  },

  // 应用高亮样式到编辑器正文
  applyHighlights(container, activeIndices) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    // 查找所有可能的行 (包括标题和普通文本，如果需要高亮普通文本所属块，逻辑会更复杂)
    // 这里保持原逻辑：只高亮标题行本身，但触发机制改为“在块内即触发”
    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    visibleHeadings.forEach(el => {
      try {
        const pos = view.posAtDOM(el);
        // 这里必须精确匹配标题的 Index
        // 因为 findHeadingIndexByPos 是模糊匹配，这里我们需要反向确认：
        // 这个 DOM 元素是不是那个标题
        
        // 简单做法：利用 pos 再查一次，看是不是刚好落在标题行范围内
        // 或者更简单：DataModel.headings 里找 start 接近 pos 的
        const idx = DataModel.findHeadingIndexByPos(pos);
        
        // 注意：findHeadingIndexByPos 返回的是该 pos *所属* 的标题。
        // 对于标题行本身，它所属的标题就是它自己。
        
        if (idx !== -1 && activeIndices.has(idx)) {
          // 只有当这个 DOM 确实是该标题本身时才高亮 (避免误伤)
          // 检查: DOM 的 pos 是否与 heading[idx].start 大致匹配
          const h = DataModel.headings[idx];
          if (Math.abs(h.start - pos) < 10) { // 容差
              el.classList.add("sb-active");
              
              if (idx === window[STATE_KEY].currentIndex) {
                el.classList.add("sb-active-current");
              } else {
                 const currentLevel = DataModel.headings[window[STATE_KEY].currentIndex].level;
                 const thisLevel = h.level;
                 if (idx < window[STATE_KEY].currentIndex && thisLevel < currentLevel) el.classList.add("sb-active-anc");
                 else el.classList.add("sb-active-desc");
              }
          }
        }
      } catch (e) {}
    });
  }
};

// ==========================================
// 3. Controller: 事件与状态
// ==========================================

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || ".cm-scroller"; // CodeMirror 滚动容器

  const bind = () => {
    // 尝试获取编辑器容器
    const container = document.querySelector(containerSelector) || document.querySelector("#sb-main");
    
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

      const contentEl = document.querySelector(".cm-content"); // 实际内容区域

      if (targetIndex === -1) {
        View.applyHighlights(contentEl, null);
        View.renderPanels(-1, container);
        return;
      }

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      View.applyHighlights(contentEl, familyIndices);
      View.renderPanels(targetIndex, container);
    }

    // --- Action Handlers ---

    // 1. 通用位置处理器 (根据 Pos 更新)
    function handlePos(pos) {
        const idx = DataModel.findHeadingIndexByPos(pos);
        updateState(idx);
    }

    // 2. 鼠标悬浮 (Hover)
    function onPointerOver(e) {
      // 修改：不仅仅是标题，任何内容行 (.cm-line) 都可以触发
      const target = e.target.closest(".cm-line"); 
      if (!target) return;

      try {
        const pos = client.editorView.posAtDOM(target);
        handlePos(pos);
      } catch (err) { }
    }

    // 3. 鼠标/键盘交互 (Click & Edit)
    // 监听鼠标抬起(点击完成) 和 键盘抬起(输入完成/光标移动)
    function onInteraction(e) {
        try {
            // 获取当前光标位置
            const state = client.editorView.state;
            const pos = state.selection.main.head;
            handlePos(pos);
        } catch(err) {}
    }

    // 4. 滚动逻辑 (保持 Sticky 效果)
    let isScrolling = false;
    function handleScroll() {
      // 如果鼠标在编辑器内，优先响应鼠标 Hover/Selection
      // 如果不在，则根据视口顶部显示
      if (container.matches(":hover")) return;

      const viewportTop = client.editorView.viewport.from;
      const idx = DataModel.findHeadingIndexByPos(viewportTop + 50);
      updateState(idx);
      isScrolling = false;
    }
    function onScroll() {
      if (!isScrolling) {
        window.requestAnimationFrame(handleScroll);
        isScrolling = true;
      }
    }

    // Bind Events
    // 使用 capture 确保尽早捕获
    container.addEventListener("mouseover", onPointerOver); 
    container.addEventListener("mouseup", onInteraction); // 点击定位
    container.addEventListener("keyup", onInteraction);   // 打字/光标移动定位
    
    // 监听全局滚动 (通常在 window 或 scroller 上)
    window.addEventListener("scroll", onScroll, { passive: true, capture: true }); 

    // MutationObserver: 当文档结构剧烈变化时重绘
    const mo = new MutationObserver(() => {
        if (window[STATE_KEY].currentIndex !== -1) {
           const contentEl = document.querySelector(".cm-content");
           const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
           View.applyHighlights(contentEl, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true });

    // Cleanup
    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("mouseover", onPointerOver);
      container.removeEventListener("mouseup", onInteraction);
      container.removeEventListener("keyup", onInteraction);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      
      const topC = document.getElementById(View.topContainerId);
      const botC = document.getElementById(View.bottomContainerId);
      if (topC) topC.remove();
      if (botC) botC.remove();
      
      View.applyHighlights(document.querySelector(".cm-content"), null);
      DataModel.headings = [];
    };

    console.log("[HHH] v10-FullScope Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
