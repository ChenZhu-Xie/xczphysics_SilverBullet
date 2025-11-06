
```space-style
.cm-line {
  animation: appearText linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
  
}

@keyframes appearText {
  0% {    /* BOTTOM OF THE PAGE*/
    opacity: 0;
    scale: 0.7; 
    filter: blur(0px);
  }
  15% {    /* LINE FULLY RENDERED*/
    opacity: 1;
    scale: 1.0;
    filter: blur(0px);
  }
  85% {  /* LINE FULLY RENDERED*/
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
