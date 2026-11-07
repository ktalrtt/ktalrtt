/* Cosmic yearbook lobby: 360-degree orbit, zoom and GitHub Pages-safe links. */
(() => {
  const $ = id => document.getElementById(id);
  const stage = $('worldStage'), orbit = $('worldOrbit');
  if (!stage || !orbit) return;
  const fallback = [
    ['Album ảnh','Những khung hình thanh xuân','pages/album.html','▧'],
    ['Thành viên','Những gương mặt thân quen','pages/members.html','✦'],
    ['Video thanh xuân','Chuyển động của ngày xưa','pages/videos.html','▶'],
    ['Kỷ niệm','Chuyện nhỏ không thể quên','pages/memories.html','✧'],
    ['Lời nhắn','Điều muốn nói với nhau','pages/messages.html','♡'],
    ['Hành trình lớp','Từ ngày đầu đến hôm nay','pages/journey.html','⌁']
  ].map(([title,description,url,icon])=>({title,description,url,icon}));
  const scriptURL = [...document.scripts].map(s=>s.src).find(s=>/world3d\.js(?:$|\?)/.test(s));
  const siteRoot = scriptURL ? new URL('.', scriptURL) : new URL('.', location.href);
  let angle=0, zoom=1, dragging=false, lastX=0, velocity=0, raf=0, pointerId=null, cards=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cfg=()=>window.getYearbookConfig?window.getYearbookConfig():{};
  function safeHref(raw) {
    const value=String(raw||'').trim();
    if (!value || value==='#') return '#';
    if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
    // Treat local paths as relative to the deployed repository, not the domain root.
    return new URL(value.replace(/^\/+/,''), siteRoot).href;
  }
  function applyZoom(){
    orbit.style.transform=`scale(${zoom})`;
    const label=$('worldZoomValue'); if(label) label.textContent=`${Math.round(zoom*100)}%`;
    const range=$('worldZoomRange'); if(range) range.value=String(Math.round(zoom*100));
  }
  function setZoom(value){zoom=Math.max(.62,Math.min(1.65,value));applyZoom();}
  function render(){
    const c=cfg(), items=Array.isArray(c.worldItems)&&c.worldItems.length?c.worldItems:fallback;
    $('worldTitle').textContent=c.worldTitle||'Vũ trụ thanh xuân';
    document.documentElement.style.setProperty('--world-glow',c.worldGlow||'#ff69c9');
    orbit.replaceChildren();
    cards=items.map((it,i)=>{
      const a=document.createElement('a'); a.className='world-card tone-'+['pink','cyan','violet','gold','blue','coral'][i%6];
      const href=safeHref(it.url); a.href=href; a.setAttribute('aria-label','Mở '+(it.title||'nội dung'));
      if (/^https?:/.test(href) && new URL(href).origin!==location.origin) { a.target='_blank'; a.rel='noopener noreferrer'; }
      a.innerHTML=`<span class="world-card-top"><i>✦</i> MEMORY PORTAL <b>0${i+1}</b></span><span class="world-card-icon">${esc(it.icon||'✦')}</span><span class="world-card-title">${esc(it.title||'Kỷ niệm')}</span><span class="world-card-desc">${esc(it.description||'Mở ra một miền ký ức')}</span><span class="world-card-open">KHÁM PHÁ <b>↗</b></span>`;
      a.addEventListener('pointerdown',e=>e.stopPropagation());
      if(href==='#') a.addEventListener('click',e=>e.preventDefault());
      orbit.appendChild(a); return a;
    });
    update(); applyZoom();
  }
  function update(){
    const w=stage.clientWidth||innerWidth,h=stage.clientHeight||560,rx=Math.min(w*.43,690),ry=Math.min(h*.19,128),n=Math.max(cards.length,1);
    cards.forEach((card,i)=>{
      const rad=((i*360/n)+angle-90)*Math.PI/180,depth=Math.cos(rad),x=Math.sin(rad)*rx,y=Math.sin(rad*2)*ry*.30;
      const scale=.70+((depth+1)/2)*.34,opacity=.50+((depth+1)/2)*.50;
      card.style.transform=`translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),${depth*150}px) scale(${scale})`;
      card.style.opacity=opacity.toFixed(2); card.style.zIndex=String(Math.round((depth+1)*100));
      card.style.pointerEvents=depth<-.78?'none':'auto'; card.setAttribute('aria-hidden',depth<-.78?'true':'false');
    });
  }
  function down(e){
    if(e.target.closest('.world-card'))return;
    dragging=true;lastX=e.clientX;velocity=0;pointerId=e.pointerId;stage.classList.add('is-dragging');
    try{stage.setPointerCapture(e.pointerId)}catch(_){} if(raf)cancelAnimationFrame(raf);
  }
  function move(e){if(!dragging||e.pointerId!==pointerId)return;const dx=e.clientX-lastX;lastX=e.clientX;angle+=dx*.28;velocity=dx*.28;update();}
  function up(){if(!dragging)return;dragging=false;pointerId=null;stage.classList.remove('is-dragging');const coast=()=>{if(dragging||Math.abs(velocity)<.06)return;angle+=velocity;velocity*=.94;update();raf=requestAnimationFrame(coast)};raf=requestAnimationFrame(coast);}
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('lostpointercapture',up);
  stage.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.08:-.08));},{passive:false});
  $('worldZoomIn')?.addEventListener('click',()=>setZoom(zoom+.12));
  $('worldZoomOut')?.addEventListener('click',()=>setZoom(zoom-.12));
  $('worldZoomRange')?.addEventListener('input',e=>setZoom(Number(e.target.value)/100));
  $('worldLeft')?.addEventListener('click',()=>{angle-=34;velocity=0;update()});
  $('worldRight')?.addEventListener('click',()=>{angle+=34;velocity=0;update()});
  $('worldReset')?.addEventListener('click',()=>{angle=0;velocity=0;setZoom(1);update()});
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){angle-=12;update()}if(e.key==='ArrowRight'){angle+=12;update()}if(e.key==='+'||e.key==='=')setZoom(zoom+.1);if(e.key==='-')setZoom(zoom-.1);});
  window.renderWorld3D=render;window.addEventListener('resize',update);window.addEventListener('kyyeu-config-ready',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();