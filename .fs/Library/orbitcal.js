export function Calendar() {
  if (document.querySelector("#myWindow")) return;

  const w = document.createElement("div");
  w.id = "myWindow";
  w.innerHTML = `
    <div id="myWindowHeader">
      <button id="prevBtn" class="navBtn">◀</button>
      <span id="monthYear"></span>
      <button id="nextBtn" class="navBtn">▶</button>
      <button id="closeBtn">✕</button>
    </div>
    <div class="content">
      <div class="calendar-grid" id="calendarGrid"></div>
    </div>
    <div id="resizeGrip"><div id="resizeHandle"></div></div>
  `;
  document.body.appendChild(w);

  // Load stored position
  const pos = JSON.parse(localStorage.getItem("calendarPos") || "{}");
  w.style.left = pos.left !== undefined ? pos.left + "px" : "30px";
  w.style.top = pos.top !== undefined ? pos.top + "px" : "100px";

  // Styles
  const s = document.createElement("style");
  s.textContent = `
    #myWindow {
      position: fixed;
      width: 250px;
      height: 260px;
      background: rgba(30,30,30,.9);
      color: #fff;
      border-radius: 12px;
      box-shadow: 0 0 4px rgba(255,255,255,.6),0 0 25px rgba(0,0,0,.8);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: .2s;
      font-family: system-ui,sans-serif;
    }
    #myWindowHeader {
      padding: 8px 0;
      background: rgba(255,255,255,.1);
      cursor: move;
      user-select: none;
      text-align: center;
      font-weight: bold;
      border-bottom: 1px solid rgba(255,255,255,.1);
      flex-shrink: 0;
      font-size: 1.1em;
      position: relative;
    }
    .navBtn,#closeBtn {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 0.8em;
      cursor: pointer;
      font-weight: bold;
    }
    .navBtn:hover,#closeBtn:hover { color: #ff5555; }
    #prevBtn { position: absolute; left: 20px; top: 8px; }
    #nextBtn { position: absolute; right: 20px; top: 8px; }
    #closeBtn { position: absolute; right: -13px; top: 4px; line-height: 1; }
    .content {
      padding: 5px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7,1fr);
      gap: 6px;
      text-align: center;
      font-size: .9em;
      flex: 1;
    }
    .calendar-grid div {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background: rgba(255,255,255,.05);
    }
    .calendar-grid .day-name {
      font-weight: bold;
      background: none;
    }
    .calendar-grid .today {
  background: #ff5555;
  color: #fff;
  box-shadow: 0 0 10px #ff5555;
  font-weight: bold;
  text-shadow: 0 1px 1px #000;
}

    #resizeGrip {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 15px;
      height: 15px;
      cursor: se-resize;
    }
    #resizeHandle {
      width: 8px;
      height: 8px;
      background: rgba(255,255,255,.7);
      border-radius: 50%;
      box-shadow: 0 0 2px rgba(0,0,0,.5);
      position: absolute;
      right: 6px;
      bottom: 6px;
    }
    #resizeHandle:hover { background: rgba(255,0,0,1); }
  `;
  document.head.appendChild(s);

  // Calendar data
  let y = (new Date()).getFullYear(), m = (new Date()).getMonth();
 const render = () => {
  const M = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const D = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = new Date();
  const t = today.getDate(), todayM = today.getMonth(), todayY = today.getFullYear();

  document.getElementById("monthYear").textContent = `${M[m]} ${y}`;
  const g = document.getElementById("calendarGrid");
  g.innerHTML = "";

  // Day names
  D.forEach(d => g.appendChild(Object.assign(document.createElement("div"), { textContent: d, className: "day-name" })));

  // First day of the month (0=Sun..6=Sat) → shift so Monday=0
  let firstDay = new Date(y, m, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay-1;

  const daysInMonth = new Date(y, m+1, 0).getDate();

  // Empty slots before first day
  for(let i=0;i<firstDay;i++) g.appendChild(document.createElement("div"));

  // Days
  for(let i=1;i<=daysInMonth;i++){
    const e = document.createElement("div");
    e.textContent = i;

    // Determine weekday (0=Mon..6=Sun)
    const weekdayIndex = (firstDay + i - 1) % 7;
    if(weekdayIndex === 6) e.style.background = "rgba(255,0,0,0.2)"; // Sunday red
    if(i===t && m===todayM && y===todayY) e.classList.add("today");

    g.appendChild(e);
  }
  const monthYearSpan = document.getElementById("monthYear");
monthYearSpan.addEventListener("click", () => {
  y = (new Date()).getFullYear();
  m = (new Date()).getMonth();
  render();
});

};

  render();
  document.getElementById("prevBtn").onclick = ()=>{ m--; if(m<0){m=11;y--;} render(); };
  document.getElementById("nextBtn").onclick = ()=>{ m++; if(m>11){m=0;y++;} render(); };

  // Drag
  const M_bounds = {l:10,t:60,r:30,b:10}, snap=100;
  const drag = ()=>{
    const h = w.querySelector("#myWindowHeader");
    let ox=0, oy=0, dr=false;
    const lim=()=>{const r=w.getBoundingClientRect(),W=innerWidth,H=innerHeight;
      w.style.left=Math.max(M_bounds.l,Math.min(r.left,W-r.width-M_bounds.r))+"px";
      w.style.top=Math.max(M_bounds.t,Math.min(r.top,H-r.height-M_bounds.b))+"px"};
    const st=p=>{dr=true;const r=w.getBoundingClientRect(),c=p.touches?p.touches[0]:p;ox=c.clientX-r.left;oy=c.clientY-r.top;w.style.transition="none"};
    const mv=p=>{if(!dr)return;p.preventDefault();const c=p.touches?p.touches[0]:p;w.style.left=c.clientX-ox+"px";w.style.top=c.clientY-oy+"px"};
    const sp=()=>{if(!dr)return; dr=false; w.style.transition=".2s"; lim();
      const r = w.getBoundingClientRect();
      localStorage.setItem("calendarPos", JSON.stringify({left:r.left, top:r.top}));
    };
    h.onmousedown=st; h.ontouchstart=st;
    addEventListener("mousemove", mv); addEventListener("touchmove", mv);
    addEventListener("mouseup", sp); addEventListener("touchend", sp); addEventListener("resize", lim);

  };

  // Resize
  const resize = ()=>{
    const g = w.querySelector("#resizeGrip"); let rsz=false,sx,sy,sw,sh;
    g.onmousedown = e => { rsz=true; sx=e.clientX; sy=e.clientY; const r=w.getBoundingClientRect(); sw=r.width; sh=r.height; e.preventDefault(); };
    onmousemove = e => { if(!rsz) return; w.style.width=Math.max(250,sw+e.clientX-sx)+"px"; w.style.height=Math.max(260,sh+e.clientY-sy)+"px"; };
    onmouseup = ()=> rsz=false;
  };

  drag(); resize();
  document.getElementById("closeBtn").onclick = ()=> w.remove();
}

export function ToggleCalendar(){
  const w = document.querySelector("#myWindow");
  w ? w.remove() : Calendar();
}