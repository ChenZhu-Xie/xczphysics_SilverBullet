
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

/* 规则：光标所在行，任务内容不透明 */
.sb-active-line .sb-attribute[data-completed] {
  opacity: 1;
}

/* 规则：鼠标按下的行，任务内容不透明 */
.sb-line-li:active .sb-attribute[data-completed] {
  opacity: 1;
}

.sb-attribute[data-completed] {  
  opacity: 0.25;
}

/* ===========================================================
   4. 逻辑 C：鼠标悬停 (Hover) - 可选
   如果你希望鼠标划过时也高亮，保留此段
=========================================================== */
.sb-line-li:hover .sb-attribute[data-completed] {
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
        const HIGHLIGHTER_ID = "sb-ghost-active-line";
        
        // 1. 创建高亮元素
        function getHighlighter(scroller) {
            let el = document.getElementById(HIGHLIGHTER_ID);
            if (!el) {
                el = document.createElement("div");
                el.id = HIGHLIGHTER_ID;
                
                // 核心样式
                el.style.position = "absolute";
                el.style.left = "0";
                el.style.right = "0";
                el.style.pointerEvents = "none"; 
                // 使用混合模式，确保在深色/浅色主题下都能看到，且不遮挡文字
                el.style.mixBlendMode = "multiply"; 
                // 调试用颜色：先用明显的颜色确认它出来了，之后改回 0.05
                el.style.backgroundColor = "rgba(0, 120, 255, 0.1)"; 
                el.style.zIndex = "0"; 
                // 平滑过渡，消除闪烁的核心
                el.style.transition = "top 0.1s ease-out, height 0.1s ease-out"; 
                
                const content = scroller.querySelector(".cm-content");
                if (content) {
                    // 重要：使用 prepend 把它插到最前面，让它位于文本（通常是后续子元素）的下方
                    // 这样就不需要复杂的 z-index 管理
                    content.insertBefore(el, content.firstChild);
                }
            }
            return el;
        }

        let rafId = null;

        function updateActiveLine() {
            const scroller = document.querySelector(".cm-scroller");
            if (!scroller) return;

            // 2. 寻找光标
            const cursor = document.querySelector(".cm-cursor-primary");
            if (!cursor) return; // 光标不在或未聚焦

            // 3. 稳健的行定位逻辑 (替代 elementFromPoint)
            // 获取光标在视口中的垂直中心位置
            const cursorRect = cursor.getBoundingClientRect();
            const cursorMidY = cursorRect.top + (cursorRect.height / 2);

            // 获取当前视口内所有行（CM6 只渲染视口内的行，所以性能开销很小）
            const lines = scroller.querySelectorAll(".cm-line");
            let currentLine = null;

            // 遍历找到包含光标中心点的行
            for (let line of lines) {
                const lineRect = line.getBoundingClientRect();
                if (cursorMidY >= lineRect.top && cursorMidY <= lineRect.bottom) {
                    currentLine = line;
                    break;
                }
            }

            if (!currentLine) return;

            // 4. 计算相对位置
            // offsetTop 是相对于父容器 (.cm-content) 的，这正是我们需要的值
            const newTop = currentLine.offsetTop;
            const newHeight = currentLine.offsetHeight;

            // 5. 更新高亮层
            const highlighter = getHighlighter(scroller);
            if (highlighter) {
                // 仅在数值变化时写入 DOM
                if (highlighter.style.top !== newTop + "px") {
                    highlighter.style.top = newTop + "px";
                }
                if (highlighter.style.height !== newHeight + "px") {
                    highlighter.style.height = newHeight + "px";
                }
                // 确保它是可见的
                if (highlighter.style.display === 'none') {
                    highlighter.style.display = 'block';
                }
            }
        }

        const scheduleUpdate = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateActiveLine);
        };

        const observer = new MutationObserver((mutations) => {
            scheduleUpdate();
        });

        const init = () => {
            const scroller = document.querySelector(".cm-scroller");
            if (scroller) {
                // 监听光标层的变化（光标移动、闪烁）
                const cursorLayer = document.querySelector(".cm-cursorLayer");
                if (cursorLayer) {
                    observer.observe(cursorLayer, { attributes: true, subtree: true, childList: true });
                }
                
                // 监听内容层变化（换行、输入）
                const content = document.querySelector(".cm-content");
                if (content) {
                    observer.observe(content, { childList: true, subtree: true, characterData: true });
                }

                // 监听滚动和点击
                scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
                window.addEventListener("click", () => setTimeout(scheduleUpdate, 50));
                window.addEventListener("resize", scheduleUpdate);
                window.addEventListener("keydown", () => setTimeout(scheduleUpdate, 0)); // 键盘输入立即响应
                
                scheduleUpdate();
                console.log("Ghost Active Line Initialized"); // 调试日志
            } else {
                setTimeout(init, 500);
            }
        };

        // 延迟一点启动，确保编辑器完全加载
        setTimeout(init, 1000);
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

