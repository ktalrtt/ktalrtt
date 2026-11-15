/* Sảnh vũ trụ mở: các cổng ký ức nổi tự do, không còn vật thể ở tâm hay tường bao quanh. */
(() => {
  const $ = id => document.getElementById(id);
  const stage = $("worldStage");
  if (!stage) return;

  const defaults = [
    ["Album ảnh","Những khung hình thanh xuân","pages/album.html","▧"],
    ["Thành viên","Những gương mặt thân quen","pages/members.html","✦"],
    ["Video thanh xuân","Chuyển động của ngày xưa","pages/videos.html","▶"],
    ["Kỷ niệm","Chuyện nhỏ không thể quên","pages/memories.html","✧"],
    ["Lời nhắn","Điều muốn nói với nhau","pages/messages.html","♡"],
    ["Hành trình lớp","Từ ngày đầu đến hôm nay","pages/journey.html","⌁"]
  ];
  let yaw = 0, pitch = 0, zoom = 1, dragging = false, pointerId = null;
  let lastX = 0, lastY = 0, startX = 0, startY = 0, moved = false;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
  const config = () => window.getYearbookConfig ? window.getYearbookConfig() : {};
  const base = () => new URL(".", document.querySelector('script[src$="world3d.js"]')?.src || location.href);
  function resolveHref(value, index) {
    const fallback = defaults[index % defaults.length][2];
    const raw = String(value || fallback).trim();
    if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
    if (raw === "#") return new URL(fallback, base()).href;
    try { return new URL(raw.replace(/^\/+/, ""), base()).href; }
    catch (_) { return new URL(fallback, base()).href; }
  }
  function render() {
    const c = config();
    const items = Array.isArray(c.worldItems) && c.worldItems.length ? c.worldItems : defaults.map(x => ({
      title:x[0], description:x[1], url:x[2], icon:x[3]
    }));
    $("worldTitle").textContent = c.worldTitle || "Sảnh chính";
    document.documentElement.style.setProperty("--world-glow", c.worldGlow || "#a78bfa");
    stage.querySelector(".immersive-room")?.remove();
    stage.querySelector(".room-vignette")?.remove();

    const room = document.createElement("div");
    room.className = "immersive-room";
    room.id = "immersiveRoom";
    const ambient = document.createElement("div");
    ambient.className = "cosmic-depth";
    ambient.setAttribute("aria-hidden", "true");
    room.append(ambient);

    items.forEach((item, index) => {
      const title = item.title || defaults[index % defaults.length][0];
      const description = item.description || "Mở ra một vùng ký ức";
      const icon = item.icon || defaults[index % defaults.length][3];
      const link = document.createElement("a");
      link.className = "room-portal";
      link.href = resolveHref(item.url, index);
      link.target = "_self";
      link.setAttribute("aria-label", "Mở trang " + title);
      link.style.setProperty("--portal-index", index);
      const image = item.image || item.photo || "";
      link.innerHTML =
        '<div class="portal-inner">' +
          (image
            ? '<img class="portal-image" src="' + esc(image) + '" alt="" loading="lazy" decoding="async">'
            : '<div class="portal-art"><span>' + esc(icon) + '</span><i>✧</i></div>') +
          '<div class="portal-info">' +
            '<small>MEMORY GATE · ' + String(index + 1).padStart(2,"0") + '</small>' +
            '<strong>' + esc(title) + '</strong>' +
            '<span>' + esc(description) + '</span>' +
            '<em>MỞ KHÁM PHÁ ↗</em>' +
          '</div>' +
        '</div>';
      room.append(link);
    });
    stage.append(room);
    update();
  }

  function update() {
    const room = $("immersiveRoom");
    if (!room) return;
    room.style.transform = "translate3d(0,0,0) rotateX(" + pitch + "deg) rotateY(" + yaw + "deg) scale(" + zoom + ")";
    const label = $("worldZoomValue");
    if (label) label.textContent = Math.round(zoom * 100) + "%";
    const range = $("worldZoomRange");
    if (range) range.value = String(Math.round(zoom * 100));
  }
  function down(event) {
    if (event.button !== 0 || event.target.closest(".room-portal")) return;
    dragging = true; moved = false; pointerId = event.pointerId;
    startX = lastX = event.clientX; startY = lastY = event.clientY;
    stage.classList.add("is-dragging");
    try { stage.setPointerCapture(pointerId); } catch (_) {}
  }
  function move(event) {
    if (!dragging || event.pointerId !== pointerId) return;
    const dx = event.clientX - lastX, dy = event.clientY - lastY;
    if (Math.abs(event.clientX - startX) + Math.abs(event.clientY - startY) > 5) moved = true;
    lastX = event.clientX; lastY = event.clientY;
    yaw = Math.max(-9, Math.min(9, yaw + dx * .035));
    pitch = Math.max(-5, Math.min(5, pitch - dy * .025));
    update();
  }
  function up() {
    dragging = false; pointerId = null;
    stage.classList.remove("is-dragging");
  }
  stage.addEventListener("pointerdown", down);
  stage.addEventListener("pointermove", move);
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);
  stage.addEventListener("lostpointercapture", up);
  $("worldZoomIn")?.addEventListener("click", () => { zoom = Math.min(1.25, zoom + .08); update(); });
  $("worldZoomOut")?.addEventListener("click", () => { zoom = Math.max(.78, zoom - .08); update(); });
  $("worldZoomRange")?.addEventListener("input", event => {
    zoom = Math.max(.78, Math.min(1.25, Number(event.target.value) / 100)); update();
  });
  $("worldLeft")?.addEventListener("click", () => { yaw = Math.max(-9, yaw - 3); update(); });
  $("worldRight")?.addEventListener("click", () => { yaw = Math.min(9, yaw + 3); update(); });
  $("worldReset")?.addEventListener("click", () => { yaw = 0; pitch = 0; zoom = 1; update(); });
  stage.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") yaw = Math.max(-9, yaw - 2);
    if (event.key === "ArrowRight") yaw = Math.min(9, yaw + 2);
    if (event.key === "+" || event.key === "=") zoom = Math.min(1.25, zoom + .05);
    if (event.key === "-") zoom = Math.max(.78, zoom - .05);
    update();
  });
  window.renderWorld3D = render;
  window.addEventListener("kyyeu-config-ready", render);
  render();
})();
