const $ = (id) => document.getElementById(id);
const ADMIN_NAME = "khổng tiến anh đẹp trai";
const DB_NAME = "kyyeu_invitation_db";
const DB_STORE = "settings";
const DB_KEY = "site-config";
const ACCOUNT_KEY = "remembered-guest-name";
let currentConfig = { ...CONFIG };
let currentGuestName = "";
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
  $("confirmNote").textContent = currentConfig.confirmNote || "Email sẽ được soạn sẵn; bạn chỉ cần nhấn Gửi trong ứng dụng email.";
  $("coverImage").src = currentConfig.coverImage || "";
  $("rsvpLink").href = "mailto:" + encodeURIComponent(currentConfig.rsvpEmail || "hello@example.com") + "?subject=" + encodeURIComponent("Xác nhận tham gia chụp kỷ yếu");
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
  $("editGalleryTitle").value = currentConfig.galleryTitle || "Một chút|thanh xuân";
  $("editGalleryCopy").value = currentConfig.galleryCopy || "Những khoảnh khắc mong được cùng bạn viết tiếp.";
  $("editConfirmTitle").value = currentConfig.confirmTitle || "Bạn xác nhận tham gia nhé?";
  $("editConfirmYes").value = currentConfig.confirmYesText || "Đồng ý, mình sẽ tham gia ♥";
  $("editConfirmNo").value = currentConfig.confirmNoText || "Để mình suy nghĩ thêm";
  $("editConfirmCopy").value = currentConfig.confirmCopy || "Cảm ơn bạn đã nhận lời. Xác nhận để mở email thông báo cho chủ nhân lời mời.";
  $("editConfirmNote").value = currentConfig.confirmNote || "Email sẽ được soạn sẵn; bạn chỉ cần nhấn Gửi trong ứng dụng email.";
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
  soundEnabled = currentConfig.soundEnabled !== false && localStorage.getItem("kyyeu-sound") !== "off";
  soundVolume = (currentConfig.soundVolume ?? 65) / 100;
  updateSoundButton();
  const remembered = await getRememberedName();
  if (remembered) $("guestName").value = remembered;
});

$("nameForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("guestName").value.trim();
  if (!name) return;
  if ($("rememberName").checked) await setRememberedName(name);
  else await setRememberedName("");
  $("gate").classList.add("hidden");
  $("invitation").classList.remove("hidden");
  currentGuestName = name;
  $("helloLine").textContent = `${currentConfig.greetingPrefix || "Kính chào:"} ${name}`;
  const isAdmin = name.toLocaleLowerCase("vi-VN") === ADMIN_NAME;
  $("adminPanel").classList.toggle("hidden", !isAdmin);
  if (isAdmin) fillEditor();
  playOpenSound();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
$("backBtn").addEventListener("click", () => {
  $("invitation").classList.add("hidden"); $("gate").classList.remove("hidden");
  $("adminPanel").classList.add("hidden"); $("guestName").focus(); window.scrollTo({ top: 0, behavior: "smooth" });
});
$("logoutBtn").addEventListener("click", () => {
  currentGuestName = "";
  $("invitation").classList.add("hidden");
  $("adminPanel").classList.add("hidden");
  $("confirmModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
  $("gate").classList.remove("hidden");
  $("guestName").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
$("closeAdmin").addEventListener("click", () => $("adminPanel").classList.add("hidden"));
$("adminForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const cover = await readImage($("editCover").files[0]);
    const background = await readImage($("editBackground").files[0]);
    const gateBackground = await readImage($("editGateBackground").files[0]);
    const galleryBackground = await readImage($("editGalleryBackground").files[0]);
    const galleryUploads = await Promise.all([1, 2, 3].map(i => readImage($(`editGallery${i}`).files[0])));
    currentConfig = { ...currentConfig,
      siteTitle: $("editSiteTitle").value.trim(), gateButtonText: $("editGateButton").value.trim(),
      gateTinyNote: $("editGateTinyNote").value.trim(), brandText: $("editBrandText").value.trim(),
      galleryEyebrow: $("editGalleryEyebrow").value.trim(), galleryTitle: $("editGalleryTitle").value.trim(),
      galleryCopy: $("editGalleryCopy").value.trim(), confirmTitle: $("editConfirmTitle").value.trim(),
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
      ...(cover ? { coverImage: cover } : {}), ...(background ? { backgroundImage: background } : {}),
      ...(gateBackground ? { gateBackgroundImage: gateBackground } : {}),
      ...(galleryBackground ? { galleryBackgroundImage: galleryBackground } : {}),
      gallery: (currentConfig.gallery || []).map((item, index) => ({
        ...item, caption: $(`editCaption${index + 1}`).value.trim(),
        ...(galleryUploads[index] ? { image: galleryUploads[index] } : {})
      }))
    };
    await saveConfigToDB(currentConfig);
    applyConfig();
    ["editCover", "editBackground", "editGateBackground", "editGalleryBackground", "editGallery1", "editGallery2", "editGallery3"].forEach(id => { $(id).value = ""; });
    soundEnabled = currentConfig.soundEnabled !== false;
    soundVolume = (currentConfig.soundVolume ?? 65) / 100;
    localStorage.setItem("kyyeu-sound", soundEnabled ? "on" : "off");
    updateSoundButton();
    alert("Đã lưu thay đổi trên trình duyệt này!");
  } catch (error) {
    console.error(error);
    alert(error.name === "QuotaExceededError"
      ? "Bộ nhớ trình duyệt đã đầy. Hãy giảm dung lượng ảnh hoặc xóa dữ liệu website cũ trong trình duyệt."
      : (error.message || "Có lỗi khi lưu ảnh."));
  }
});
$("exportConfig").addEventListener("click", downloadConfig);


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
  if (soundEnabled) playOpenSound();
});
updateSoundButton();
document.addEventListener("click", event => {
  const button = event.target.closest("button, .rsvp");
  if (button && !button.disabled && button.id !== "soundToggle") playClickSound();
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
  $("confirmText").textContent = `${currentConfig.confirmCopy || "Cảm ơn bạn đã nhận lời."} ${currentGuestName ? `(${currentGuestName})` : ""} Sau khi xác nhận, email thông báo sẽ được soạn sẵn.`;
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
$("confirmYes").addEventListener("click", () => {
  const recipient = currentConfig.rsvpEmail || "khongtienanhlrtt@gmail.com";
  const subject = `Xác nhận tham gia chụp kỷ yếu - ${currentGuestName}`;
  const body = `Xin chào Khổng Tiến Anh,\n\nMình là ${currentGuestName}. Mình xác nhận sẽ tham gia buổi chụp kỷ yếu.\n\nCảm ơn bạn đã mời mình!`;
  const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  closeConfirmModal();
  playSuccessSound();
  window.location.href = mailto;
});
