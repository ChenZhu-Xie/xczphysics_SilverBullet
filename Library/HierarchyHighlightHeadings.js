// Library/HierarchyHighlightHeadings.js
// HHH v10-FullScope & DualNav
// 1. Hover/Edit anywhere triggers hierarchy
// 2. Top-Left: Ancestors (Breadcrumbs)
// 3. Bottom-Left: Descendants (Subtree)

const STATE_KEY = "__xhHighlightState_v10";

// ==========================================
// 1. Model: 数据模型
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

    // 匹配 Markdown 标题
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

  // 修改核心：找到 pos 归属的标题（即 pos 之前最近的一个标题）
  findHeadingIndexByPos(pos) {
    this.rebuildSync();
    // 简单的线性查找，找到 start <= pos 的最后一个标题
    let bestIndex = -1;
    for (let i = 0; i < this.headings.length; i++) {
      if (this.headings[i].start <= pos) {
        bestIndex = i;
      } else {
        // 因为 headings 是按顺序排列的，一旦 start > pos，后面的都不用看了
        break;
      }
    }
    return bestIndex;
  },

  // 获取高亮家族索引 (自身 + 祖先 + 后代)
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

    // 2. 后代 (直到遇到同级或更高级标题)
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      if (h.level <= target.level) break;
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
        list.unshift(h); // 插入到开头
        currentLevel = h.level;
      }
    }
    return list;
  },

  // 获取后代链 (用于左下角)
  getDescendants(targetIndex) {
    if (targetIndex < 0) return [];
    const target = this.headings[targetIndex];
    const list = [];
    
    for (let i = targetIndex + 1; i < this.headings.length; i++) {
      const h = this.headings[i];
      // 如果遇到 level <= 当前标题 level，说明子树结束了
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

  // 创建或获取容器
  getContainer(id, isBottom) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.display = "none";
      el.style.flexDirection = "column"; // 竖向排列
      el.style.alignItems = "flex-start";
      el.style.pointerEvents = "none"; // 让鼠标穿透，不影响编辑
      
      // 基础样式参考
      if (isBottom) {
        el.style.bottom = "20px";
        el.style.left = "20px";
      } else {
        el.style.top = "60px"; // 避开顶部菜单
        el.style.left = "20px";
      }
      
      document.body.appendChild(el);
    }
    return el;
  },

  // 渲染左上角：父级链
  renderTopBar(targetIndex) {
    const el = this.getContainer(this.topContainerId, false);
    if (targetIndex === -1) {
      el.style.display = "none";
      return;
    }

    const list = DataModel.getAncestors(targetIndex);
    if (list.length === 0) {
      el.style.display = "none";
      return;
    }

    el.innerHTML = "";
    el.style.display = "flex";
    
    // 标题样式
    const label = document.createElement("div");
    label.textContent = "Current Context:";
    label.style.fontSize = "10px";
    label.style.opacity = "0.5";
    label.style.marginBottom = "4px";
    el.appendChild(label);

    list.forEach(h => {
      const div = document.createElement("div");
      // 复用现有的高亮样式类，或者自定义
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      div.style.backgroundColor = "var(--sb-background-color, white)";
      div.style.border = "1px solid var(--sb-border-color, #ddd)";
      div.style.padding = "2px 6px";
      div.style.margin = "1px 0";
      div.style.borderRadius = "4px";
      div.style.fontSize = "12px";
      div.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
      el.appendChild(div);
    });
  },

  // 渲染左下角：子级链
  renderBottomBar(targetIndex) {
    const el = this.getContainer(this.bottomContainerId, true);
    if (targetIndex === -1) {
      el.style.display = "none";
      return;
    }

    const list = DataModel.getDescendants(targetIndex);
    if (list.length === 0) {
      el.style.display = "none";
      return;
    }

    el.innerHTML = "";
    el.style.display = "flex";

    const label = document.createElement("div");
    label.textContent = "Sub-sections:";
    label.style.fontSize = "10px";
    label.style.opacity = "0.5";
    label.style.marginBottom = "4px";
    el.appendChild(label);

    list.forEach(h => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      // 保持一致的样式
      div.style.backgroundColor = "var(--sb-background-color, white)";
      div.style.border = "1px solid var(--sb-border-color, #ddd)";
      div.style.padding = "2px 6px";
      div.style.margin = "1px 0";
      div.style.borderRadius = "4px";
      div.style.fontSize = "12px";
      div.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
      
      // 缩进效果体现层级
      const indent = (h.level - DataModel.headings[targetIndex].level) * 10;
      div.style.marginLeft = `${indent}px`;
      
      el.appendChild(div);
    });
  },

  // DOM 高亮 (文档内的标题树高亮)
  applyHighlights(container, activeIndices) {
    const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
    container.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));

    if (!activeIndices || activeIndices.size === 0) return;

    if (!window.client || !client.editorView) return;
    const view = client.editorView;

    // 只查找可见区域的标题元素进行高亮
    const visibleHeadings = container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
    
    visibleHeadings.forEach(el => {
      try {
        const pos = view.posAtDOM(el);
        // 这里必须精确匹配标题行，所以用旧逻辑：找到这行是不是标题
        // 我们利用 DataModel 已经解析好的数据，找是否有标题 start 接近 pos
        const idx = DataModel.findHeadingIndexByPos(pos);
        
        // 只有当 idx 确实对应当前 DOM 所在的行时才高亮 (防止误判)
        // findHeadingIndexByPos 返回的是"包含 pos 的标题"，所以如果 el 是标题行，它一定返回自己
        if (idx !== -1 && activeIndices.has(idx)) {
            // 双重确认：el 确实是该标题的 DOM
            const h = DataModel.headings[idx];
            // 简单判断：如果 el 的位置和 h.start 很近
            if (pos >= h.start - 10 && pos <= h.end + 10) {
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
      cleanup: null
    };

    function updateState(targetIndex) {
      if (targetIndex === window[STATE_KEY].currentIndex) return;
      window[STATE_KEY].currentIndex = targetIndex;

      if (targetIndex === -1) {
        View.applyHighlights(container, null);
        View.renderTopBar(-1);
        View.renderBottomBar(-1);
        return;
      }

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      View.applyHighlights(container, familyIndices);
      View.renderTopBar(targetIndex);
      View.renderBottomBar(targetIndex);
    }

    // --- Event Handlers ---

    // 1. Mouse Hover (任何区域)
    function onPointerOver(e) {
      // 查找最近的 CodeMirror 内容行 (cm-line) 或 标题行
      const target = e.target.closest(".cm-line, .sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
      
      // 如果不在编辑器内容区，稍微放宽一点，允许在 container 内 hover
      if (!container.contains(e.target)) return;

      try {
        let pos;
        if (target) {
            pos = client.editorView.posAtDOM(target);
        } else {
            // 如果 hover 在空白处，尝试获取鼠标坐标对应的 pos
            pos = client.editorView.posAtCoords({x: e.clientX, y: e.clientY});
        }

        if (pos != null) {
          const idx = DataModel.findHeadingIndexByPos(pos);
          updateState(idx);
        }
      } catch (err) { }
    }

    // 2. Click & Edit (光标移动/输入)
    function onCursorActivity() {
      try {
        const state = client.editorView.state;
        const pos = state.selection.main.head; // 获取光标位置
        const idx = DataModel.findHeadingIndexByPos(pos);
        updateState(idx);
      } catch (e) {}
    }

    // 3. Scroll Logic (可选，保持之前的逻辑，滚动时如果鼠标不在编辑器内则更新)
    let isScrolling = false;
    function handleScroll() {
      if (container.matches(":hover")) {
          isScrolling = false;
          return; // 如果鼠标在编辑器上，优先响应 hover
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
    
    // 4. Mutation Observer (内容变化重新高亮)
    const mo = new MutationObserver(() => {
        if (window[STATE_KEY].currentIndex !== -1) {
           const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
           View.applyHighlights(container, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true });

    // Bind Events
    // 使用 pointerover 覆盖面更广
    container.addEventListener("pointerover", onPointerOver); 
    
    // 监听点击和键盘事件来更新光标位置的状态
    container.addEventListener("click", onCursorActivity);
    container.addEventListener("keyup", onCursorActivity);

    window.addEventListener("scroll", onScroll, { passive: true });

    window[STATE_KEY].cleanup = () => {
      container.removeEventListener("pointerover", onPointerOver);
      container.removeEventListener("click", onCursorActivity);
      container.removeEventListener("keyup", onCursorActivity);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      
      View.applyHighlights(container, null);
      const top = document.getElementById(View.topContainerId);
      const bot = document.getElementById(View.bottomContainerId);
      if (top) top.remove();
      if (bot) bot.remove();
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
