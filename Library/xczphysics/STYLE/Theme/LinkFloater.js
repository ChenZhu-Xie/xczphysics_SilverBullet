// Library/xczphysics/STYLE/Theme/LinkFloater.js
// LinkFloater v5 - 修复 [[#header]] 解析问题及 .map 类型错误

const STATE_KEY = "__LinkFloaterState_v5";

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
  setTimeout(() => centerCursor(), 50);
}

/**
 * 获取当前页面名称（不含 .md 后缀）
 */
function getCurrentPageName() {
  try {
    if (window.client) {
      // 优先使用 currentPage()，其次 currentName()
      const page = client.currentPage?.() || client.currentName?.() || "";
      return page.replace(/\.md$/, "");
    }
  } catch (e) { console.warn(e); }
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
 * 从指定位置提取 wiki link 内容
 * 从 pos 位置开始，跳过 [[，然后捕获直到 ]] 的内容
 * 返回链接内容（不含 [[ 和 ]]）
 */
function extractWikiLinkAtPos(text, pos) {
  // 检查 pos 位置是否是 [[ 开头
  if (text.substring(pos, pos + 2) !== '[[') {
    // 可能 pos 已经在 [[ 之后，尝试往前找
    const searchStart = Math.max(0, pos - 5);
    const prefix = text.substring(searchStart, pos + 2);
    const bracketPos = prefix.lastIndexOf('[[');
    if (bracketPos === -1) return null;
    pos = searchStart + bracketPos;
  }
  
  // 现在 pos 应该指向 [[
  const contentStart = pos + 2;
  const endBracket = text.indexOf(']]', contentStart);
  
  if (endBracket === -1) return null;
  
  const content = text.substring(contentStart, endBracket);
  
  // 处理别名: [[target|alias]] -> 只取 target
  const pipeIndex = content.indexOf('|');
  const target = pipeIndex > 0 ? content.substring(0, pipeIndex) : content;
  
  return target.trim();
}

/**
 * 解析链接目标字符串，返回解析后的对象
 * ★ v5 修复：当 page 为空但有 header 时，补全为当前页面
 */
function parseLinkTarget(target) {
  if (!target) return null;
  
  const currentPage = getCurrentPageName();
  
  let page = target;
  let header = null;
  let posNum = null;
  let isLocalAnchor = false;
  
  // ★ 关键修复：检测是否为纯锚点链接 [[#...]]
  if (target.startsWith("#")) {
    isLocalAnchor = true;
    page = currentPage;
    header = target.substring(1);
    return { page, header, posNum, raw: target, isLocalAnchor };
  }
  
  // 检查 @pos
  const atIndex = target.lastIndexOf("@");
  if (atIndex > 0) {
    const possiblePos = target.substring(atIndex + 1);
    if (/^\d+$/.test(possiblePos)) {
      page = target.substring(0, atIndex);
      posNum = parseInt(possiblePos);
    }
  }
  
  // 检查 #header（仅当没有 @pos 时）
  if (posNum === null) {
    const hashIndex = target.indexOf("#");
    if (hashIndex >= 0) {
      // hashIndex === 0 的情况已在上面处理，这里是 page#header 格式
      page = hashIndex === 0 ? currentPage : target.substring(0, hashIndex);
      header = target.substring(hashIndex + 1);
      if (hashIndex === 0) isLocalAnchor = true;
    }
  }
  
  // 再次确保 page 不为空
  if (!page && header) {
    page = currentPage;
    isLocalAnchor = true;
  }
  
  return { page, header, posNum, raw: target, isLocalAnchor };
}

/**
 * ★ v5 新增：补全显示用的页面名称
 * 处理 toPage 为空或以 # 开头的情况
 */
function normalizeDisplayPage(toPage, ref) {
  const currentPage = getCurrentPageName();
  
  if (!toPage || toPage === "") {
    // toPage 为空，检查 ref
    if (ref && ref.startsWith("#")) {
      return currentPage + ref;
    }
    return currentPage;
  }
  
  if (toPage.startsWith("#")) {
    // toPage 是纯锚点，补全当前页面
    return currentPage + toPage;
  }
  
  return toPage;
}

// ==========================================
// Model
// ==========================================

const Model = {
  backlinks: [],
  forwardLinks: []
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
   * 渲染右上角：前向链接 (交替排列 Links 和 Go)
   * ★ v5 修复：正确处理 [[#header]] 格式
   */
  renderForward(forwardLinks) {
    const container = this.createContainer(this.topContainerId, false);
    container.innerHTML = "";

    // ★ 修复：增加 Array.isArray 检查，防止空对象传入导致 .map 崩溃
    if (!Array.isArray(forwardLinks) || forwardLinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const text = getFullText();
    const currentPage = getCurrentPageName();

    // 为每个 forwardLink 提取完整的链接目标
    const enrichedLinks = forwardLinks.map(link => {
      const rawTarget = extractWikiLinkAtPos(text, link.pos);
      const parsed = parseLinkTarget(rawTarget);
      
      // ★ v5 修复：补全 displayPage
      const displayPage = normalizeDisplayPage(link.toPage, link.ref);
      
      return {
        ...link,
        rawTarget: rawTarget,
        parsed: parsed,
        displayPage: displayPage  // 用于 Column 1 显示
      };
    });

    const wrapper = document.createElement("div");
    wrapper.className = "sb-floater-wrapper";

    // 分列
    const linksColumns = this.splitIntoColumns(enrichedLinks);
    const goColumns = this.splitIntoColumns(enrichedLinks);
    const maxCols = Math.max(linksColumns.length, goColumns.length);

    // 交替排列：Links[0], Go[0], Links[1], Go[1], ...
    for (let i = 0; i < maxCols; i++) {
      // ========== Column 1 (Links) - 第 i 列 ==========
      if (i < linksColumns.length) {
        const col = document.createElement("div");
        col.className = "sb-floater-col";
        
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Links";
        if (i > 0) header.style.opacity = "0.3";
        col.appendChild(header);

        linksColumns[i].forEach(link => {
          // ★ v5 修复：使用补全后的 displayPage
          const shortName = extractPageName(link.displayPage);
          const fullName = link.ref;
          
          col.appendChild(this.createButton(shortName, fullName, () => {
            if (window.client) {
              const currentPath = client.currentPath();
              navigateAndCenter({
                path: currentPath,
                details: { type: "position", pos: link.pos }
              });
            }
          }, "local"));
        });
        wrapper.appendChild(col);
      }

      // ========== Column 2 (Go) - 第 i 列 ==========
      if (i < goColumns.length) {
        const col = document.createElement("div");
        col.className = "sb-floater-col";
        
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Go";
        if (i > 0) header.style.opacity = "0.3";
        col.appendChild(header);

        goColumns[i].forEach(link => {
          const parsed = link.parsed;
          
          // ★ v5 修复：构建完整的目标显示（已补全 currentPage）
          let targetDisplay = link.rawTarget || link.displayPage;
          if (parsed && parsed.isLocalAnchor) {
            // 纯锚点链接，显示为 currentPage#header
            targetDisplay = `${parsed.page}#${parsed.header}`;
          }
          
          const navigateAction = () => {
            if (!window.client) return;
            
            if (parsed) {
              if (parsed.posNum !== null) {
                // 有具体位置 @pos
                navigateAndCenter({
                  path: `${parsed.page}.md`,
                  details: { type: "position", pos: parsed.posNum }
                });
              } else if (parsed.header) {
                // 有标题 #header（page 已在 parseLinkTarget 中补全）
                navigateAndCenter({
                  path: `${parsed.page}.md`,
                  details: { type: "header", header: parsed.header }
                });
              } else if (parsed.page) {
                // 纯页面
                navigateAndCenter({ path: `${parsed.page}.md` });
              }
            } else {
              // 回退：使用 displayPage
              navigateAndCenter({ path: `${link.displayPage}.md` });
            }
          };
          
          col.appendChild(this.createButton("→", targetDisplay, navigateAction, "remote"));
        });
        wrapper.appendChild(col);
      }
    }

    container.appendChild(wrapper);
  },

  /**
   * 渲染右下角：反向链接
   */
  renderBacklinks(backlinks) {
    const container = this.createContainer(this.bottomContainerId, true);
    container.innerHTML = "";

    // 同样加强类型检查
    if (!Array.isArray(backlinks) || backlinks.length === 0) {
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
      header.textContent = "Backlinks";
      if (colIndex > 0) header.style.opacity = "0.3";
      col.appendChild(header);

      columnItems.forEach(link => {
        const shortName = extractPageName(link.page);
        const fullName = `${link.page}@${link.pos}`;
        
        col.appendChild(this.createButton(shortName, fullName, () => {
          if (window.client) {
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
  // ★ 修复：确保 data 是数组，防止传入空对象
  Model.backlinks = Array.isArray(data) ? data : [];
  View.renderBacklinks(Model.backlinks);
}

/** 供 Lua 调用：更新前向链接数据 */
export function updateForwardlinks(data) {
  // ★ 修复：确保 data 是数组，防止传入空对象
  Model.forwardLinks = Array.isArray(data) ? data : [];
  View.renderForward(Model.forwardLinks);
}

/** 清空并重新渲染 */
export function refresh() {
  View.clearAll();
}

export function enable() {
  if (window[STATE_KEY]) return;
  window[STATE_KEY] = {};
  console.log("[LinkFloater] v5 Enabled");
}

export function disable() {
  if (window[STATE_KEY]) {
    View.clearAll();
    const top = document.getElementById(View.topContainerId);
    if (top) top.remove();
    const bot = document.getElementById(View.bottomContainerId);
    if (bot) bot.remove();
    window[STATE_KEY] = null;
  }
}
