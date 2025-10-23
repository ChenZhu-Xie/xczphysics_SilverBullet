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
-- 定义 Slash Command
slashcommand.define {
  name = "plantumleditor",
  description = "Insert PlantUML editor iframe",
  run = function()
    -- 设置默认宽高
    local width = "100%"
    local height = "1000px"

    -- 调用 utilities.embedUrl 生成 iframe HTML
    local iframe_html = utilities.embedUrl("https://plantuml.online/uml/", width, height)

    -- 插入光标处，直接插入 HTML
    editor.insertAtCursor(iframe_html, false, false)
  end
}

```

${utilities.embedUrl("https://plantuml.online/uml/","100%","1000px")}
