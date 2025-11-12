---
hide-frontmatter: true
---


1. [hiding frontmatter](https://community.silverbullet.md/t/hiding-frontmatter/830/13?u=chenzhu-xie) #community #silverbullet

```
-- Toggle frontmatter visibility with auto-hide support
-- Auto-hides if page has hide-frontmatter: true in frontmatter

local styleId = 'hide-frontmatter-css'
local style = '.sb-frontmatter, .sb-line-frontmatter-outside, .sb-frontmatter-marker { display: none !important; }'

local function scrollToFrontmatter()
  local fm = js.window.document.querySelector('.sb-frontmatter, .sb-line-frontmatter-outside')
  if fm then
    fm.scrollIntoView({ behavior = 'smooth', block = 'start' })
  end
end

local function setVisibility(hidden)
  local el = js.window.document.getElementById(styleId)
  if hidden and not el then
    js.window.document.head.insertAdjacentHTML('beforeend', '<style id="' .. styleId .. '">' .. style .. '</style>')
  elseif not hidden and el then
    el.remove()
    js.window.setTimeout(scrollToFrontmatter, 50)
  end
end

local function pageHasHideFrontmatter()
  local pageName = editor.getCurrentPage()
  if not pageName then return false end
  
  local success, pageText = pcall(function() return space.readPage(pageName) end)
  if not success or not pageText then return false end
  
  -- Find frontmatter block boundaries
  local startPos = string.find(pageText, "^%-%-%-")
  if not startPos then return false end
  
  -- Find the end of frontmatter (second ---)
  local endPos = string.find(pageText, "[\r\n]+%-%-%-", startPos + 3)
  if not endPos then return false end
  
  -- Extract frontmatter content (between first --- and second ---)
  local fm = string.sub(pageText, startPos + 3, endPos - 1)
  fm = string.gsub(fm, "^%s*[\r\n]+", "")  -- Remove leading whitespace/newlines
  fm = string.gsub(fm, "[\r\n]+%s*$", "")  -- Remove trailing whitespace/newlines
  
  -- Check for hide-frontmatter: true (case-insensitive)
  return string.match(string.lower(fm), "hide%-frontmatter%s*:%s*true") ~= nil
end

function toggleFrontmatterVisibility()
  local isHidden = js.window.document.getElementById(styleId) ~= nil
  setVisibility(not isHidden)
  js.window.localStorage.setItem('frontmatterHidden', tostring(not isHidden))
end

local function updateVisibility()
  local shouldHide = pageHasHideFrontmatter() or 
                     js.window.localStorage.getItem('frontmatterHidden') == 'true'
  setVisibility(shouldHide)
end

command.define {
  name = "Toggle Frontmatter Visibility",
  key = "Ctrl-Alt-f",
  mac = "Cmd-Alt-f",
  run = toggleFrontmatterVisibility
}

local function delayedUpdate(delay)
  js.window.setTimeout(updateVisibility, delay or 100)
end

event.listen { name = 'editor:pageLoaded', run = function() delayedUpdate(100) end }
event.listen { name = 'editor:pageSaved', run = function() delayedUpdate(100) end }
event.listen { name = 'system:ready', run = function() delayedUpdate(200) end }
```
