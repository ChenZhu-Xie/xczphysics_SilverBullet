// Library/xczphysics/STYLE/Theme/LinkFloater.js
// LinkFloater v2 - Lua 双向通信 + 悬浮展开 + 样式优化

const STATE_KEY = "__LinkFloaterState";

// ==========================================
// 辅助函数
// ==========================================

/**
 * 从完整路径提取页面名称（保留 @pos 和 #header）
 * 例如: "folder/subfolder/PageName@123" → "PageName@123"
 *       "folder/PageName#Section" → "PageName#Section"
 */
function extractPageName(fullRef) {
  if (!fullRef) return "";
  
  let suffix = "";
  let basePath = fullRef;
  
  // 分离后缀（@pos 或 #header）
  const atIndex = fullRef.lastIndexOf("@");
  const hashIndex = fullRef.lastIndexOf("#");
  
  if (atIndex > 0) {
    suffix = fullRef.substring(atIndex);
    basePath = fullRef.substring(0, atIndex);
  } else if (hashIndex > 0) {
    suffix = fullRef.substring(hashIndex);
    basePath = fullRef.substring(0, hashIndex);
  }
  
  // 提取最后一部分作为页面名
  const parts = basePath.split("/");
  const pageName = parts[parts.length - 1] || basePath;
  
  return pageName + suffix;
}

// ==========================================
// 1. Model & Logic
// ==========================================

const Model = {
  backlinks: [],
  forwardLinks: []
};

// ==========================================
// 2. View: 渲染悬浮窗
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
   * @param {string} displayText - 默认显示的短文本
   * @param {string} fullText - 悬浮时显示的完整文本
   * @param {Function} onClick - 点击回调
   * @param {string} type - 按钮类型 (local/remote/backlink)
   */
  createButton(displayText, fullText, onClick, type) {
    const btn = document.createElement("div");
    btn.className = `sb-floater-btn sb-floater-${type}`;
    btn.textContent = displayText;
    btn.title = fullText; // tooltip
    btn.dataset.fullText = fullText;
    btn.dataset.shortText = displayText;
    
    // 鼠标悬浮时展开显示完整内容
    btn.addEventListener("mouseenter", () => {
      if (fullText !== displayText) {
        btn.textContent = fullText;
        btn.style.maxWidth = "none";
      }
    });
    
    btn.addEventListener("mouseleave", () => {
      btn.textContent = displayText;
      btn.style.maxWidth = "";
    });
    
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick();
    };
    
    return btn;
  },

  /**
   * 渲染右上角：前向链接 (2列)
   * Column 1: 链接名称 → 点击跳转到当前页面中该链接的位置
   * Column 2: → → 点击跳转到目标页面
   */
  renderForward(forwardLinks) {
    const container = this.createContainer(this.topContainerId, false);
    container.innerHTML = "";

    if (!forwardLinks || forwardLinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "8px";

    // ========== Column 1: 链接引用（当前页面位置） ==========
    const col1 = document.createElement("div");
    col1.className = "sb-floater-col";
    
    const header1 = document.createElement("div");
    header1.className = "sb-floater-header";
    header1.textContent = "Links";
    col1.appendChild(header1);

    forwardLinks.forEach(link => {
      // link 来自 Lua: { ref, toPage, pos }
      const shortName = extractPageName(link.toPage);
      const fullName = link.ref;
      
      col1.appendChild(this.createButton(shortName, fullName, () => {
        // 跳转到当前页面中该链接的位置
        if (window.client) {
          const currentPage = client.currentPath();
          client.navigate({
            path: currentPage,
            details: { type: "position", pos: link.pos }
          });
        }
      }, "local"));
    });
    wrapper.appendChild(col1);

    // ========== Column 2: → 按钮（目标页面） ==========
    const col2 = document.createElement("div");
    col2.className = "sb-floater-col";
    
    const header2 = document.createElement("div");
    header2.className = "sb-floater-header";
    header2.textContent = "Go";
    col2.appendChild(header2);

    forwardLinks.forEach(link => {
      const targetRef = link.toPage || link.ref;
      
      col2.appendChild(this.createButton("→", targetRef, () => {
        if (!window.client) return;
        
        // 解析目标：可能是 page@pos 或 page#header 或纯 page
        const ref = targetRef;
        
        // 检查是否包含 @pos
        const atIndex = ref.lastIndexOf("@");
        if (atIndex > 0) {
          const page = ref.substring(0, atIndex);
          const pos = parseInt(ref.substring(atIndex + 1));
          if (!isNaN(pos)) {
            client.navigate({
              path: `${page}.md`,
              details: { type: "position", pos: pos }
            });
            return;
          }
        }
        
        // 检查是否包含 #header
        const hashIndex = ref.lastIndexOf("#");
        if (hashIndex > 0) {
          const page = ref.substring(0, hashIndex);
          const header = ref.substring(hashIndex + 1);
          client.navigate({
            path: `${page}.md`,
            details: { type: "header", header: header }
          });
          return;
        }
        
        // 纯页面跳转
        client.navigate({
          path: `${ref}.md`
        });
      }, "remote"));
    });
    wrapper.appendChild(col2);

    container.appendChild(wrapper);
  },

  /**
   * 渲染右下角：反向链接 (1列)
   */
  renderBacklinks(backlinks) {
    const container = this.createContainer(this.bottomContainerId, true);
    container.innerHTML = "";

    if (!backlinks || backlinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const col = document.createElement("div");
    col.className = "sb-floater-col";

    const header = document.createElement("div");
    header.className = "sb-floater-header";
    header.textContent = "Backlinks";
    col.appendChild(header);

    backlinks.forEach(link => {
      // link 来自 Lua: { ref, page, pos }
      const shortName = extractPageName(link.ref);
      const fullName = link.ref;
      
      col.appendChild(this.createButton(shortName, fullName, () => {
        if (window.client) {
          client.navigate({
            path: `${link.page}.md`,
            details: { type: "position", pos: link.pos }
          });
        }
      }, "backlink"));
    });

    container.appendChild(col);
  }
};

// ==========================================
// 3. Controller - 导出接口
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

export function enable() {
  if (window[STATE_KEY]) return;
  window[STATE_KEY] = {};
  console.log("[LinkFloater] Enabled");
}

export function disable() {
  if (window[STATE_KEY]) {
    const top = document.getElementById(View.topContainerId);
    if (top) top.remove();
    const bot = document.getElementById(View.bottomContainerId);
    if (bot) bot.remove();
    window[STATE_KEY] = null;
  }
}