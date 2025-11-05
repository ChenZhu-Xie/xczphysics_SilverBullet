
${query[[from index.tag "page" 
         where _.lastVisit and _.name != editor.getCurrentPage()
         select {ref=_.ref, lastVisit=_.lastVisit} 
         order by _.lastVisit desc 
         limit 5]]}