
# Slash Cmd

```space-lua
-- Date Picker (space-lua)
-- Fix: avoid colliding with any existing /datepicker command by using a unique name.
-- Usage: /pickdate

function insertDate(args)
  if args and args.date then
    editor.insertAtCursor("[[" .. args.date .. "]]" )
    -- NOTE: moveCursor expects a position; calling getCursor() immediately after insert
    -- can be nil during early startup, but here we are in an interactive slash command.
    local cur = editor.getCursor()
    if cur then
      editor.moveCursor(cur)
    end
  end
end

-- CONFIGURATION
-- 0 = Sunday, 1 = Monday
local WEEK_START = 1

function openDatePicker()
  local sessionID = "dp_" .. tostring(math.floor(js.window.performance.now()))

  -- Remove any existing picker
  local existing = js.window.document.getElementById("sb-datepicker-root")
  if existing then
    existing.remove()
  end

  -- Listen for the JS side to dispatch the chosen date
  local function uniqueHandler(e)
    if e and e.detail and e.detail.session == sessionID then
      insertDate({ date = e.detail.date })
      js.window.removeEventListener("sb-insert-date", uniqueHandler)
    end
  end
  js.window.addEventListener("sb-insert-date", uniqueHandler)

  -- Build modal container
  local container = js.window.document.createElement("div")
  container.id = "sb-datepicker-root"
  container.innerHTML = [[
    <style>
      #sb-datepicker-root {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.3); z-index: 20000; display: flex;
        align-items: center; justify-content: center; font-family: sans-serif;
      }
      .dp-card {
        background: #222; color: white;
        border: 1px solid var(--ui-accent-color, #444); border-radius: 12px;
        padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        width: 280px; user-select: none;
      }
      .dp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; gap: 5px; }
      .dp-selectors { display: flex; gap: 4px; flex-grow: 1; justify-content: center; }
      .dp-select {
        background: transparent; color: inherit; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 4px; font-size: 0.9em; padding: 2px; cursor: pointer;
      }
      .dp-select option { background: #222; color: white; }
      .dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
      #dp-days { min-height: 200px; align-content: start; }
      .dp-cell {
        padding: 6px 0; border: none; background: rgba(255,255,255,0.05); color: inherit;
        cursor: pointer; border-radius: 6px; font-size: 0.8em; text-align: center;
        height: 28px; display: flex; align-items: center; justify-content: center;
      }
      .dp-cell:hover { background: var(--ui-accent-color, #007bff); color: white !important; }
      .dp-cell.today { border: 1px solid var(--ui-accent-color); font-weight: bold; }
      .dp-cell.sunday { color: #ff5f5f; }
      .dp-lbl.sunday { color: #ff5f5f; opacity: 0.8; }
      .dp-lbl { font-size: 0.75em; opacity: 0.5; font-weight: bold; text-align: center; padding-bottom: 8px; }
      .dp-nav { cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.1); color: white; border-radius: 6px; padding: 5px 10px; }
      .dp-nav:hover { background: var(--ui-accent-color); }
      .dp-footer {
        margin-top: 10px; display: flex; flex-direction: column; align-items: center; gap: 8px;
        border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;
      }
      .btn-today {
        background: transparent; border: 1px solid var(--ui-accent-color); color: var(--ui-accent-color);
        padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8em; transition: 0.2s; width: 100%;
      }
      .btn-today:hover { background: var(--ui-accent-color); color: white; }

      /* Keyboard selection highlight */
      .dp-cell.selected {
        outline: 2px solid var(--ui-accent-color);
        background: rgba(255,255,255,0.15);
      }
    </style>
    <div class="dp-card" onclick="event.stopPropagation()">
      <div class="dp-header">
        <button class="dp-nav" id="dp-prev"> &lt; </button>
        <div class="dp-selectors" id="dp-title-area">
           <select id="dp-month-select" class="dp-select"></select>
           <select id="dp-year-select" class="dp-select"></select>
        </div>
        <button class="dp-nav" id="dp-next"> &gt; </button>
      </div>
      <div class="dp-grid" id="dp-labels"></div>
      <div class="dp-grid" id="dp-days"></div>
      <div class="dp-footer">
        <button class="btn-today" id="dp-today">Today</button>
        <div style="font-size: 9px; opacity: 0.4; letter-spacing: 1px;">ESC TO CANCEL · ENTER TO INSERT · ARROWS TO MOVE</div>
      </div>
    </div>
  ]]

  js.window.document.body.appendChild(container)

  -- Inject JS
  local script = [[
    (function() {
      const currentSession = "]] .. sessionID .. [[";
      let viewDate = new Date();
      let selectedDate = new Date(viewDate);
      const today = new Date();
      const root = document.getElementById("sb-datepicker-root");

      // Capture previously focused element (likely the editor)
      const prevFocus = document.activeElement;

            // Week start configuration injected from Lua
      const WEEK_START = ]] .. tostring(WEEK_START) .. [[;

      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

      const sameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      const cleanup = () => {
        // Restore focus back to whatever had it before opening the picker
        if (prevFocus && prevFocus.focus) {
          try { prevFocus.focus({ preventScroll: true }); }
          catch (e) { try { prevFocus.focus(); } catch (_) {} }
        }
        window.removeEventListener("keydown", handleKey, true);
        if (root && root.parentNode) root.remove();
      };

      const insertSelected = () => {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        window.dispatchEvent(new CustomEvent("sb-insert-date", {
          detail: { date: `${y}-${m}-${d}`, session: currentSession }
        }));
        cleanup();
      };

      const handleKey = (e) => {
        // Only handle keys while focus is inside the picker.
        // This avoids stealing keys from the editor when it still has focus.
        if (root && !root.contains(document.activeElement)) {
          const ae = document.activeElement;
          // If focus is on body, still allow navigation.
          if (ae && ae !== document.body) return;
        }

        // If the user is interacting with a dropdown, don't hijack arrows/page keys.
        const ae = document.activeElement;
        const tag = (ae && ae.tagName) ? ae.tagName.toLowerCase() : "";
        if (tag === "select") {
          if (e.key === "Escape") {
            e.preventDefault();
            cleanup();
          } else if (e.key === "Enter") {
            e.preventDefault();
            insertSelected();
          }
          return;
        }

        let changed = false;
        switch (e.key) {
          case "Escape":
            e.preventDefault();
            cleanup();
            return;
          case "Enter":
            e.preventDefault();
            insertSelected();
            return;

          // Arrow keys
          case "ArrowLeft":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() - 1);
            changed = true;
            break;
          case "ArrowRight":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() + 1);
            changed = true;
            break;
          case "ArrowUp":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() - 7);
            changed = true;
            break;
          case "ArrowDown":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() + 7);
            changed = true;
            break;

          // Vim-style navigation (hjkl)
          case "h":
          case "H":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() - 1);
            changed = true;
            break;
          case "l":
          case "L":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() + 1);
            changed = true;
            break;
          case "k":
          case "K":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() - 7);
            changed = true;
            break;
          case "j":
          case "J":
            e.preventDefault();
            selectedDate.setDate(selectedDate.getDate() + 7);
            changed = true;
            break;

          // Month/year navigation
          case "PageUp":
            e.preventDefault();
            if (e.shiftKey) selectedDate.setFullYear(selectedDate.getFullYear() - 1);
            else selectedDate.setMonth(selectedDate.getMonth() - 1);
            changed = true;
            break;
          case "PageDown":
            e.preventDefault();
            if (e.shiftKey) selectedDate.setFullYear(selectedDate.getFullYear() + 1);
            else selectedDate.setMonth(selectedDate.getMonth() + 1);
            changed = true;
            break;
          case "Home":
            e.preventDefault();
            selectedDate.setDate(1);
            changed = true;
            break;
          case "End":
            e.preventDefault();
            selectedDate.setDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate());
            changed = true;
            break;
          case "t":
          case "T":
            e.preventDefault();
            selectedDate = new Date();
            changed = true;
            break;
          default:
            return;
        }

        if (changed) {
          viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          render();
        }
      };

      const render = () => {
        const monthSelect = document.getElementById("dp-month-select");
        const yearSelect = document.getElementById("dp-year-select");
        const grid = document.getElementById("dp-days");
        const labels = document.getElementById("dp-labels");

        grid.innerHTML = "";
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        monthSelect.innerHTML = monthNames.map((m, i) =>
          `<option value="${i}" ${i === month ? 'selected' : ''}>${m}</option>`
        ).join('');

        const years = [];
        for (let y = year - 10; y <= year + 5; y++) years.push(y);
        yearSelect.innerHTML = years.map(y =>
          `<option value="${y}" ${y === year ? 'selected' : ''}>${y}</option>`
        ).join('');

                // Build weekday labels based on WEEK_START
        const baseDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const daysArr = baseDays.slice(WEEK_START).concat(baseDays.slice(0, WEEK_START));
        labels.innerHTML = daysArr.map((day, idx) => {
          const isSunday = (day === 'Sun');
          return `<div class="dp-lbl ${isSunday ? 'sunday' : ''}">${day}</div>`;
        }).join('');('');

                let firstDay = new Date(year, month, 1).getDay();
        // Adjust offset based on WEEK_START
        let offset = (firstDay - WEEK_START + 7) % 7;
        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < offset; i++) grid.appendChild(document.createElement("div"));

        for (let i = 1; i <= lastDay; i++) {
          const btn = document.createElement("button");
          btn.className = "dp-cell";

          const d = new Date(year, month, i);
                    if (d.getDay() === 0) btn.classList.add("sunday");
          if (sameDay(d, today)) btn.classList.add("today");
          if (sameDay(d, selectedDate)) btn.classList.add("selected");

          btn.innerText = i;
          btn.onclick = (e) => {
            e.stopPropagation();
            selectedDate = d;
            insertSelected();
          };
          grid.appendChild(btn);
        }
      };

      document.getElementById("dp-month-select").onchange = (e) => {
        viewDate.setMonth(parseInt(e.target.value));
        // keep selected day, but ensure we're viewing the same month
        selectedDate.setMonth(viewDate.getMonth());
        render();
      };

      document.getElementById("dp-year-select").onchange = (e) => {
        viewDate.setFullYear(parseInt(e.target.value));
        selectedDate.setFullYear(viewDate.getFullYear());
        render();
      };

      window.addEventListener("keydown", handleKey, true);
      root.onclick = cleanup;
      document.getElementById("dp-prev").onclick = (e) => {
        e.stopPropagation();
        viewDate.setMonth(viewDate.getMonth() - 1);
        selectedDate.setMonth(viewDate.getMonth());
        render();
      };
      document.getElementById("dp-next").onclick = (e) => {
        e.stopPropagation();
        viewDate.setMonth(viewDate.getMonth() + 1);
        selectedDate.setMonth(viewDate.getMonth());
        render();
      };
      document.getElementById("dp-today").onclick = (e) => {
        e.stopPropagation();
        selectedDate = new Date();
        viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        render();
      };

      // Initial render
      render();

      // ---- SAFE & EFFECTIVE FOCUS CAPTURE ----
      // Focusing the root element is unreliable in SB because CodeMirror
      // often immediately reclaims focus. Instead, focus a real interactive
      // element inside the modal (the selected day button).
      try {
        setTimeout(() => {
          try {
            const btn = root.querySelector('.dp-cell.selected');
            if (btn && btn.focus) {
              btn.focus({ preventScroll: true });
            }
          } catch (e) {}
        }, 0);
      } catch (e) {}

      // ---- SAFE FOCUS CAPTURE ----
      // Make root focusable without breaking execution if anything goes wrong
      try {
        root.tabIndex = -1;
        // Defer focus until after render + layout
        setTimeout(() => {
          try {
            if (root && root.isConnected) {
              root.focus({ preventScroll: true });
            }
          } catch (e) {}
        }, 0);
      } catch (e) {}
    })();
  ]]

  local scriptEl = js.window.document.createElement("script")
  scriptEl.innerHTML = script
  container.appendChild(scriptEl)
end

-- IMPORTANT: use a unique slash command name to avoid collisions with any built-in or other plug.
slashCommand.define {
  name = "pickdate",
  run = function() openDatePicker() end
}
```
