---
githubUrl: "https://github.com/malys/silverbullet-libraries/blob/main/src/ExternalTransclusion.md"
---

# External transclusion
Transclude data form external resource.


${ transclude "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/refs/heads/main/pages/techniques/zeroshot.en.mdx" }


```space-lua
transclude = function(url)
  local result = http.request(url)
  local tree = markdown.parseMarkdown(result.body)
  local rendered = markdown.renderParseTree(tree)
  return widget.new { markdown = rendered:gsub("<[^>]*>","") }
end
```



```space-lua
slashcommand.define {
  name = "plantumleditor",
  description= "insert plantuml editor",
  run = function()
tpl=[[${utilities.embedUrl("https://plantuml.online/uml/","100%","1000px")}]]
  editor.insertAtCursor(tpl, false, true)
  end
}
```