(() => {
 const params=new URLSearchParams(location.search);
 const id=document.body.dataset.page||params.get('page')||'album';
 const fallback={album:['Album ảnh','Những khung hình lưu giữ thanh xuân','Nơi cất giữ những bức ảnh đẹp nhất của lớp.'],members:['Thành viên lớp','Mỗi người là một mảnh ghép','Những gương mặt làm nên thanh xuân của chúng ta.'],videos:['Video thanh xuân','Những ngày tháng chuyển động','Các thước phim, video và khoảnh khắc đáng nhớ.'],memories:['Kỷ niệm','Chuyện nhỏ không thể quên','Những câu chuyện chỉ lớp mình mới hiểu.'],messages:['Lời nhắn','Gửi lại một điều muốn nói','Lời cảm ơn, lời chúc gửi đến bạn bè và thầy cô.'],journey:['Hành trình lớp','Từ ngày đầu đến ngày chia tay','Những cột mốc đáng nhớ trên hành trình của lớp.']};
 const defaults=fallback[id]||fallback.album, key='kyyeu-page-'+id;
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let data={title:defaults[0],subtitle:defaults[1],body:defaults[2],items:[]};
 try{data={...data,...JSON.parse(localStorage.getItem(key)||'{}')}}catch(_){}
 document.title=data.title+' · Kỷ yếu';
 $('#pageTitle').textContent=data.title;$('#pageSubtitle').textContent=data.subtitle;$('#pageBody').textContent=data.body;
 function draw(){ $('#pageItems').innerHTML=(data.items||[]).map((x,i)=>'<article class="memory-card">'+(x.image?'<img src="'+esc(x.image)+'" alt="">':'<div class="memory-placeholder">✦</div>')+'<div><h3>'+esc(x.title)+'</h3><p>'+esc(x.text)+'</p></div><button data-remove="'+i+'" aria-label="Xóa">×</button></article>').join('');$('#pageItems').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{data.items.splice(Number(b.dataset.remove),1);save()})}
 function save(){localStorage.setItem(key,JSON.stringify(data));$('#pageTitle').textContent=data.title;$('#pageSubtitle').textContent=data.subtitle;$('#pageBody').textContent=data.body;document.title=data.title+' · Kỷ yếu';draw();$('#status').textContent='Đã lưu trên trình duyệt này.'}
 $('#editOpen').onclick=()=>{$('#editor').hidden=false;$('#fTitle').value=data.title;$('#fSubtitle').value=data.subtitle;$('#fBody').value=data.body};
 $('#editClose').onclick=()=>$('#editor').hidden=true;
 $('#editSave').onclick=()=>{data.title=$('#fTitle').value.trim()||defaults[0];data.subtitle=$('#fSubtitle').value.trim();data.body=$('#fBody').value.trim();save();$('#editor').hidden=true};
 $('#addItem').onclick=()=>{$('#itemEditor').hidden=false};
 $('#itemClose').onclick=()=>$('#itemEditor').hidden=true;
 $('#itemSave').onclick=()=>{const file=$('#itemImage').files[0],title=$('#itemTitle').value.trim(),text=$('#itemText').value.trim();if(!title&&!file){$('#status').textContent='Hãy nhập tiêu đề hoặc chọn ảnh.';return}const add=image=>{data.items.push({title,text,image});save();$('#itemEditor').hidden=true;$('#itemTitle').value='';$('#itemText').value='';$('#itemImage').value=''};if(file){const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const scale=Math.min(1,1400/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=im.width*scale;cv.height=im.height*scale;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);add(cv.toDataURL('image/jpeg',.78))};im.src=rd.result};rd.readAsDataURL(file)}else add('')};
 $('#exportPage').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=id+'-content.json';a.click();URL.revokeObjectURL(u)};
 const canEdit=sessionStorage.getItem('kyyeu-admin-session')==='1';
 ['editOpen','addItem','exportPage'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=!canEdit});
 if(!canEdit){$('#status').textContent='Chế độ xem · chỉ quản trị viên mới được chỉnh sửa';}
 draw();
})();