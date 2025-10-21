
1. https://community.silverbullet.md/t/super-fast-tag-page-navigator/2203/10?u=chenzhu-xie
2. 

```space-style
.fastnav-tags button {
  background-color: var(--root-background-color);
  color: var(--root-color);
  margin-top: 5px;
  margin-right: -5px;
  padding: 0.3em 0.3em;
  border: none;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
}

.fastnav-tags button:hover {
  background-color: var(--meta-subtle-color);
  color: var(--root-color);
}

.fastnav-tags button.active-tag {
  background-color: var(--editor-hashtag-background-color);
  color: var(--editor-hashtag-color);
}

.fastnav-tags button span.fn-c {
  font-size: 0.7em;
  vertical-align: super;
  opacity: 0.5;
  margin-left: 4px;
}

.fn-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
  padding: 10px 0;
}

.fn-pagination button {
  background-color: var(--editor-hashtag-background-color);
  color: var(--editor-hashtag-color);
  padding: 0.4em 0.8em;
  border: 1px solid var(--button-border-color);
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
}

.fn-pagination button:hover:not(:disabled) {
  background-color: var(--meta-subtle-color);
  color: var(--root-color);
}

.fn-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.fn-page-info {
  font-size: 0.9em;
  color: var(--root-color);
}

.fastnav-pages {
  padding-top: 5px;
  font-size: 0.9em;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fastnav-pages span {
  background-color: var(--editor-code-background-color);
  border: 1px solid var(--button-border-color);
  flex: 1 1 calc(20% - 8px);
  padding: 0.4em 0.6em;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
}

.fastnav-pages span:hover {
  background-color: var(--meta-subtle-color);
  color: var(--root-color);
  cursor: pointer;
}

.fastnav-block {
  color: var(--root-color);
}
```