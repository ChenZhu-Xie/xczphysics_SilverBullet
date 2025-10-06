
1. Modified from https://community.silverbullet.md/t/togglable-and-configurable-read-only-mode/3147

```space-lua
-- Must be set before actionButtons
config.set("readOnly", {
    mobileOnlyActionButton = false,
    disableCheckboxes = true,
    shortcut = 'Ctrl-alt-t',
    persistent = true,
    enabledIcon = 'edit',
    disabledIcon = 'eye'
  })

actionButton.define {
  mobile = config.get('readOnly').mobileOnlyActionButton,
  icon = editor.getUiOption("forcedROMode") and config.get('readOnly').enabledIcon or config.get('readOnly').disabledIcon,
  description = editor.getUiOption("forcedROMode") and "Enable edit mode" or "Enable read-only mode",
  run = function()
    editor.invokeCommand("Toggle Read-Only Mode")
  end
}

-- Read-only mode implementation
function toggleReadOnlyMode()
  local cursor = editor.getCursor()
  local mode = editor.getUiOption('forcedROMode')

  editor.setUiOption('forcedROMode', not mode)
  editor.rebuildEditorState()
  editor.reloadConfigAndCommands()
  js.window.document.querySelector('.sb-mini-editor .cm-content').contentEditable = mode

  if config.get('readOnly').persistent then
    clientStore.set('readOnly', not mode)
  end

  if mode == false and config.get('readOnly').disableCheckboxes then
    js.window.document.head.insertAdjacentHTML('beforeend',
      '<style id="readonly-checkbox-css">' ..
      '.sb-checkbox input[type="checkbox"] { pointer-events: none; cursor: default; opacity: 0.5; }' ..
      '</style>'
    )
  else
    checkbox_css = js.window.document.getElementById('readonly-checkbox-css')
    if checkbox_css ~= nil then
      checkbox_css.remove()
    end
  end

  editor.moveCursor(cursor, true)
end

command.define {
  name = 'Toggle Read-Only Mode',
  key = config.get('readOnly').shortcut,
  run = function()
    toggleReadOnlyMode()
  end
}

event.listen {
  name = 'system:ready',
  run = function(e)
    if config.get('readOnly').persistent
     
      then
      local readOnlyConfig = clientStore.get('readOnly')
      local readOnlyCurrent = editor.getUiOption('forcedROMode')
  
      if readOnlyConfig and not readOnlyCurrent then
        toggleReadOnlyMode()
      end
    end
  end
}
```