const STATE_KEY = "__xhHighlightState_v4_Clone";

// --- 配置 ---
const CONFIG = {
  containerId: "sb-frozen-container",
  // 顶部导航栏的高度偏移，如果被遮挡请调整此值（例如 35）
  topOffset: 0, 
  // 标题选择器（匹配 SB 的渲染类名）
  headingSelector: ".sb-line-h1, .sb-line-h2, .sb-line-h3, .sb-line-h4, .sb-line-h5, .sb-line-h6"
};

// --- 辅助函数 ---

function getLevel(el) {
  if (!el || !el.classList) return 10;
  if (el.classList.contains('sb-line-h1')) return 1;
  if (el.classList.contains('sb-line-h2')) return 2;
  if (el.classList.contains('sb-line-h3')) return 3;
  if (el.classList.contains('sb-line-h4')) return 4;
  if (el.classList.contains('sb-line-h5')) return 5;
  if (el.classList.contains('sb-line-h6')) return 6;
  return 10; // 非标题
}

// 获取或者创建冻结容器
function getFrozenContainer() {
  let div = document.getElementById(CONFIG.containerId);
  if (!div) {
    div = document.createElement('div');
    div.id = CONFIG.containerId;
    document.body.appendChild(div);
  }
  return div;
}

// 查找某个元素之前最近的祖先链 [H1, H2, H3...]
// 这里使用 DOM 倒序遍历，因为 CM6 结构是扁平的
function findAncestors(startNode) {
  const ancestors = [];
  let currentLevel = 10; // Start high
  
  // 如果起始点本身就是标题，先处理它
  const startLvl = getLevel(startNode);
  if (startLvl < 10) {
    currentLevel = startLvl;
    ancestors.unshift(startNode);
  }

  let curr = startNode.previousElementSibling;
  while (curr) {
    const lvl = getLevel(curr);
    // 只有找到更高级别（数字更小）的标题才加入
    if (lvl < currentLevel) {
      ancestors.unshift(curr);
      currentLevel = lvl;
      if (currentLevel === 1) break; // 找到 H1 就结束
    }
    curr = curr.previousElementSibling;
  }
  return ancestors;
}

// --- 主逻辑 ---

export function enableHighlight() {
  const editorContainer = document.querySelector("#sb-main");
  if (!editorContainer) {
    setTimeout(enableHighlight, 500);
    return;
  }

  // 清理旧实例
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
  }

  const frozenContainer = getFrozenContainer();
  let isTicking = false;

  // 核心更新函数
  function update() {
    // 1. 找到当前视口最上方的元素（锚点）
    // 我们取视口顶部往下一点点的位置探测元素
    const checkY = window.scrollY + CONFIG.topOffset + 50; 
    
    // 获取所有行
    const lines = document.querySelectorAll('.cm-line');
    let anchorNode = null;

    // 简单二分或遍历找到第一个在视口内的行
    // 由于 querySelectorAll 是文档顺序，直接找第一个 offsetTop + height > scrollY 的即可
    for (let i = 0; i < lines.length; i++) {
      const rect = lines[i].getBoundingClientRect();
      // 如果元素的底部在视口顶部下方，说明这个元素是当前可见的（或刚被切断的）
      if (rect.bottom > CONFIG.topOffset) {
        anchorNode = lines[i];
        break;
      }
    }

    if (!anchorNode) {
        frozenContainer.innerHTML = '';
        return;
    }

    // 2. 计算祖先链 (Active Branch)
    const activeBranch = findAncestors(anchorNode);

    // 3. 高亮处理 (Highlighting)
    // 移除所有旧高亮
    document.querySelectorAll('.sb-active').forEach(el => el.classList.remove('sb-active'));
    // 给当前链条上的原标题加高亮
    activeBranch.forEach(el => el.classList.add('sb-active'));

    // 4. 冻结处理 (Freezing / Cloning)
    // 清空容器，重新渲染
    frozenContainer.innerHTML = '';
    
    let cumulativeHeight = CONFIG.topOffset;
    
    // 检测顶部导航栏高度（如果有）
    const topBar = document.querySelector("#sb-top");
    if (topBar) {
        cumulativeHeight += topBar.offsetHeight;
    }

    activeBranch.forEach((h) => {
      // 克隆节点
      const clone = h.cloneNode(true);
      clone.classList.add('sb-frozen-clone');
      clone.classList.remove('sb-active'); // 克隆体不需要 active 类，它有专门样式
      
      // 设置样式
      clone.style.position = 'absolute'; // 容器是 fixed，里面用 absolute 堆叠
      clone.style.top = `${cumulativeHeight}px`;
      clone.style.left = `${h.getBoundingClientRect().left}px`; // 对齐左边
      clone.style.width = `${h.getBoundingClientRect().width}px`; // 对齐宽度
      
      frozenContainer.appendChild(clone);
      
      // 累加高度
      cumulativeHeight += clone.getBoundingClientRect().height;
    });

    isTicking = false;
  }

  function onScrollOrInteract() {
    if (!isTicking) {
      window.requestAnimationFrame(update);
      isTicking = true;
    }
  }

  // --- 事件绑定 ---
  
  // 1. 滚动时更新
  window.addEventListener('scroll', onScrollOrInteract, { passive: true });
  
  // 2. 鼠标点击/键盘输入时更新 (解决“点击取消高亮”问题)
  // 因为点击可能导致光标移动，光标移动可能导致编辑器重绘
  editorContainer.addEventListener('click', onScrollOrInteract);
  editorContainer.addEventListener('keyup', onScrollOrInteract);

  // 3. 监听 DOM 变化 (内容加载、折叠展开)
  const observer = new MutationObserver((mutations) => {
    onScrollOrInteract();
  });
  observer.observe(editorContainer, { childList: true, subtree: true, attributes: false });

  // 4. Resize
  window.addEventListener('resize', onScrollOrInteract);

  // 初始化
  onScrollOrInteract();

  // --- 清理 ---
  window[STATE_KEY] = {
    cleanup: () => {
      window.removeEventListener('scroll', onScrollOrInteract);
      window.removeEventListener('resize', onScrollOrInteract);
      editorContainer.removeEventListener('click', onScrollOrInteract);
      editorContainer.removeEventListener('keyup', onScrollOrInteract);
      observer.disconnect();
      if (frozenContainer) frozenContainer.innerHTML = '';
      document.querySelectorAll('.sb-active').forEach(el => el.classList.remove('sb-active'));
    }
  };
  
  console.log("[HHH] Highlight & Freeze enabled (Clone Mode)");
}

export function disableHighlight() {
  if (window[STATE_KEY] && window[STATE_KEY].cleanup) {
    window[STATE_KEY].cleanup();
  }
}
