
1. [css rendering vs markdown editing](https://community.silverbullet.md/t/css-rendering-vs-markdown-editing/3780/3?u=chenzhu-xie) #community #silverbullet

- [x] test [completed: 2026-01-20T15:41:00] [completed: 2026-01-20T15:41:00]

## customized css2

```space-style
/* ===========================================================
   Base: Smooth transition & visual polish
=========================================================== */
.cm-line {
  transition: background-color 0.1s ease-out;
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

## customized css1

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

## MR-red css

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

## MR-red js

```space-lua
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
