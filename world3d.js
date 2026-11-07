/* Sảnh kỷ yếu 3D: xoay 360° bằng chuột, cảm ứng hoặc bàn phím. */
(() => {
  const $ = id => document.getElementById(id);
  const stage = $('worldStage'), orbit = $('worldOrbit');
  if (!stage || !orbit) return;
  let angle = 0, dragging = false, lastX = 0, velocity = 0, raf = 0;
  const fallback = [
    {title:'Album ảnh',description:'Những khung hình thanh xuân',url:'pages/album.html',icon:'▧'},
    {title:'Thành viên',description:'Những gương mặt thân quen',url:'pages/members.html',icon:'✳'},
    {title:'Video thanh xuân',description:'Chuyển động của những ngày xưa',url:'pages/videos.html',icon:'▶'},
    {title:'Kỷ niệm',description:'Chuyện nhỏ không thể quên',url:'pages/memories.html',icon:'✧'},
    {title:'Lời nhắn',description:'Điều muốn nói với nhau',url:'pages/messages.html',icon:'♡'},
    {title:'Hành trình lớp',description:'Từ ngày đầu đến hôm nay',url:'pages/journey.html',icon:'⌁'}
  ];
  function getConfig(){ return window.getYearbookConfig ? window.getYearbookConfig() : {}; }
  function render(){
    const c=getConfig(), items=(c.worldItems && c.worldItems.length ? c.worldItems : fallback);
    $('worldTitle').innerHTML = `${escapeText(c.worldTitle || 'Bảo tàng thanh xuân')}`;
    document.documentElement.style.setProperty('--world-glow', c.worldGlow || '#d6ad79');
    orbit.innerHTML='';
    const radius=Math.min(430, Math.max(255, stage.clientWidth*.34));
    items.forEach((item,i)=>{
      const card=document.createElement('a'); card.className='world-card'; card.href=item.url || '#';
      const a=(360/items.length)*i;
      card.style.setProperty('--card-angle', `${a}deg`);
      card.style.setProperty('--card-radius', `${radius}px`);
      card.innerHTML=`<span class="world-card-icon">${escapeText(item.icon || '✳')}</span><span class="world-card-title">${escapeText(item.title)}</span><span class="world-card-desc">${escapeText(item.description || '')}</span><span class="world-card-open">KHÁM PHÁ ↗</span>`;
      card.addEventListener('click',e=>{ if(Math.abs(velocity)>2){e.preventDefault();return;} });
      orbit.appendChild(card);
    });
    update();
  }
  function escapeText(s){return String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function update(){ orbit.style.transform=`translate(-50%,-50%) rotateY(${angle}deg)`; }
  function down(e){dragging=true;lastX=e.clientX;velocity=0;stage.classList.add('is-dragging');stage.setPointerCapture?.(e.pointerId);}
  function move(e){if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;angle+=dx*.32;velocity=dx*.32;update();}
  function up(){dragging=false;stage.classList.remove('is-dragging');if(raf)cancelAnimationFrame(raf);const coast=()=>{if(dragging||Math.abs(velocity)<.08)return;angle+=velocity;velocity*=.94;update();raf=requestAnimationFrame(coast);};raf=requestAnimationFrame(coast);}
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('lostpointercapture',up);
  $('worldLeft').addEventListener('click',()=>{angle-=35;update();});$('worldRight').addEventListener('click',()=>{angle+=35;update();});$('worldReset').addEventListener('click',()=>{angle=0;velocity=0;update();});
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){angle-=12;update();}if(e.key==='ArrowRight'){angle+=12;update();}});
  window.renderWorld3D=render;
  window.addEventListener('resize',render);
  window.addEventListener('kyyeu-config-ready',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
