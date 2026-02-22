
1. [link previews](https://community.silverbullet.md/t/link-previews/3906?u=chenzhu-xie) #community #silverbullet

${fetchPreview("https://github.com/silverbulletmd")}

## Lua

```space-lua
function fetchPreview(url)
  local hash = crypto.sha256(url)
  local key = {'urlPreview',hash}
  local cache = datastore.get(key)
  local img, desc, title;
  if cache != nil then
    img = cache.img
    desc = cache.desc
    title = cache.title
  else
    local c = net.proxyFetch(url)
    img = string.matchRegex(c.body,'(?<="og:image" content=")[^"]*')
    img = (next(img) != nil) and img[1] or "https://placehold.co/1200x630?text=Image+Not+Found"
    title = string.matchRegex(c.body,'(?<="og:title" content=")[^"]*')
    if next(title) == nil then
      title = string.matchRegex(c.body,[[(?<=<title>).+?(?=<\/title>)]])
    end
    title = (next(title) != nil) and title[1] or "(No title)"
    desc = string.matchRegex(c.body,'(?<="og:description" content=")[^"]*')
    if next(desc) == nil then
      desc = string.matchRegex(c.body,'(?<=meta name="description" content=")[^"]*')
    end
    desc = (next(desc) != nil) and desc[1] or "(No description)"
    datastore.set(key,{img = img, title = title, desc = desc})
  end
  
  return widget.html(dom.a{
  href = url,
  class = "link-preview",
  target="_blank",
  rel="noopener noreferrer",

  dom.div{
    class = "link-preview__image-wrapper",

    dom.img{
      src = img,
      alt = title,
      class = "link-preview__image"
    }
  },

  dom.div{
    class = "link-preview__content",

    dom.h3{
      class = "link-preview__title",
      title
    },

    dom.p{
      class = "link-preview__description",
      desc
    },

    dom.span{
      class = "link-preview__url",
      url
    }
  }
  })
end
```

## CSS

```space-style
.link-preview {
  display: flex;
  flex-direction: row;
  text-decoration: none;
  color: inherit;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  max-width: 600px;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
  max-height: 200px;
}

.link-preview:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.12);
  border-color: #ccc;
}

.link-preview__image-wrapper {
  flex: 0 0 35%;
  max-width: 35%;
  aspect-ratio: 1.91 / 1; /*typical OG preview ratio*/
  overflow: hidden;
  background: #f3f3f3;
}

.link-preview__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.link-preview__content {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.link-preview__title {
  color: black;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.link-preview__description {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.4;
  max-height: 3.2em; /*~2 lines*/
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-preview__url {
  font-size: 12px;
  color: #888;
  margin-top: auto;
}
```
