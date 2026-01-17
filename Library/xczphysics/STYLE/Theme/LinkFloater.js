// Library/xczphysics/STYLE/Theme/LinkFloater.js
// LinkFloater v4 - 简化的 Column 2 解析方案

const STATE_KEY = "__LinkFloaterState_v4";

// ==========================================
// 辅助函数
// ==========================================

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
 */
function parseLinkTarget(target) {
  if (!target) return null;
  
  let page = target;
  let header = null;
  let posNum = null;
  
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
      page = hashIndex === 0 ? "" : target.substring(0, hashIndex);
      header = target.substring(hashIndex + 1);
    }
  }
  
  return { page, header, posNum, raw: target };
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
   * 渲染右上角：前向链接 (交替排列 Links 和 Go)
   */
  renderForward(forwardLinks) {
    const container = this.createContainer(this.topContainerId, false);
    container.innerHTML = "";

    if (!forwardLinks || forwardLinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const text = getFullText();

    // 为每个 forwardLink 提取完整的链接目标
    const enrichedLinks = forwardLinks.map(link => {
      const rawTarget = extractWikiLinkAtPos(text, link.pos);
      const parsed = parseLinkTarget(rawTarget);
      return {
        ...link,
        rawTarget: rawTarget,
        parsed: parsed
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
      // Column 1 (Links) - 第 i 列
      if (i < linksColumns.length) {
        const col = document.createElement("div");
        col.className = "sb-floater-col";
        
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Links";
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
        header.textContent = "Go";
        if (i > 0) header.style.opacity = "0.3";
        col.appendChild(header);

        goColumns[i].forEach(link => {
          const parsed = link.parsed;
          let targetDisplay = link.rawTarget || link.toPage;
          
          const navigateAction = () => {
            if (!window.client) return;
            
            if (parsed) {
              if (parsed.posNum !== null) {
                client.navigate({
                  path: `${parsed.page}.md`,
                  details: { type: "position", pos: parsed.posNum }
                });
              } else if (parsed.header) {
                const targetPage = parsed.page || client.currentPage();
                client.navigate({
                  path: `${targetPage}.md`,
                  details: { type: "header", header: parsed.header }
                });
              } else if (parsed.page) {
                client.navigate({ path: `${parsed.page}.md` });
              }
            } else {
              client.navigate({ path: `${link.toPage}.md` });
            }
          };
          
          col.appendChild(this.createButton("→", targetDisplay, navigateAction, "remote"));
        });
        wrapper.appendChild(col);
      }
    }

    container.appendChild(wrapper);
  },

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
// Controller
// ==========================================

export function updateBacklinks(data) {
  Model.backlinks = data || [];
  View.renderBacklinks(Model.backlinks);
}

export function updateForwardlinks(data) {
  Model.forwardLinks = data || [];
  View.renderForward(Model.forwardLinks);
}

export function refresh() {
  View.clearAll();
}

export function enable() {
  if (window[STATE_KEY]) return;
  window[STATE_KEY] = {};
  console.log("[LinkFloater] v4 Enabled");
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