---
name: Library/Al3cLee/Silversearch-Chinese-Tokenizer
tags: meta/library
files:
- silversearch-chinese-tokenizer.js
- silversearch-chinese-tokenizer.wasm
share.uri: "ghr:Al3cLee/silversearch-chinese-tokenizer/PLUG.md"
share.hash: 0860bd70
share.mode: pull
---
# Silversearch Chinese Tokenizer

This is a tokenizer plug of [Silversearch](https://github.com/MrMugame/silversearch) for Chinese.

# Install

In [Library Manager](https://silverbullet.md/Library%20Manager), click "Install from URI", and enter `ghr:Al3cLee/silversearch-chinese-tokenizer/PLUG.md`. It will install the latest release build.

[Silversearch](https://github.com/MrMugame/silversearch) should also be installed from edge branch (`ghr:MrMugame/silversearch@edge/PLUG.md`), and add below to its config:

```lua
config.set("silversearch.tokenizers", {
  ["Library/Al3cLee/silversearch-chinese-tokenizer.js"] = {}
})
```

The above code should be inserted as a `space-config` block in your space, e.g. in your `[[CONFIG]]` page. Do not add this code to a meta page, that is, a page whose `tags` include `meta` or some sub-tag `meta/*`.

# Dependency

Currently, [jieba-wasm](https://github.com/fengkx/jieba-wasm/) is used internally. In rare scenario where it's upgraded to a new version, a reload + reindex is required for best results.

