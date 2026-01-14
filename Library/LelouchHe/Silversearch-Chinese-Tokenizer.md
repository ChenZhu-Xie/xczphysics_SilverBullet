---
name: Library/LelouchHe/Silversearch-Chinese-Tokenizer
tags: meta/library
files:
- silversearch-chinese-tokenizer.js
- silversearch-chinese-tokenizer.wasm
share.uri: "ghr:LelouchHe/silversearch-chinese-tokenizer/PLUG.md"
share.hash: b9b03e20
share.mode: pull
---
# Silversearch Chinese Tokenizer

This is the tokenizer plug of [Silversearch](https://github.com/MrMugame/silversearch) for Chinese.

# Install

In [Library Manager](https://silverbullet.md/Library%20Manager), click "Install from URI", and enter `ghr:LelouchHe/silversearch-chinese-tokenizer/PLUG.md`. It will install the latest release build.

[Silversearch](https://github.com/MrMugame/silversearch) should also be installed from edge branch (`ghr:MrMugame/silversearch@edge/PLUG.md`), and add below to its config:

```lua
config.set("silversearch.tokenizers", {
  ["Library/LelouchHe/silversearch-chinese-tokenizer.js"] = {}
})
```

# Dependency

Currently, [jieba-wasm](https://github.com/fengkx/jieba-wasm/) is used internally. In rare scenario where it's upgraded to a new version, a reload + reindex is required for best results.