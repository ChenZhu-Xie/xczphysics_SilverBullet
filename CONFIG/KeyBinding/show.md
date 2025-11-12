
1. [editor keyboard shortcuts](https://community.silverbullet.md/t/editor-keyboard-shortcuts/886/10?u=chenzhu-xie) #community #silverbullet

```space-lua
function toggleKeyboardShortcutsPanel()
  local isOpen = js.window.localStorage.getItem('shortcutsPanelOpen') == 'true'
  
  if isOpen then
    editor.hidePanel("rhs")
    js.window.localStorage.setItem('shortcutsPanelOpen', 'false')
  else
    local commands = system.listCommands()
    local shortcuts = {}
    
    for commandName, cmd in pairs(commands) do
      if cmd.key or cmd.mac then
        local keyDisplay = cmd.key or cmd.mac
        if cmd.mac and cmd.key and cmd.mac ~= cmd.key then
          keyDisplay = cmd.key .. " / " .. cmd.mac
        end
        
        table.insert(shortcuts, {
          key = keyDisplay,
          name = cmd.name or commandName
        })
      end
    end
    
    table.sort(shortcuts, function(a, b) return a.name < b.name end)
    
    local rows = {}
    for _, shortcut in ipairs(shortcuts) do
      table.insert(rows, string.format(
        '<tr><td class="key">%s</td><td class="cmd">%s</td></tr>',
        shortcut.key, shortcut.name
      ))
    end
    
    local html = string.format([[
      <style>
        #sb-main .panel {
          width: 12%% !important;
          max-width: 12%% !important;
          min-width: 250px !important;
          padding: 0.4em 0.3em !important;
        }
        .shortcuts-table {
          font-size: 0.95em;
          line-height: 1.35;
          width: 100%%;
        }
        .shortcuts-table th, .shortcuts-table td {
          padding: 0.25em 0.4em;
          border: none;
        }
        .shortcuts-table thead th {
          font-weight: 600;
          padding: 0.3em 0.4em;
          background-color: var(--editor-widget-background, rgba(0, 0, 0, 0.1));
          cursor: pointer;
          user-select: none;
        }
        .shortcuts-table thead th:hover {
          background-color: var(--editor-selection-background, rgba(0, 0, 0, 0.15));
        }
        .shortcuts-table thead th::after {
          content: ' ↕';
          opacity: 0.5;
          font-size: 0.8em;
        }
        .shortcuts-table thead th.sort-asc::after {
          content: ' ↑';
          opacity: 1;
        }
        .shortcuts-table thead th.sort-desc::after {
          content: ' ↓';
          opacity: 1;
        }
        .shortcuts-table tbody tr:nth-child(even) {
          background-color: var(--editor-widget-background, rgba(0, 0, 0, 0.05));
        }
        .shortcuts-table tbody tr:hover {
          background-color: var(--editor-selection-background, rgba(0, 0, 0, 0.1));
        }
        .shortcuts-table td.key {
          font-family: monospace;
          font-weight: 600;
          white-space: nowrap;
          width: 45%%;
          max-width: 180px;
          font-size: 1.15em;
        }
        .shortcuts-table td.cmd {
          width: 55%%;
        }
        .shortcuts-table tbody tr {
          height: 1.5em;
        }
        .shortcuts-header {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4em;
        }
        .shortcuts-close {
          position: absolute;
          top: 0;
          right: 0;
          cursor: pointer;
          font-size: 1.5em;
          padding: 0.2em 0.4em;
          color: var(--editor-foreground, #ccc);
          background: transparent;
          border: none;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .shortcuts-close:hover {
          opacity: 1;
        }
        .shortcuts-header h2 {
          margin: 0;
          font-size: 1.2em;
          font-weight: 600;
        }
      </style>
      <div class="shortcuts-header">
        <h2>Keyboard Shortcuts</h2>
        <button class="shortcuts-close" title="Close">×</button>
      </div>
      <table class="shortcuts-table">
        <thead>
          <tr><th>Shortcut</th><th>Command</th></tr>
        </thead>
        <tbody>%s</tbody>
      </table>
    ]], table.concat(rows, "\n        "))
    
    local script = [[
      (function() {
        const table = document.querySelector('.shortcuts-table');
        const tbody = table.querySelector('tbody');
        const headers = table.querySelectorAll('thead th');
        let currentSort = { column: -1, direction: 'asc' };
        
        function sortTable(columnIndex, direction) {
          const rows = Array.from(tbody.querySelectorAll('tr'));
          rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.trim();
            const bText = b.cells[columnIndex].textContent.trim();
            return direction === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
          });
          rows.forEach(row => tbody.removeChild(row));
          rows.forEach(row => tbody.appendChild(row));
          headers.forEach((header, index) => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (index === columnIndex) header.classList.add('sort-' + direction);
          });
          currentSort = { column: columnIndex, direction: direction };
        }
        
        headers.forEach((header, index) => {
          header.addEventListener('click', () => {
            const direction = (currentSort.column === index && currentSort.direction === 'asc') ? 'desc' : 'asc';
            sortTable(index, direction);
          });
        });
        
        document.querySelector('.shortcuts-close')?.addEventListener('click', () => {
          syscall('editor.hidePanel', 'rhs');
          localStorage.setItem('shortcutsPanelOpen', 'false');
        });
      })();
    ]]
    
    editor.showPanel("rhs", 1, html, script)
    js.window.localStorage.setItem('shortcutsPanelOpen', 'true')
  end
end

command.define {
  name = "Toggle Keyboard Shortcuts",
  key = "Ctrl-Shift-/",
  mac = "Cmd-Shift-/",
  run = toggleKeyboardShortcutsPanel()
}
```
