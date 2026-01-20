
1. [css rendering vs markdown editing](https://community.silverbullet.md/t/css-rendering-vs-markdown-editing/3780/3?u=chenzhu-xie) #community #silverbullet

- [x] test [completed: 2026-01-20T15:41:00] [completed: 2026-01-20T15:41:00]


## customized css2

```space-style
/* 
   通用设置：给所有状态添加平滑过渡 
   注意：时间不要超过 0.15s，否则会感觉“跟手”有延迟
*/
.cm-line {
  transition: background-color 0.1s ease-out;
  border-radius: 4px; /* 可选：让高亮条有一点圆角，看起来更像现代 UI */
}

/* =================================================================
   层级 1: Hover (最低优先级)
   不需要 !important，它是最基础的交互
   ================================================================= */
.cm-line:hover {
  background-color: rgba(65, 90, 115, 0.15);
}

/* =================================================================
   层级 2: Cursor / Focus (中等优先级)
   这是常驻状态。
   改进：如果可能，尽量不使用 !important，而是利用 CSS 加载顺序。
   但由于 SilverBullet 内部样式可能也很强，保留 !important 也是为了稳妥。
   ================================================================= */
.sb-active-line {
  background-color: rgba(131, 195, 55, 0.15) !important;
}

/* =================================================================
   层级 3: Click / Active (最高优先级)
   改进：增加了特异性 (Specificity)。
   使用 .cm-line.sb-active-line:active 组合选择器，
   确保即使在“当前行”点击，橙色也能稳稳覆盖绿色。
   ================================================================= */

/* 情况 A: 点击普通行 */
.cm-line:active {
  background-color: rgba(255, 165, 0, 0.15) !important;
}

/* 情况 B: 点击已经是光标所在的行 (增强反馈) */
/* 这条规则确保了你在打字时，如果用鼠标点击当前行，依然能看到橙色闪烁 */
.cm-line.sb-active-line:active {
  background-color: rgba(255, 165, 0, 0.25) !important; /* 可以稍微加深一点，强调确认感 */
}

```

## customized css1

```space-
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

```space
.sb-active-line {
  background-color: rgba(255, 165, 0, 0.15) !important;
}
.cm-line:hover {
  background-color: rgba(65, 90, 115, 0.15) !important;
}
.sb-line-li:active {
  background-color: rgba(255, 165, 0, 0.15) !important;
}


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
/* =================================================================
   4. 逻辑 C：鼠标悬停 (Hover) - 可选
   如果你希望鼠标划过时也高亮，保留此段
   ================================================================= */
.sb-line-li:hover .sb-attribute[data-completed] {
  opacity: 1;
}

```


## M-R css

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

## js

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
