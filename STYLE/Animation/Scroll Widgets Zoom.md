
1. https://community.silverbullet.md/t/space-style-animation-of-lua-block-widgets-incl-tables/3498

```space-style
.sb-table-widget, 
.sb-lua-directive-block {
  animation: appearWidget linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes appearWidget {
  0% {
    opacity: 0;
    scale: 0.4;  /* starting point */
  }
  50% {
    opacity: 1;
    scale: 1; /* briefly overshoots */
  }
  100% {
    opacity: 0;
    scale: 0.4; /* settles back */
  }
}
```


