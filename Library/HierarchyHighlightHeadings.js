const STATE_KEY = "__xhHighlightState_v5_HHH_Model";

// ---------- 核心：获取 CodeMirror 实例 ----------

function getEditorView() {
  // 尝试从标准 DOM 结构获取 CodeMirror 实例
  const dom = document.querySelector(".cm-editor");
  if (dom && dom.view) return dom.view;
  // 备用方案：SilverBullet 全局对象 (视版本而定)
  if (window.editor && window.editor.editorView) return window.editor.editorView;
  return null;
}

// ---------- 核心：基于文档模型(Model)的算法 ----------

// 解析一行文本是否为标题，返回 { level, text } 或 null
function parseHeading(lineText) {
  // 匹配 Markdown 标题：# 标题, ## 标题
  // 注意：SilverBullet 可能有 .sb-line-hN 类，但在纯文本中我们只认 Markdown 语法
  const match = lineText.match(/^(#{1,6})\s+(.*)/);
  if (match) {
    return {
      level: match[1].length,
      text: match[2].trim(),
      raw: lineText
    };
  }
  return null;
}

// 从指定行号(startLine)开始，向上遍历文档，找到所有祖先标题
// 返回数组: [H1对象, H2对象, ..., 当前标题对象]
function getAncestorsFromModel(view, startLineNumber) {
  const doc = view.state.doc;
  const ancestors = [];
  let currentMinLevel = 7; // 初始设为比 H6 更大

  // 1. 先判断当前行本身是不是标题
  const currentLineText = doc.line(startLineNumber).text;
  const currentHeading = parseHeading(currentLineText);
  
  if (currentHeading) {
    ancestors.unshift(currentHeading);
    currentMinLevel = currentHeading.level;
  }

  // 2. 向上回溯
  for (let l = startLineNumber - 1; l >= 1; l--) {
    // 如果已经找到 H1，就不需要再找了
    if (currentMinLevel === 1) break;

    const line = doc.line(l);
    const h = parseHeading(line.text);
    
    if (h && h.level < currentMinLevel) {
      ancestors.unshift(h);
      currentMinLevel = h.level;
    }
  }
  
  return ancestors;
}

// ---------- 渲染逻辑 ----------

function getFrozenContainer() {
  let fc = document.getElementById("sb-frozen-container");
  if (!fc) {
    fc = document.createElement("div");
    fc.id = "sb-frozen-container";
    document.body.appendChild(fc);
  }
  return fc;
}

function clearFrozen() {
  const fc = document.getElementById("sb-frozen-container");
  if (fc) {
    fc.innerHTML = "";
    fc.style.display = "none";
  }
}

// 渲染冻结栏 (因为 DOM 可能不存在，所以我们基于 Text 数据创建元素)
function renderFrozenBranch(container, branchHeadings) {
  const fc = getFrozenContainer();

  if (!branchHeadings || branchHeadings.length === 0) {
    clearFrozen();
    return;
  }

  fc.style.display = "flex";
  fc.style.flexDirection = "column";
  fc.style.alignItems = "flex-start";
  fc.innerHTML = "";

  branchHeadings.forEach(h => {
    const el = document.createElement("div");
    el.classList.add("sb-frozen-clone");
    // 给一个对应的 hN 类，以便继承颜色样式
    el.classList.add(`sb-line-h${h.level}`);
    el.innerText = h.text; // 纯文本渲染，丢失加粗/斜体，但保证层级正确
    fc.appendChild(el);
  });

  const rect = container.getBoundingClientRect();
  fc.style.left = rect.left + "px";
}

// ---------- 高亮逻辑 (仅针对可见 DOM) ----------

function clearClasses(root) {
  root.querySelectorAll(".sb-active, .sb-active-anc, .sb-active-desc, .sb-active-current")
    .forEach(el => el.classList.remove("sb-active", "sb-active-anc", "sb-active-desc", "sb-active-current"));
}

// 尝试高亮当前视口内可见的标题元素
// 注意：我们只高亮"在屏幕上"的。屏幕外的不用管，反正看不见。
function highlightVisibleElements(container, branchHeadings) {
  clearClasses(container);
  
  // 简单的文本匹配策略：如果 DOM 里的文本和我们的标题链匹配，就高亮
  // 这比 DOM 遍历更鲁棒
  const visibleHeadings = Array.from(container.querySelectorAll(".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6"));
  
  // 提取纯文本用于比对
  const branchTexts = branchHeadings.map(h => h.text);
  
  visibleHeadings.forEach(el => {
    // 移除 markdown 标记 (#) 后的纯文本
    const text = el.innerText.replace(/^#+\s+/, '').trim();
    if (branchTexts.includes(text)) {
      el.classList.add("sb-active");
      // 区分当前还是祖先? 比较难精确对应，统一高亮即可，或者：
      if (text === branchTexts[branchTexts.length - 1]) {
        el.classList.add("sb-active-current");
      } else {
        el.classList.add("sb-active-anc");
      }
    }
  });
}

// ---------- 主逻辑 ----------

export function enableHighlight(opts = {}) {
  const containerSelector = opts.containerSelector || "#sb-main";
  const debug = !!opts.debug;

  const bind = () => {
    const container = document.querySelector(containerSelector);
    const view = getEditorView();

    if (!container || !view) {
      // 没找到 View 可能是加载时机问题，稍后重试
      if (debug) console.log("[HHH] Waiting for CodeMirror View...");
      setTimeout(bind, 500);
      return;
    }

    if (debug) console.log("[HHH] CodeMirror View found! Hooking events.");

    // 清理旧状态
    if (window[STATE_KEY] && window[STATE_KEY].cleanup) window[STATE_KEY].cleanup();

    // 状态更新核心函数
    function updateState(sourceType, event) {
      let targetLine = -1;

      if (sourceType === 'scroll') {
        // 算法：获取视口顶部对应的 Block
        // 40px 是为了让标题稍微滚过顶部一点点才切换
        const topBlock = view.lineBlockAtHeight(view.scrollDOM.scrollTop + 40);
        targetLine = view.state.doc.lineAt(topBlock.from).number;
      } else if (sourceType === 'hover') {
        // 算法：根据鼠标坐标获取文档位置
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) return; // 鼠标不在编辑器文字区域
        targetLine = view.state.doc.lineAt(pos).number;
      }

      if (targetLine === -1) return;

      // 使用 Model 获取祖先链（不受 DOM 虚拟化影响）
      const ancestors = getAncestorsFromModel(view, targetLine);
      
      // 渲染
      renderFrozenBranch(container, ancestors);
      highlightVisibleElements(container, ancestors);
    }

    // --- 事件监听 ---

    // 1. 鼠标悬浮
    function onPointerOver(e) {
      if (!container.contains(e.target)) return;
      // 只有停留在标题行上才触发？或者停留在任意内容都显示上下文？
      // 原逻辑是"查找最近上方标题"，这里我们简化为：显示鼠标所在位置的上下文
      updateState('hover', e);
    }
    
    // 2. 鼠标离开
    function onPointerOut(e) {
       const to = e.relatedTarget;
       if (!to || !container.contains(to)) {
         clearClasses(container);
         // clearFrozen(); // 可选：移出时隐藏冻结栏
       }
    }

    // 3. 滚动
    let isScrolling = false;
    function onScroll() {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          updateState('scroll');
          isScrolling = false;
        });
        isScrolling = true;
      }
    }

    // 4. 内容变化 (编辑时)
    const updateListener = view.dispatch({
        effects: [], // 这是一个占位，实际上我们需要注册一个 UpdateListener
    }); 
    // 由于我们无法直接注入 CM 插件，我们使用 MutationObserver 监听 DOM 变化作为替补，
    // 或者简单地依靠 scroll/hover 触发。
    // 为了响应编辑（如修改了标题），我们可以监听 keyup
    function onKeyUp() {
        // 稍微延迟等待 Model 更新
        setTimeout(() => updateState('scroll'), 100);
    }

    container.addEventListener("pointermove", onPointerOver); // pointermove 比 over 更灵敏
    container.addEventListener("pointerout", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("keyup", onKeyUp);

    // 初始化运行一次
    updateState('scroll');

    window[STATE_KEY] = {
      cleanup() {
        container.removeEventListener("pointermove", onPointerOver);
        container.removeEventListener("pointerout", onPointerOut);
        window.removeEventListener("scroll", onScroll);
        container.removeEventListener("keyup", onKeyUp);
        clearFrozen();
        clearClasses(container);
      }
    };
  };

  bind();
}

export function disableHighlight() {
  const st = window[STATE_KEY];
  if (st && st.cleanup) st.cleanup();
  window[STATE_KEY] = null;
}
