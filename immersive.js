import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root = document.querySelector('#memoryUniverse');
if (root) {
  const canvas = root.querySelector('canvas');
  const status = root.querySelector('.universe-status');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#171521');
  scene.fog = new THREE.Fog('#171521', 12, 34);
  const camera = new THREE.PerspectiveCamera(52, 1, .1, 100);
  camera.position.set(0, 2.1, 10);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  scene.add(new THREE.HemisphereLight(0xc9d5ff, 0x36243c, 2));
  const key = new THREE.PointLight(0xffc6a8, 42, 22); key.position.set(0, 5, 3); scene.add(key);
  const rim = new THREE.PointLight(0x9c8cff, 28, 20); rim.position.set(-7, 2, -3); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80,80), new THREE.MeshStandardMaterial({color:'#292333', roughness:.8, metalness:.15}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-2.25; scene.add(floor);
  const grid = new THREE.GridHelper(50,50,0x79648d,0x40364e); grid.position.y=-2.23; grid.material.transparent=true; grid.material.opacity=.18; scene.add(grid);
  const room = new THREE.Group(); scene.add(room);
  const mats = [0xffd9c2,0xc7b9ff,0xf3d6a7];
  for(let i=0;i<3;i++){
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.25,4.25,.18), new THREE.MeshStandardMaterial({color:0x9d7a68,metalness:.55,roughness:.32}));
    frame.position.set((i-1)*5.2,0,-3.2); room.add(frame);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(3.02,4.02), new THREE.MeshStandardMaterial({color:mats[i],roughness:.7,emissive:mats[i],emissiveIntensity:.08}));
    inner.position.set((i-1)*5.2,0,-3.08); room.add(inner);
    const canvasTex = document.createElement('canvas'); canvasTex.width=512; canvasTex.height=700;
    const ctx=canvasTex.getContext('2d'); const grad=ctx.createLinearGradient(0,0,512,700); grad.addColorStop(0,['#4b3b55','#35465a','#654b48'][i]); grad.addColorStop(1,['#d5a995','#9c9ac5','#d7b98e'][i]); ctx.fillStyle=grad;ctx.fillRect(0,0,512,700);
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 34px Georgia';ctx.fillText(['THANH XUÂN','CHÚNG TA','KỶ NIỆM'][i],256,330);ctx.font='22px Arial';ctx.fillText(['Một thời để nhớ','Những người bạn','Mãi không quên'][i],256,380);
    const texture=new THREE.CanvasTexture(canvasTex); texture.colorSpace=THREE.SRGBColorSpace;
    const poster=new THREE.Mesh(new THREE.PlaneGeometry(2.88,3.88),new THREE.MeshBasicMaterial({map:texture}));poster.position.set((i-1)*5.2,0,-2.96);room.add(poster);
  }
  // Floating keepsake spheres and warm lights create a dreamy exhibition hall.
  for(let i=0;i<34;i++){
    const bead=new THREE.Mesh(new THREE.SphereGeometry(.025+Math.random()*.045,12,12),new THREE.MeshBasicMaterial({color:i%3===0?0xffd6bd:0xbdb0ff,transparent:true,opacity:.72}));
    bead.position.set((Math.random()-.5)*22,Math.random()*8-2,(Math.random()-.5)*17-2); scene.add(bead);
  }
  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  let targetYaw=0,yaw=0,targetPitch=0,pitch=0,down=false,lastX=0,lastY=0;
  const hitTargets=[];
  room.children.forEach((obj,i)=>{if(obj.geometry?.type==='BoxGeometry')hitTargets.push(obj);});
  function resize(){const r=root.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(r.height,1);camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(root); resize();
  canvas.addEventListener('pointerdown',e=>{down=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!down)return;targetYaw+=(e.clientX-lastX)*.006;targetPitch+=(e.clientY-lastY)*.003;targetPitch=THREE.MathUtils.clamp(targetPitch,-.35,.35);lastX=e.clientX;lastY=e.clientY;});
  canvas.addEventListener('pointerup',e=>{down=false;const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);if(raycaster.intersectObjects(hitTargets).length)document.querySelector('#gallerySection')?.scrollIntoView({behavior:'smooth'});});
  canvas.addEventListener('wheel',e=>{camera.position.z=THREE.MathUtils.clamp(camera.position.z+e.deltaY*.008,6,15);},{passive:true});
  root.querySelector('[data-action="gallery"]')?.addEventListener('click',()=>document.querySelector('#gallerySection')?.scrollIntoView({behavior:'smooth'}));
  root.querySelector('[data-action="explore"]')?.addEventListener('click',()=>{targetYaw+=Math.PI*.45;});
  let handCamera=null, handActive=false, lastHandX=null;
  const handBtn=root.querySelector('#handMode');
  handBtn?.addEventListener('click',async()=>{
    if(handActive){handCamera?.stop();handActive=false;handBtn.textContent='✋ Điều khiển bằng tay';status.textContent='Đã tắt điều khiển bằng tay.';return;}
    try{
      status.textContent='Đang xin quyền camera…';
      await new Promise((resolve,reject)=>{
        const add=(src)=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.append(s);});
        (async()=>{await add('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');await add('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');resolve();})().catch(reject);
      });
      const video=document.createElement('video');video.playsInline=true;video.muted=true;video.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';root.append(video);
      const hands=new window.Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
      hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.65,minTrackingConfidence:.6});
      hands.onResults(results=>{
        const lm=results.multiHandLandmarks?.[0]; if(!lm)return;
        const x=lm[8].x, y=lm[8].y;
        if(lastHandX!==null){targetYaw+=(lastHandX-x)*3.8;targetPitch=THREE.MathUtils.clamp((y-.5)*.8,-.35,.35);} lastHandX=x;
        const pinch=Math.hypot(lm[4].x-lm[8].x,lm[4].y-lm[8].y)<.055;
        if(pinch){document.querySelector('#gallerySection')?.scrollIntoView({behavior:'smooth'});lastHandX=null;}
      });
      handCamera=new window.Camera(video,{onFrame:async()=>hands.send({image:video}),width:640,height:480});
      await handCamera.start();handActive=true;handBtn.textContent='Tắt điều khiển tay';status.textContent='Đưa tay vào khung hình: di chuyển ngón trỏ để xoay, chụm ngón cái và trỏ để mở kỷ yếu.';
    }catch(err){status.textContent='Không mở được camera. Hãy cấp quyền camera và dùng HTTPS (GitHub Pages hỗ trợ).';console.error(err);}
  });
  function animate(){requestAnimationFrame(animate);yaw+=(targetYaw-yaw)*.055;pitch+=(targetPitch-pitch)*.055;camera.position.x=Math.sin(yaw)*.6;camera.position.y=2.1+pitch*3;camera.lookAt(0,0,-2);room.rotation.y=Math.sin(performance.now()*.00022)*.025;renderer.render(scene,camera);}
  animate();
}
