// Library/HierarchyHighlightHeadings.js
// HHH v10-FullContext
// 功能：
// 1. 鼠标悬浮/点击/编辑任意区域，自动高亮所属的父标题树。
// 2. 左上角显示祖先路径 (Breadcrumbs)。
// 3. 右下角显示当前块的子标题列表 (Children TOC)。

const STATE_KEY = "__xhHighlightState_v10";

// ==========================================
// 1. Model: 全量数据与层级计算
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

  // [修改] 根据文档位置 (pos) 查找“所属”的标题索引
  // 逻辑：找到 start <= pos 的最后一个标题
  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    if (this.headings.length === 0) return -1;

    // 如果位置在第一个标题之前，返回 -1 (导言区)
    if (pos < this.headings[0].start) return -1;

    // 二分查找或倒序遍历。由于数量不多，倒序遍历足够快
    for (let i = this.headings.length - 1; i >= 0; i--) {
      if (this.headings[i].start <= pos) {
        return i;
      }
    }
    return -1;
  },

  getFamilyIndices(targetIndex) {
    const indices = new Set();
    if (targetIndex < 0 || targetIndex >= this.headings.length) return indices;

    const target = this.headings[targetIndex];
    indices.add(targetIndex);

    // 1. 找祖先
    let currentLevel = target.level;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const h = this.headings[i];
      if (h.level < currentLevel) {
        indices.add(i);
        currentLevel = h.level;
        if (currentLevel === 1) break;
      }
    }

    // 2. 找后代 (用于高亮文档中的所有子孙)
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
  },

  // [新增] 获取当前标题的直接子级（用于右下角显示）
  getChildren(targetIndex) {
    if (targetIndex < 0 || targetIndex >= this.headings.length) return [];
    
    const children = [];
    const parent = this.headings[targetIndex];
    
    // 寻找该范围内，层级比父级大且最小的那个层级 (通常是 parent.level + 1)
    // 这里简化逻辑：只显示下一层级的标题
    // 如果想要显示所有子孙，逻辑会复杂一些，通常 TOC 只显示直属子级
    
    // 1. 确定子级的目标层级 (扫描直到遇到同级或更高级)
    let targetChildLevel = -1;
    
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= parent.level) break; // 超出范围

      // 找到第一个子元素，定为目标层级
      if (targetChildLevel === -1) {
        targetChildLevel = h.level;
      }

      // 只收集该层级的元素
      if (h.level === targetChildLevel) {
        children.push(h);
      }
    }
    return children;
  }
};

// ==========================================
// 2. View: 渲染与 DOM 操作
// ==========================================

const View = {
  topContainerId: "sb-frozen-breadcrumbs",
  bottomContainerId: "sb-frozen-toc",

  getContainer(id, isBottom) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.display = "none";
      el.style.position = "fixed";
      el.style.zIndex = "999";
      el.style.padding = "4px 8px";
      el.style.background = "var(--sb-background, #fff)";
      el.style.border = "1px solid var(--sb-border-color, #ddd)";
      el.style.borderRadius = "4px";
      el.style.fontSize = "12px";
      el.style.opacity = "0.9";
      el.style.pointerEvents = "none"; // 让鼠标穿透，不影响编辑

      if (isBottom) {
        el.style.bottom = "20px";
        el.style.right = "20px";
        el.style.textAlign = "right";
      } else {
        el.style.top = "0px"; // 初始位置，会被动态修改
        el.style.left = "0px";
      }
      
      document.body.appendChild(el);
    }
    return el;
  },

  // 渲染左上角面包屑
  renderBreadcrumbs(targetIndex, editorContainer) {
    const fc = this.getContainer(this.topContainerId, false);
    
    if (targetIndex === -1) {
      fc.style.display = "none";
      return;
    }

    const crumbs = DataModel.getBreadcrumbs(targetIndex);
    if (crumbs.length === 0) {
      fc.style.display = "none";
      return;
    }

    // 构建内容
    const html = crumbs.map(h => 
      `<span class="sb-frozen-item" style="margin-right:5px; color:var(--sb-primary, #666);">${h.text}</span>`
    ).join("<span style='color:#ccc'>/</span> ");
    
    fc.innerHTML = html;
    fc.style.display = "block";

    // 定位到编辑器左上角附近
    if (editorContainer) {
      const rect = editorContainer.getBoundingClientRect();
      fc.style.top = Math.max(0, rect.top) + 5 + "px";
      fc.style.left = (rect.left + 10) + "px";
    }
  },

  // [新增] 渲染右下角子标题列表
  renderChildrenToc(targetIndex) {
    const toc = this.getContainer(this.bottomContainerId, true);

    if (targetIndex === -1) {
      toc.style.display = "none";
      return;
    }

    const children = DataModel.getChildren(targetIndex);
    if (children.length === 0) {
      toc.style.display = "none";
      return;
    }

    // 构建内容
    toc.innerHTML = `<div style="font-weight:bold; margin-bottom:4px; font-size:10px; color:#999">SUB-SECTIONS</div>`;
    children.forEach(h => {
      const div = document.createElement("div");
      div.textContent = h.text;
      div.style.color = "var(--sb-text-color, #333)";
      toc.appendChild(div);
    });
    
    toc.style.display = "block";
  },

  applyHighlights(container, activeIndices) {
    // 清除旧样式
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    // 遍历可见标题
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
             if (idx < window[STATE_KEY].currentIndex && thisLevel < currentLevel) el.classList.add("sb-active-anc");
             else el.classList.add("sb-active-desc");
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
  const containerSelector = opts.containerSelector || "#sb-main";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container || !window.client || !client.editorView) {
      requestAnimationFrame(bind);
      return;
    }

    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    window[STATE_KEY] = {
      currentIndex: -2, // 初始值设为 -2 强制刷新
      cleanup: null
    };

    function updateState(targetIndex) {
      if (targetIndex === window[STATE_KEY].currentIndex) return;
      window[STATE_KEY].currentIndex = targetIndex;

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      
      View.applyHighlights(container, familyIndices);
      View.renderBreadcrumbs(targetIndex, container);
      View.renderChildrenToc(targetIndex);
    }

    // --- Core Logic: 从 Event 获取 Position ---
    function resolvePositionAndHighlight(e) {
      // 1. 获取文档位置
      let pos = null;
      try {
        // 如果是 CodeMirror 编辑器
        if (client.editorView) {
          // 如果是鼠标事件，使用 coordsAtPos 的逆向? 不，使用 posAtCoords
          if (e.type === 'mouseover' || e.type === 'click' || e.type === 'mouseup') {
             pos = client.editorView.posAtCoords({ x: e.clientX, y: e.clientY });
          } 
          // 如果是键盘事件，使用当前光标位置
          else if (e.type === 'keyup' || e.type === 'selectionchange') {
             pos = client.editorView.state.selection.main.head;
          }
        }
      } catch (err) { /* console.warn("Pos calc error", err); */ }

      if (pos === null) return;

      // 2. 查找对应的标题 Index
      const idx = DataModel.findHeadingIndexByPos(pos);
      
      // 3. 更新
      updateState(idx);
    }

    // --- Event Handlers ---
    
    // 1. 鼠标移动 (Hover)
    // 节流处理，避免过于频繁计算
    let hoverTimer = null;
    function onMouseOver(e) {
       // 检查是否在编辑器内容区域内
       if (!container.contains(e.target)) return;
       
       if (hoverTimer) cancelAnimationFrame(hoverTimer);
       hoverTimer = requestAnimationFrame(() => {
           resolvePositionAndHighlight(e);
       });
    }

    // 2. 点击与编辑 (Click / Keyup)
    // 同样适用于点击文本区域进行编辑的情况
    function onInteraction(e) {
        resolvePositionAndHighlight(e);
    }

    // 3. 离开编辑器区域
    function onMouseOut(e) {
      if (!container.contains(e.relatedTarget)) {
         // 可选：移出时是否保持最后的状态？
         // 如果希望移出时清空，取消注释下面这行：
         // updateState(-1);
      }
    }

    // 绑定监听器
    // 使用 capture: true 还是 false? 默认冒泡即可。
    container.addEventListener("mouseover", onMouseOver); 
    container.addEventListener("mouseup", onInteraction); // 点击定位光标
    container.addEventListener("keyup", onInteraction);   // 键盘打字/移动光标
    container.addEventListener("mouseout", onMouseOut);

    // Mutation Observer (处理文档内容变化)
    const mo = new MutationObserver(() => {
        // 重新构建索引并刷新高亮
        DataModel.lastText = null; // 强制刷新
        if (window[STATE_KEY].currentIndex !== -2) {
           // 尝试保留当前高亮，但索引可能变了，简单起见重算当前光标位置
           // 这里我们简单刷新一下视图
           const idx = window[STATE_KEY].currentIndex;
           const familyIndices = DataModel.getFamilyIndices(idx);
           View.applyHighlights(container, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true, characterData: true });

    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("mouseover", onMouseOver);
      container.removeEventListener("mouseup", onInteraction);
      container.removeEventListener("keyup", onInteraction);
      container.removeEventListener("mouseout", onMouseOut);
      mo.disconnect();
      
      View.applyHighlights(container, null);
      const topEl = document.getElementById(View.topContainerId);
      if (topEl) topEl.remove();
      const botEl = document.getElementById(View.bottomContainerId);
      if (botEl) botEl.remove();
      
      DataModel.headings = [];
    };

    console.log("[HHH] v10-FullContext Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
