// Library/xczphysics/STYLE/Theme/LinkFloater.js
// LinkFloater v3 - 完整重构
// 1. Fix: shortName 使用 link.toPage
// 2. Feature: Column 2 实时解析 [[...]] 语法获取精确目标
// 3. Fix: 页面切换时正确刷新
// 4. Feature: 超过半屏高度时自动分列
// 5. Feature: 悬浮展开完整内容

const STATE_KEY = "__LinkFloaterState_v3";

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
 * 格式: [[page]], [[page#header]], [[page@pos]], [[page|alias]]
 */
function parseWikiLinks(text) {
  const codeBlockRanges = getCodeBlockRanges(text);
  const links = [];
  
  // 匹配 [[...]] 或 [[...|...]]
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    // 跳过代码块中的链接
    if (isInCodeBlock(matchIndex, codeBlockRanges)) continue;
    
    const rawTarget = match[1].trim();
    
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
    
    links.push({
      raw: rawTarget,
      page: page,
      header: header,
      posNum: posNum,
      textPos: matchIndex, // 在文本中的位置
      fullMatch: match[0]
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
  parsedLinks: [] // 从文本解析的链接
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
   * 将项目列表分成多列（当超过半屏高度时）
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
   * 渲染右上角：前向链接 (2列: Links + Go)
   */
  renderForward(forwardLinks) {
    const container = this.createContainer(this.topContainerId, false);
    container.innerHTML = "";

    if (!forwardLinks || forwardLinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    // 解析当前页面文本中的 wiki links
    const text = getFullText();
    const parsedLinks = parseWikiLinks(text);
    Model.parsedLinks = parsedLinks;

    const wrapper = document.createElement("div");
    wrapper.className = "sb-floater-wrapper";

    // 根据高度限制分列
    const linksColumns = this.splitIntoColumns(forwardLinks);
    const goColumns = this.splitIntoColumns(forwardLinks);

    // ========== Column Group 1: Links (跳转到当前页面中链接的位置) ==========
    linksColumns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-floater-col";
      
      if (colIndex === 0) {
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Links";
        col.appendChild(header);
      } else {
        // 占位保持对齐
        const spacer = document.createElement("div");
        spacer.className = "sb-floater-header";
        spacer.textContent = "·";
        spacer.style.opacity = "0.3";
        col.appendChild(spacer);
      }

      columnItems.forEach(link => {
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
    });

    // ========== Column Group 2: → 按钮 (跳转到目标页面) ==========
    goColumns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-floater-col";
      
      if (colIndex === 0) {
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Go";
        col.appendChild(header);
      } else {
        const spacer = document.createElement("div");
        spacer.className = "sb-floater-header";
        spacer.textContent = "·";
        spacer.style.opacity = "0.3";
        col.appendChild(spacer);
      }

      columnItems.forEach(link => {
        // 从解析的链接中找到对应的完整目标
        const parsed = parsedLinks.find(p => 
          Math.abs(p.textPos - link.pos) < 5 || 
          p.page === link.toPage ||
          p.raw === link.ref
        );
        
        let targetDisplay = link.toPage;
        let navigateAction;
        
        if (parsed) {
          // 构建完整的目标显示
          if (parsed.header) {
            targetDisplay = `${parsed.page}#${parsed.header}`;
          } else if (parsed.posNum !== null) {
            targetDisplay = `${parsed.page}@${parsed.posNum}`;
          } else {
            targetDisplay = parsed.page;
          }
          
          navigateAction = () => {
            if (!window.client) return;
            
            if (parsed.posNum !== null) {
              // 有具体位置
              client.navigate({
                path: `${parsed.page}.md`,
                details: { type: "position", pos: parsed.posNum }
              });
            } else if (parsed.header) {
              // 有标题
              client.navigate({
                path: `${parsed.page}.md`,
                details: { type: "header", header: parsed.header }
              });
            } else {
              // 纯页面
              client.navigate({ path: `${parsed.page}.md` });
            }
          };
        } else {
          // 回退到基本的页面跳转
          navigateAction = () => {
            if (window.client) {
              client.navigate({ path: `${link.toPage}.md` });
            }
          };
        }
        
        const shortTarget = extractPageName(targetDisplay);
        col.appendChild(this.createButton("→", targetDisplay, navigateAction, "remote"));
      });
      wrapper.appendChild(col);
    });

    container.appendChild(wrapper);
  },

  /**
   * 渲染右下角：反向链接
   */
  renderBacklinks(backlinks) {
    const container = this.createContainer(this.bottomContainerId, true);
    container.innerHTML = "";

    if (!backlinks || backlinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const wrapper = document.createElement("div");
    wrapper.className = "sb-floater-wrapper";

    // 根据高度限制分列
    const columns = this.splitIntoColumns(backlinks);

    columns.forEach((columnItems, colIndex) => {
      const col = document.createElement("div");
      col.className = "sb-floater-col";

      if (colIndex === 0) {
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Backlinks";
        col.appendChild(header);
      } else {
        const spacer = document.createElement("div");
        spacer.className = "sb-floater-header";
        spacer.textContent = "·";
        spacer.style.opacity = "0.3";
        col.appendChild(spacer);
      }

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

  /**
   * 清空所有容器
   */
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
  View.renderBacklinks(Model.backlinks);
}

/** 供 Lua 调用：更新前向链接数据 */
export function updateForwardlinks(data) {
  Model.forwardLinks = data || [];
  View.renderForward(Model.forwardLinks);
}

/** 清空并重新渲染（用于页面切换时） */
export function refresh() {
  View.clearAll();
  View.renderForward(Model.forwardLinks);
  View.renderBacklinks(Model.backlinks);
}

export function enable() {
  if (window[STATE_KEY]) return;
  
  window[STATE_KEY] = {
    observer: null
  };

  // 监听页面变化事件（如果有的话）
  // 这里用 MutationObserver 作为备用
  const container = document.querySelector("#sb-main");
  if (container) {
    const mo = new MutationObserver(() => {
      // 当 DOM 大量变化时可能是页面切换
      // 但实际刷新由 Lua 的 event.listen 触发
    });
    mo.observe(container, { childList: true, subtree: false });
    window[STATE_KEY].observer = mo;
  }

  console.log("[LinkFloater] v3 Enabled");
}

export function disable() {
  if (window[STATE_KEY]) {
    if (window[STATE_KEY].observer) {
      window[STATE_KEY].observer.disconnect();
    }
    View.clearAll();
    const top = document.getElementById(View.topContainerId);
    if (top) top.remove();
    const bot = document.getElementById(View.bottomContainerId);
    if (bot) bot.remove();
    window[STATE_KEY] = null;
  }
}