
## Lua

```space-lua
-- priority: -1
function widgets.button(text, callback, attrs) --added attrs argument
  local buttonAttrs = {
    onclick = callback,
    text
  }

--addtrs to add custom classes to buttons for easier styling
  if attrs then
    for k, v in pairs(attrs) do
      buttonAttrs[k] = v
    end
  end

  return widget.html(dom.button(buttonAttrs))
end

function library.installedLibrariesWidget()
  local rows = {}
  for lib in query[[from index.tag "meta/library"]] do
    table.insert(rows, dom.tr {
      dom.td { "[[" .. lib.name .. "|" .. lib.name .. "]]" },
      dom.td {
        not lib.share and "" or dom.span{
          widgets.button("Update", function()
            local updated = library.update(lib.name, true)
            if updated then
              editor.flashNotification "Updated."
              reloadEverything()
            else
              editor.flashNotification "No update required."
            end
          end,{ class = "btn-update" }), --added custom class
          widgets.button("Remove", function()
            if editor.confirm("Are you sure?") then
              library.remove(lib.name)
              editor.flashNotification "Done!"
              reloadEverything()
            end
          end, { class = "btn-remove"}) --added custom class 
        }
      }
    })
  end
  return widget.htmlBlock(dom.table {class = "manage-lib-table", --added custom class
    dom.thead {
      dom.tr {
        dom.td {"Library"},
        dom.td {"Action"}
      }
    },
    dom.tbody(rows)
  })
end

function library.installableLibrariesWidget()
  local rows = {}
  for lib in query[[from index.tag "meta/library/remote"]] do
    local installed = library.getInstalled(lib.uri)
    if not installed then
      table.insert(rows, dom.tr {
        dom.td { lib.name },
        dom.td { "[[" .. lib.page .. "|" .. lib.page .. "]]" },
        dom.td {
          widgets.button("Install", function()
            library.install(library.libPath(lib.name), lib.uri)
            editor.flashNotification "Done!"
            reloadEverything()
          end,{ class = "btn-install" }) --added custom class
        }
      })
    end
  end
  return widget.htmlBlock(dom.table {class = "manage-lib-table", --added custom class
    dom.thead {
      dom.tr {
        dom.td {"Library"},
        dom.td {"Repository"},
        dom.td {"Action"}
      }
    },
    dom.tbody(rows)
  })
end

function library.installedRepositoriesWidget()
  local rows = {}
  for repo in query[[from index.tag(library.repositoryTag)]] do
    table.insert(rows, dom.tr {
      dom.td { "[[" .. repo.name .. "|" .. repo.name .. "]]" },
      dom.td {
        repo.share and dom.span {
          widgets.button("Update", function()
            if share.sharePage(repo.name) then
              editor.flashNotification "Repository updated"
              reloadEverything()
            else
              editor.flashNotification "No changes"
            end
          end, { class = "btn-update"}),
          widgets.button("Remove", function()
            if editor.confirm("Are you sure?") then
              space.deletePage(repo.name)
              editor.flashNotification "Done!"
              reloadEverything()
            end
          end, { class = "btn-remove"}) --added custom class
        } or ""
      }
    })
  end
  return widget.htmlBlock(dom.table {class = "manage-lib-table", --added custom class
    dom.thead {
      dom.tr {
        dom.td {"Repository"},
        dom.td {"Action"}
      }
    },
    dom.tbody(rows)
  })
end
```

## Style

```space-style
:root {
  /* UPDATE (green) */
  --btn-update-bg: oklch(50% 0.25 160);
  --btn-update-text: oklch(100% 0.05 160);
  --btn-update-border: oklch(70% 0.20 160);
  --btn-update-hover: oklch(70% 0.25 160);

  /* REMOVE (red) */
  --btn-remove-bg: oklch(50% 0.25 30);
  --btn-remove-text: oklch(100% 0.05 30);
  --btn-remove-border: oklch(70% 0.20 30);
  --btn-remove-hover: oklch(70% 0.25 30);

  /* INSTALL (blue) */
  --btn-install-bg: oklch(55% 0.20 260);
  --btn-install-text: oklch(100% 0.05 260);
  --btn-install-border: oklch(70% 0.15 260);
  --btn-install-hover: oklch(70% 0.25 260);
}

/* Base button style */
table.manage-lib-table td button {
  padding: 6px 12px !important;
  margin-inline: 4px;
  font-size: 0.95em;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background 0.25s ease,
    transform 0.15s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

/* UPDATE button */
table.manage-lib-table td button.btn-update {
  background: var(--btn-update-bg);
  color: var(--btn-update-text);
  border-color: var(--btn-update-border);
}
table.manage-lib-table td button.btn-update:hover {
  background: var(--btn-update-hover);
  border-color: color-mix(in oklch, var(--btn-update-hover), white 5%);
  box-shadow: 0 0 5px color-mix(in oklch, var(--btn-update-hover), white 15%);
  transform: scale(0.95);
}

/* REMOVE button */
table.manage-lib-table td button.btn-remove {
  background: var(--btn-remove-bg);
  color: var(--btn-remove-text);
  border-color: var(--btn-remove-border);
}
table.manage-lib-table td button.btn-remove:hover {
  background: var(--btn-remove-hover);
  border-color: color-mix(in oklch, var(--btn-remove-hover), white 5%);
  box-shadow: 0 0 5px color-mix(in oklch, var(--btn-remove-hover), white 15%);
  transform: scale(0.95);
}

/* INSTALL button */
table.manage-lib-table td button.btn-install {
  background: var(--btn-install-bg);
  color: var(--btn-install-text);
  border-color: var(--btn-install-border);
}
table.manage-lib-table td button.btn-install:hover {
  background: var(--btn-install-hover);
  border-color: color-mix(in oklch, var(--btn-install-hover), white 5%);
  box-shadow: 0 0 5px color-mix(in oklch, var(--btn-install-hover), white 15%);
  transform: scale(0.95);
}

/* Press feedback */
table.manage-lib-table td button:active {
  transform: scale(0.90);
  box-shadow: 0 0 4px color-mix(in oklch, black, var(--btn-remove-bg) 20%);
}


/* Right-align the Action column header (thead uses <td> in your markup) */
table.manage-lib-table thead td:last-child {
  text-align: right;
}

/* Right-align every last column cell (where your buttons live) */
table.manage-lib-table tbody td:last-child {
  text-align: right;
}
```
