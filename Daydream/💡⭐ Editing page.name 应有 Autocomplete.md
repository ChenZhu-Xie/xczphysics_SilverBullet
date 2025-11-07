#silverbullet #dev #💡

# 💡⭐ Editing page.name 应有 Autocomplete

难道不是么？在 SB 中编辑 本页的 title 时。

```space-lua
function generateLua()
    return '{editor.getCurrentPage()}'
end
```
${"$"}${generateLua()}

## Use case

比如你先 `Shift + Alt + N` Quick Note，再 Rename 到这里 Daydream/...，在你敲 Daydream 的时候，应该 autocomplete it.

这应该很容易做到，因为 已经在 `[[]]` 中实现了。
> **warning** Warning
> 然而：汉字 和 emoji 等非 asdf 符号
> 不被 autocomplete 的检索支持

1. relates to [[CONFIG/Auto Completions]]