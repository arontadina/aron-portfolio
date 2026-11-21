(function(){
  var root=document.documentElement,btns=document.querySelectorAll('.theme button');
  function set(t){
    try{localStorage.setItem('theme',t)}catch(e){}
    if(t==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',t);
    btns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.theme===t)});
  }
  var saved='system';try{saved=localStorage.getItem('theme')||'system'}catch(e){}
  set(saved);
  btns.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.theme)})});
  
})();
// Contact form via Formspree (no server needed)
(function(){
  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
  var f=document.getElementById('cf'),fl=document.getElementById('flash');if(!f)return;
  f.addEventListener('submit',function(e){
    e.preventDefault();fl.className='flash';fl.textContent='Sending…';
    fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw 0;f.reset();fl.className='flash good';fl.textContent='Message sent. I will reply by email.'})
      .catch(function(){fl.className='flash bad';fl.textContent='Could not send. Email me directly instead.'});
  });
})();
// Work: grouped by category (4 per row), filters, zoomable lightbox
(function(){
  if(typeof WORKS==='undefined'||!document.getElementById('grid'))return;
  var wrap=document.getElementById('grid'),fb=document.getElementById('filters'),lb=document.getElementById('lb');
  var img=lb.querySelector('img'),cap=lb.querySelector('p');
  wrap.className='groups';
  var cats=[];WORKS.forEach(function(w){if(cats.indexOf(w.category)<0)cats.push(w.category)});
  var cat='All',cur=[],idx=0,zoomed=false;
  function tile(w,i){
    var f=document.createElement('figure');f.className='tile'+(w.fit?' '+w.fit:'');f.tabIndex=0;
    f.innerHTML='<div class="ph"><img loading="lazy" alt=""></div><figcaption></figcaption>';
    var im=f.querySelector('img');im.src=w.src;im.alt=w.title;
    im.onerror=function(){var m=document.createElement('span');m.className='miss';m.textContent='Missing: '+w.src;im.replaceWith(m)};
    f.querySelector('figcaption').textContent=w.title;
    f.addEventListener('click',function(){openLb(i)});
    f.addEventListener('keydown',function(e){if(e.key==='Enter')openLb(i)});
    return f;
  }
  function render(){
    wrap.innerHTML='';cur=[];
    cats.forEach(function(c){
      if(cat!=='All'&&c!==cat)return;
      var g=document.createElement('div');g.className='grp';
      var h=document.createElement('h3');h.textContent=c;
      var gr=document.createElement('div');gr.className='grid';
      WORKS.filter(function(w){return w.category===c}).forEach(function(w){gr.appendChild(tile(w,cur.push(w)-1))});
      g.appendChild(h);g.appendChild(gr);wrap.appendChild(g);
    });
  }
  if(cats.length>1)['All'].concat(cats).forEach(function(c){
    var b=document.createElement('button');b.textContent=c;b.setAttribute('aria-pressed',c==='All');
    b.addEventListener('click',function(){cat=c;fb.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});render()});
    fb.appendChild(b);
  });
  function zoom(on,e){
    zoomed=on;lb.classList.toggle('zoomed',on);
    if(on&&e)origin(e);else img.style.transformOrigin='50% 50%';
    img.style.transform=on?'scale(2.4)':'scale(1)';
  }
  function origin(e){
    var x=Math.min(1,Math.max(0,(e.clientX-img.offsetLeft)/img.offsetWidth));
    var y=Math.min(1,Math.max(0,(e.clientY-img.offsetTop)/img.offsetHeight));
    img.style.transformOrigin=(x*100)+'% '+(y*100)+'%';
  }
  function show(){var w=cur[idx];img.src=w.src;img.alt=w.title;cap.textContent=w.title+'  ('+(idx+1)+'/'+cur.length+')  ·  click image to zoom';zoom(false)}
  function openLb(i){idx=i;lb.hidden=false;show();lb.querySelector('.lb-x').focus()}
  function close(){lb.hidden=true;zoom(false)}
  function step(d){idx=(idx+d+cur.length)%cur.length;show()}
  img.addEventListener('click',function(e){e.stopPropagation();zoom(!zoomed,e)});
  lb.addEventListener('mousemove',function(e){if(zoomed)origin(e)});
  lb.querySelector('.lb-x').onclick=close;
  lb.querySelector('.lb-p').onclick=function(e){e.stopPropagation();step(-1)};
  lb.querySelector('.lb-n').onclick=function(e){e.stopPropagation();step(1)};
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  document.addEventListener('keydown',function(e){
    if(lb.hidden)return;
    if(e.key==='Escape')zoomed?zoom(false):close();
    if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1);
  });
  render();
})();
// Landing page: sample work carousel (click a side card, arrows, dots, keys or swipe)
(function(){
  var stage=document.querySelector('.cov-stage');if(!stage)return;
  var cards=[].slice.call(stage.querySelectorAll('.cov')),dots=[].slice.call(document.querySelectorAll('.dot')),n=cards.length,a=0;
  function set(i){
    a=(i+n)%n;
    cards.forEach(function(c,k){
      var p=((k-a+n+1)%n)-1;c.dataset.pos=p;
      c.setAttribute('aria-hidden',p!==0);
      c.querySelectorAll('a').forEach(function(l){l.tabIndex=p===0?0:-1});
    });
    dots.forEach(function(d,k){d.setAttribute('aria-current',k===a)});
  }
  cards.forEach(function(c,k){c.addEventListener('click',function(e){if(c.dataset.pos!=='0'){e.preventDefault();set(k)}})});
  dots.forEach(function(d,k){d.addEventListener('click',function(){set(k)})});
  document.querySelectorAll('.cov-nav').forEach(function(b){b.addEventListener('click',function(){set(a+Number(b.dataset.d))})});
  stage.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')set(a-1);if(e.key==='ArrowRight')set(a+1)});
  var x0=null;
  stage.addEventListener('pointerdown',function(e){x0=e.clientX});
  stage.addEventListener('pointerup',function(e){if(x0===null)return;var d=e.clientX-x0;x0=null;if(Math.abs(d)>50)set(a+(d<0?1:-1))});
  set(0);
})();
// Works page: show one category at a time (sidebar sub-nav / tabs use #hash)
(function(){
  var panels=[].slice.call(document.querySelectorAll('.panel'));if(!panels.length)return;
  var links=[].slice.call(document.querySelectorAll('.sub-nav a,.work-tabs a'));
  function show(){
    var id=location.hash.slice(1);
    if(!panels.some(function(p){return p.id===id}))id=panels[0].id;
    panels.forEach(function(p){p.hidden=p.id!==id});
    links.forEach(function(a){a.setAttribute('aria-current',a.getAttribute('href').split('#')[1]===id?'true':'false')});
  }
  window.addEventListener('hashchange',function(){show();window.scrollTo(0,0)});
  show();
})();
// Contact dock: live local time (Philippines)
(function(){
  var el=document.getElementById('dockClock');if(!el)return;
  function tick(){try{el.textContent=new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'Asia/Manila'})}catch(e){}}
  tick();setInterval(tick,30000);
})();
// Page background: waving layers + drifting shapes (behind everything)
(function(){
  var bg=document.querySelector('.dock-bg');if(!bg)return;
  ['wv1','wv2','wv3','wv4'].forEach(function(c){var w=document.createElement('div');w.className='wave '+c;bg.appendChild(w)});
  var chars=['+','✦','◇','△','○','×','+','✦'],r=function(a,b){return a+Math.random()*(b-a)};
  for(var i=0;i<30;i++){
    var s=document.createElement('span');s.className='px';
    var dot=Math.random()<.25;
    s.textContent=dot?'•':chars[Math.floor(Math.random()*chars.length)];
    s.style.left=r(2,97).toFixed(1)+'%';s.style.top=r(3,96).toFixed(1)+'%';
    s.style.fontSize=(dot?r(10,18):r(12,28)).toFixed(0)+'px';s.style.opacity=r(.1,.3).toFixed(2);
    s.style.setProperty('--dx',r(-50,50).toFixed(0)+'px');s.style.setProperty('--dy',r(-60,60).toFixed(0)+'px');
    s.style.setProperty('--rot',r(-180,180).toFixed(0)+'deg');
    s.style.setProperty('--dur',r(14,34).toFixed(1)+'s');s.style.setProperty('--del','-'+r(0,24).toFixed(1)+'s');
    bg.appendChild(s);
  }
})();

// Motion switch (remembered). Animations are on unless the visitor turns them off here.
(function(){
  var root=document.documentElement,b=document.getElementById('motionBtn');
  function apply(on){
    root.classList.toggle('no-motion',!on);
    if(b){b.setAttribute('aria-pressed',on?'true':'false');b.querySelector('span').textContent='Motion: '+(on?'on':'off')}
  }
  var on=true;try{on=localStorage.getItem('motion')!=='off'}catch(e){}
  apply(on);
  if(b)b.addEventListener('click',function(){on=!on;try{localStorage.setItem('motion',on?'on':'off')}catch(e){}apply(on)});
})();
// Opening animation (once per browser session; skipped when Motion is off)
(function(){
  var el=document.getElementById('intro');if(!el)return;
  if(document.documentElement.classList.contains('no-intro')){el.parentNode.removeChild(el);return}
  try{sessionStorage.setItem('introSeen','1')}catch(e){}
  var svg=document.getElementById('introSvg');
  if(window.innerWidth<700)svg.setAttribute('viewBox','270 -80 780 460');
  // wave: rounded up/down strokes that grow taller and run off the right edge
  var r=20,x=895,cy=150,k=0,d='M'+x+' 70 a'+r+' '+r+' 0 0 1 '+(2*r)+' 0';x+=2*r;
  while(x<2200){var A=Math.min(215,80+k*20);d+=' V'+(cy+A)+' a'+r+' '+r+' 0 0 0 '+(2*r)+' 0 V'+(cy-A)+' a'+r+' '+r+' 0 0 1 '+(2*r)+' 0';x+=4*r;k++}
  document.getElementById('introWave').setAttribute('d',d);
  var t1,t2;
  function finish(){clearTimeout(t1);clearTimeout(t2);el.classList.add('reveal','done')}
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    el.classList.add('go');
    t1=setTimeout(function(){el.classList.add('reveal')},3720);
    t2=setTimeout(finish,5000);
  })});
  ['click','keydown','touchstart'].forEach(function(ev){el.addEventListener(ev,finish,{once:true})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')finish()},{once:true});
})();
