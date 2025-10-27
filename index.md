---
banner: ["https://raw.githubusercontent.com/Mr-xRed/silverbullet-libraries/refs/heads/main/banner/welcome.jpg"]
---

# Hello 👋

Welcome to the wondrous world of [SilverBullet](https://v2.silverbullet.md/). A world that once you discover and appreciate, you’ll never want to leave.

_[One of us!](https://community.silverbullet.md/)_
![[ETP.png]]

## ETP.logo Meaning

In the same spirit as [SilverBullet](https://silverbullet.md/) and [this website](https://enlarge-the-percentage.fly.dev/) built upon it — the logo above is meant to _enlarge the percentage_.

But what percentage? The percentage of **us** —— those who admire, employ, and enhance these tools.

These individuals define the boundaries and frontiers between the explored and the yet unexplored worlds.

The mutual dynamics among this small group, as well as between them and the world they build, propel the the world’s shared evolution forward, ultimately shaping the course of the future.

## ETP.logo History

Those three words _Enlarge. The. Percentage._ are clearly not what an adult native English speaker would use, and the phrasing seems grammatically off as well. 

Yes, the image was drawn by an 18-year-old from mainland China — my younger self — meticulously constructed with ruler on the back of my high-school graduation shirt.

At that time, and even now, I feel deeply that I am good at:

1. ${Green("Acquisition")}: actively gather and filter unknown information efficiently, discover unusual dark spots ([SilverBullet](https://silverbullet.md/) itself counts a proof :);
2. ${Green("Processing")}: pattern recognize, distill, understand, interweave, compress, and transform known information through original logic into forms comprehensible to the public; 
3. ${Green("Output")}: strive for what one believes to be precise expression —

Therefore, I possess value to the outside world, as a automatic crawler + processor + distributor.

However, these thoughts are often incomprehensible to others physically surrounds me (due to the mismatch), and their true worth cannot be accurately assessed.

Since I face this dilemma, and I am but one instance out of 8.2 billion, it stands to reason that many others share a similar condition. Thus, the thought *“I wish to find my companions among the boundless sea of humanity, and if not, to convert a few myself”* became the very impetus behind this project.

That is precisely why I wish to _enlarge the percentage_ — I need to ${Blue("replicate myself")}, not through reproduction, not through education, and certainly not through eliminating others. 

So how should it be done? 

Well, let’s start with a logo first.

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