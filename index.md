---
banner: ["https://raw.githubusercontent.com/Mr-xRed/silverbullet-libraries/refs/heads/main/banner/welcome.jpg"]
---

# Hello 👋
Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

## ETP.logo meaning

In the same spirit as [SilverBullet](https://silverbullet.md/) and [this website](https://enlarge-the-percentage.fly.dev/) built upon it — the logo above is meant to _enlarge the percentage_.

But what percentage? The percentage of **us** —— those who admire, employ, and enhance these tools.

These individuals define the boundaries and frontiers between the explored and the yet unexplored worlds.

The mutual dynamics among this small group, as well as between them and the world they build, propel the the world’s shared evolution forward, ultimately shaping the course of the future.

## ETP.logo history

Those three words are clearly not what an adult native English speaker would use, and the phrasing seems grammatically off as well. 

Yes, the image was drawn by an 18-year-old from mainland China — my younger self — meticulously constructed with ruler on the back of my high-school graduation shirt.

At that time, and even now, I feel deeply that:

1. Acquisition: Few people can filter and gather unknown information as efficiently as I do; 
2. Processing: distill, compress, and transform known information through original thought into forms comprehensible to the public; and 
3. Output: I strive for what I believe to be precise expression —

Therefore, I possess value to the outside world.

However, these thoughts are often incomprehensible to others (due to the mismatch), and their true worth cannot be accurately assessed.



# Last Modified ✏️

${query[[from index.tag "page" where _.name != editor.getCurrentPage() select {ref=_.ref, lastModified=_.lastModified} order by lastModified desc limit 5]]}

# Last Visit 👀

${query[[from index.tag "page" 
         where _.lastVisit and _.name != editor.getCurrentPage()
         select {ref=_.ref, lastVisit=_.lastVisit} 
         order by _.lastVisit desc 
         limit 5]]}

# Time 🌄

${timeLeftBar()}