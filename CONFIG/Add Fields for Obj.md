```space-lua
export async function indexPageMeta({ name }, index) {
  const meta = await space.readPageMeta(name);
  index({
    key: name,
    tag: "page-meta",
    value: { lastOpened: meta.lastOpened }
  });
}
```