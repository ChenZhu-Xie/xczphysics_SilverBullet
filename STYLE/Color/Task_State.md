
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
  background-color: rgba(65, 90, 115, 0.15);
}

/* ===========================================================
   L2: Active cursor line (Medium priority)
   Persists as long as the cursor is on the line.
=========================================================== */
.sb-active-line {
  background-color: rgba(131, 195, 55, 0.15) !important;
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

