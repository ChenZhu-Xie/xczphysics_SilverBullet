// Library/HierarchyHighlightHeadings.js
// HHH v9 - Fix: Code Block Interference & Persistent Highlight (Typing/Clicking)

const STATE_KEY = "__xhHighlightState_v9_HHH_Final";

// ---------- 1. 获取全文与源码解析 ----------

function getFullTextFromCodeMirror() {
  try {
    // 尝试获取最新的编辑器状态
    if (window.client && client.editorView && client.editorView.state) {
      return client.editorView.state.sliceDoc();
    }
  } catch (e) {
    console.warn("[HHH] getFullText failed:", e);
  }
  return "";
}

let FULL_HEADINGS = [];

function rebuildHeadingsSync() {
  const text = getFullTextFromCodeMirror();
  if (!text) {
    FULL_HEADINGS = [];
    return;
  }

  const list = [];
  // 正则匹配：行首的 # 标题
  // 注意：这仍然可能匹配到代码块内部的 #，所以后续必须通过文本比对来剔除
  const regex = /^(#{1,6})\s+([^\n]*)$/gm;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    let rawText = match[2].trim();
    // 简单的清理，用于显示
    let displayText = rawText;

    list.push({
      level: match[1].length,
      text: rawText,        // 源码中的原始文本（用于比对）
      displayText: displayText // 冻结栏显示的文本
    });
  }

  FULL_HEADINGS = list;
}

// ---------- 2. 核心修复：智能索引映射 ----------

// 目标：找到 DOM 元素 (domH) 在 FULL_HEADINGS 源码列表中的正确位置
// 解决了代码块中包含 # 导致索引错位的问题
function findFullIndexForDomHeading(domH, domIndexHint) {
  if (FULL_HEADINGS.length === 0) rebuildHeadingsSync();

  const domLevel = getLevel(domH);
  // 获取 DOM 标题的纯文本，去除可能的伪元素干扰
  const domText = domH.innerText.replace(/^#+\s*/, "").trim(); 

  // 辅助函数：判断源码标题和 DOM 标题是否看起来是同一个
  const isMatch = (srcItem) => {
    if (!srcItem) return false;
    if (srcItem.level !== domLevel) return false;
    // 文本包含检查：源码包含DOM文本，或DOM包含源码文本
    // 这种双向检查能兼容 Widget 渲染前后长度不一致的情况
    return srcItem.text.includes(domText) || domText.includes(srcItem.text);
  };

  // 策略 1: 优先检查 hint 索引 (假设没有代码块干扰的理想情况)
  if (domIndexHint >= 0 && domIndexHint < FULL_HEADINGS.length) {
    if (isMatch(FULL_HEADINGS[domIndexHint])) {
      return domIndexHint;
    }
  }

  // 策略 2: 局部搜索 (Sliding Window)
  // 因为代码块通常只会导致索引偏移一点点，或者偏移一段
  // 我们以 hint 为中心，向前后搜索最近的匹配项
  const searchRadius = 20; // 向前后搜20个标题
  for (let offset = 1; offset <= searchRadius; offset++) {
    // 向后搜
    if (isMatch(FULL_HEADINGS[domIndexHint + offset])) return domIndexHint + offset;
    // 向前搜
    if (isMatch(FULL_HEADINGS[domIndexHint - offset])) return domIndexHint - offset;
  }

  // 策略 3: 全局搜索 (Fallback)
  // 如果偏移太远，只好遍历整个数组
  for (let i = 0; i < FULL_HEADINGS.length; i++) {
    if (isMatch(FULL_HEADINGS[i])) return i;
  }

  return -1;
}

// 构建面包屑路径 (父级链)
function getBranchFromFullHeadings(idx) {
  if (idx < 0 || idx >= FULL_HEADINGS.length) return null;
  const leaf = FULL_HEADINGS[idx];
  const ancestors = [];
  let currentLevel = leaf.level;

  // 向前回溯寻找父级
  for (let i = idx - 1; i >= 0; i--) {
    const h = FULL_HEADINGS[i];
    // 严格小于当前层级才算父级 (标准 Markdown 逻辑)
    if (h.level < currentLevel) {
      ancestors.unshift(h);
      currentLevel = h.level;
      if (currentLevel === 1) break;
    }
  }
  return { ancestors, leaf };
}

// ---------- 3. DOM 工具函数 ----------

function getLevel(el) {
  // SilverBullet 这里的类名通常是 sb-line-h1 到 sb-line-h6
  for (let i = 1; i <= 6; i++) {
    if (el.classList && el.classList.contains(`sb-line-h${i}`)) return i;
  }
  // Fallback check
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (/^h[1-6]$/.test(tag)) return Number(tag[1]);
  return 0;
}

function listHeadings(root, selector) {
  return Array.from(root.querySelectorAll(selector));
}

function collectAncestors(startIndex, headings, startLevel) {
  const res = [];
  let minLevel = startLevel;
  for (let i = startIndex - 1; i >= 0; i--) {
    const lvl = getLevel(headings[i]);
    if (lvl < minLevel) {
      res.unshift(headings[i]);
      minLevel = lvl;
      if (minLevel === 1) break;
    }
  }
  return res;
}

function collectDescendants(startIndex, headings, startLevel) {
  const res = [];
  for (let i = startIndex + 1; i < headings.length; i++) {
    const lvl = getLevel(headings[i]);
    if (lvl <= startLevel) break;
    res.push(headings[i]);
  }
  return res;
}

// ---------- 4. 界面渲染 ----------

function clearClasses(root) {
  const cls = ["sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"];
  root.querySelectorAll("." + cls.join(", .")).forEach(el => el.classList.remove(...cls));
}

function getFrozenContainer() {
  let fc = document.getElementById("sb-frozen-container");
  if (!fc) {
    fc = document.createElement("div");
    fc.id = "sb-frozen-container";
    fc.style.display = "none";
    document.body.appendChild(fc);
  }
  return fc;
}

function updateFrozenBar(domHeading, domIndex) {
  const fc = getFrozenContainer();
  rebuildHeadingsSync(); // 确保数据最新

  // 使用智能索引查找，修复层级错误
  const idx = findFullIndexForDomHeading(domHeading, domIndex);

  if (idx === -1) {
    fc.style.display = "none";
    return;
  }

  const branch = getBranchFromFullHeadings(idx);
  if (!branch) {
    fc.style.display = "none";
    return;
  }

  fc.innerHTML = "";
  fc.style.display = "flex";
  
  [...branch.ancestors, branch.leaf].forEach(h => {
    const div = document.createElement("div");
    div.className = `sb-frozen-item sb-frozen-l${h.level}`;
    div.textContent = h.displayText || h.text; 
    fc.appendChild(div);
  });
  
  // 定位调整
  const container = document.querySelector("#sb-main");
  if(container) {
      const cRect = container.getBoundingClientRect();
      fc.style.left = (cRect.left + 10) + "px";
  }
}

// ---------- 5. 查找当前上下文标题 (修复打字/点击无高亮) ----------

// 从当前 DOM 节点向上查找最近的标题行
function findClosestHeadingPreceding(startNode, headingSelector) {
  if (!startNode) return null;
  
  // 1. 找到该节点所属的行 (cm-line)
  let currentLine = startNode;
  if (startNode.nodeType === 3) currentLine = startNode.parentElement; // 文本节点 -> 父级
  
  while (currentLine && (!currentLine.classList || !currentLine.classList.contains("cm-line"))) {
    currentLine = currentLine.parentElement;
    if (!currentLine || currentLine === document.body) return null;
  }

  if (!currentLine) return null;

  // 2. 如果当前行本身就是标题，直接返回
  if (currentLine.matches(headingSelector)) return currentLine;

  // 3. 否则，向前遍历兄弟节点查找最近的标题
  let prev = currentLine.previousElementSibling;
  while (prev) {
    if (prev.matches && prev.matches(headingSelector)) {
      return prev;
    }
    prev = prev.previousElementSibling;
  }
  
  return null; // 到了文档顶部还没找到标题
}

// ---------- 6. 主逻辑 ----------

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const headingSelector = opts.headingSelector || ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6";

  const bind = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      requestAnimationFrame(bind);
      return;
    }

    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    // 核心渲染函数
    function render(targetHeading) {
      if (!targetHeading) {
        // 如果找不到标题（比如在文档最开头且没有H1），清除所有高亮
        clearClasses(container);
        const fc = document.getElementById("sb-frozen-container");
        if(fc) fc.style.display = "none";
        return;
      }

      const headings = listHeadings(container, headingSelector);
      const idx = headings.indexOf(targetHeading);
      // 注意：idx === -1 也要处理吗？通常意味着 targetHeading 不在当前列表中（可能是脏数据），忽略即可
      if (idx === -1) return;

      const level = getLevel(targetHeading);
      const ancestors = collectAncestors(idx, headings, level);
      const descendants = collectDescendants(idx, headings, level);

      clearClasses(container);
      
      // 添加类名
      targetHeading.classList.add("sb-active", "sb-active-current");
      ancestors.forEach(el => el.classList.add("sb-active", "sb-active-anc"));
      descendants.forEach(el => el.classList.add("sb-active", "sb-active-desc"));

      // 更新顶部冻结栏
      updateFrozenBar(targetHeading, idx);
    }

    // --- 事件监听器 ---

    // 1. 鼠标移动 (Hover)
    function onPointerOver(e) {
      if (!e.target) return;
      // 检查鼠标是否直接指在标题上
      let target = e.target;
      // 向上找几层以防指在 span 上
      while(target && target !== container && (!target.matches || !target.matches(headingSelector))) {
          target = target.parentElement;
      }
      if (target && target.matches && target.matches(headingSelector)) {
          render(target);
      }
    }
    
    // 2. 滚动 (Scroll)
    let isScrolling = false;
    function onScroll() {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          const headings = listHeadings(container, headingSelector);
          const triggerY = 150; // 判定线
          let current = null;
          
          for (let h of headings) {
            const rect = h.getBoundingClientRect();
            if (rect.top < triggerY) {
               current = h; 
            } else {
               break; 
            }
          }
          if (current) render(current);
          isScrolling = false;
        });
        isScrolling = true;
      }
    }

    // 3. 点击与打字 (Click & Type) - 修复持久化高亮
    function onInteract(e) {
        // 使用 requestAnimationFrame 确保 DOM 更新后再查找
        requestAnimationFrame(() => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const node = selection.anchorNode; // 光标所在节点
                const h = findClosestHeadingPreceding(node, headingSelector);
                if (h) {
                    render(h);
                }
            }
        });
    }

    // 绑定事件
    container.addEventListener("pointerover", onPointerOver);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // 新增：监听鼠标抬起（覆盖点击定位）和键盘抬起（覆盖打字）
    container.addEventListener("mouseup", onInteract);
    container.addEventListener("keyup", onInteract);

    // 注册清理函数
    window[STATE_KEY] = {
      cleanup() {
        container.removeEventListener("pointerover", onPointerOver);
        window.removeEventListener("scroll", onScroll);
        container.removeEventListener("mouseup", onInteract);
        container.removeEventListener("keyup", onInteract);
        
        clearClasses(container);
        const fc = document.getElementById("sb-frozen-container");
        if (fc) fc.remove();
      }
    };
    
    console.log("[HHH] v9 Enabled: Smart Indexing + Persistent Interaction");
  };

  bind();
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
    window[STATE_KEY] = null;
  }
}
