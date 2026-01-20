
1. [css rendering vs markdown editing](https://community.silverbullet.md/t/css-rendering-vs-markdown-editing/3780/3?u=chenzhu-xie) #community #silverbullet

- [x] test [completed: 2026-01-20T15:41:00] [completed: 2026-01-20T15:41:00]

## CSS


### customized css2

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

### customized css1

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

### customized JS

```space-lua
function setupActiveLineHighlighter()
    local scriptEl = js.window.document.createElement("script")
    scriptEl.innerHTML = [[
    (function() {
        const CLASS_NAME = "sb-active-line";
        let lastActiveLine = null;
        let rafId = null;
        
        function updateActiveLine() {
            // 1. Find the primary cursor
            const cursor = document.querySelector(".cm-cursor-primary");
            if (!cursor) return;

            // 2. Get the cursor position
            const rect = cursor.getBoundingClientRect();
            const x = rect.left + 5; 
            const y = rect.top + (rect.height / 2);

            // 3. Find the element at that coordinate
            const elementAtCursor = document.elementFromPoint(x, y);
            const currentLine = elementAtCursor ? elementAtCursor.closest(".cm-line") : null;

            // [CORE FIX]: If the line hasn't changed, do NOTHING.
            // This prevents the "remove -> add" cycle that causes flickering during typing/blinking.
            if (currentLine === lastActiveLine) {
                return;
            }

            // 4. Clean up old highlights
            // First, try to remove from the cached element directly (fastest)
            if (lastActiveLine) {
                lastActiveLine.classList.remove(CLASS_NAME);
            }
            // Fallback: Ensure strictly no other elements have the class (handles scrolling/virtual DOM recycling)
            document.querySelectorAll("." + CLASS_NAME).forEach(el => {
                if (el !== currentLine) el.classList.remove(CLASS_NAME);
            });

            // 5. Apply new highlight
            if (currentLine) {
                currentLine.classList.add(CLASS_NAME);
            }
            
            // Update cache
            lastActiveLine = currentLine;
        }

        // Wrapper to align updates with browser frames
        const scheduleUpdate = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateActiveLine);
        };

        // Observer to watch for cursor movements
        const observer = new MutationObserver((mutations) => {
            scheduleUpdate();
        });

        const init = () => {
            const scroller = document.querySelector(".cm-scroller");
            if (scroller) {
                const cursorLayer = document.querySelector(".cm-cursorLayer");
                if (cursorLayer) {
                    // Observe attributes (like opacity for blinking) and childList (for movement)
                    observer.observe(cursorLayer, { attributes: true, subtree: true, childList: true });
                }
                
                // Update on scroll and click
                scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
                window.addEventListener("click", () => setTimeout(scheduleUpdate, 10));
                
                // Initial run
                scheduleUpdate();
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
