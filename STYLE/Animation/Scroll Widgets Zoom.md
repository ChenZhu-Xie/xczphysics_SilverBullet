
```space-style
@keyframes appear {
  0% {
    opacity: 0;
    scale: 0.4;  /* starting point */
  }
  80% {
    opacity: 1;
    scale: 1.05; /* briefly overshoots */
  }
  100% {
    opacity: 1;
    scale: 1; /* settles back */
  }
}
.sb-table-widget, 
.sb-lua-directive-block {
  animation: appear linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
  
}
```
