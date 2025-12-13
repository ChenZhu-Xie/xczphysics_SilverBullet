// Library/HierarchyHighlightHeadings.js
// HHH v10-FullScope & DualNav (Refactored Style)
// 1. Hover/Edit anywhere triggers hierarchy
// 2. Top-Left: Ancestors (Breadcrumbs) - v9 Style & Position
// 3. Bottom-Left: Descendants (Subtree) - v9 Style & Position

const STATE_KEY = "__xhHighlightState_v10";

// ==========================================
// 1. Model: 数据模型 (保持 v10 逻辑)
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
// 2. View: 视图渲染 (修改为 v9 样式和定位)
// ==========================================

const View = {
  topContainerId: "sb-frozen-container-top",
  bottomContainerId: "sb-frozen-container-bottom",

  // 创建或获取容器
  getContainer(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.display = "none";
      el.style.flexDirection = "column";
      el.style.alignItems = "flex-start";
      el.style.pointerEvents = "auto"; // 确保容器允许点击交互
      // 移除这里写死的 top/left/bottom，改为在 render 时根据容器计算
      document.body.appendChild(el);
    }
    return el;
  },

  // 渲染左上角：父级链
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

    // --- 定位逻辑 (参照 v9，移回编辑器内，并防止挤压) ---
    if (container) {
        const rect = container.getBoundingClientRect();
        // Left: 容器左边 + 45px (防止太靠边)
        el.style.left = (rect.left + 45) + "px";
        // Top: 容器顶部 + 50px (避开顶部菜单)
        el.style.top = (rect.top + 50) + "px";
    }

    el.innerHTML = "";
    el.style.display = "flex";
    
    // 标题 (样式简化，去除了背景色)
    const label = document.createElement("div");
    label.textContent = "Context:";
    label.style.fontSize = "10px";
    label.style.opacity = "0.5";
    label.style.marginBottom = "2px";
    label.style.pointerEvents = "none"; // 标签无需响应点击
    el.appendChild(label);

    list.forEach(h => {
      const div = document.createElement("div");
      // 还原 v9 样式：只保留 className，去除背景、边框、圆角等内联样式
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      
      // 仅保留少量间距调整，不添加颜色
      div.style.margin = "1px 0";

      // --- 新增功能：点击跳转 ---
      // 保持 UI 不变，仅增加鼠标手势提示
      div.style.cursor = "pointer";
      div.onclick = (e) => {
        e.stopPropagation(); // 防止触发编辑器其他点击事件
        if (window.client) {
            const pagePath = client.currentPath(); // 获取当前页面名称
            // 构造符合 SilverBullet 内部 navigate 逻辑的对象
            client.navigate({
                path: pagePath,
                details: {
                    type: "header",
                    header: h.text
                }
            });
        }
      };
      // ------------------------
      
      el.appendChild(div);
    });
  },

  // 渲染左下角：子级链
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

    // --- 定位逻辑 ---
    if (container) {
        const rect = container.getBoundingClientRect();
        el.style.left = (rect.left + 45) + "px"; // 同上，防止挤压
        el.style.bottom = "30px"; // 底部固定距离
        el.style.top = "auto";
    }

    el.innerHTML = "";
    el.style.display = "flex";

    const label = document.createElement("div");
    label.textContent = "Sub-sections:";
    label.style.fontSize = "10px";
    label.style.opacity = "0.5";
    label.style.marginBottom = "2px";
    label.style.pointerEvents = "none";
    el.appendChild(label);

    list.forEach(h => {
      const div = document.createElement("div");
      div.className = `sb-frozen-item sb-frozen-l${h.level}`;
      div.textContent = h.text;
      
      // 还原 v9 样式：去除背景、边框
      div.style.margin = "1px 0";
      
      // 保留缩进逻辑（结构性样式），以便区分层级
      const indent = (h.level - DataModel.headings[targetIndex].level) * 10;
      div.style.marginLeft = `${indent}px`;

      // --- 新增功能：点击跳转 ---
      div.style.cursor = "pointer";
      div.onclick = (e) => {
        e.stopPropagation();
        if (window.client) {
            const pagePath = client.currentPath();
            client.navigate({
                path: pagePath,
                details: {
                    type: "header",
                    header: h.text
                }
            });
        }
      };
      // ------------------------
      
      el.appendChild(div);
    });
  },

  // DOM 高亮 (文档内的标题树高亮 - 保持 v10 逻辑)
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
        const idx = DataModel.findHeadingIndexByPos(pos);
        
        if (idx !== -1 && activeIndices.has(idx)) {
            const h = DataModel.headings[idx];
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
        View.renderTopBar(-1, container);
        View.renderBottomBar(-1, container);
        return;
      }

      const familyIndices = DataModel.getFamilyIndices(targetIndex);
      View.applyHighlights(container, familyIndices);
      // 传入 container 以便计算位置
      View.renderTopBar(targetIndex, container);
      View.renderBottomBar(targetIndex, container);
    }

    // --- Event Handlers ---

    function onPointerOver(e) {
      const target = e.target.closest(".cm-line, .sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6");
      if (!container.contains(e.target)) return;

      try {
        let pos;
        if (target) {
            pos = client.editorView.posAtDOM(target);
        } else {
            pos = client.editorView.posAtCoords({x: e.clientX, y: e.clientY});
        }

        if (pos != null) {
          const idx = DataModel.findHeadingIndexByPos(pos);
          updateState(idx);
        }
      } catch (err) { }
    }

    function onCursorActivity() {
      try {
        const state = client.editorView.state;
        const pos = state.selection.main.head;
        const idx = DataModel.findHeadingIndexByPos(pos);
        updateState(idx);
      } catch (e) {}
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
    
    const mo = new MutationObserver(() => {
        if (window[STATE_KEY].currentIndex !== -1) {
           const familyIndices = DataModel.getFamilyIndices(window[STATE_KEY].currentIndex);
           View.applyHighlights(container, familyIndices);
        }
    });
    mo.observe(container, { childList: true, subtree: true });

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
      
      View.applyHighlights(container, null);
      const top = document.getElementById(View.topContainerId);
      const bot = document.getElementById(View.bottomContainerId);
      if (top) top.remove();
      if (bot) bot.remove();
      DataModel.headings = [];
    };

    console.log("[HHH] v10-FullScope (v9 Style) Enabled");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
