(() => {
  const params = new URLSearchParams(location.search);
  const id = document.body.dataset.page || params.get("page") || "album";
  const fallback = {
    album:["Album ảnh","Những khung hình lưu giữ thanh xuân","Nơi cất giữ những bức ảnh đẹp nhất của lớp."],
    members:["Thành viên lớp","Mỗi người là một mảnh ghép","Những gương mặt làm nên thanh xuân của chúng ta."],
    videos:["Video thanh xuân","Những ngày tháng chuyển động","Các thước phim, video và khoảnh khắc đáng nhớ."],
    memories:["Kỷ niệm","Chuyện nhỏ không thể quên","Những câu chuyện chỉ lớp mình mới hiểu."],
    messages:["Lời nhắn","Gửi lại một điều muốn nói","Lời cảm ơn, lời chúc gửi đến bạn bè và thầy cô."],
    journey:["Hành trình lớp","Từ ngày đầu đến ngày chia tay","Những cột mốc đáng nhớ trên hành trình của lớp."]
  };
  const defaults = fallback[id] || fallback.album, key = "kyyeu-page-" + id;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let data = {title:defaults[0],subtitle:defaults[1],body:defaults[2],items:[]};
  let editingIndex = -1;
  const videoUrls = new Set();
  const CONFIG_DB = "kyyeu_invitation_db";
  const CONFIG_STORE = "settings";
  const CONFIG_KEY = "site-config";
  function openSharedConfigDB() {
    return new Promise((resolve,reject) => {
      const request = indexedDB.open(CONFIG_DB,1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(CONFIG_STORE)) request.result.createObjectStore(CONFIG_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Không mở được cấu hình tổng."));
    });
  }
  async function readSharedConfig() {
    const db = await openSharedConfigDB();
    try {
      return await new Promise((resolve,reject) => {
        const req = db.transaction(CONFIG_STORE,"readonly").objectStore(CONFIG_STORE).get(CONFIG_KEY);
        req.onsuccess = () => resolve(req.result || {});
        req.onerror = () => reject(req.error);
      });
    } finally { db.close(); }
  }
  async function writeSharedPage() {
    const db = await openSharedConfigDB();
    try {
      const config = await new Promise((resolve,reject) => {
        const req = db.transaction(CONFIG_STORE,"readonly").objectStore(CONFIG_STORE).get(CONFIG_KEY);
        req.onsuccess = () => resolve(req.result || {});
        req.onerror = () => reject(req.error);
      });
      config.worldPages = config.worldPages || {};
      config.worldPages[id] = { ...(config.worldPages[id] || {}), title:data.title, subtitle:data.subtitle, body:data.body, items:data.items || [] };
      await new Promise((resolve,reject) => {
        const tx = db.transaction(CONFIG_STORE,"readwrite");
        tx.objectStore(CONFIG_STORE).put(config,CONFIG_KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("Không lưu được cấu hình tổng."));
        tx.onabort = () => reject(tx.error || new Error("Lưu cấu hình bị hủy."));
      });
    } finally { db.close(); }
  }
  const videoDbPromise = new Promise((resolve,reject) => {
    if (!("indexedDB" in window)) return reject(new Error("Trình duyệt không hỗ trợ lưu video."));
    const request = indexedDB.open("kyyeu-media",1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("videos")) db.createObjectStore("videos");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Không mở được kho lưu video."));
  });
  async function putVideo(videoId, blob) {
    const db = await videoDbPromise;
    return new Promise((resolve,reject) => {
      const tx = db.transaction("videos","readwrite");
      tx.objectStore("videos").put(blob,videoId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Không lưu được video."));
      tx.onabort = () => reject(tx.error || new Error("Đã hủy lưu video."));
    });
  }
  async function getVideo(videoId) {
    const db = await videoDbPromise;
    return new Promise((resolve,reject) => {
      const request = db.transaction("videos","readonly").objectStore("videos").get(videoId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  async function deleteVideo(videoId) {
    if (!videoId) return;
    const db = await videoDbPromise;
    return new Promise((resolve,reject) => {
      const tx = db.transaction("videos","readwrite");
      tx.objectStore("videos").delete(videoId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  async function loadPageData() {
    try {
      const config = await readSharedConfig();
      const sharedPage = config.worldPages && config.worldPages[id];
      if (sharedPage && Array.isArray(sharedPage.items)) data = { ...data, ...sharedPage };
      else {
        try {
          const legacy = JSON.parse(localStorage.getItem(key) || "{}");
          data = { ...data, ...legacy };
          if (Object.keys(legacy).length) await writeSharedPage();
        } catch (_) {}
      }
    } catch (error) {
      try { data = { ...data, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch (_) {}
      console.warn("Không đọc được cấu hình tổng:",error);
    }
  }
  function drawHeader() {
    document.title = data.title + " · Kỷ yếu";
    $("#pageTitle").textContent = data.title;
    $("#pageSubtitle").textContent = data.subtitle;
    $("#pageBody").textContent = data.body;
  }
  function draw() {
    $("#pageItems").innerHTML = (data.items || []).map((item,index) =>
      '<article class="memory-card">' +
        (item.videoId || item.videoUrl ? '<video controls playsinline preload="metadata" data-video-id="' + esc(item.videoId || "") + '" data-video-url="' + esc(item.videoUrl || "") + '" aria-label="' + esc(item.title || "Video") + '"></video>' : item.image ? '<img src="' + esc(item.image) + '" alt="">' : '<div class="memory-placeholder">✦</div>') +
        '<div class="memory-card-copy"><h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p></div>' +
        (canEdit ? '<div class="memory-actions"><button type="button" data-edit="' + index + '">Sửa</button><button type="button" data-remove="' + index + '" aria-label="Xóa">Xóa</button></div>' : '') +
      '</article>'
    ).join("");
    videoUrls.forEach(url => URL.revokeObjectURL(url));
    videoUrls.clear();
    $("#pageItems").querySelectorAll("video[data-video-id]").forEach(async video => {
      try {
        const blob = video.dataset.videoId ? await getVideo(video.dataset.videoId) : null;
        if (blob && video.isConnected) {
          const url = URL.createObjectURL(blob);
          videoUrls.add(url);
          video.src = url;
        } else if (video.dataset.videoUrl) {
          video.src = new URL("../" + video.dataset.videoUrl, location.href).href;
        }
      } catch (_) {
        video.insertAdjacentHTML("afterend", '<p class="media-error">Không tải được video đã lưu trên trình duyệt này.</p>');
      }
    });
    $("#pageItems").querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => openItemEditor(Number(button.dataset.edit))));
    $("#pageItems").querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      const index = Number(button.dataset.remove);
      if (!Number.isInteger(index) || !data.items[index]) return;
      const removed = data.items.splice(index,1)[0];
      save();
      if (removed && removed.videoId) deleteVideo(removed.videoId).catch(() => {});
    }));
  }
  async function save() {
    try {
      await writeSharedPage();
      drawHeader();draw();
      $("#status").textContent = "Đã lưu vào cấu hình tổng trên thiết bị này.";
      return true;
    } catch (error) {
      $("#status").textContent = error && error.name === "QuotaExceededError"
        ? "Bộ nhớ trình duyệt đã đầy. Hãy giảm dung lượng ảnh hoặc xóa bớt nội dung."
        : "Không thể lưu vào cấu hình tổng: " + (error.message || "Vui lòng thử lại.");
      return false;
    }
  }
  function openItemEditor(index = -1) {
    editingIndex = index;
    const item = index >= 0 ? data.items[index] : {title:"",text:"",image:"",videoId:""};
    $("#itemEditor").hidden = false;
    $("#itemTitle").value = item.title || "";
    $("#itemText").value = item.text || "";
    $("#itemImage").value = "";
    $("#itemVideo").value = "";
    $("#itemEditor h2").textContent = index >= 0 ? "Chỉnh sửa nội dung" : "Thêm nội dung";
    $("#itemSave").textContent = index >= 0 ? "Lưu chỉnh sửa" : "Thêm vào trang";
  }
  async function readCompressedImage(file) {
    if (!file) return "";
    if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn tệp hình ảnh.");
    const dataUrl = await new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Không đọc được ảnh."));
      reader.readAsDataURL(file);
    });
    const image = await new Promise((resolve,reject) => {
      const img = new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Ảnh không hợp lệ."));img.src=dataUrl;
    });
    const scale = Math.min(1,1400 / Math.max(image.width,image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1,Math.round(image.width * scale));
    canvas.height = Math.max(1,Math.round(image.height * scale));
    canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL("image/jpeg",.76);
  }
  const canEdit = sessionStorage.getItem("kyyeu-admin-session") === "1";
  $("#editOpen").onclick = () => {
    $("#editor").hidden = false;
    $("#fTitle").value = data.title;$("#fSubtitle").value = data.subtitle;$("#fBody").value = data.body;
  };
  $("#editClose").onclick = () => $("#editor").hidden = true;
  $("#editSave").onclick = () => {
    data.title = $("#fTitle").value.trim() || defaults[0];
    data.subtitle = $("#fSubtitle").value.trim();data.body = $("#fBody").value.trim();
    save().then(saved => { if (saved) $("#editor").hidden = true; });
  };
  $("#addItem").onclick = () => openItemEditor(-1);
  $("#itemClose").onclick = () => $("#itemEditor").hidden = true;
  $("#itemSave").onclick = async () => {
    const title = $("#itemTitle").value.trim(), text = $("#itemText").value.trim();
    const file = $("#itemImage").files[0];
    const videoFile = $("#itemVideo").files[0];
    if (videoFile && !videoFile.type.startsWith("video/")) { $("#status").textContent = "Vui lòng chọn tệp video hợp lệ.";return; }
    if (!title && !text && !file && !videoFile && editingIndex < 0) { $("#status").textContent = "Hãy nhập nội dung hoặc chọn ảnh/video.";return; }
    if (file && videoFile) { $("#status").textContent = "Mỗi nội dung chỉ chọn ảnh hoặc video, không chọn cả hai.";return; }
    const button = $("#itemSave");button.disabled = true;
    try {
      const uploaded = await readCompressedImage(file);
      const old = editingIndex >= 0 ? data.items[editingIndex] : {};
      let videoId = old.videoId || "";
      if (videoFile) {
        videoId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("video-" + Date.now() + "-" + Math.random().toString(36).slice(2));
        await putVideo(videoId, videoFile);
      }
      const next = {title,text,image:uploaded || (videoFile ? "" : old.image || ""),videoId:videoFile ? videoId : (file ? "" : videoId)};
      if (editingIndex >= 0) data.items[editingIndex] = next; else data.items.push(next);
      const saved = await save();
      if (saved) {
        if ((file || videoFile) && old.videoId && old.videoId !== videoId) deleteVideo(old.videoId).catch(() => {});
        $("#itemEditor").hidden = true;
      } else if (videoFile) {
        deleteVideo(videoId).catch(() => {});
        if (editingIndex >= 0) data.items[editingIndex] = old; else data.items.pop();
      }
    } catch (error) { $("#status").textContent = error.message || "Không xử lý được tệp."; }
    finally { button.disabled = false; }
  };
  $("#exportPage").onclick = () => {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob),link = document.createElement("a");
    link.href=url;link.download=id+"-content.json";link.click();URL.revokeObjectURL(url);
  };
  ["editOpen","addItem","exportPage"].forEach(buttonId => { const button = document.getElementById(buttonId);if(button)button.hidden = !canEdit; });
  if (!canEdit) $("#status").textContent = "Chế độ xem · chỉ quản trị viên mới được chỉnh sửa";
  loadPageData().then(() => { drawHeader(); draw(); }).catch(error => { console.warn(error); drawHeader(); draw(); });
})();
