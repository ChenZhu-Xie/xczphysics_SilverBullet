export async function indexPageMeta({ name }, index) {
  const meta = await space.readPageMeta(name);
  if (!meta) return;
  index({
    key: name,
    tag: "page-meta",
    value: { lastOpened: meta.lastOpened }
  });
}
