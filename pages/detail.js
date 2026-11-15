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
  try { data = {...data,...JSON.parse(localStorage.getItem(key) || "{}")}; } catch (_) {}
  function drawHeader() {
    document.title = data.title + " · Kỷ yếu";
    $("#pageTitle").textContent = data.title;
    $("#pageSubtitle").textContent = data.subtitle;
    $("#pageBody").textContent = data.body;
  }
  function draw() {
    $("#pageItems").innerHTML = (data.items || []).map((item,index) =>
      '<article class="memory-card">' +
        (item.image ? '<img src="' + esc(item.image) + '" alt="">' : '<div class="memory-placeholder">✦</div>') +
        '<div><h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p></div>' +
        (canEdit ? '<div class="memory-actions"><button type="button" data-edit="' + index + '">Sửa</button><button type="button" data-remove="' + index + '" aria-label="Xóa">Xóa</button></div>' : '') +
      '</article>'
    ).join("");
    $("#pageItems").querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => openItemEditor(Number(button.dataset.edit))));
    $("#pageItems").querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      const index = Number(button.dataset.remove);
      if (!Number.isInteger(index) || !data.items[index]) return;
      data.items.splice(index,1); save();
    }));
  }
  function save() {
    try {
      localStorage.setItem(key,JSON.stringify(data));
      drawHeader();draw();
      $("#status").textContent = "Đã lưu trên trình duyệt này.";
    } catch (error) {
      $("#status").textContent = error.name === "QuotaExceededError"
        ? "Bộ nhớ trình duyệt đã đầy. Hãy dùng ảnh nhỏ hơn hoặc xóa bớt nội dung."
        : "Không thể lưu. Vui lòng thử lại.";
    }
  }
  function openItemEditor(index = -1) {
    editingIndex = index;
    const item = index >= 0 ? data.items[index] : {title:"",text:"",image:""};
    $("#itemEditor").hidden = false;
    $("#itemTitle").value = item.title || "";
    $("#itemText").value = item.text || "";
    $("#itemImage").value = "";
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
  drawHeader();
  $("#editOpen").onclick = () => {
    $("#editor").hidden = false;
    $("#fTitle").value = data.title;$("#fSubtitle").value = data.subtitle;$("#fBody").value = data.body;
  };
  $("#editClose").onclick = () => $("#editor").hidden = true;
  $("#editSave").onclick = () => {
    data.title = $("#fTitle").value.trim() || defaults[0];
    data.subtitle = $("#fSubtitle").value.trim();data.body = $("#fBody").value.trim();
    save();$("#editor").hidden = true;
  };
  $("#addItem").onclick = () => openItemEditor(-1);
  $("#itemClose").onclick = () => $("#itemEditor").hidden = true;
  $("#itemSave").onclick = async () => {
    const title = $("#itemTitle").value.trim(), text = $("#itemText").value.trim();
    const file = $("#itemImage").files[0];
    if (!title && !text && !file && editingIndex < 0) { $("#status").textContent = "Hãy nhập nội dung hoặc chọn ảnh.";return; }
    const button = $("#itemSave");button.disabled = true;
    try {
      const uploaded = await readCompressedImage(file);
      const old = editingIndex >= 0 ? data.items[editingIndex] : {};
      const next = {title,text,image:uploaded || old.image || ""};
      if (editingIndex >= 0) data.items[editingIndex] = next; else data.items.push(next);
      save();$("#itemEditor").hidden = true;
    } catch (error) { $("#status").textContent = error.message || "Không xử lý được ảnh."; }
    finally { button.disabled = false; }
  };
  $("#exportPage").onclick = () => {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob),link = document.createElement("a");
    link.href=url;link.download=id+"-content.json";link.click();URL.revokeObjectURL(url);
  };
  ["editOpen","addItem","exportPage"].forEach(buttonId => { const button = document.getElementById(buttonId);if(button)button.hidden = !canEdit; });
  if (!canEdit) $("#status").textContent = "Chế độ xem · chỉ quản trị viên mới được chỉnh sửa";
  draw();
})();
