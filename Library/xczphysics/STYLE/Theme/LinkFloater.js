// Library/xczphysics/STYLE/Theme/LinkFloater.js
// LinkFloater v6 - 导航后自动居中光标

const STATE_KEY = "__LinkFloaterState_v6";

// ==========================================
// 辅助函数
// ==========================================

/**
 * 居中光标的辅助函数
 * 尝试多种方式实现 "Navigate: Center Cursor" 效果
 */
async function centerCursor() {
  // 给导航一点时间完成
  await new Promise(resolve => setTimeout(resolve, 50));
  
  try {
    // 方法1: 使用 silverbullet.syscall (如果在正确的上下文中)
    if (globalThis.silverbullet && typeof globalThis.silverbullet.syscall === 'function') {
      await globalThis.silverbullet.syscall("editor.invokeCommand", "Navigate: Center Cursor");
      return true;
    }
  } catch (e) {
    // console.warn("[LinkFloater] syscall method failed:", e);
  }
  
  try {
    // 方法2: 直接使用 editorView 滚动到光标位置
    if (window.client && client.editorView) {
      const view = client.editorView;
      const cursorPos = view.state.selection.main.head;
      
      // 获取光标的屏幕坐标
      const coords = view.coordsAtPos(cursorPos);
      if (coords) {
        const viewRect = view.dom.getBoundingClientRect();
        const viewHeight = viewRect.height;
        
        // 计算目标滚动位置，使光标位于视图中心
        const currentScrollTop = view.scrollDOM.scrollTop;
        const cursorRelativeY = coords.top - viewRect.top + currentScrollTop;
        const targetScrollTop = cursorRelativeY - viewHeight / 2;
        
        view.scrollDOM.scrollTo({ 
          top: Math.max(0, targetScrollTop), 
          behavior: 'instant' 
        });
      }
      return true;
    }
  } catch (e) {
    // console.warn("[LinkFloater] Direct scroll failed:", e);
  }
  
  return false;
}

/**
 * 封装的导航函数 - 导航后自动居中光标
 * @param {Object} options - client.navigate 的参数
 */
function navigateAndCenter(options) {
  if (!window.client) return;
  
  client.navigate(options);
  
  // 异步执行居中，不阻塞导航
  setTimeout(() => centerCursor(), 150);
}

/**
 * 获取当前页面名称（不含 .md 后缀）
 */
function getCurrentPageName() {
  try {
    if (window.client) {
      const page = client.currentPage?.() || client.currentName?.() || "";
      return page.replace(/\.md$/, "");
    }
  } catch (e) {}
  return "";
}

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

/**
 * 获取编辑器全文
 */
function getFullText() {
  try {
    if (window.client && client.editorView && client.editorView.state) {
      return client.editorView.state.sliceDoc();
    }
  } catch (e) { console.warn(e); }
  return "";
}

/**
 * 扫描代码块范围
 */
function getCodeBlockRanges(text) {
  const ranges = [];
  const regex = /```[\s\S]*?```/gm;
  let match;
  while ((match = regex.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

/**
 * 检查位置是否在代码块内
 */
function isInCodeBlock(pos, codeBlockRanges) {
  return codeBlockRanges.some(range => pos >= range.start && pos < range.end);
}

/**
 * 解析文本中的 [[wiki link]]，返回完整信息
 * ★ v5 修复：[[#header]] 时，page 补全为 currentPage
 */
function parseWikiLinks(text) {
  const codeBlockRanges = getCodeBlockRanges(text);
  const links = [];
  const currentPage = getCurrentPageName();
  
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    if (isInCodeBlock(matchIndex, codeBlockRanges)) continue;
    
    const rawTarget = match[1].trim();
    
    let page = rawTarget;
    let header = "";
    let posNum = null;
    let isLocalAnchor = false;
    
    // ★ 检测纯锚点链接 [[#...]]
    if (rawTarget.startsWith("#")) {
      isLocalAnchor = true;
      page = currentPage;
      header = rawTarget.substring(1);
    } else {
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
        if (hashIndex > 0) {
          page = rawTarget.substring(0, hashIndex);
          header = rawTarget.substring(hashIndex + 1);
        } else if (hashIndex === 0) {
          page = currentPage;
          header = rawTarget.substring(1);
          isLocalAnchor = true;
        }
      }
    }
    
    if (!page && header) {
      page = currentPage;
      isLocalAnchor = true;
    }
    
    links.push({
      raw: rawTarget,
      page: page,
      header: header,
      posNum: posNum,
      textPos: matchIndex,
      fullMatch: match[0],
      isLocalAnchor: isLocalAnchor
    });
  }
  
  return links;
}

// ==========================================
// Model
// ==========================================

const Model = {
  backlinks: [],
  forwardLinks: [],
  parsedWikiLinks: [],
  lastText: null
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
   * 渲染右上角：前向链接 (2列: Links + Go)
   * ★ v6: 所有导航都使用 navigateAndCenter
   */
  renderForward() {
    const container = this.createContainer(this.topContainerId, false);
    container.innerHTML = "";

    const forwardLinks = Model.forwardLinks || [];
    
    const text = getFullText();
    const parsedLinks = parseWikiLinks(text);
    Model.parsedWikiLinks = parsedLinks;

    if (forwardLinks.length === 0 && parsedLinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const wrapper = document.createElement("div");
    wrapper.className = "sb-floater-wrapper";

    const linksColumns = this.splitIntoColumns(forwardLinks);
    const goColumns = this.splitIntoColumns(parsedLinks);
    
    const maxCols = Math.max(linksColumns.length, goColumns.length);

    for (let i = 0; i < maxCols; i++) {
      // ========== Column 1 (Links) ==========
      if (i < linksColumns.length) {
        const col = document.createElement("div");
        col.className = "sb-floater-col";
        
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = i === 0 ? "Links" : "·";
        if (i > 0) header.style.opacity = "0.3";
        col.appendChild(header);

        linksColumns[i].forEach(link => {
          let displayPage = link.toPage || link.ref || "";
          const currentPage = getCurrentPageName();
          
          if (!displayPage || displayPage.startsWith("#")) {
            if (displayPage.startsWith("#")) {
              displayPage = currentPage + displayPage;
            } else if (link.ref && link.ref.startsWith("#")) {
              displayPage = currentPage + link.ref;
            }
          }
          
          const shortName = extractPageName(displayPage);
          const fullName = link.ref;
          
          col.appendChild(this.createButton(shortName, fullName, () => {
            if (window.client) {
              const currentPath = client.currentPath();
              // ★ v6: 使用 navigateAndCenter
              navigateAndCenter({
                path: currentPath,
                details: { type: "position", pos: link.pos }
              });
            }
          }, "local"));
        });
        wrapper.appendChild(col);
      }

      // ========== Column 2 (Go) ==========
      if (i < goColumns.length) {
        const col = document.createElement("div");
        col.className = "sb-floater-col";
        
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = i === 0 ? "Go" : "·";
        if (i > 0) header.style.opacity = "0.3";
        col.appendChild(header);

        goColumns[i].forEach(link => {
          let targetDisplay = link.page;
          if (link.header) {
            targetDisplay = `${link.page}#${link.header}`;
          } else if (link.posNum !== null) {
            targetDisplay = `${link.page}@${link.posNum}`;
          }
          
          col.appendChild(this.createButton("→", targetDisplay, () => {
            if (!window.client) return;
            
            // ★ v6: 所有导航都使用 navigateAndCenter
            if (link.posNum !== null) {
              navigateAndCenter({
                path: `${link.page}.md`,
                details: { type: "position", pos: link.posNum }
              });
            } else if (link.header) {
              navigateAndCenter({
                path: `${link.page}.md`,
                details: { type: "header", header: link.header }
              });
            } else {
              navigateAndCenter({ path: `${link.page}.md` });
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
   * ★ v6: 使用 navigateAndCenter
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
            // ★ v6: 使用 navigateAndCenter
            navigateAndCenter({
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
// Controller - 导出接口
// ==========================================

/** 供 Lua 调用：更新反向链接数据 */
export function updateBacklinks(data) {
  Model.backlinks = data || [];
  View.renderBacklinks();
}

/** 供 Lua 调用：更新前向链接数据 (Column 1) */
export function updateForwardlinks(data) {
  Model.forwardLinks = data || [];
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

  function refreshColumn2() {
    Model.lastText = null;
    View.renderForward();
  }

  function onActivity() {
    if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
    window[STATE_KEY].updateTimeout = setTimeout(refreshColumn2, 300);
  }

  setTimeout(() => {
    View.renderForward();
    View.renderBacklinks();
  }, 500);

  document.addEventListener("keyup", onActivity);
  document.addEventListener("click", onActivity);

  window[STATE_KEY].cleanup = () => {
    document.removeEventListener("keyup", onActivity);
    document.removeEventListener("click", onActivity);
    if (window[STATE_KEY].updateTimeout) clearTimeout(window[STATE_KEY].updateTimeout);
  };

  console.log("[LinkFloater] v6 Enabled (with auto-center)");
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