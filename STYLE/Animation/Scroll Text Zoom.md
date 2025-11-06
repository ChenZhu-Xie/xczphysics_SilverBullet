
```
.cm-line,
.sb-table-widget, 
.sb-lua-directive-inline,
.sb-lua-directive-block {
  animation: appear linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 100%;
  
}

@keyframes appear {
  0% {    /* BOTTOM OF THE PAGE*/
    opacity: 0;
    scale: 0.7; 
    filter: blur(0px);
  }
  10% {    /* LINE FULLY RENDERED*/
    opacity: 1;
    scale: 1.0;
     filter: blur(0px);
  }
  90% {  /* LINE FULLY RENDERED*/
    opacity: 1;
    scale: 1;
     filter: blur(0px);
  }
  100% {  /* TOP OF THE PAGE*/
    opacity: 0;
    scale: 0.7;
     filter: blur(0px);
  }
}
```
