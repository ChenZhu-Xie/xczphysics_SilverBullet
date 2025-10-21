
1. https://community.silverbullet.md/t/space-lua-command-to-update-silverbullet-libraries/3421?u=chenzhu-xie

```space-lua
command.define {
  name = "Import: Update library for current page from GitHub",
  key = "Ctrl-Alt-u",
  mac = "Cmd-Alt-u",
  run = function()
    local page = editor.getCurrentPage()
    if not page then
      editor.flashNotification("No page open to update", "error")
      return
    end

 -- get current text and original frontmatter block (raw)
    local original_text = editor.getText() or ""

    local parsed = index.extractFrontmatter(original_text)
    local fm = parsed.frontmatter or {}
    local url = fm.githubUrl
    local frontmatter = '---\ngithubUrl: "'.. url ..'"\n---'
    
    if not url or url == "" then
      editor.flashNotification("⚠️ No 'githubUrl' found in frontmatter", "error")
      return
    end

    -- Convert GitHub URL to raw URL
    local rawUrl = url
    rawUrl = rawUrl:gsub("^https://github%.com/", "https://raw.githubusercontent.com/")
    rawUrl = rawUrl:gsub("/blob/", "/")
    rawUrl = rawUrl:gsub("/tree/", "/")

    editor.flashNotification("Fetching latest version from GitHub…")

    local req = http.request(rawUrl)
    if not req.ok then
      js.log("Failed to fetch " .. rawUrl)
      editor.flashNotification("⚠️ Update failed: could not fetch remote file", "error")
      return
    end

    local newContent = req.body or ""
    if newContent == "" then
      editor.flashNotification("⚠️ Fetched content is empty.", "error")
      return
    end

    local final = nil
    if fm and fm ~= "" then
      final = frontmatter .. "\n\n" .. newContent
    else
      final = newContent
    end

    -- write back and navigate
    space.writePage(page, final)
    editor.flashNotification("✅ Page updated from GitHub")
    editor.navigate({ kind = "page", page = page })
  end
}
```