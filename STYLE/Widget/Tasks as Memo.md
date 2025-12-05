
```space-lua
local colors = { "#fcf", "#ffc", "#cff", "#fcc", "#9cf", "#c9f", "#fcd", "#ff9", "#cf9", "#9fc", "#fc6", "#f9f", "#fc9", "#cfc", "#9f9", "#ccf", "#f9c", "#9ff" }

function widgets.stickyNotes(tasks)
  local list = dom.ul {}

  for _, task in ipairs(tasks) do
    local rotation = math.random(-7, 7)
    local translation = math.random(-5, 5)
    local color = colors[math.random(#colors)]
    local tape = math.random(1, 3)
    local stateClass = task.done and "done" or "open"

    local element = dom.li {
      dom.a {
        dom.p {
          task.name
        },
        href = "/" .. task.ref,
        style = string.format(
          "transform:rotate(%ddeg); top:%dpx; background: %s;",
          rotation,
          translation,
          color
        ),
        class = string.format("tape-%d %s", tape, stateClass)
      }
    }

    list.appendChild(element)
  end

  local linkNode = dom.link {
    href="https://fonts.googleapis.com/css2?family=Reenie+Beanie&display=swap",
    rel="stylesheet"
  }

  return widget.new {
    display = "block",
    html = dom.div {
      id = "board",
      class = "sticky-notes",
      list, linkNode
    }
  }
end
```


```space-style
.sticky-notes {
  font-size: 12px;
  padding: 2em;
}

.sticky-notes * {
  padding: 0;
  margin: 0;
}

.sticky-notes ul, .sticky-notes li {
  list-style: none;
}

.sticky-notes ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.sticky-notes > ul > li > a {
  position: relative;
  text-decoration: none;
  color: #000;
  background: #ffc;
  display: block;
  height: 14em;
  width: 14em;
  padding: 1em;
  box-shadow: 3px 3px 5px rgba(33, 33, 33, .7);
}

.sticky-notes > ul > li > a::before {
  content: "";
  position: absolute;
  display: block;
  background-color: rgba(255, 255, 240, 0.6);
}

.sticky-notes > ul > li > a.tape-1::before {
  height: 20px;
  width: 15px;
  left: 50%;
  top: -10px;
  transform: rotate(-5deg) translateX(-48%);
}

.sticky-notes > ul > li > a.tape-2::before {
  height: 20px;
  width: 35px;
  left: 50%;
  top: -10px;
  transform: rotate(2deg) translateX(-55%);
}

.sticky-notes > ul > li > a.tape-3::before {
  height: 20px;
  width: 25px;
  left: 43%;
  top: -4px;
  transform: rotate(15deg) translateX(-50%);
}

.sticky-notes > ul > li:hover {
  transform: scale(1.05);
  transition: all 0.2s ease;
}

.sticky-notes > ul > li > a > p {
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;

  font-family: 'Reenie Beanie';
  font-size: 2.2em;
  font-weight: bold;
}

.sticky-notes ul li {
  margin: 1em;
}

/* Overwrite Silverbullet stuff */
.sticky-notes ul li::before {
  content: none !important;
}

/* DONE STATE */
.sticky-notes > ul > li > a.done p {
  text-decoration: line-through;
  text-decoration-color: #e00;
  text-decoration-thickness: 3px;
  text-decoration-style: wavy;
}

.sticky-notes > ul > li > a.done {
  filter: grayscale(40%);
  opacity: 0.3;
}
```
