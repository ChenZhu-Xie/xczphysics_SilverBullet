
# Hello 👋

Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

${widget.html(dom.marquee{
  dom.span {
    style="color:cyan;",
    "Finally, You’ve made it here!"
  }
})}

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png|500]]

## ETP.logo Meaning

In the same spirit as [SilverBullet](https://silverbullet.md/) and [this website](https://enlarge-the-percentage.fly.dev/) built upon it — the logo above is meant to _enlarge the percentage_.

But what percentage? The percentage of **us** —— those who admire, employ, and enhance these tools.

These individuals define the boundaries and frontiers between the explored and the yet unexplored worlds.

The mutual dynamics among this small group, as well as between them and the world they build, propel the the world’s shared evolution forward, ultimately shaping the course of the future.

## ETP.logo History

Those three words _Enlarge. The. Percentage._ are clearly not what an adult native English speaker would use, and the phrasing seems grammatically off as well. 

Yes, the image was drawn by an 17-year-old from mainland China — my younger self — meticulously constructed with ruler on the back of my high-school graduation shirt.

At that time — a decade ago, and even now, I feel deeply that I possess a natural gift:

1. ${Purple("Acquisition")}: actively generate (from purely within), gather (from surroundings) and filter unknown information efficiently, discover unusual dark spots (e.g. [SilverBullet](https://silverbullet.md/), [[Language/Input Method]]);
2. ${Purple("Processing")}: pattern recognize, distill, understand, interweave, compress, and transform known information through original logic into forms comprehensible to the public; 
3. ${Purple("Output")}: strive for what one believes to be precise and concise expression —

Therefore, I possess value to the outside world, as a automatic info generator/crawler + processor + distributor.

However, these thoughts are often incomprehensible to others physically surrounds me (due to the mismatch), and their true worth cannot be accurately assessed.

Since I face this dilemma, and I am but one instance out of 8.2 billion, it stands to reason that many others share a similar condition. Thus, the thought *“I wish to find my companions among the boundless sea of humanity, and if not, to convert/transform a few myself”* became the very impetus behind this project.

That is precisely why I, together with some of you, wish to _enlarge the percentage_ — ${Blue("replicate oneself")}, not through reproduction ♂×♀, not through education🧑‍🎓, and certainly not through eliminating others. 

So how should it be done? 

Well, let’s start with a logo first.

# Statistics

## Last Modified ✏️

${query[[
    from index.tag "page" 
    where _.name != editor.getCurrentPage() 
    select {ref=_.ref, lastModified=_.lastModified} 
    order by lastModified 
    desc limit 5
]]}
## Last Visit 👀

${query[[
    from editor.getRecentlyOpenedPages "page"
    where _.lastOpened and _.name != editor.getCurrentPage()
    select {ref=_.ref, lastVisit=os.date("%Y-%m-%d %H:%M:%S", _.lastOpened/1000)} 
    order by _.lastOpened desc
    limit 5
]]}
## Most Visit ❤️‍🔥

table.sort(mytable, compareVisitimes)

```space-lua
mytable = query[[
              from index.tag "page"
              select {ref=_.ref, Visitimes=((datastore.get({"Visitimes", _.name}) or {}).value or 0)}
          ]]

function compareVisitimes(a, b)
  return a.Visitimes  > b.Visitimes 
end
```
