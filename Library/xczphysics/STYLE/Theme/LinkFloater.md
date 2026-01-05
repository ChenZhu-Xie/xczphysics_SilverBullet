---
author: Chenzhu-Xie
name: Library/xczphysics/STYLE/Theme/LinkFloater
tags: meta/library
files:
- LinkFloater.js
pageDecoration.prefix: "🔗 "
---

# LinkFloater - Realtime Link Navigator

## 1. JS Logic

> **Note**: Click the button below to save the JS core logic.
> ${widgets.commandButton("Save: LinkFloater.js")}

```space-lua
local jsCode = [[
// /.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js

const STATE_KEY = "__LinkFloaterState";

// ==========================================
// 1. Model & Logic
// ==========================================

const Model = {
  // 缓存反向链接数据
  backlinks: [],

  // 获取当前编辑器文本
  getText() {
    if (window.client && client.editorView && client.editorView.state) {
      return client.editorView.state.sliceDoc();
    }
    return "";
  },

  // 解析前向链接 (Forward Links)
  // 返回对象: { localLinks: [], remoteLinks: [] }
  parseForwardLinks() {
    const text = this.getText();
    const localLinks = [];
    const remoteLinks = [];
    const currentName = window.client ? client.getCurrentPage() : "";

    // Regex 匹配 [[Page]] 或 [[Page|Alias]] 或 [[Page#Anchor]]
    // 捕获组 1: Page name (可能包含 #Anchor)
    const regex = /$$\[([^$$\|]+)(?:\|[^\]]+)?\]\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const rawLink = match[1];
      let page = rawLink;
      let anchor = "";

      // 分离 Page 和 Anchor
      if (rawLink.includes("#")) {
        const parts = rawLink.split("#");
        page = parts[0];
        anchor = parts.slice(1).join("#");
      }

      // 判断是否为页内链接 (Local)
      // 1. 显式指向当前页面: [[CurrentPage#Section]]
      // 2. 纯锚点: [[#Section]] (page 为空)
      const isLocal = (page === "" || page === currentName) && anchor !== "";

      const linkObj = {
        full: rawLink,
        page: page || currentName,
        anchor: anchor,
        pos: match.index // 记录链接在文本中的位置，可用于高亮或定位
      };

      if (isLocal) {
        localLinks.push(linkObj);
      } else {
        // 排除指向当前页但没有锚点的链接（通常是无效引用，或者是自引用）
        if (page !== currentName) {
            remoteLinks.push(linkObj);
        }
      }
    }
    
    // 去重 (可选，这里简单根据 full 字段去重)
    const uniqueRemote = [...new Map(remoteLinks.map(item => [item.page, item])).values()];
    
    return { localLinks, remoteLinks: uniqueRemote };
  }
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
        el.style.top = "60px"; // 避开顶部栏
      }
      document.body.appendChild(el);
    }
    return el;
  },

  createButton(text, onClick, type) {
    const btn = document.createElement("div");
    btn.className = `sb-floater-btn sb-floater-${type}`;
    btn.textContent = text;
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick();
    };
    return btn;
  },

  // 渲染右上角：前向链接 (2列)
  renderForward(localLinks, remoteLinks) {
    const container = this.createContainer(this.topContainerId, false);
    container.innerHTML = "";
    
    if (localLinks.length === 0 && remoteLinks.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    // 创建两列布局
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "8px";

    // Column 1: Local / Anchors
    if (localLinks.length > 0) {
        const col1 = document.createElement("div");
        col1.className = "sb-floater-col";
        // Header
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Anchors";
        col1.appendChild(header);

        localLinks.forEach(link => {
            const label = link.anchor;
            col1.appendChild(this.createButton(label, () => {
                // 跳转到锚点
                 client.navigate({ 
                    page: link.page, 
                    pos: link.anchor // SB 支持通过 pos 传锚点字符串? 或者 url hash
                 });
                 // 备用方案：如果 client.navigate 不支持直接传 anchor 字符串作为 pos
                 // 可以构造 path: "Page#Anchor"
                 // 实际上 SB navigate 接受 { page, pos }，pos 如果是数字是光标位置。
                 // 对于锚点，通常需要解析 URL。
                 // 这里尝试直接 navigate 到 path
                 client.navigate({ path: link.page + "#" + link.anchor });
            }, "local"));
        });
        wrapper.appendChild(col1);
    }

    // Column 2: Remote / Outgoing
    if (remoteLinks.length > 0) {
        const col2 = document.createElement("div");
        col2.className = "sb-floater-col";
         // Header
        const header = document.createElement("div");
        header.className = "sb-floater-header";
        header.textContent = "Outgoing";
        col2.appendChild(header);

        remoteLinks.forEach(link => {
            col2.appendChild(this.createButton(link.page, () => {
                client.navigate({ page: link.page });
            }, "remote"));
        });
        wrapper.appendChild(col2);
    }

    container.appendChild(wrapper);
  },

  // 渲染右下角：反向链接 (1列)
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
        // link 对象来自 Lua: { page: "PageName", pos: 123 }
        col.appendChild(this.createButton(link.page, () => {
             client.navigate({ page: link.page, pos: link.pos });
        }, "backlink"));
    });

    container.appendChild(col);
  }
};

// ==========================================
// 3. Controller
// ==========================================

// 供 Lua 调用的接口：更新反向链接数据
export function updateBacklinks(data) {
    // console.log("JS received backlinks:", data);
    Model.backlinks = data || [];
    View.renderBacklinks(Model.backlinks);
}

export function enable() {
    const containerSelector = "#sb-main"; // 监听主区域

    if (window[STATE_KEY]) return; // 已启用

    window[STATE_KEY] = {
        observer: null,
        timeout: null
    };

    // 实时更新前向链接
    function refreshForward() {
        const { localLinks, remoteLinks } = Model.parseForwardLinks();
        View.renderForward(localLinks, remoteLinks);
    }

    // 监听 DOM 变化或键盘事件来触发刷新
    // 简单的防抖处理
    function onActivity() {
        if (window[STATE_KEY].timeout) clearTimeout(window[STATE_KEY].timeout);
        window[STATE_KEY].timeout = setTimeout(refreshForward, 300);
    }

    // 初始渲染
    setTimeout(refreshForward, 500);

    // 绑定事件
    document.addEventListener("keyup", onActivity);
    document.addEventListener("click", onActivity); // 点击可能改变光标位置或切换页面

    // 也可以监听 DOM 变化 (更激进，但更实时)
    // const targetNode = document.querySelector(".cm-content");
    // if (targetNode) {
    //    const obs = new MutationObserver(onActivity);
    //    obs.observe(targetNode, { childList: true, subtree: true, characterData: true });
    //    window[STATE_KEY].observer = obs;
    // }

    console.log("[LinkFloater] Enabled");
}

export function disable() {
    if (window[STATE_KEY]) {
        document.removeEventListener("keyup", window[STATE_KEY].timeout); // 清理逻辑简化
        // 移除 DOM
        const top = document.getElementById(View.topContainerId);
        if (top) top.remove();
        const bot = document.getElementById(View.bottomContainerId);
        if (bot) bot.remove();
        
        window[STATE_KEY] = null;
    }
}
]]

command.define {
  name = "Save: LinkFloater.js",
  run = function()
    space.writeDocument("/.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js", jsCode)
    editor.flashNotification("LinkFloater JS saved!")
  end
}
```

## 2. Lua Logic (Bridge)
This part queries the index and pushes data to the JS view.

```space-lua
-- 监听系统就绪和页面加载事件
event.listen {
  name = "system:ready",
  run = function()
    -- 只有在客户端模式下才加载 JS
    if editor.isClient() then
        js.import("/.fs//.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").enable()
    end
  end
}

-- 定义一个函数来获取反链并推送到前端
local function pushBacklinks()
    if not editor.isClient() then return end
    
    local currentPage = editor.getCurrentPage()
    
    -- 查询反向链接
    -- 注意：这里使用 index.tag "link" 并筛选 toPage
    local query = [[
      from index.tag "link"
      where toPage = @page and page != @page
      select page, pos
    ]]
    
    -- 执行查询
    local results = system.invokeFunction("index.query", query, { page = currentPage })
    
    -- 将结果传递给 JS
    -- JS 模块导出了 updateBacklinks 函数
    js.import("/.fs//.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").updateBacklinks(results)
end

-- 监听页面加载完成
event.listen {
  name = "editor:pageLoaded",
  run = function()
    -- 延迟一点执行，确保 JS 环境已加载
    -- 也可以重新 enable 确保 View 存在
    js.import("/.fs//.fs/Library/xczphysics/STYLE/Theme/LinkFloater.js").enable()
    pushBacklinks()
  end
}

-- 监听页面保存 (反链可能发生变化，虽然通常是其他页面保存影响本页，但刷新一下无妨)
event.listen {
  name = "editor:pageSaved",
  run = function()
    pushBacklinks()
  end
}
```

## 3. CSS Style

```space-style
/* 悬浮窗容器定位 */
.sb-floater-container {
  position: fixed;
  right: 20px;
  z-index: 1000;
  pointer-events: none; /* 容器本身不阻挡点击，只有按钮阻挡 */
  font-family: sans-serif;
  font-size: 12px;
}

/* 列布局 */
.sb-floater-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 靠右对齐 */
  gap: 4px;
  pointer-events: auto;
}

/* 标题头 */
.sb-floater-header {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--secondary-text-color, #888);
  margin-bottom: 2px;
  margin-right: 2px;
  font-weight: bold;
}

/* 按钮样式 */
.sb-floater-btn {
  background: var(--bg-color, white);
  border: 1px solid var(--border-color, #ddd);
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color, #333);
}

.sb-floater-btn:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  border-color: var(--action-color, #007bff);
}

/* 不同类型的特定样式 */
.sb-floater-local {
  border-left: 3px solid #4caf50; /* Green for local anchors */
}

.sb-floater-remote {
  border-left: 3px solid #2196f3; /* Blue for outgoing */
}

.sb-floater-backlink {
  border-right: 3px solid #ff9800; /* Orange for backlinks (right side border) */
  border-left: 1px solid var(--border-color, #ddd); /* reset left */
}

/* Dark mode 适配 */
html[data-theme="dark"] .sb-floater-btn {
  background: #2d2d2d;
  border-color: #444;
  color: #ccc;
}
```
