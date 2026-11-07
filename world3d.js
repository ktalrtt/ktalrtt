/* Sảnh triển lãm kỷ yếu 360°: không gian ấm áp, nhẹ và tối ưu cho thiết bị phổ thông. */
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
 let yaw=0,pitch=0,zoom=1,drag=false,lastX=0,lastY=0,pid=null,raf=0,moveRaf=0,pendingX=0,pendingY=0,vx=0,vy=0;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cfg=()=>window.getYearbookConfig?window.getYearbookConfig():{};
 const base=()=>new URL('.',document.querySelector('script[src$="world3d.js"]')?.src||location.href);
 function href(v){if(!v||v==='#')return '#';if(/^(https?:|mailto:|tel:)/i.test(v))return v;return new URL(String(v).replace(/^\/+/,''),base()).href;}
 function render(){
  const c=cfg(),items=Array.isArray(c.worldItems)&&c.worldItems.length?c.worldItems:fallback;
  $('worldTitle').textContent=c.worldTitle||'Bảo tàng thanh xuân';
  document.documentElement.style.setProperty('--world-glow',c.worldGlow||'#df70ff');
  stage.querySelectorAll('.immersive-room,.room-vignette').forEach(n=>n.remove());
  const room=document.createElement('div');room.className='immersive-room';room.id='immersiveRoom';
  const back=document.createElement('div');back.className='room-backdrop';back.innerHTML='<div class="room-nebula"></div><div class="room-logo"><span>✦</span><b></b><small></small></div>';back.querySelector('b').textContent=(c.worldCenterTitle||'THANH XUÂN | CỦA CHÚNG MÌNH').replace(/\s*\|\s*/g,'\n');back.querySelector('small').textContent=c.worldCenterSubtitle||'NHỮNG NGÀY KHÔNG QUÊN';room.append(back);
  const floor=document.createElement('div');floor.className='room-floor';room.append(floor);
  const ceiling=document.createElement('div');ceiling.className='room-ceiling';room.append(ceiling);
  items.forEach((it,i)=>{
   const a=document.createElement('a');a.className='room-portal portal-'+(i%6);a.href=href(it.url);a.style.transform='rotateY('+((i*360/items.length))+'deg) translateZ(650px) rotateY(180deg)';
   const img=it.image||it.photo||'';
   a.innerHTML='<div class="portal-inner">'+(img?'<img class="portal-image" src="'+esc(img)+'" alt="">':'<div class="portal-art"><span>'+esc(it.icon||'✦')+'</span><i>✧</i></div>')+'<div class="portal-info"><small>MEMORY SPACE · 0'+(i+1)+'</small><strong>'+esc(it.title||'Kỷ niệm')+'</strong><span>'+esc(it.description||'Mở ra một miền ký ức')+'</span><em>CHẠM ĐỂ KHÁM PHÁ ↗</em></div></div>';
   const portalImage=a.querySelector('.portal-image');if(portalImage){portalImage.loading='lazy';portalImage.decoding='async';}
   if(a.href==='#')a.addEventListener('click',e=>e.preventDefault());
   room.append(a);
  });
  stage.append(room);
  const v=document.createElement('div');v.className='room-vignette';stage.append(v);
  update();
 }
 function update(){
  const r=$('immersiveRoom');if(!r)return;
  r.style.transform='translate3d(0,0,-80px) rotateX('+pitch+'deg) rotateY('+yaw+'deg) scale('+zoom+')';
  const z=$('worldZoomValue');if(z)z.textContent=Math.round(zoom*100)+'%';
  const range=$('worldZoomRange');if(range)range.value=String(Math.round(zoom*100));
 }
 function down(e){if(e.target.closest('.room-portal'))return;drag=true;pid=e.pointerId;lastX=e.clientX;lastY=e.clientY;vx=vy=0;stage.classList.add('is-dragging');try{stage.setPointerCapture(pid)}catch(_){}if(raf)cancelAnimationFrame(raf);}
 function move(e){if(!drag||e.pointerId!==pid)return;pendingX=e.clientX;pendingY=e.clientY;if(moveRaf)return;moveRaf=requestAnimationFrame(()=>{moveRaf=0;const dx=pendingX-lastX,dy=pendingY-lastY;lastX=pendingX;lastY=pendingY;yaw+=dx*.18;pitch=Math.max(-55,Math.min(55,pitch-dy*.15));vx=dx*.18;vy=-dy*.15;update();});}
 function up(){if(!drag)return;drag=false;pid=null;stage.classList.remove('is-dragging');const coast=()=>{if(drag||Math.abs(vx)+Math.abs(vy)<.07)return;yaw+=vx;pitch=Math.max(-55,Math.min(55,pitch+vy));vx*=.91;vy*=.91;update();raf=requestAnimationFrame(coast)};raf=requestAnimationFrame(coast);}
 stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('lostpointercapture',up);
 stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.78,Math.min(1.35,zoom+(e.deltaY<0?.05:-.05)));update()},{passive:false});
 $('worldZoomIn')?.addEventListener('click',()=>{zoom=Math.min(1.35,zoom+.08);update()});
 $('worldZoomOut')?.addEventListener('click',()=>{zoom=Math.max(.78,zoom-.08);update()});
 $('worldZoomRange')?.addEventListener('input',e=>{zoom=Math.max(.78,Math.min(1.35,Number(e.target.value)/100));update()});
 $('worldLeft')?.addEventListener('click',()=>{yaw-=30;update()});$('worldRight')?.addEventListener('click',()=>{yaw+=30;update()});
 $('worldReset')?.addEventListener('click',()=>{yaw=0;pitch=0;zoom=1;update()});
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')yaw-=10;if(e.key==='ArrowRight')yaw+=10;if(e.key==='ArrowUp')pitch=Math.min(55,pitch+8);if(e.key==='ArrowDown')pitch=Math.max(-55,pitch-8);if(e.key==='+'||e.key==='=')zoom=Math.min(1.45,zoom+.1);if(e.key==='-')zoom=Math.max(.72,zoom-.1);update()});
 window.renderWorld3D=render;window.addEventListener('resize',update);window.addEventListener('kyyeu-config-ready',render);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();