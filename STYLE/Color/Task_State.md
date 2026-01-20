
1. [css rendering vs markdown editing](https://community.silverbullet.md/t/css-rendering-vs-markdown-editing/3780/3?u=chenzhu-xie) #community #silverbullet

- [x] test [completed: 2026-01-20T15:41:00] [completed: 2026-01-20T15:41:00]

## CSS

### customized CSS 2

```space-style
/* ===========================================================
   Base: Smooth transition & visual polish
=========================================================== */
.cm-line {
  /* transition: background-color 0.1s ease-out; */
  border-radius: 4px; /* Optional: Modern rounded look */
}

/* ===========================================================
   L1: Hover state (Lowest priority)
=========================================================== */
.cm-line:hover {
  /* background-color: rgba(65, 90, 115, 0.15); */
  /* background-color: rgba(191, 117, 213, 0.15); */
  background-color: rgba(191, 117, 23, 0.15);
}

/* ===========================================================
   L2: Active cursor line (Medium priority)
   Persists as long as the cursor is on the line.
=========================================================== */
.sb-active-line {
  /* background-color: rgba(131, 195, 55, 0.15) !important; */
  /* background-color: rgba(192, 26, 77, 0.15) !important; */
  background-color: rgba(23, 126, 77, 0.15) !important;
}

/* ===========================================================
   L3: Mouse down / Click (Highest priority)
   Overrides everything else while the mouse button is held down.
=========================================================== */

/* Case A: Clicking a normal line */
.cm-line:active {
  background-color: rgba(255, 165, 0, 0.15) !important;
}

/* Case B: Clicking the ALREADY active line */
/* Slightly darker for better feedback when clicking where you are typing */
.cm-line.sb-active-line:active {
  background-color: rgba(255, 165, 0, 0.25) !important;
}
```

### customized CSS 1

```space
.cm-line:hover {
  background-color: rgba(65, 90, 115, 0.15);
} /* hover (lowest priority) */
.sb-active-line {
  background-color: rgba(131, 195, 55, 0.15) !important;
} /* cursor + Mouse released (medium priority) */
.cm-line:active {
  background-color: rgba(255, 165, 0, 0.15) !important;
} /* click (and hold) = Mouse pressed and not released */
```

```space-style
.sb-attribute[data-completed] {  
  opacity: 0.25;
}

/* ===========================================================
   4. 逻辑 C：鼠标悬停 (Hover) - 也高亮
=========================================================== */
.sb-line-li:hover .sb-attribute[data-completed] {
  opacity: 1;
}

/* 规则：光标所在行，任务内容不透明 */
.sb-active-line .sb-attribute[data-completed] {
  opacity: 1;
}

/* 规则：鼠标按下的行，任务内容不透明 */
.sb-line-li:active .sb-attribute[data-completed] {
  opacity: 1;
}
```

### MR-red css

```space
.sb-attribute[data-completed] {  
  opacity: 0.25;
  /* transition: opacity 0.1s ease-in-out; */
}

.sb-active-line .sb-attribute[data-completed] {
  opacity: 1;
}

/*As a bonus, I also added some background to the currently active line, because why not*/
.sb-active-line {
  background-color: rgba(65, 90, 115, 0.15) !important;
  /* transition: background-color 0.1s ease; */
}


/* Uncoment if you also want opacity:1 while hovering over the line */
.sb-line-li:hover .sb-attribute[data-completed] {
  opacity: 1;
}
```

## JS

### customized JS 5

```space
function setupActiveLineHighlighter()
    local styleEl = js.window.document.createElement("style")
    styleEl.innerHTML = [[
        #sb-ghost-active-line {
            position: absolute;
            left: 0;
            right: 0;
            pointer-events: none;
            background-color: rgba(131, 195, 55, 0.12);
            z-index: 0;
            will-change: transform;
        }
        /* 确保 scroller 是定位上下文 */
        .cm-scroller {
            position: relative !important;
        }
    ]]
    js.window.document.head.appendChild(styleEl)

    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const HIGHLIGHTER_ID = "sb-ghost-active-line";
        let lastTop = -1;
        let lastHeight = -1;
        let rafId = null;

        // ★ 获取或重新创建幽灵层（放在 .cm-scroller 内，不会被 CM6 删除）
        function getOrCreateHighlighter() {
            let el = document.getElementById(HIGHLIGHTER_ID);
            
            // 检查是否存在且在正确位置
            if (el && el.parentElement && el.parentElement.classList.contains("cm-scroller")) {
                return el;
            }
            
            // 需要重新创建
            if (el) el.remove();
            
            const scroller = document.querySelector(".cm-scroller");
            if (!scroller) return null;

            el = document.createElement("div");
            el.id = HIGHLIGHTER_ID;
            
            // ★ 关键：插入到 scroller，而非 content
            // scroller 不会被 CodeMirror 重建
            scroller.insertBefore(el, scroller.firstChild);
            
            console.log("[ActiveLine] Highlighter created/recreated");
            return el;
        }

        function updateHighlighter() {
            if (!window.client || !client.editorView) return;
            
            const view = client.editorView;
            const state = view.state;
            
            // 检查是否有选区
            if (!state.selection || !state.selection.main) return;
            
            const pos = state.selection.main.head;
            
            // ★ 使用 lineBlockAt 获取行信息
            let lineBlock;
            try {
                lineBlock = view.lineBlockAt(pos);
            } catch (e) {
                return;
            }
            
            if (!lineBlock) return;

            // ★ 计算相对于 scroller 的位置
            // lineBlock.top 是相对于文档顶部的，需要加上 content 的 padding
            const content = document.querySelector(".cm-content");
            if (!content) return;
            
            const contentStyle = window.getComputedStyle(content);
            const paddingTop = parseFloat(contentStyle.paddingTop) || 0;
            
            const newTop = lineBlock.top + paddingTop;
            const newHeight = lineBlock.height;

            // 位置没变，只检查幽灵层是否还存在
            if (Math.abs(newTop - lastTop) < 0.5 && Math.abs(newHeight - lastHeight) < 0.5) {
                // ★ 即使位置没变，也要检查幽灵层是否被删除
                const el = getOrCreateHighlighter();
                if (el && el.style.transform !== `translateY(${newTop}px)`) {
                    el.style.transform = `translateY(${newTop}px)`;
                    el.style.height = newHeight + "px";
                }
                return;
            }

            lastTop = newTop;
            lastHeight = newHeight;

            const el = getOrCreateHighlighter();
            if (el) {
                el.style.transform = `translateY(${newTop}px)`;
                el.style.height = newHeight + "px";
            }
        }

        // ★ 同步更新（用于 MutationObserver 回调）
        function syncUpdate() {
            updateHighlighter();
        }

        // ★ 异步更新（用于频繁事件如 scroll）
        function scheduleUpdate() {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                rafId = null;
                updateHighlighter();
            });
        }

        function init() {
            if (!window.client || !client.editorView) {
                setTimeout(init, 500);
                return;
            }

            const scroller = document.querySelector(".cm-scroller");
            const cursorLayer = document.querySelector(".cm-cursorLayer");
            const content = document.querySelector(".cm-content");

            if (!scroller) {
                setTimeout(init, 500);
                return;
            }

            // ★ 监听光标层变化（光标移动、闪烁）
            if (cursorLayer) {
                const cursorObserver = new MutationObserver(syncUpdate);
                cursorObserver.observe(cursorLayer, { 
                    attributes: true, 
                    subtree: true, 
                    childList: true 
                });
            }

            // ★ 监听内容层变化（打字、删除）- 同步执行！
            if (content) {
                const contentObserver = new MutationObserver((mutations) => {
                    // ★ 检查幽灵层是否被删除
                    const el = document.getElementById(HIGHLIGHTER_ID);
                    if (!el || !document.body.contains(el)) {
                        // 幽灵层被删除了，立即恢复
                        syncUpdate();
                    } else {
                        // 正常更新
                        syncUpdate();
                    }
                });
                contentObserver.observe(content, { 
                    childList: true, 
                    subtree: true,
                    characterData: true
                });
            }

            // ★ 监听 scroller 变化（检测幽灵层被删除）
            const scrollerObserver = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    if (m.removedNodes.length > 0) {
                        for (const node of m.removedNodes) {
                            if (node.id === HIGHLIGHTER_ID) {
                                // 幽灵层被删除，立即重建
                                console.log("[ActiveLine] Highlighter removed, recreating...");
                                syncUpdate();
                                return;
                            }
                        }
                    }
                }
            });
            scrollerObserver.observe(scroller, { childList: true });

            // 滚动事件（使用 RAF 节流）
            scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
            
            // 点击事件
            window.addEventListener("click", () => setTimeout(syncUpdate, 10));
            
            // resize 事件
            window.addEventListener("resize", scheduleUpdate);

            // ★ 键盘事件 - 打字时立即更新
            window.addEventListener("keydown", syncUpdate);
            window.addEventListener("keyup", syncUpdate);

            // 初始更新
            syncUpdate();
            console.log("[ActiveLine] Ghost layer v2 initialized");
        }

        setTimeout(init, 800);
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

### customized JS 4

```space
function setupActiveLineHighlighter()
    local styleEl = js.window.document.createElement("style")
    styleEl.innerHTML = [[
        #sb-ghost-active-line {
            position: absolute;
            left: 0;
            right: 0;
            pointer-events: none;
            background-color: rgba(131, 195, 55, 0.12);
            z-index: -1;
            /* ★ 关键：不用 transition，用 will-change 提升层 */
            will-change: transform;
        }
        /* 让 .cm-content 成为定位上下文 */
        .cm-content {
            position: relative !important;
        }
    ]]
    js.window.document.head.appendChild(styleEl)

    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const HIGHLIGHTER_ID = "sb-ghost-active-line";
        let highlighter = null;
        let lastTop = -1;
        let lastHeight = -1;
        let updateScheduled = false;

        function ensureHighlighter() {
            if (highlighter && document.body.contains(highlighter)) return highlighter;
            
            const content = document.querySelector(".cm-content");
            if (!content) return null;

            highlighter = document.createElement("div");
            highlighter.id = HIGHLIGHTER_ID;
            
            // ★ 关键：插入到 content 的最前面，作为第一个子元素
            content.insertBefore(highlighter, content.firstChild);
            
            return highlighter;
        }

        function updateHighlighter() {
            updateScheduled = false;
            
            if (!window.client || !client.editorView) return;
            
            const view = client.editorView;
            const state = view.state;
            const pos = state.selection.main.head;
            
            // ★ 使用 CM6 API 获取行信息（比 DOM 查询更可靠）
            const line = state.doc.lineAt(pos);
            const lineBlock = view.lineBlockAt(pos);
            
            if (!lineBlock) return;

            const newTop = lineBlock.top;
            const newHeight = lineBlock.height;

            // 位置没变，跳过
            if (Math.abs(newTop - lastTop) < 0.5 && Math.abs(newHeight - lastHeight) < 0.5) {
                return;
            }

            lastTop = newTop;
            lastHeight = newHeight;

            const el = ensureHighlighter();
            if (el) {
                // ★ 使用 transform 而非 top（触发 GPU 加速，不触发 reflow）
                el.style.transform = `translateY(${newTop}px)`;
                el.style.height = newHeight + "px";
            }
        }

        function scheduleUpdate() {
            if (updateScheduled) return;
            updateScheduled = true;
            // ★ 使用 requestAnimationFrame 确保在渲染前完成
            requestAnimationFrame(updateHighlighter);
        }

        function init() {
            if (!window.client || !client.editorView) {
                setTimeout(init, 500);
                return;
            }

            const view = client.editorView;

            // ★ 最可靠的方式：监听 CM6 的 updateListener
            // 每次编辑器状态更新时都会触发，包括打字、选择变化等
            try {
                const updateListener = view.constructor.updateListener || 
                                       (window.CM && CM.view && CM.view.EditorView.updateListener);
                
                if (updateListener) {
                    view.dispatch({
                        effects: window.CM.state.StateEffect.appendConfig.of(
                            updateListener.of((update) => {
                                if (update.selectionSet || update.docChanged) {
                                    scheduleUpdate();
                                }
                            })
                        )
                    });
                    console.log("[ActiveLine] Using CM6 updateListener");
                }
            } catch (e) {
                console.log("[ActiveLine] updateListener not available:", e);
            }

            // 备用：MutationObserver
            const scroller = document.querySelector(".cm-scroller");
            const cursorLayer = document.querySelector(".cm-cursorLayer");
            
            if (cursorLayer) {
                const observer = new MutationObserver(scheduleUpdate);
                observer.observe(cursorLayer, { attributes: true, subtree: true, childList: true });
            }
            
            if (scroller) {
                scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
            }

            window.addEventListener("resize", scheduleUpdate);
            
            scheduleUpdate();
            console.log("[ActiveLine] Ghost layer initialized");
        }

        setTimeout(init, 800);
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

### customized JS 3

```space
function setupNativeActiveLine()
    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        // 等待 SilverBullet 完全加载
        function trySetup() {
            if (!window.client || !client.editorView) {
                setTimeout(trySetup, 500);
                return;
            }

            const view = client.editorView;
            
            // 检查是否已经有 highlightActiveLine 扩展
            // CM6 的 @codemirror/view 包含此功能
            try {
                // 动态导入 CodeMirror 模块（如果 SilverBullet 暴露了）
                if (window.CM && CM.view && CM.view.highlightActiveLine) {
                    // 方案 A：使用官方扩展
                    view.dispatch({
                        effects: CM.state.StateEffect.appendConfig.of(
                            CM.view.highlightActiveLine()
                        )
                    });
                    console.log("[ActiveLine] Native CM extension enabled");
                    return;
                }
            } catch (e) {
                console.log("[ActiveLine] Native extension not available:", e);
            }

            // 方案 B：使用 CM6 的 Decoration API（更底层但更可靠）
            try {
                const { StateField, StateEffect } = window.CM?.state || {};
                const { Decoration, DecorationSet, EditorView } = window.CM?.view || {};
                
                if (StateField && Decoration) {
                    const lineHighlightField = StateField.define({
                        create() {
                            return Decoration.none;
                        },
                        update(value, tr) {
                            // 每次状态更新时同步计算高亮位置
                            const line = tr.state.doc.lineAt(tr.state.selection.main.head);
                            return Decoration.set([
                                Decoration.line({ class: "sb-active-line" }).range(line.from)
                            ]);
                        },
                        provide: f => EditorView.decorations.from(f)
                    });

                    view.dispatch({
                        effects: StateEffect.appendConfig.of(lineHighlightField)
                    });
                    console.log("[ActiveLine] Custom decoration enabled");
                    return;
                }
            } catch (e) {
                console.log("[ActiveLine] Decoration API failed:", e);
            }

            console.log("[ActiveLine] Falling back to MutationObserver method");
            // 如果原生 API 都不可用，回退到 Observer 方案
            setupFallback();
        }

        trySetup();
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

### customized JS 2

```space-lua
function setupActiveLineHighlighter()
    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const CLASS_NAME = "sb-active-line";
        const STATE_KEY = "__sbActiveLineState__";
        
        // ★ HHH.js 式状态缓存
        window[STATE_KEY] = {
            lastOffsetTop: -1,      // 缓存行的 offsetTop（用于匹配重建后的行）
            lastLineElement: null,  // 缓存行元素引用
            isActive: false         // 是否处于激活状态
        };

        // 根据 offsetTop 查找对应的行（CodeMirror 重建行后元素引用会变，但位置不变）
        function findLineByPosition(targetTop) {
            const lines = document.querySelectorAll(".cm-line");
            for (let line of lines) {
                if (Math.abs(line.offsetTop - targetTop) < 2) {
                    return line;
                }
            }
            return null;
        }

        // 查找光标所在行
        function findCurrentLine() {
            const cursor = document.querySelector(".cm-cursor-primary") 
                        || document.querySelector(".cm-cursor");
            if (!cursor) return null;

            const rect = cursor.getBoundingClientRect();
            const cursorMidY = rect.top + (rect.height / 2);

            const lines = document.querySelectorAll(".cm-line");
            for (let line of lines) {
                const lineRect = line.getBoundingClientRect();
                if (cursorMidY >= lineRect.top && cursorMidY <= lineRect.bottom) {
                    return line;
                }
            }
            return null;
        }

        // 应用高亮到指定行
        function applyHighlight(line) {
            if (!line) return;
            if (!line.classList.contains(CLASS_NAME)) {
                line.classList.add(CLASS_NAME);
            }
            // 更新状态缓存
            const state = window[STATE_KEY];
            state.lastOffsetTop = line.offsetTop;
            state.lastLineElement = line;
            state.isActive = true;
        }

        // 移除高亮
        function removeHighlight(line) {
            if (line && line.classList.contains(CLASS_NAME)) {
                line.classList.remove(CLASS_NAME);
            }
        }

        // ★ HHH.js 核心技巧：检测高亮是否丢失，丢失则恢复
        function checkAndRestoreHighlight() {
            const state = window[STATE_KEY];
            if (!state.isActive) return;

            // 检查当前是否有高亮元素
            const activeEl = document.querySelector("." + CLASS_NAME);
            
            if (!activeEl) {
                // ★ 高亮丢失！（CodeMirror 重建了行元素）
                // 根据缓存的位置找到新的行元素并恢复高亮
                const newLine = findLineByPosition(state.lastOffsetTop);
                if (newLine) {
                    applyHighlight(newLine);
                }
            } else if (activeEl !== state.lastLineElement) {
                // 元素引用变了但高亮还在（可能是 CodeMirror 复用了类名）
                // 更新我们的缓存
                state.lastLineElement = activeEl;
                state.lastOffsetTop = activeEl.offsetTop;
            }
        }

        // 完整更新（用于光标实际移动到新行时）
        function updateActiveLine() {
            const state = window[STATE_KEY];
            const currentLine = findCurrentLine();
            
            if (!currentLine) {
                // 光标不在任何行上
                if (state.lastLineElement) {
                    removeHighlight(state.lastLineElement);
                }
                state.isActive = false;
                state.lastLineElement = null;
                state.lastOffsetTop = -1;
                return;
            }

            const currentTop = currentLine.offsetTop;

            // ★ 关键优化：如果位置相同，只检查恢复，不做切换
            if (Math.abs(currentTop - state.lastOffsetTop) < 2) {
                // 同一行，确保高亮存在即可
                checkAndRestoreHighlight();
                return;
            }

            // 行发生变化，执行切换
            if (state.lastLineElement && state.lastLineElement !== currentLine) {
                removeHighlight(state.lastLineElement);
            }
            applyHighlight(currentLine);
        }

        // MutationObserver 回调
        function onMutation(mutations) {
            // ★ HHH.js 策略：先检查恢复，再判断是否需要完整更新
            checkAndRestoreHighlight();
            
            // 检查是否有行结构变化（可能需要重新定位）
            let needFullUpdate = false;
            for (let m of mutations) {
                if (m.type === 'childList' && m.addedNodes.length > 0) {
                    // 有新节点添加，可能是换行或大规模重绘
                    needFullUpdate = true;
                    break;
                }
            }
            
            if (needFullUpdate) {
                updateActiveLine();
            }
        }

        // 初始化
        function init() {
            const scroller = document.querySelector(".cm-scroller");
            const cursorLayer = document.querySelector(".cm-cursorLayer");
            const content = document.querySelector(".cm-content");

            if (!scroller || !cursorLayer || !content) {
                setTimeout(init, 500);
                return;
            }

            // ★ 关键 Observer：检测 DOM 变化后立即检查并恢复高亮
            const contentObserver = new MutationObserver(onMutation);
            contentObserver.observe(content, { 
                childList: true, 
                subtree: true,
                characterData: true
            });

            // 光标层 Observer（监听光标移动）
            const cursorObserver = new MutationObserver(() => {
                updateActiveLine();
            });
            cursorObserver.observe(cursorLayer, { 
                attributes: true, 
                subtree: true, 
                childList: true 
            });

            // 事件监听
            scroller.addEventListener("scroll", updateActiveLine, { passive: true });
            window.addEventListener("click", () => setTimeout(updateActiveLine, 10));
            window.addEventListener("keydown", checkAndRestoreHighlight);
            window.addEventListener("resize", updateActiveLine);

            updateActiveLine();
            console.log("[ActiveLine] HHH-style initialized (no ghost layer)");
        }

        setTimeout(init, 800);
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

### customized JS 1

```space
function setupActiveLineHighlighter()
    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const CLASS_NAME = "sb-active-line";
        
        function updateActiveLine() {
            // 1. Find the primary cursor
            const cursor = document.querySelector(".cm-cursor-primary");
            if (!cursor) return;

            // 2. Get the cursor position
            const rect = cursor.getBoundingClientRect();
            // Shift slightly right to hit the line content
            const x = rect.left + 5; 
            const y = rect.top + (rect.height / 2);

            // 3. Find the element at that coordinate
            const elementAtCursor = document.elementFromPoint(x, y);
            const currentLine = elementAtCursor ? elementAtCursor.closest(".cm-line") : null;

            // 4. Apply new highlight IMMEDIATELY (Before removing old ones)
            // This order prevents a "frame gap" where no line is highlighted.
            if (currentLine) {
                // Check to avoid unnecessary DOM writes (though classList.add is usually optimized)
                if (!currentLine.classList.contains(CLASS_NAME)) {
                    currentLine.classList.add(CLASS_NAME);
                }
            }

            // 5. Clean up old highlights
            // We remove the class from ANY element that is not the current line.
            // This handles the case where the "old" line DOM node still exists but is no longer active.
            const allActive = document.getElementsByClassName(CLASS_NAME);
            // Convert to array to avoid live collection issues during iteration
            Array.from(allActive).forEach(el => {
                if (el !== currentLine) {
                    el.classList.remove(CLASS_NAME);
                }
            });
        }

        // Observer to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            // Execute synchronously to beat the browser paint frame
            updateActiveLine();
        });

        const init = () => {
            const scroller = document.querySelector(".cm-scroller");
            const content = document.querySelector(".cm-content");
            const cursorLayer = document.querySelector(".cm-cursorLayer");

            if (scroller && content && cursorLayer) {
                // 1. Watch cursor blinking and movement
                observer.observe(cursorLayer, { 
                    attributes: true, 
                    subtree: true, 
                    childList: true 
                });

                // 2. Watch text content changes (CRITICAL for typing)
                // When you type, CM6 replaces the line div. We must catch this replacement.
                // We only watch childList (lines added/removed), not subtree (text changes inside lines),
                // to save performance, as replacing a line triggers childList on the parent.
                observer.observe(content, { 
                    childList: true,
                    subtree: false 
                });

                // 3. Update on interactions
                scroller.addEventListener("scroll", updateActiveLine, { passive: true });
                window.addEventListener("click", () => updateActiveLine()); // Removed timeout for instant reaction
                
                // Initial run
                updateActiveLine();
            } else {
                setTimeout(init, 100);
            }
        };

        init();
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

### MR-red js 2

```space
function setupActiveLineHighlighter()
    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const CLASS_NAME = "sb-active-line";
        
        function updateActiveLine() {
            // 1. Find the primary cursor
            const cursor = document.querySelector(".cm-cursor-primary");
            if (!cursor) return;

            // 2. Get the cursor position
            const rect = cursor.getBoundingClientRect();
            // We shift slightly to the right to ensure we hit the line text area
            const x = rect.left + 5; 
            const y = rect.top + (rect.height / 2);

            // 3. Find the element at that coordinate
            const elementAtCursor = document.elementFromPoint(x, y);
            const currentLine = elementAtCursor ? elementAtCursor.closest(".cm-line") : null;

            // 4. Clean up old highlights
            document.querySelectorAll("." + CLASS_NAME).forEach(el => {
                if (el !== currentLine) el.classList.remove(CLASS_NAME);
            });

            // 5. Apply new highlight
            if (currentLine && !currentLine.classList.contains(CLASS_NAME)) {
                currentLine.classList.add(CLASS_NAME);
            }
        }

        // Observer to watch for cursor movements (changes in style or DOM position)
        const observer = new MutationObserver((mutations) => {
            updateActiveLine();
        });

        // We need to wait for the editor to be available in the DOM
        const init = () => {
            const scroller = document.querySelector(".cm-scroller");
            if (scroller) {
                // Monitor the cursor layer for changes (blinking/moving)
                const cursorLayer = document.querySelector(".cm-cursorLayer");
                if (cursorLayer) {
                    observer.observe(cursorLayer, { attributes: true, subtree: true });
                }
                // Also update on scrolls and clicks
                scroller.addEventListener("scroll", updateActiveLine, { passive: true });
                window.addEventListener("click", () => setTimeout(updateActiveLine, 10));
                updateActiveLine();
            } else {
                setTimeout(init, 500);
            }
        };

        init();
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

-- Initialize the hack on page load
event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

### MR-red js 1

```space
function setupActiveLineHighlighter()
    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const CLASS_NAME = "sb-active-line";
        let debounceTimer = null;
        
        function performUpdate() {
            const cursor = document.querySelector(".cm-cursor-primary");
            if (!cursor) return;

            const rect = cursor.getBoundingClientRect();
            // Offset slightly into the line area to hit the text container
            const x = rect.left + 5; 
            const y = rect.top + (rect.height / 2);

            const elementAtCursor = document.elementFromPoint(x, y);
            const currentLine = elementAtCursor ? elementAtCursor.closest(".cm-line") : null;

            // Remove previous highlights
            const oldLines = document.getElementsByClassName(CLASS_NAME);
            while(oldLines.length > 0) {
                oldLines[0].classList.remove(CLASS_NAME);
            }

            // Apply new highlight
            if (currentLine) {
                currentLine.classList.add(CLASS_NAME);
            }
        }

        function updateActiveLine() {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(performUpdate, 50); // <-----here is the debouncer
        }

        const observer = new MutationObserver((mutations) => {
            // Check if the cursor actually changed position/visibility
            updateActiveLine();
        });

        const init = () => {
            const scroller = document.querySelector(".cm-scroller");
            const cursorLayer = document.querySelector(".cm-cursorLayer");
            
            if (scroller && cursorLayer) {
                // Monitor the cursor layer for movement or blinks
                observer.observe(cursorLayer, { attributes: true, subtree: true });
                
                // Monitor the content for line changes (Enter/Delete)
                const content = document.querySelector(".cm-content");
                if (content) {
                    observer.observe(content, { childList: true });
                }

                // Handle scrolling and clicking
                scroller.addEventListener("scroll", updateActiveLine, { passive: true });
                window.addEventListener("click", updateActiveLine);
                
                updateActiveLine();
            } else {
                // Editor might still be loading
                setTimeout(init, 500);
            }
        };

        init();
    })();
    ]]
    js.window.document.body.appendChild(scriptEl)
end

event.listen { 
    name = "editor:pageLoaded", 
    run = function() 
        setupActiveLineHighlighter() 
    end 
}
```

