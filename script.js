const $ = (id) => document.getElementById(id);
const ADMIN_NAME = "khổng tiến anh đẹp trai";
const DB_NAME = "kyyeu_invitation_db";
const DB_STORE = "settings";
const DB_KEY = "site-config";
const ACCOUNT_KEY = "remembered-guest-name";
const ADMIN_SESSION_KEY = "kyyeu-admin-session";
const ENTERED_SESSION_KEY = "kyyeu-entered-session";
const RSVP_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby0xLcANRpEN6RmVUS4yaVj58iC2EPPV0ddPoB9z9KDH1sZQC9mgZwb4-XwYqo2ZfZ1/exec";
let currentConfig = { ...CONFIG };
let currentGuestName = "";
window.getYearbookConfig = () => currentConfig;
function openConfigDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function loadSavedConfig() {
  try {
    const db = await openConfigDB();
    const saved = await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(DB_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (saved) currentConfig = { ...currentConfig, ...saved };
  } catch (error) { console.warn("Không thể đọc cấu hình đã lưu:", error); }
}
async function saveConfigToDB(config) {
  const db = await openConfigDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(config, DB_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Lưu bị hủy."));
  });
  db.close();
}

async function getRememberedName() {
  try {
    const db = await openConfigDB();
    const value = await new Promise((resolve, reject) => {
      const req = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(ACCOUNT_KEY);
      req.onsuccess = () => resolve(req.result || ""); req.onerror = () => reject(req.error);
    });
    db.close(); return value;
  } catch (_) { return ""; }
}
async function setRememberedName(name) {
  const db = await openConfigDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    if (name) tx.objectStore(DB_STORE).put(name, ACCOUNT_KEY);
    else tx.objectStore(DB_STORE).delete(ACCOUNT_KEY);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
  db.close();
}
function setLines(id, value) {
  const el = $(id);
  el.replaceChildren();
  String(value || "").split("|").forEach((part, index) => {
    if (index) { const br = document.createElement("br"); const em = document.createElement("em"); em.textContent = part.trim(); el.append(br, em); }
    else el.textContent = part.trim();
  });
}
function applyConfig() {
  document.title = currentConfig.siteTitle || "Thư mời kỷ yếu";
  $("gateEyebrow").textContent = currentConfig.gateEyebrow || "A LITTLE INVITATION";
  setLines("gateTitle", currentConfig.gateTitle);
  $("gateCopy").textContent = currentConfig.gateCopy || "";
  $("gateButton").innerHTML = `${escapeHtml(currentConfig.gateButtonText || "Mở lời mời")} <span>↗</span>`;
  $("gateTinyNote").textContent = currentConfig.gateTinyNote || "";
  $("brandText").innerHTML = `${escapeHtml(currentConfig.brandText || "OUR LITTLE MOMENT")} <i>✳</i>`;
  $("mainEyebrow").textContent = currentConfig.mainEyebrow || "";
  $("helloLine").textContent = `${currentConfig.greetingPrefix || "Kính chào:"} ${currentGuestName}`.trim();
  setLines("mainTitle", currentConfig.mainTitle);
  $("mainMessage").textContent = currentConfig.mainMessage || "";
  $("eventDate").textContent = currentConfig.eventDate || "";
  $("eventPlace").textContent = currentConfig.eventPlace || "";
  $("footerNote").textContent = currentConfig.footerNote || "";
  $("galleryEyebrow").textContent = currentConfig.galleryEyebrow || "MEMORIES IN FRAMES";
  setLines("galleryTitle", currentConfig.galleryTitle || "Một chút|thanh xuân");
  $("galleryCopy").textContent = currentConfig.galleryCopy || "Những khoảnh khắc mong được cùng bạn viết tiếp.";
  $("confirmTitle").textContent = currentConfig.confirmTitle || "Bạn xác nhận tham gia nhé?";
  $("confirmYes").textContent = currentConfig.confirmYesText || "Đồng ý, mình sẽ tham gia ♥";
  $("confirmNo").textContent = currentConfig.confirmNoText || "Để mình suy nghĩ thêm";
  $("confirmNote").textContent = currentConfig.confirmNote || "Thông tin xác nhận sẽ được gửi tự động về email của chủ lời mời.";
  $("coverImage").src = currentConfig.coverImage || "";
  $("rsvpLink").innerHTML = `${escapeHtml(currentConfig.buttonText || "Chấp nhận lời mời")} <span>↗</span>`;
  document.documentElement.style.setProperty("--site-font", `"${currentConfig.fontFamily || "DM Sans"}", sans-serif`);
  document.body.style.backgroundImage = "";
  document.documentElement.style.setProperty("--accent-color", currentConfig.accentColor || "#b77d70");
  document.documentElement.style.setProperty("--text-color", currentConfig.textColor || "#342d2a");
  document.documentElement.style.setProperty("--gate-color", currentConfig.gateColor || "#f7eee8");
  document.documentElement.style.setProperty("--gallery-color", currentConfig.galleryColor || "#f3e9e2");
  const gate = $("gate"), invitation = $("invitation"), gallerySection = document.querySelector(".gallery-section");
  gate.style.backgroundImage = currentConfig.gateBackgroundImage
    ? `linear-gradient(rgba(247,238,232,${(currentConfig.gateOverlay ?? .72)}),rgba(237,218,207,${(currentConfig.gateOverlay ?? .72)})),url("${currentConfig.gateBackgroundImage}")`
    : "";
  invitation.style.backgroundImage = currentConfig.backgroundImage
    ? `linear-gradient(rgba(251,247,243,${(currentConfig.pageOverlay ?? .78)}),rgba(251,247,243,${(currentConfig.pageOverlay ?? .78)})),url("${currentConfig.backgroundImage}")`
    : "";
  document.documentElement.style.setProperty("--ocean-deep", currentConfig.oceanDeep || "#062b46");
  document.documentElement.style.setProperty("--ocean-light", currentConfig.oceanLight || "#4fd6d0");
  document.documentElement.dataset.oceanLife = currentConfig.oceanLife || "medium";
  const worldStage = $("worldStage");
  if (worldStage) worldStage.style.backgroundImage = currentConfig.worldBackgroundImage ? `linear-gradient(rgba(4,7,20,.35),rgba(4,7,20,.62)),url("${currentConfig.worldBackgroundImage}")` : "";
  gallerySection.style.backgroundImage = currentConfig.galleryBackgroundImage
    ? `linear-gradient(rgba(243,233,226,${(currentConfig.galleryOverlay ?? .78)}),rgba(243,233,226,${(currentConfig.galleryOverlay ?? .78)})),url("${currentConfig.galleryBackgroundImage}")`
    : "";
  $("photoCaption")?.replaceChildren(document.createTextNode(currentConfig.photoCaption || "the days we'll remember"));
  document.body.classList.toggle("motion-disabled", currentConfig.motionEnabled === false || currentConfig.motionStyle === "off");
  document.body.classList.toggle("motion-soft", currentConfig.motionStyle === "soft");
  $("gallery").innerHTML = (currentConfig.gallery || []).map((item, i) => `<figure class="gallery-item"><img src="${item.image}" alt="Khoảnh khắc kỷ yếu ${i + 1}"><figcaption><span>0${i + 1}</span>${escapeHtml(item.caption)}</figcaption></figure>`).join("");
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fillEditor() {
  $("editSiteTitle").value = currentConfig.siteTitle || "";
  $("editGateEyebrow").value = currentConfig.gateEyebrow || "";
  $("editGateTitle").value = currentConfig.gateTitle || "";
  $("editGateCopy").value = currentConfig.gateCopy || "";
  $("editGateButton").value = currentConfig.gateButtonText || "Mở lời mời";
  $("editGateTinyNote").value = currentConfig.gateTinyNote || "một ngày đặc biệt · những kỷ niệm thật đẹp";
  $("editBrandText").value = currentConfig.brandText || "OUR LITTLE MOMENT";
  $("editMainEyebrow").value = currentConfig.mainEyebrow || "";
  $("editGalleryEyebrow").value = currentConfig.galleryEyebrow || "MEMORIES IN FRAMES";
  $("editWorldTitle").value = currentConfig.worldTitle || "Bảo tàng thanh xuân";
  $("editWorldGlow").value = currentConfig.worldGlow || "#d6ad79";
  $("editOceanDeep").value = currentConfig.oceanDeep || "#062b46";
  $("editOceanLight").value = currentConfig.oceanLight || "#4fd6d0";
  $("editOceanLife").value = currentConfig.oceanLife || "medium";
  $("editWorldCenterTitle").value = currentConfig.worldCenterTitle || "OUR CLASS | OUR FOREVER";
  $("editWorldCenterSubtitle").value = currentConfig.worldCenterSubtitle || "MEMORIES LIVE HERE";
  $("editWorldItems").value = (currentConfig.worldItems || []).map(x => [x.title,x.description,x.url,x.icon || "✳",x.image || ""].join(" | ")).join("\n");
  $("editWorldPages").value = JSON.stringify(currentConfig.worldPages || {}, null, 2);
  $("editGalleryTitle").value = currentConfig.galleryTitle || "Một chút|thanh xuân";
  $("editGalleryCopy").value = currentConfig.galleryCopy || "Những khoảnh khắc mong được cùng bạn viết tiếp.";
  $("editConfirmTitle").value = currentConfig.confirmTitle || "Bạn xác nhận tham gia nhé?";
  $("editConfirmYes").value = currentConfig.confirmYesText || "Đồng ý, mình sẽ tham gia ♥";
  $("editConfirmNo").value = currentConfig.confirmNoText || "Để mình suy nghĩ thêm";
  $("editConfirmCopy").value = currentConfig.confirmCopy || "Cảm ơn bạn đã nhận lời. Xác nhận để mở email thông báo cho chủ nhân lời mời.";
  $("editConfirmNote").value = currentConfig.confirmNote || "Thông tin xác nhận sẽ được gửi tự động về email của chủ lời mời.";
  $("editGreetingPrefix").value = currentConfig.greetingPrefix || "Kính chào:";
  $("editFooterNote").value = currentConfig.footerNote || "";
  $("editRsvpEmail").value = currentConfig.rsvpEmail || "";
  [1,2,3].forEach(i => { $( `editCaption${i}` ).value = currentConfig.gallery?.[i-1]?.caption || ""; });
  $("editInvitationLine").value = currentConfig.invitationLine || "";
  $("editMainTitle").value = currentConfig.mainTitle || "";
  $("editMessage").value = currentConfig.mainMessage || "";
  $("editDate").value = currentConfig.eventDate || "";
  $("editPlace").value = currentConfig.eventPlace || "";
  $("editButtonText").value = currentConfig.buttonText || "Chấp nhận lời mời";
  $("editFont").value = currentConfig.fontFamily || "DM Sans";
  $("editPhotoCaption").value = currentConfig.photoCaption || "the days we'll remember";
  $("editAccentColor").value = currentConfig.accentColor || "#b77d70";
  $("editTextColor").value = currentConfig.textColor || "#342d2a";
  $("editGateColor").value = currentConfig.gateColor || "#f7eee8";
  $("editGalleryColor").value = currentConfig.galleryColor || "#f3e9e2";
  $("editGateOverlay").value = Math.round((currentConfig.gateOverlay ?? .72) * 100);
  $("editPageOverlay").value = Math.round((currentConfig.pageOverlay ?? .78) * 100);
  $("editGalleryOverlay").value = Math.round((currentConfig.galleryOverlay ?? .78) * 100);
  $("editMotionEnabled").checked = currentConfig.motionEnabled !== false;
  $("editSoundEnabled").checked = currentConfig.soundEnabled !== false;
  $("editSoundVolume").value = currentConfig.soundVolume ?? 65;
  $("editMusicUrl").value = currentConfig.musicUrl || "";
  $("editMusicEnabled").checked = currentConfig.musicEnabled !== false;
  $("editMusicVolume").value = currentConfig.musicVolume ?? 35;
  $("editMusicClear").checked = false;
  $("editMotionStyle").value = currentConfig.motionStyle || "luxury";
}
async function readImage(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn một tệp ảnh.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Ảnh gốc tối đa 15 MB. Hãy chọn ảnh nhỏ hơn.");
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không đọc được ảnh."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Ảnh không hợp lệ hoặc không thể mở."));
    img.src = dataUrl;
  });
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  let quality = 0.82;
  let blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", quality));
  while (blob && blob.size > 450 * 1024 && quality > 0.42) {
    quality -= 0.08;
    blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", quality));
  }
  if (!blob) throw new Error("Trình duyệt không hỗ trợ nén ảnh này. Hãy thử ảnh khác.");
  if (blob.size > 500 * 1024) throw new Error("Ảnh vẫn quá lớn sau khi nén. Hãy chọn ảnh khác có dung lượng thấp hơn.");
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không thể hoàn tất việc nén ảnh."));
    reader.readAsDataURL(blob);
  });
}
async function readMusic(file) {
  if (!file) return null;
  if (!file.type.startsWith("audio/")) throw new Error("Vui lòng chọn tệp âm thanh hợp lệ.");
  if (file.size > 1.5 * 1024 * 1024) throw new Error("Nhạc tải trực tiếp tối đa 1,5 MB. Hãy dùng URL MP3 công khai cho tệp lớn.");
  return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Không đọc được tệp nhạc."));reader.readAsDataURL(file);});
}
function applyBackgroundMusic() {
  const audio=$("bgMusic"); if(!audio)return;
  const source=currentConfig.musicData || currentConfig.musicUrl || "";
  if(audio.dataset.source!==source){audio.pause();audio.removeAttribute("src");audio.src=source;audio.dataset.source=source;audio.load();}
  audio.volume=Math.max(0,Math.min(1,(currentConfig.musicVolume??35)/100));
}
async function startBackgroundMusic() {
  const audio=$("bgMusic"); if(!audio || currentConfig.musicEnabled===false)return;
  applyBackgroundMusic();
  if(!audio.src)return;
  try{await audio.play();}catch(_){const b=$("soundToggle");if(b)b.title="Nhấn để phát nhạc nền";}
}
function downloadConfig() {
  const source = "/* File được xuất từ trình chỉnh sửa thiệp kỷ yếu */\nconst CONFIG = " + JSON.stringify(currentConfig, null, 2) + ";\n";
  const blob = new Blob([source], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "config.js"; a.click();
  URL.revokeObjectURL(url);
}
applyConfig();
loadSavedConfig().then(async () => {
  applyConfig();
  window.dispatchEvent(new Event("kyyeu-config-ready"));
  soundEnabled = currentConfig.soundEnabled !== false && localStorage.getItem("kyyeu-sound") !== "off";
  soundVolume = (currentConfig.soundVolume ?? 65) / 100;
  updateSoundButton();
  const remembered = await getRememberedName();
  if (remembered) $("guestName").value = remembered;
  if (sessionStorage.getItem(ENTERED_SESSION_KEY) === "1") {
    currentGuestName = sessionStorage.getItem("kyyeu-guest-name") || remembered || "";
    $("helloLine").textContent = `${currentConfig.greetingPrefix || "Kính chào:"} ${currentGuestName}`.trim();
    $("gate").classList.add("hidden");
    $("invitation").classList.remove("hidden");
    $("worldLobby")?.classList.remove("hidden");
    $("classicInvitation")?.classList.add("hidden");
    const isAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
    $("adminPanel").classList.toggle("hidden", !isAdmin);
    $("quickEdit")?.classList.toggle("hidden", !isAdmin);
    if (isAdmin) fillEditor();
  }
});

// Chuyển cảnh cinematic: chỉ dùng CSS/JS thuần, không tải thư viện ngoài.
const PERFORMANCE_KEY = "kyyeu-performance-mode";
function getPerformanceMode() {
  const saved = localStorage.getItem(PERFORMANCE_KEY);
  return ["low", "balanced", "high"].includes(saved) ? saved : "balanced";
}
function setPerformanceMode(mode) {
  const safe = ["low", "balanced", "high"].includes(mode) ? mode : "balanced";
  localStorage.setItem(PERFORMANCE_KEY, safe);
  document.documentElement.dataset.performance = safe;
  document.querySelectorAll('input[name="performanceMode"]').forEach(input => { input.checked = input.value === safe; });
}
document.querySelectorAll('input[name="performanceMode"]').forEach(input => {
  input.addEventListener("change", () => setPerformanceMode(input.value));
});
setPerformanceMode(getPerformanceMode());

function runCinematicTransition(direction, onCovered) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mode = getPerformanceMode();
  const disabled = mode === "low" || currentConfig.motionEnabled === false || currentConfig.motionStyle === "off";
  if (reduced || disabled) {
    onCovered();
    return Promise.resolve();
  }
  const layer = document.createElement("div");
  layer.className = `cinematic-transition ${direction === "enter" ? "is-entering" : "is-leaving"}`;
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `<div class="cinematic-vortex"></div><div class="cinematic-core"></div><div class="cinematic-wordmark">${direction === "enter" ? "A NEW MEMORY" : "UNTIL NEXT TIME"}<span>✦</span></div><div class="cinematic-particles">${Array.from({length:mode === "high" ? 48 : mode === "balanced" ? 20 : 8}, (_,i) => `<i style="--i:${i};--angle:${i*10}deg;--delay:${(i%9)*.025}s;--size:${3+(i%4)*2}px"></i>`).join("")}</div>`;
  document.body.appendChild(layer);
  document.body.classList.add("cinematic-running");
  // Đổi nội dung đúng lúc lớp sáng đã che kín toàn màn hình.
  window.setTimeout(() => {
    onCovered();
    layer.classList.add("is-revealing");
  }, 760);
  return new Promise(resolve => window.setTimeout(() => {
    layer.remove();
    document.body.classList.remove("cinematic-running");
    resolve();
  }, mode === "high" ? 1850 : mode === "balanced" ? 1300 : 900));
}

$("nameForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("guestName")?.value?.trim();
  if (!name) {
    $("guestName")?.focus();
    return;
  }

  // Không để IndexedDB chặn thao tác mở sảnh: lưu tên chạy nền, lỗi lưu không ảnh hưởng đăng nhập.
  const remember = $("rememberName")?.checked;
  Promise.resolve().then(() => setRememberedName(remember ? name : "")).catch(error => {
    console.warn("Không lưu được tên khách trên thiết bị:", error);
    try {
      if (remember) localStorage.setItem(ACCOUNT_KEY, name);
      else localStorage.removeItem(ACCOUNT_KEY);
    } catch (_) {}
  });

  currentGuestName = name;
  $("helloLine").textContent = `${currentConfig.greetingPrefix || "Kính chào:"} ${name}`;
  const normalizedName = name.toLocaleLowerCase("vi-VN").normalize("NFC");
  const isAdmin = normalizedName === ADMIN_NAME.toLocaleLowerCase("vi-VN").normalize("NFC");
  try {
    sessionStorage.setItem(ENTERED_SESSION_KEY, "1");
    sessionStorage.setItem("kyyeu-guest-name", name);
    if (isAdmin) sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    console.warn("Không lưu được phiên đăng nhập:", error);
  }
  $("adminPanel")?.classList.toggle("hidden", !isAdmin);
  $("quickEdit")?.classList.toggle("hidden", !isAdmin);
  if (isAdmin) {
    try { fillEditor(); } catch (error) { console.warn("Không tải được trình chỉnh sửa:", error); }
  }

  const showLobby = () => {
    $("gate")?.classList.add("hidden");
    $("invitation")?.classList.remove("hidden");
    $("worldLobby")?.classList.remove("hidden");
    $("classicInvitation")?.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "auto" });
    // Render lai sau khi san thoat trang thai display:none de lay dung kich thuoc khung 3D.
    requestAnimationFrame(() => {
      if (window.renderWorld3D) window.renderWorld3D();
    });
    // Render lại sau khi sảnh thoát trạng thái display:none để lấy đúng kích thước khung 3D.
    requestAnimationFrame(() => {
      if (window.renderWorld3D) window.renderWorld3D();
    });
  };
  try {
    const openingTransition = runCinematicTransition("enter", showLobby);
    playOpenSound();
    startBackgroundMusic();
    await openingTransition;
  } catch (error) {
    console.error("Lỗi hiệu ứng mở sảnh, chuyển sang chế độ trực tiếp:", error);
    showLobby();
  }
});
$("backBtn")?.addEventListener("click", async () => {
  await runCinematicTransition("leave", () => {
    $("invitation").classList.add("hidden");
    $("gate").classList.remove("hidden");
    $("adminPanel").classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "auto" });
  });
  $("guestName").focus();
});
$("logoutBtn").addEventListener("click", async () => {
  await runCinematicTransition("leave", () => {
    currentGuestName = "";
    sessionStorage.removeItem(ENTERED_SESSION_KEY);
    sessionStorage.removeItem("kyyeu-guest-name");
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    $("invitation").classList.add("hidden");
    $("adminPanel").classList.add("hidden");
    $("quickEdit")?.classList.add("hidden");
    $("confirmModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
    $("gate").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "auto" });
  });
  $("guestName").focus();
});
$("closeAdmin").addEventListener("click", () => $("adminPanel").classList.add("hidden"));
$("adminForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const cover = await readImage($("editCover").files[0]);
    const background = await readImage($("editBackground").files[0]);
    const gateBackground = await readImage($("editGateBackground").files[0]);
    const galleryBackground = await readImage($("editGalleryBackground").files[0]);
    const worldBackground = await readImage($("editWorldBackground").files[0]);
    const musicData = await readMusic($("editMusicFile").files[0]);
    const worldItemUploads = await Promise.all([1,2,3,4,5,6].map(i => readImage($(`editWorldItem${i}`).files[0])));
    const galleryUploads = await Promise.all([1, 2, 3].map(i => readImage($(`editGallery${i}`).files[0])));
    currentConfig = { ...currentConfig,
      siteTitle: $("editSiteTitle").value.trim(), gateButtonText: $("editGateButton").value.trim(),
      gateTinyNote: $("editGateTinyNote").value.trim(), brandText: $("editBrandText").value.trim(),
      galleryEyebrow: $("editGalleryEyebrow").value.trim(), galleryTitle: $("editGalleryTitle").value.trim(),
      galleryCopy: $("editGalleryCopy").value.trim(),
      worldTitle: $("editWorldTitle").value.trim(), worldGlow: $("editWorldGlow").value,
      oceanDeep: $("editOceanDeep").value, oceanLight: $("editOceanLight").value, oceanLife: $("editOceanLife").value,
      worldCenterTitle: $("editWorldCenterTitle").value.trim(), worldCenterSubtitle: $("editWorldCenterSubtitle").value.trim(),
      worldItems: $("editWorldItems").value.split(/\r?\n/).map(line => line.split("|").map(s => s.trim())).filter(parts => parts[0] && parts[2]).map((parts,index) => ({ title: parts[0], description: parts[1] || "Khám phá kỷ niệm", url: parts[2], icon: parts[3] || "✳", image: worldItemUploads[index] || parts[4] || currentConfig.worldItems?.[index]?.image || "" })),
      worldPages: JSON.parse($("editWorldPages").value || "{}"),
      confirmTitle: $("editConfirmTitle").value.trim(),
      confirmYesText: $("editConfirmYes").value.trim(), confirmNoText: $("editConfirmNo").value.trim(),
      confirmCopy: $("editConfirmCopy").value.trim(), confirmNote: $("editConfirmNote").value.trim(), gateEyebrow: $("editGateEyebrow").value.trim(),
      gateTitle: $("editGateTitle").value.trim(), gateCopy: $("editGateCopy").value.trim(),
      mainEyebrow: $("editMainEyebrow").value.trim(), greetingPrefix: $("editGreetingPrefix").value.trim(),
      footerNote: $("editFooterNote").value.trim(), rsvpEmail: $("editRsvpEmail").value.trim(),
      invitationLine: $("editInvitationLine").value.trim(), mainTitle: $("editMainTitle").value.trim(),
      mainMessage: $("editMessage").value.trim(), eventDate: $("editDate").value.trim(),
      eventPlace: $("editPlace").value.trim(), buttonText: $("editButtonText").value.trim(),
      fontFamily: $("editFont").value,
      photoCaption: $("editPhotoCaption").value.trim(),
      accentColor: $("editAccentColor").value, textColor: $("editTextColor").value,
      gateColor: $("editGateColor").value, galleryColor: $("editGalleryColor").value,
      gateOverlay: Number($("editGateOverlay").value) / 100,
      pageOverlay: Number($("editPageOverlay").value) / 100,
      galleryOverlay: Number($("editGalleryOverlay").value) / 100,
      motionEnabled: $("editMotionEnabled").checked, soundEnabled: $("editSoundEnabled").checked,
      soundVolume: Number($("editSoundVolume").value), motionStyle: $("editMotionStyle").value,
      musicUrl: $("editMusicClear").checked ? "" : $("editMusicUrl").value.trim(), musicEnabled: $("editMusicEnabled").checked, musicVolume: Number($("editMusicVolume").value),
      ...( $("editMusicClear").checked ? { musicData: "" } : {} ), ...(musicData ? { musicData, musicUrl: "" } : {}),
      ...(cover ? { coverImage: cover } : {}), ...(background ? { backgroundImage: background } : {}),
      ...(gateBackground ? { gateBackgroundImage: gateBackground } : {}),
      ...(galleryBackground ? { galleryBackgroundImage: galleryBackground } : {}),
      ...(worldBackground ? { worldBackgroundImage: worldBackground } : {}),
      gallery: (currentConfig.gallery || []).map((item, index) => ({
        ...item, caption: $(`editCaption${index + 1}`).value.trim(),
        ...(galleryUploads[index] ? { image: galleryUploads[index] } : {})
      }))
    };
    await saveConfigToDB(currentConfig);
    applyConfig();
    if (window.renderWorld3D) window.renderWorld3D();
    ["editCover", "editBackground", "editGateBackground", "editGalleryBackground", "editGallery1", "editGallery2", "editGallery3", "editWorldBackground", "editWorldItem1", "editWorldItem2", "editWorldItem3", "editWorldItem4", "editWorldItem5", "editWorldItem6", "editMusicFile"].forEach(id => { $(id).value = ""; });
    soundEnabled = currentConfig.soundEnabled !== false;
    soundVolume = (currentConfig.soundVolume ?? 65) / 100;
    localStorage.setItem("kyyeu-sound", soundEnabled ? "on" : "off");
    updateSoundButton();
    applyBackgroundMusic();
    alert("Đã lưu trên trình duyệt này. Để mọi người cùng thấy, hãy tải config.js và cập nhật file trên GitHub.");
  } catch (error) {
    console.error(error);
    alert(error.name === "QuotaExceededError"
      ? "Bộ nhớ trình duyệt đã đầy. Hãy giảm dung lượng ảnh hoặc xóa dữ liệu website cũ trong trình duyệt."
      : (error.message || "Có lỗi khi lưu ảnh."));
  }
});
$("exportConfig").addEventListener("click", downloadConfig);
$("copyConfig")?.addEventListener("click", async () => {
  const source = "/* File được xuất từ trình chỉnh sửa kỷ yếu */\nconst CONFIG = " + JSON.stringify(currentConfig, null, 2) + ";\n";
  try {
    await navigator.clipboard.writeText(source);
    alert("Đã sao chép toàn bộ config.js. Bạn có thể dán vào file config.js trên GitHub.");
  } catch (_) {
    const area = document.createElement("textarea");
    area.value = source; area.style.position = "fixed"; area.style.opacity = "0";
    document.body.appendChild(area); area.select();
    const ok = document.execCommand("copy"); area.remove();
    alert(ok ? "Đã sao chép config.js." : "Không thể sao chép tự động. Hãy dùng nút Tải config.js.");
  }
});


$("quickEdit")?.addEventListener("click", () => { $("adminPanel")?.classList.remove("hidden"); $("adminPanel")?.scrollIntoView({behavior:"smooth",block:"start"}); });

/* Main lobby / restored classic invitation navigation. */
$("openInvitation")?.addEventListener("click", () => {
  $("worldLobby")?.classList.add("hidden");
  $("classicInvitation")?.classList.remove("hidden");
  $("adminPanel")?.classList.toggle("hidden", sessionStorage.getItem(ADMIN_SESSION_KEY) !== "1");
  window.scrollTo({top:0,behavior:"smooth"});
});
$("returnLobby")?.addEventListener("click", () => {
  $("classicInvitation")?.classList.add("hidden");
  $("worldLobby")?.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});



// Hộp xác nhận tham gia và hiệu ứng âm thanh được tạo trực tiếp bằng Web Audio.
let soundEnabled = currentConfig.soundEnabled !== false && localStorage.getItem("kyyeu-sound") !== "off";
let soundVolume = (currentConfig.soundVolume ?? 65) / 100;
let audioContext = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}
function playTone(frequency, start, duration, volume, type = "sine", endFrequency = frequency) {
  if (!soundEnabled) return;
  try {
    const audio = getAudioContext();
    if (!audio) return;
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audio.currentTime + start);
    if (endFrequency !== frequency) osc.frequency.exponentialRampToValueAtTime(endFrequency, audio.currentTime + start + duration);
    gain.gain.setValueAtTime(.0001, audio.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(volume * soundVolume, audio.currentTime + start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + start + duration);
    osc.connect(gain); gain.connect(audio.destination);
    osc.start(audio.currentTime + start); osc.stop(audio.currentTime + start + duration + .02);
  } catch (_) {}
}
function playClickSound() {
  playTone(520, 0, .075, .035, "triangle", 760);
  playTone(1040, .018, .055, .012, "sine", 880);
}
function playOpenSound() {
  playTone(440, 0, .16, .035, "sine", 660);
  playTone(554.37, .10, .19, .03, "sine", 830);
  playTone(659.25, .21, .28, .035, "sine", 987);
}
function playSuccessSound() {
  [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => playTone(note, i * .105, .42, .04, "sine", note * 1.005));
}
function updateSoundButton() {
  const button = $("soundToggle");
  if (!button) return;
  button.textContent = soundEnabled ? "♫ Âm thanh: bật" : "♪ Âm thanh: tắt";
  button.setAttribute("aria-pressed", String(soundEnabled));
}
$("soundToggle")?.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem("kyyeu-sound", soundEnabled ? "on" : "off");
  updateSoundButton();
  if (soundEnabled) { playOpenSound(); startBackgroundMusic(); } else $("bgMusic")?.pause();
  if (currentConfig.musicEnabled !== false) startBackgroundMusic();
});
updateSoundButton();
document.addEventListener("click", event => {
  const button = event.target.closest("button, .rsvp");
  if (button && !button.disabled && button.id !== "soundToggle") playClickSound();
});

// Bọt bong bóng khi bấm và vệt sáng/bong bóng nhỏ chạy theo chuột (chỉ trên thiết bị có chuột).
function spawnBubble(x, y, count = 7, trail = false) {
  if (currentConfig.motionEnabled === false || currentConfig.motionStyle === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement("i");
    bubble.className = trail ? "cursor-bubble cursor-bubble-trail" : "cursor-bubble";
    const angle = Math.random() * Math.PI * 2;
    const distance = trail ? 8 + Math.random() * 18 : 24 + Math.random() * 58;
    bubble.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    bubble.style.setProperty("--dy", `${Math.sin(angle) * distance - (trail ? 8 : 20)}px`);
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.setProperty("--bubble-size", `${trail ? 4 + Math.random() * 5 : 7 + Math.random() * 10}px`);
    document.body.appendChild(bubble);
    bubble.addEventListener("animationend", () => bubble.remove(), { once: true });
  }
}
let lastPointerBubble = 0;
if (window.matchMedia("(pointer: fine)").matches) {
  const cursorGlow = document.createElement("div");
  cursorGlow.className = "cursor-glow";
  cursorGlow.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursorGlow);
  document.addEventListener("pointermove", event => {
    if (currentConfig.motionEnabled === false || currentConfig.motionStyle === "off") {
      cursorGlow.style.opacity = "0";
      return;
    }
    cursorGlow.style.opacity = "1";
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
    /* Disable continuous particle spawning while moving: keep click effects only for smoother rendering. */
  }, { passive: true });
}
document.addEventListener("click", event => {
  if (event.target.closest("button, a, .photo-frame, .gallery-item")) spawnBubble(event.clientX || 0, event.clientY || 0, 5, false);
});

const revealTargets = ".hero-content,.hero-art,.section-heading,.gallery-item,footer";
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll(revealTargets).forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 90}ms`);
    revealObserver.observe(element);
  });
}

$("rsvpLink").addEventListener("click", () => {
  $("confirmText").textContent = `${currentConfig.confirmCopy || "Cảm ơn bạn đã nhận lời."} ${currentGuestName ? `(${currentGuestName})` : ""} Khi xác nhận, thông báo sẽ được gửi tự động.`;
  $("confirmStatus").textContent = "";
  $("confirmYes").disabled = false;
  $("confirmYes").classList.remove("is-sending");
  $("confirmModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
  playOpenSound();
});
function closeConfirmModal() {
  $("confirmModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}
$("confirmNo").addEventListener("click", closeConfirmModal);
$("confirmModal").addEventListener("click", event => {
  if (event.target === $("confirmModal")) closeConfirmModal();
});
let rsvpSending = false;
$("confirmYes").addEventListener("click", async () => {
  if (rsvpSending) return;
  rsvpSending = true;
  const button = $("confirmYes");
  const status = $("confirmStatus");
  button.disabled = true;
  button.classList.add("is-sending");
  button.textContent = "Đang gửi xác nhận…";
  status.textContent = "Đang gửi thông tin đến chủ lời mời. Vui lòng đợi một chút nhé.";
  status.className = "confirm-status is-pending";
  const payload = {
    name: currentGuestName || "Khách mời",
    note: "Đã xác nhận tham gia buổi chụp kỷ yếu.",
    page: location.href,
    submittedAt: new Date().toISOString()
  };
  try {
    // text/plain + no-cors tránh yêu cầu preflight từ trình duyệt khi gọi Apps Script.
    // Response ở chế độ opaque nên chỉ xác nhận yêu cầu đã được gửi đi, không đọc được kết quả MailApp.
    await fetch(RSVP_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    playSuccessSound();
    status.textContent = "Đã gửi yêu cầu xác nhận! Chủ lời mời sẽ nhận thông báo qua Gmail nếu Apps Script đã được cấp quyền và triển khai đúng.";
    status.className = "confirm-status is-success";
    button.textContent = "Đã gửi yêu cầu ♥";
    setTimeout(() => {
      closeConfirmModal();
      button.textContent = currentConfig.confirmYesText || "Đồng ý, mình sẽ tham gia ♥";
      button.disabled = false;
      button.classList.remove("is-sending");
      rsvpSending = false;
    }, 2600);
  } catch (error) {
    console.error("Không gửi được thông báo RSVP:", error);
    status.textContent = "Chưa gửi được thông báo. Bạn hãy thử lại hoặc báo chủ lời mời kiểm tra đường dẫn Apps Script.";
    status.className = "confirm-status is-error";
    button.textContent = currentConfig.confirmYesText || "Thử gửi lại ♥";
    button.disabled = false;
    button.classList.remove("is-sending");
    rsvpSending = false;
  }
});
