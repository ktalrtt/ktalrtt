/* Sảnh vũ trụ 360° — dựng ổn định một lần, hạn chế nhấp nháy khi cập nhật cấu hình. */
(() => {
 const $=id=>document.getElementById(id), stage=$('worldStage');
 if(!stage)return;
 const fallback=[
  {title:'Album ảnh',description:'Những khung hình thanh xuân',url:'pages/album.html',icon:'▧'},
  {title:'Thành viên',description:'Những gương mặt thân quen',url:'pages/members.html',icon:'✦'},
  {title:'Video thanh xuân',description:'Chuyển động của ngày xưa',url:'pages/videos.html',icon:'▶'},
  {title:'Kỷ niệm',description:'Chuyện nhỏ không thể quên',url:'pages/memories.html',icon:'✧'},
  {title:'Lời nhắn',description:'Điều muốn nói với nhau',url:'pages/messages.html',icon:'♡'},
  {title:'Hành trình lớp',description:'Từ ngày đầu đến hôm nay',url:'pages/journey.html',icon:'⌁'}
 ];
 let yaw=0,pitch=0,zoom=1,drag=false,lastX=0,lastY=0,pid=null,raf=0,moveRaf=0,pendingX=0,pendingY=0,vx=0,vy=0,hasRendered=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cfg=()=>window.getYearbookConfig?window.getYearbookConfig():{};
 const base=()=>new URL('.',document.querySelector('script[src$="world3d.js"]')?.src||location.href);
 function href(v){if(!v||v==='#')return '#';if(/^(https?:|mailto:|tel:)/i.test(v))return v;return new URL(String(v).replace(/^\/+/,''),base()).href;}
 function render(){
  const c=cfg(),items=Array.isArray(c.worldItems)&&c.worldItems.length?c.worldItems:fallback;
  $('worldTitle').textContent=c.worldTitle||'Vũ trụ thanh xuân';
  document.documentElement.style.setProperty('--world-glow',c.worldGlow||'#df70ff');
   if(hasRendered){
    const old=stage.querySelector('.immersive-room');
    if(old) old.remove();
    stage.querySelector('.room-vignette')?.remove();
   }
  const room=document.createElement('div');room.className='immersive-room';room.id='immersiveRoom';
  const back=document.createElement('div');back.className='room-backdrop';back.innerHTML='<div class="room-nebula"></div><div class="room-logo"><span>✦</span><b></b><small></small></div>';back.querySelector('b').textContent=(c.worldCenterTitle||'THANH XUÂN | GIỮA NGÂN HÀ').replace(/\s*\|\s*/g,'\n');back.querySelector('small').textContent=c.worldCenterSubtitle||'MỖI KỶ NIỆM LÀ MỘT VÌ SAO';room.append(back);
  const galaxy=document.createElement('div');
  galaxy.className='room-galaxy';
  galaxy.setAttribute('aria-hidden','true');
  galaxy.innerHTML='<div class="galaxy-halo"></div><div class="galaxy-spiral"></div><div class="galaxy-core"></div><div class="galaxy-heart">♥</div><div class="galaxy-spark"></div><div class="galaxy-caption">NGÂN HÀ KỶ NIỆM</div>';
  room.append(galaxy);
  const floor=document.createElement('div');floor.className='room-floor';room.append(floor);
  const ceiling=document.createElement('div');ceiling.className='room-ceiling';room.append(ceiling);
  const constellation=[[19,28],[50,15],[81,28],[81,72],[50,85],[19,72]];
  items.forEach((it,i)=>{
   const a=document.createElement('a');a.className='room-portal portal-'+(i%6);a.href=href(it.url);
   const pos=constellation[i%constellation.length];a.style.left=pos[0]+'%';a.style.top=pos[1]+'%';a.style.transform='translate(-50%,-50%) translateZ(115px)';
   const img=it.image||it.photo||'';
   a.innerHTML='<div class="portal-inner">'+(img?'<img class="portal-image" src="'+esc(img)+'" alt="">':'<div class="portal-art"><span>'+esc(it.icon||'✦')+'</span><i>✧</i></div>')+'<div class="portal-info"><small>COSMIC MEMORY · 0'+(i+1)+'</small><strong>'+esc(it.title||'Kỷ niệm')+'</strong><span>'+esc(it.description||'Mở ra một vùng ký ức')+'</span><em>CHẠM ĐỂ KHÁM PHÁ ↗</em></div></div>';
   const portalImage=a.querySelector('.portal-image');if(portalImage){portalImage.loading='eager';portalImage.decoding='async';}
   a.addEventListener('click',e=>{if(a.getAttribute('href')==='#'){e.preventDefault();return;}e.stopPropagation();});
   room.append(a);
  });
  stage.append(room);
  const v=document.createElement('div');v.className='room-vignette';stage.append(v);
  hasRendered=true;
  update();
 }
 function update(){
  const r=$('immersiveRoom');if(!r)return;
  const nextTransform='translate3d(0,0,-80px) rotateX('+pitch+'deg) rotateY('+yaw+'deg) scale('+zoom+')';
  if(r.style.transform!==nextTransform) r.style.transform=nextTransform;
  const z=$('worldZoomValue');if(z)z.textContent=Math.round(zoom*100)+'%';
  const range=$('worldZoomRange');if(range)range.value=String(Math.round(zoom*100));
 }
 function down(e){if(e.target.closest('.room-portal, .world-controls, .world-bottom, button, input, a'))return;if(e.button!==0)return;drag=true;pid=e.pointerId;lastX=e.clientX;lastY=e.clientY;vx=vy=0;stage.classList.add('is-dragging');try{stage.setPointerCapture(pid)}catch(_){}if(raf)cancelAnimationFrame(raf);if(moveRaf){cancelAnimationFrame(moveRaf);moveRaf=0;}}
 function move(e){if(!drag||e.pointerId!==pid)return;e.preventDefault();pendingX=e.clientX;pendingY=e.clientY;if(moveRaf)return;moveRaf=requestAnimationFrame(()=>{moveRaf=0;const dx=pendingX-lastX,dy=pendingY-lastY;lastX=pendingX;lastY=pendingY;yaw+=dx*.18;pitch=Math.max(-55,Math.min(55,pitch-dy*.15));vx=dx*.18;vy=-dy*.15;update();});}
 function up(){
  if(!drag)return;
  drag=false;pid=null;vx=vy=0;
  stage.classList.remove('is-dragging');
  if(moveRaf){cancelAnimationFrame(moveRaf);moveRaf=0;}
 }
 if('ResizeObserver' in window){const stageObserver=new ResizeObserver(()=>{if(stage.clientWidth&&stage.clientHeight)update();});stageObserver.observe(stage);}
 stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('lostpointercapture',up);
 stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.78,Math.min(1.35,zoom+(e.deltaY<0?.05:-.05)));update()},{passive:false});
 $('worldZoomIn')?.addEventListener('click',()=>{zoom=Math.min(1.35,zoom+.08);update()});
 $('worldZoomOut')?.addEventListener('click',()=>{zoom=Math.max(.78,zoom-.08);update()});
 $('worldZoomRange')?.addEventListener('input',e=>{zoom=Math.max(.78,Math.min(1.35,Number(e.target.value)/100));update()});
 $('worldLeft')?.addEventListener('click',()=>{yaw-=30;update()});$('worldRight')?.addEventListener('click',()=>{yaw+=30;update()});
 $('worldReset')?.addEventListener('click',()=>{if(raf)cancelAnimationFrame(raf);if(moveRaf)cancelAnimationFrame(moveRaf);moveRaf=0;vx=vy=0;yaw=0;pitch=0;zoom=1;update();});
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')yaw-=10;if(e.key==='ArrowRight')yaw+=10;if(e.key==='ArrowUp')pitch=Math.min(55,pitch+8);if(e.key==='ArrowDown')pitch=Math.max(-55,pitch-8);if(e.key==='+'||e.key==='=')zoom=Math.min(1.45,zoom+.1);if(e.key==='-')zoom=Math.max(.72,zoom-.1);update()});
 window.renderWorld3D=render;window.addEventListener('resize',update);window.addEventListener('kyyeu-config-ready',render);
})();