---
source: markdown-import
sourceUrl: "https://codeberg.org/gulfkiwi/silverbullet-base16-themes/src/branch/trunk/base16.md"
---

This library provides for SilverBullet integration with the tinted-theming base16 specification and library of base16 (but not base24) themes.

# Implementation
The full implementation of this integration follows.

```space-lua

-- ==============================================================================
-- BASE16 THEME LOADER FOR SILVERBULLET
-- ==============================================================================
-- Automatically generates Base16 color schemes for SilverBullet
-- Fetches themes from the official Base16 repository and applies them
-- 
-- Usage:
-- 1. Drop this file into your SilverBullet space
-- 2. Configure theme in SETTINGS with: base16.scheme: "theme-name"
-- 3. Optionally set base16.scheme-dark: "dark-theme-name" for explicit dark theme
-- 4. Reload SilverBullet - theme will auto-apply
-- 
-- Available themes: https://github.com/tinted-theming/schemes/tree/spec-0.11/base16
-- ==============================================================================

-- priority: 95

theme = theme or {}

-- ==============================================================================
-- CONFIGURATION SCHEMA
-- ==============================================================================
if config and type(config.define) == "function" then
  config.define("base16", {
    type = "object",
    properties = {
      scheme = { 
        type = "string", 
        description = "Base16 theme slug for light mode (e.g., 'monokai', 'solarized-light')" 
      },
      ["scheme-dark"] = {
        type = "string",
        description = "Base16 theme slug for dark mode (optional - if not set, will try to find inverse or generate from light theme)"
      },
      ["ui-font"] = {
        type = "string",
        description = "UI font stack (optional - defaults to system fonts)"
      },
      ["editor-font"] = {
        type = "string", 
        description = "Editor font stack (optional - defaults to monospace fonts)"
      },
      ["editor-width"] = {
        type = "string",
        description = "Editor width (optional - defaults to 800px)"
      }
    },
    additionalProperties = false
  })
end

-- ==============================================================================
-- CONSTANTS
-- ==============================================================================
local BASE_URL = "https://raw.githubusercontent.com/tinted-theming/schemes/spec-0.11/base16/"

-- ==============================================================================
-- UI STYLESHEET TEMPLATES
-- ==============================================================================
local UI_TEMPLATE = [[
  color-scheme: light;

--ui-accent-color: var(--base0d);
--ui-accent-text-color: var(--ui-accent-color);
--ui-accent-contrast-color: var(--base00);
--highlight-color: color-mix(in srgb, var(--base0a), transparent 50%);
--link-color: var(--base0d);
--link-missing-color: var(--base09);
--link-invalid-color: var(--base0e);
--meta-color: var(--base08);
--meta-subtle-color: var(--base04);
--subtle-color: var(--base04);
--subtle-background-color: color-mix(in srgb, var(--base01), transparent 50%);

--root-background-color: var(--base00);
--root-color: inherit;

--top-color: inherit;
--top-background-color: var(--base01);
--top-border-color: var(--base03);
--top-sync-error-color: var(--top-color);
--top-sync-error-background-color: var(--base0a);
--top-saved-color: var(--base05);
--top-unsaved-color: var(--base04);
--top-loading-color: var(--base04);

--panel-background-color: var(--base00);
--panel-border-color: var(--base00);

--bhs-background-color: var(--base00);
--bhs-border-color: var(--base03);

--modal-color: inherit;
--modal-background-color: var(--base00);
--modal-border-color: var(--base03);
--modal-header-label-color: var(--ui-accent-text-color);
--modal-help-background-color: var(--base01);
--modal-help-color: var(--base04);
--modal-selected-option-background-color: var(--ui-accent-color);
--modal-selected-option-color: var(--ui-accent-contrast-color);
--modal-hint-background-color: var(--base0d);
--modal-hint-color: var(--base00);
--modal-hint-inactive-background-color: var(--base01);
--modal-hint-inactive-color: var(--base05);
--modal-description-color: var(--base04);
--modal-selected-option-description-color: var(--base02);

--notifications-background-color: inherit;
--notifications-border-color: var(--base03);
--notification-info-background-color: var(--base0c);
--notification-error-background-color: var(--base08);

--button-background-color: var(--base01);
--button-hover-background-color: inherit;
--button-color: var(--base05);
--button-border-color: var(--base03);
--primary-button-background-color: var(--ui-accent-color);
--primary-button-hover-background-color: color-mix(
  in srgb,
  var(--ui-accent-color),
  var(--base00) 35%
);
--primary-button-color: var(--ui-accent-contrast-color);
--primary-button-border-color: transparent;

--text-field-background-color: var(--button-background-color);

--progress-background-color: var(--base01);
--progress-sync-color: var(--base05);
--progress-index-color: var(--base0d);

--action-button-background-color: transparent;
--action-button-color: var(--base05);
--action-button-hover-color: var(--base0d);
--action-button-active-color: var(--base0d);

--editor-caret-color: var(--base05);
--editor-selection-background-color: color-mix(in srgb, var(--base0c), transparent 65%);
--editor-panels-bottom-color: inherit;
--editor-panels-bottom-background-color: var(--base01);
--editor-panels-bottom-border-color: var(--base03);
--editor-completion-detail-color: var(--base04);
--editor-completion-detail-selected-color: var(--base02);
--editor-list-bullet-color: var(--base04);
--editor-heading-color: var(--base05);
--editor-heading-meta-color: var(--meta-subtle-color);
--editor-hashtag-background-color: color-mix(in srgb, var(--base0c), transparent 65%);
--editor-hashtag-color: var(--base06);
--editor-hashtag-border-color: color-mix(in srgb, var(--base0d), transparent 58%);
--editor-ruler-color: var(--base04);
--editor-naked-url-color: var(--link-color);
--editor-code-color: var(--base04);
--editor-link-color: var(--link-color);
--editor-link-url-color: var(--link-color);
--editor-link-meta-color: var(--meta-subtle-color);
--editor-wiki-link-page-background-color: color-mix(in srgb, var(--base0d), transparent 93%);
--editor-wiki-link-page-color: var(--link-color);
--editor-wiki-link-page-missing-color: var(--link-missing-color);
--editor-wiki-link-page-invalid-color: var(--link-invalid-color);
--editor-wiki-link-color: var(--base0d);
--editor-command-button-color: inherit;
--editor-command-button-background-color: var(--base01);
--editor-command-button-hover-background-color: inherit;
--editor-command-button-meta-color: var(--meta-subtle-color);
--editor-command-button-border-color: var(--base03);
--editor-line-meta-color: var(--meta-subtle-color);
--editor-meta-color: var(--meta-color);
--editor-table-head-background-color: var(--base05);
--editor-table-head-color: var(--base00);
--editor-table-even-background-color: var(--base01);
--editor-blockquote-background-color: var(--subtle-background-color);
--editor-blockquote-color: var(--subtle-color);
--editor-blockquote-border-color: var(--base04);
--editor-struct-color: var(--base08);
--editor-highlight-background-color: var(--highlight-color);
--editor-code-background-color: color-mix(in srgb, var(--base01), transparent 50%);
--editor-code-comment-color: var(--meta-subtle-color);
--editor-code-variable-color: var(--base0c);
--editor-code-typename-color: var(--base0b);
--editor-code-string-color: var(--base0e);
--editor-code-number-color: var(--base0b);
--editor-code-operator-color: var(--base04);
--editor-code-info-color: var(--subtle-color);
--editor-code-atom-color: var(--base08);
--editor-frontmatter-background-color: color-mix(in srgb, var(--base0a), transparent 85%);
--editor-frontmatter-color: var(--subtle-color);
--editor-frontmatter-marker-color: color-mix(in srgb, var(--base08), transparent 50%);
--editor-widget-background-color: var(--base01);
--editor-task-marker-color: var(--subtle-color);
--editor-task-state-color: var(--subtle-color);

--editor-directive-mark-color: var(--base08);
--editor-directive-color: var(--base04);
--editor-directive-background-color: color-mix(in srgb, var(--base01), transparent 51%);

--ui-font: %s;
--editor-font: %s;
--editor-width: %s;


  /* Admonitions */
  --admonition-width: 1.25rem;]]

local DARK_UI_TEMPLATE = [[
  color-scheme: dark;

--ui-accent-color: var(--base0d);
--ui-accent-text-color: var(--ui-accent-color);
--ui-accent-contrast-color: var(--base00);
--highlight-color: color-mix(in srgb, var(--base0a), transparent 50%);
--link-color: var(--base0d);
--link-missing-color: var(--base09);
--link-invalid-color: var(--base0e);
--meta-color: var(--base08);
--meta-subtle-color: var(--base04);
--subtle-color: var(--base04);
--subtle-background-color: color-mix(in srgb, var(--base01), transparent 50%);

--root-background-color: var(--base00);
--root-color: inherit;

--top-color: inherit;
--top-background-color: var(--base01);
--top-border-color: var(--base03);
--top-sync-error-color: var(--top-color);
--top-sync-error-background-color: var(--base0a);
--top-saved-color: var(--base05);
--top-unsaved-color: var(--base04);
--top-loading-color: var(--base04);

--panel-background-color: var(--base00);
--panel-border-color: var(--base00);

--bhs-background-color: var(--base00);
--bhs-border-color: var(--base03);

--modal-color: inherit;
--modal-background-color: var(--base00);
--modal-border-color: var(--base03);
--modal-header-label-color: var(--ui-accent-text-color);
--modal-help-background-color: var(--base01);
--modal-help-color: var(--base04);
--modal-selected-option-background-color: var(--ui-accent-color);
--modal-selected-option-color: var(--ui-accent-contrast-color);
--modal-hint-background-color: var(--base0d);
--modal-hint-color: var(--base00);
--modal-hint-inactive-background-color: var(--base01);
--modal-hint-inactive-color: var(--base05);
--modal-description-color: var(--base04);
--modal-selected-option-description-color: var(--base02);

--notifications-background-color: inherit;
--notifications-border-color: var(--base03);
--notification-info-background-color: var(--base0c);
--notification-error-background-color: var(--base08);

--button-background-color: var(--base01);
--button-hover-background-color: inherit;
--button-color: var(--base05);
--button-border-color: var(--base03);
--primary-button-background-color: var(--ui-accent-color);
--primary-button-hover-background-color: color-mix(
  in srgb,
  var(--ui-accent-color),
  var(--base00) 35%
);
--primary-button-color: var(--ui-accent-contrast-color);
--primary-button-border-color: transparent;

--text-field-background-color: var(--button-background-color);

--progress-background-color: var(--base01);
--progress-sync-color: var(--base05);
--progress-index-color: var(--base0d);

--action-button-background-color: transparent;
--action-button-color: var(--base05);
--action-button-hover-color: var(--base0d);
--action-button-active-color: var(--base0d);

--editor-caret-color: var(--base05);
--editor-selection-background-color: color-mix(in srgb, var(--base0c), transparent 65%);
--editor-panels-bottom-color: inherit;
--editor-panels-bottom-background-color: var(--base01);
--editor-panels-bottom-border-color: var(--base03);
--editor-completion-detail-color: var(--base04);
--editor-completion-detail-selected-color: var(--base02);
--editor-list-bullet-color: var(--base04);
--editor-heading-color: var(--base05);
--editor-heading-meta-color: var(--meta-subtle-color);
--editor-hashtag-background-color: color-mix(in srgb, var(--base0c), transparent 65%);
--editor-hashtag-color: var(--base06);
--editor-hashtag-border-color: color-mix(in srgb, var(--base0d), transparent 58%);
--editor-ruler-color: var(--base04);
--editor-naked-url-color: var(--link-color);
--editor-code-color: var(--base04);
--editor-link-color: var(--link-color);
--editor-link-url-color: var(--link-color);
--editor-link-meta-color: var(--meta-subtle-color);
--editor-wiki-link-page-background-color: color-mix(in srgb, var(--base0d), transparent 93%);
--editor-wiki-link-page-color: var(--link-color);
--editor-wiki-link-page-missing-color: var(--link-missing-color);
--editor-wiki-link-page-invalid-color: var(--link-invalid-color);
--editor-wiki-link-color: var(--base0d);
--editor-command-button-color: inherit;
--editor-command-button-background-color: var(--base01);
--editor-command-button-hover-background-color: inherit;
--editor-command-button-meta-color: var(--meta-subtle-color);
--editor-command-button-border-color: var(--base03);
--editor-line-meta-color: var(--meta-subtle-color);
--editor-meta-color: var(--meta-color);
--editor-table-head-background-color: var(--base05);
--editor-table-head-color: var(--base00);
--editor-table-even-background-color: var(--base01);
--editor-blockquote-background-color: var(--subtle-background-color);
--editor-blockquote-color: var(--subtle-color);
--editor-blockquote-border-color: var(--base04);
--editor-struct-color: var(--base08);
--editor-highlight-background-color: var(--highlight-color);
--editor-code-background-color: color-mix(in srgb, var(--base01), transparent 50%);
--editor-code-comment-color: var(--meta-subtle-color);
--editor-code-variable-color: var(--base0c);
--editor-code-typename-color: var(--base0b);
--editor-code-string-color: var(--base0e);
--editor-code-number-color: var(--base0b);
--editor-code-operator-color: var(--base04);
--editor-code-info-color: var(--subtle-color);
--editor-code-atom-color: var(--base08);
--editor-frontmatter-background-color: color-mix(in srgb, var(--base0a), transparent 85%);
--editor-frontmatter-color: var(--subtle-color);
--editor-frontmatter-marker-color: color-mix(in srgb, var(--base08), transparent 50%);
--editor-widget-background-color: var(--base01);
--editor-task-marker-color: var(--subtle-color);
--editor-task-state-color: var(--subtle-color);

--editor-directive-mark-color: var(--base08);
--editor-directive-color: var(--base04);
--editor-directive-background-color: color-mix(in srgb, var(--base01), transparent 51%);

  /* Admonitions */
  --admonition-width: 1.25rem;
  
]]

-- ==============================================================================
-- HELPER FUNCTIONS
-- ==============================================================================
function fetchTheme(scheme_name)
  --editor.flashNotification("Fetching theme: " .. scheme_name)
  --local url = BASE_URL .. scheme_name .. ".yaml"
  --editor.flashNotification("Fetching URL: " .. url)

  local success, result = pcall(function() 
    return http.request(BASE_URL .. scheme_name .. ".yaml")
  end)

  --editor.flashNotification("HTTP success: " .. tostring(success))

  if not success then
    --editor.flashNotification("HTTP error: " .. tostring(result))
    return false, nil
  end

  if not result or not result.body then
    --editor.flashNotification("No response body")
    return false, nil
  end

  --editor.flashNotification("Body length: " .. string.len(result.body))
  --editor.flashNotification("First 100 chars: " .. string.sub(result.body, 1, 100))

  local palette = {}
  local match_count = 0
  for key, val in result.body:gmatch("base(%x%x)%s*:%s*['\"]?([#]?%x%x%x%x%x%x)['\"]?") do
    match_count = match_count + 1
    local clean = string.gsub(val, "#", "")
    local lower = string.lower(clean)
    if string.len(lower) == 6 and string.match(lower, "^%x+$") then
      palette["base" .. string.lower(key)] = "#" .. lower
    end
  end

  --editor.flashNotification("Regex matches: " .. match_count .. " | Palette size: " .. tostring(#palette))
  if match_count == 0 then
    --editor.flashNotification("YAML sample: " .. string.sub(result.body, 1, 200))
  end

  return true, palette
end


function findInverseTheme(scheme)
  local inverse_candidates = {}

  --editor.flashNotification("Input scheme: '" .. tostring(scheme) .. "' (type: " .. type(scheme) .. ")")

  if string.find(scheme, "light") then
    local result1 = string.gsub(scheme, "light", "dark")
    local result2 = string.gsub(scheme, "-light", "-dark")
    local result3 = scheme:gsub("light", "dark")

    table.insert(inverse_candidates, result1)
    table.insert(inverse_candidates, result2) 
    table.insert(inverse_candidates, result3)
  end

  for _, candidate in ipairs(inverse_candidates) do
    local success, palette = fetchTheme(candidate)
    if success then
      return candidate, palette
    end
  end

  return nil, nil
end

function generateThemeVars(palette, swap_neutrals)
  local rules = {}

  -- DEBUG: Check what we're getting
  --editor.flashNotification("generateThemeVars called with swap_neutrals: " .. tostring(swap_neutrals))

  if not palette then
    --editor.flashNotification("ERROR: base16 palette is nil!")
    return ""
  end

  -- Count palette entries
  local count = 0
  for k, v in pairs(palette) do
    count = count + 1
    --editor.flashNotification("Palette: " .. k .. " = " .. v)
  end
  --editor.flashNotification("Palette has " .. count .. " entries")

  -- Rest of function unchanged...
  if swap_neutrals then
    for i = 0, 7 do
      local from_key = string.format("base%02x", i)
      local to_key = string.format("base%02x", 7-i)
      if palette[from_key] then
        rules[#rules + 1] = string.format("  --%s: %s;", to_key, palette[from_key])
      end
    end
  else
    for i = 0, 7 do
      local key = string.format("base%02x", i)
      if palette[key] then
        rules[#rules + 1] = string.format("  --%s: %s;", key, palette[key])
      end
    end
  end

  for i = 8, 15 do
    local key = string.format("base%02x", i)
    if palette[key] then
      rules[#rules + 1] = string.format("  --%s: %s;", key, palette[key])
    end
  end

  --editor.flashNotification("Generated " .. #rules .. " CSS rules")
  return table.concat(rules, "\n")
end


-- ==============================================================================
-- MAIN THEME APPLICATION FUNCTION
-- ==============================================================================
function theme.applyFromConfig()
  local light_scheme = "default-light"
  local dark_scheme = nil

local light_success, config_result = pcall(function() return config.get("base16.scheme") end)
--editor.flashNotification("Config read success: " .. tostring(light_success))
--editor.flashNotification("Config result: " .. tostring(config_result) .. " (type: " .. type(config_result) .. ")")

if light_success and type(config_result) == "string" and config_result ~= "" then
  light_scheme = config_result
  --editor.flashNotification("Using scheme: " .. light_scheme)
else
  --editor.flashNotification("Falling back to default-light")
end

  local dark_success, dark_config_result = pcall(function() return config.get("base16.scheme-dark") end)
  if dark_success and type(dark_config_result) == "string" and dark_config_result ~= "" then
    dark_scheme = dark_config_result
  end

  -- Read font and width configuration
  local ui_font = "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""
  local editor_font = "\"iA-Mono\", \"Menlo\""
  local editor_width = "800px"

  local font_success, ui_font_config = pcall(function() return config.get("base16.ui-font") end)
  if font_success and type(ui_font_config) == "string" and ui_font_config ~= "" then
    ui_font = ui_font_config
  end

  local editor_font_success, editor_font_config = pcall(function() return config.get("base16.editor-font") end)
  if editor_font_success and type(editor_font_config) == "string" and editor_font_config ~= "" then
    editor_font = editor_font_config
  end

  local width_success, editor_width_config = pcall(function() return config.get("base16.editor-width") end)
  if width_success and type(editor_width_config) == "string" and editor_width_config ~= "" then
    -- Add 'px' if no unit is specified
    if string.match(editor_width_config, "^%d+$") then
      editor_width = editor_width_config .. "px"
    else
      editor_width = editor_width_config
    end
  end

  -- Check if existing stylesheet matches current config
  local page_exists, existing_content = pcall(function()
    return space.readPage("Library/User/Styles/Base16 Stylesheet")
  end)

  if page_exists and existing_content then
    -- Parse existing config from comment
    local existing_config = existing_content:match("/%* Config: (.-) %*/")
    local current_config = string.format("%s|%s|%s|%s|%s", 
      light_scheme, 
      dark_scheme or "", 
      ui_font, 
      editor_font, 
      editor_width)
  
    if existing_config == current_config then
      --editor.flashNotification("Config matches. No changes!")
      return true
    end
  end

  -- Fetch light theme
  local light_success, light_palette = fetchTheme(light_scheme)
  if not light_success then
    error("Failed to fetch light theme: " .. light_scheme)
  end

  -- Determine dark theme
  local dark_palette = nil
  local used_dark_scheme = light_scheme

  if dark_scheme then
    -- 1. Explicit dark theme specified
    local dark_success, explicit_dark_palette = fetchTheme(dark_scheme)
    if dark_success then
      dark_palette = explicit_dark_palette
      used_dark_scheme = dark_scheme
    end
  elseif string.find(light_scheme, "light") or string.find(light_scheme, "dark") then
    -- 4. Scheme has light/dark in name, try to find inverse
    local inverse_scheme, inverse_palette = findInverseTheme(light_scheme)
    if inverse_scheme then
      dark_palette = inverse_palette  
      used_dark_scheme = inverse_scheme
    end
  end
  -- 3. If no explicit dark theme and scheme doesn't have light/dark in name,
  -- we'll swap base00-07 below

  -- Generate CSS variables
  local light_vars = generateThemeVars(light_palette, false)
  local dark_vars

  if dark_palette then
    -- Use separate dark theme palette
    dark_vars = generateThemeVars(dark_palette, false)
  else
    -- Generate swapped colors from light theme
    dark_vars = generateThemeVars(light_palette, true)
    used_dark_scheme = light_scheme .. " (inverted)"
  end

  -- Create config signature for change detection
  local config_signature = string.format("%s|%s|%s|%s|%s", 
    light_scheme, 
    dark_scheme or "", 
    ui_font, 
    editor_font, 
    editor_width)

  -- Generate CSS content
  local css_content = string.format([[/* Base16 Stylesheet: %s / %s */
/* Config: %s */
/* Generated by Base16 Loader */
/* priority: 99 */

html {
%s
%s
}

html[data-theme="light"] {
  color-scheme: light;
}

html[data-theme="dark"] {
%s
%s
}

/* Admonition styling */
.sb-admonition[admonition="note"] .sb-admonition-type::before { width: var(--admonition-width) !important; }
.sb-admonition[admonition="note"] .sb-admonition-type * { display: none; }
.sb-admonition[admonition="note"] {
  --admonition-icon: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>');
  --admonition-color: #00b8d4;
}

.sb-admonition[admonition="warning"] .sb-admonition-type::before { width: var(--admonition-width) !important; }
.sb-admonition[admonition="warning"] .sb-admonition-type * { display: none; }
.sb-admonition[admonition="warning"] {
  --admonition-icon: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>');
  --admonition-color: #ff9100;
}]], light_scheme, used_dark_scheme, config_signature, light_vars, string.format(UI_TEMPLATE, ui_font, editor_font, editor_width), dark_vars, DARK_UI_TEMPLATE)

  -- Write stylesheet
  local page_content = string.format("```space-style\n%s\n```", css_content)
  space.writePage("Library/User/Styles/Base16 Stylesheet", page_content)

  editor.flashNotification("Updated to new base16 theme settings!")
  return true
end

-- ==============================================================================
-- AUTOMATIC APPLICATION ON STARTUP
-- ==============================================================================
event.listen{
  name = "system:ready",
  run = function()
    local success, result = pcall(theme.applyFromConfig)
    if success then
      --editor.flashNotification("Base16 stylesheet generated!")
    else
      --editor.flashNotification("Base16 error: " .. tostring(result))
    end
  end
}


```
