// Library/xczphysics/STYLE/Theme/LinkFloater.js
// LinkFloater v4 - 完整重构
// 1. Column 2 使用 HHH.js 风格的实时解析
// 2. Column 1 保持 Lua table 渲染
// 3. 多列交替排列 (1212)

const STATE_KEY = "__LinkFloaterState_v4";

// ==========================================
// 辅助函数
// ==========================================

/**
 * 从完整路径提取页面名称（保留 @pos 和 #header）
 */
function extractPageName(fullRef) {
  if (!fullRef) return "";
  
  let suffix = "";
  let basePath = fullRef;
  
  const atIndex = fullRef.lastIndexOf("@");
  const hashIndex = fullRef.lastIndexOf("#");
  
  if (atIndex > 0) {
    suffix = fullRef.substring(atIndex);
    basePath = fullRef.substring(0, atIndex);
  } else if (hashIndex > 0) {
    suffix = fullRef.substring(hashIndex);
    basePath = fullRef.substring(0, hashIndex);
  }
  
  const parts = basePath.split("/");
  const pageName = parts[parts.length - 1] || basePath;
  
  return pageName + suffix;
}

// ==========================================
// Model - 照搬 HHH.js 的解析逻辑
// ==========================================

const Model = {
  backlinks: [],
  forwardLinks: [],      // 来自 Lua
  parsedWikiLinks: [],   // 实时解析的 wiki links
  lastText: null,

  getFullText() {
    try {
      if (window.client && client.editorView && client.editorView.state) {
        return client.editorView.state.sliceDoc();
      }
    } catch (e) { console.warn(e); }
    return "";
  },

  getCurrentPage() {
    try {
      if (window.client) {
        return client.currentPage() || client.currentName() || "";
      }
    } catch (e) {}
    return "";
  },

  /**
   * 重建 wiki links 列表 - 照搬 HHH.js 的代码块排除逻辑
   */
  rebuildWikiLinks() {
    const text = this.getFullText();
    if (text === this.lastText && this.parsedWikiLinks.length > 0) return;

    this.lastText = text;
    this.parsedWikiLinks = [];
    
    if (!text) return;

    const currentPage = this.getCurrentPage();

    // 1. 预先扫描所有代码块的范围，用于后续排除
    const codeBlockRanges = [];
    const codeBlockRegex = /```[\s\S]*?```/gm;
    let blockMatch;
    while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
      codeBlockRanges.push({
        start: blockMatch.index,
        end: blockMatch.index + blockMatch[0].length
      });
    }

    // 2. 扫描 wiki links: [[...]] 或 [[...|...]]
    const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      // 3. 检查当前匹配是否在代码块范围内
      const isInsideCodeBlock = codeBlockRanges.some(range => 
        matchIndex >= range.start && matchIndex < range.end
      );

      if (isInsideCodeBlock) continue;

      const rawTarget = match[1].trim();
      const alias = match[2] ? match[2].trim() : null;
      
      let page = rawTarget;
      let header = "";
      let posNum = null;
      
      // 解析 @pos
      const atIndex = rawTarget.lastIndexOf("@");
      if (atIndex > 0) {
        const possiblePos = rawTarget.substring(atIndex + 1);
        if (/^\d+$/.test(possiblePos)) {
          page = rawTarget.substring(0, atIndex);
          posNum = parseInt(possiblePos);
        }
      }
      
      // 解析 #header
      if (posNum === null) {
        const hashIndex = rawTarget.indexOf("#");
        if (hashIndex >= 0) {
          page = rawTarget.substring(0, hashIndex);
          header = rawTarget.substring(hashIndex + 1);
        }
      }

      // 排除指向当前页面且没有锚点的链接
      if (page === currentPage && !header && posNum === null) continue;
      // 排除空页面名（纯锚点 [[#Section]]）
      if (!page && !header) continue;

      this.parsedWikiLinks.push({
        raw: rawTarget,
        page: page || currentPage,
        header: header,
        posNum: posNum,
        alias: alias,
        textPos: matchIndex,
        end: matchIndex + match[0].length,
        fullMatch: match[0]
      });
    }
  },

  /**
   * 获取去重后的外部链接（用于 Column 2）
   */
  getUniqueOutgoingLinks() {
    this.rebuildWikiLinks();
    const currentPage = this.getCurrentPage();
    
    // 过滤出真正的外链（目标页面不是当前页面，或有锚点）
    const outgoing = this.parsedWikiLinks.filter(link => {
      return link.page !== currentPage || link.header || link.posNum !== null;
    });

    // 按 raw 去重，保留第一个出现的
    const seen = new Map();
    outgoing.forEach(link => {
      const key = link.raw;
      if (!seen.has(key)) {
        seen.set(key, link);
      }
    });

    return Array.from(seen.values());
  }
};

// ==========================================
// View
// ==========================================

const View = {
  topContainerId: "sb-floater-top-right",
  bottomContainerId: "sb-floater-bottom-right",

  createContainer(id, isBottom) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = "sb-floater-container";
      if (isBottom) {
        el.style.bottom = "20px";
      } else {
        el.style.top = "60px";
      }
      document.body.appendChild(el);
    }
    return el;
  },

  /**
   * 创建带悬浮展开效果的按钮
   */
  createButton(displayText, fullText, onClick, type) {
    const btn = document.createElement("div");
    btn.className = `sb-floater-btn sb-floater-${type}`;
    btn.textContent = displayText;
    btn.title = fullText;
    btn.dataset.fullText = fullText;
    btn.dataset.shortText = displayText;
    
    btn.addEventListener("mouseenter", () => {
      if (fullText !== displayText) {
        btn.textContent = fullText;
        btn.classList.add("sb-floater-expanded");
      }
    });
    
    btn.addEventListener("mouseleave", () => {
      btn.textContent = displayText;
      btn.classList.remove("sb-floater-expanded");
    });
    
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick();
    };
    
    return btn;
  },

  /**
   * 将项目列表分成多列
   */
  splitIntoColumns(items, itemHeight = 28) {
    const maxHeight = window.innerHeight * 0.45;
    const maxItemsPerCol = Math.max(3, Math.floor(maxHeight / itemHeight));
    
    const columns = [];
    for (let i = 0; i < items.length; i += maxItemsPerCol) {
      columns.push(items.slice(i, i + maxItemsPerCol));
    }
    return columns;
  },

  /**
   * 渲染右上角：前向链接
   * Column 1: Links (来自 Lua) - 跳转到当前页面中链接的位置
   * Column 2: Go (实时解析) - 跳转到目标页面
   * 多列时交替排列: 1, 2, 1, 2...
   */
  renderForward() {
    const container = this.createContainer(this.topContainerId, false);
    container.innerHTML = "";

    const forwardLinks = Model.forwardLinks || [];
    const outgoingLinks = Model.getUniqueOutgoingLinks();

    if (forwardLinks.length === 0 && outgoingLinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const wrapper = document.createElement("div");
    wrapper.className = "sb-floater-wrapper";

    // 分列
    const linksColumns = this.splitIntoColumns(forwardLinks);
    const goColumns = this.splitIntoColumns(outgoingLinks);
    
    const maxCols = Math.max(linksColumns.length, goColumns.length);

    // 交替排列: Links[0], Go[0], Links[1], Go[1], ...
    for (let i = 0; i < maxCols; i++) {
      // Column 1 (Links) - 第 i 列
      if (i < linksColumns.length) {
        const col = document.createElement("div");
        col.className = "sb-floater-col";
        
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = i === 0 ? "Links" : "·";
        if (i > 0) header.style.opacity = "0.3";
        col.appendChild(header);

        linksColumns[i].forEach(link => {
          const shortName = extractPageName(link.toPage);
          const fullName = link.ref;
          
          col.appendChild(this.createButton(shortName, fullName, () => {
            if (window.client) {
              const currentPage = client.currentPath();
              client.navigate({
                path: currentPage,
                details: { type: "position", pos: link.pos }
              });
            }
          }, "local"));
        });
        wrapper.appendChild(col);
      }

      // Column 2 (Go) - 第 i 列
      if (i < goColumns.length) {
        const col = document.createElement("div");
        col.className = "sb-floater-col";
        
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = i === 0 ? "Go" : "·";
        if (i > 0) header.style.opacity = "0.3";
        col.appendChild(header);

        goColumns[i].forEach(link => {
          // 构建完整的目标显示
          let targetDisplay = link.page;
          if (link.header) {
            targetDisplay = `${link.page}#${link.header}`;
          } else if (link.posNum !== null) {
            targetDisplay = `${link.page}@${link.posNum}`;
          }
          
          col.appendChild(this.createButton("→", targetDisplay, () => {
            if (!window.client) return;
            
            if (link.posNum !== null) {
              client.navigate({
                path: `${link.page}.md`,
                details: { type: "position", pos: link.posNum }
              });
            } else if (link.header) {
              client.navigate({
                path: `${link.page}.md`,
                details: { type: "header", header: link.header }
              });
            } else {
              client.navigate({ path: `${link.page}.md` });
            }
          }, "remote"));
        });
        wrapper.appendChild(col);
      }
    }

    container.appendChild(wrapper);
  },

  /**
   * 渲染右下角：反向链接
   */
  renderBacklinks() {
    const container = this.createContainer(this.bottomContainerId, true);
    container.innerHTML = "";

    const backlinks = Model.backlinks || [];

    if (backlinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const wrapper = document.createElement("div");
    wrapper.className = "sb-floater-wrapper";

    const columns = this.splitIntoColumns(backlinks);

    columns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-floater-col";

      const header = document.createElement("div");
      header.className = "sb-floater-header";
      header.textContent = colIndex === 0 ? "Backlinks" : "·";
      if (colIndex > 0) header.style.opacity = "0.3";
      col.appendChild(header);

      columnItems.forEach(link => {
        const shortName = extractPageName(link.page);
        const fullName = `${link.page}@${link.pos}`;
        
        col.appendChild(this.createButton(shortName, fullName, () => {
          if (window.client) {
            client.navigate({
              path: `${link.page}.md`,
              details: { type: "position", pos: link.pos }
            });
          }
        }, "backlink"));
      });

      wrapper.appendChild(col);
    });

    container.appendChild(wrapper);
  },

  clearAll() {
    const top = document.getElementById(this.topContainerId);
    const bot = document.getElementById(this.bottomContainerId);
    if (top) {
      top.innerHTML = "";
      top.style.display = "none";
    }
    if (bot) {
      bot.innerHTML = "";
      bot.style.display = "none";
    }
  }
};

// ==========================================
// Controller - 照搬 HHH.js 的事件监听逻辑
// ==========================================

/** 供 Lua 调用：更新反向链接数据 */
export function updateBacklinks(data) {
  Model.backlinks = data || [];
  View.renderBacklinks();
}

/** 供 Lua 调用：更新前向链接数据 (Column 1) */
export function updateForwardlinks(data) {
  Model.forwardLinks = data || [];
  // 同时触发完整渲染（包括 Column 2 的实时解析）
  View.renderForward();
}

/** 清空并重新渲染 */
export function refresh() {
  Model.lastText = null;
  Model.parsedWikiLinks = [];
  View.clearAll();
  View.renderForward();
  View.renderBacklinks();
}

export function enable() {
  if (window[STATE_KEY]) return;
  
  window[STATE_KEY] = {
    updateTimeout: null,
    cleanup: null
  };

  // 实时更新 Column 2（照搬 HHH.js 的事件监听逻辑）
  function refreshColumn2() {
    Model.lastText = null; // 强制重新解析
    View.renderForward();
  }

  function onActivity() {
    if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
    window[STATE_KEY].updateTimeout = setTimeout(refreshColumn2, 300);
  }

  // 初始渲染
  setTimeout(() => {
    View.renderForward();
    View.renderBacklinks();
  }, 500);

  // 绑定事件
  document.addEventListener("keyup", onActivity);
  document.addEventListener("click", onActivity);

  window[STATE_KEY].cleanup = () => {
    document.removeEventListener("keyup", onActivity);
    document.removeEventListener("click", onActivity);
    if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
  };

  console.log("[LinkFloater] v4 Enabled");
}

export function disable() {
  if (window[STATE_KEY]) {
    if (window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();
    View.clearAll();
    const top = document.getElementById(View.topContainerId);
    if (top) top.remove();
    const bot = document.getElementById(View.bottomContainerId);
    if (bot) bot.remove();
    window[STATE_KEY] = null;
  }
}