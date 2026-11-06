const $ = (id) => document.getElementById(id);
const ADMIN_NAME = "khổng tiến anh đẹp trai";
const STORAGE_KEY = "kyyeu_invitation_custom_config_v1";
let currentConfig = { ...CONFIG };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (saved) currentConfig = { ...currentConfig, ...saved };
} catch (_) {}

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
  $("mainEyebrow").textContent = currentConfig.mainEyebrow || "";
  $("helloLine").textContent = currentConfig.invitationLine || "Khổng Tiến Anh trân trọng mời bạn đi dự kỷ yếu";
  setLines("mainTitle", currentConfig.mainTitle);
  $("mainMessage").textContent = currentConfig.mainMessage || "";
  $("eventDate").textContent = currentConfig.eventDate || "";
  $("eventPlace").textContent = currentConfig.eventPlace || "";
  $("footerNote").textContent = currentConfig.footerNote || "";
  $("coverImage").src = currentConfig.coverImage || "";
  $("rsvpLink").href = "mailto:" + encodeURIComponent(currentConfig.rsvpEmail || "hello@example.com") + "?subject=" + encodeURIComponent("Xác nhận tham gia chụp kỷ yếu");
  $("rsvpLink").innerHTML = `${escapeHtml(currentConfig.buttonText || "Chấp nhận lời mời")} <span>↗</span>`;
  document.documentElement.style.setProperty("--site-font", `"${currentConfig.fontFamily || "DM Sans"}", sans-serif`);
  document.body.style.backgroundImage = currentConfig.backgroundImage ? `linear-gradient(rgba(251,247,243,.78),rgba(251,247,243,.78)),url("${currentConfig.backgroundImage}")` : "";
  $("gallery").innerHTML = (currentConfig.gallery || []).map((item, i) => `<figure class="gallery-item"><img src="${item.image}" alt="Khoảnh khắc kỷ yếu ${i + 1}"><figcaption><span>0${i + 1}</span>${escapeHtml(item.caption)}</figcaption></figure>`).join("");
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fillEditor() {
  $("editInvitationLine").value = currentConfig.invitationLine || "";
  $("editMainTitle").value = currentConfig.mainTitle || "";
  $("editMessage").value = currentConfig.mainMessage || "";
  $("editDate").value = currentConfig.eventDate || "";
  $("editPlace").value = currentConfig.eventPlace || "";
  $("editButtonText").value = currentConfig.buttonText || "Chấp nhận lời mời";
  $("editFont").value = currentConfig.fontFamily || "DM Sans";
}
function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith("image/")) return reject(new Error("Vui lòng chọn một tệp ảnh."));
    if (file.size > 3 * 1024 * 1024) return reject(new Error("Ảnh tối đa 3 MB để file cấu hình không quá lớn."));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không đọc được ảnh."));
    reader.readAsDataURL(file);
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

$("nameForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("guestName").value.trim();
  if (!name) return;
  $("gate").classList.add("hidden");
  $("invitation").classList.remove("hidden");
  const isAdmin = name.toLocaleLowerCase("vi-VN") === ADMIN_NAME;
  $("adminPanel").classList.toggle("hidden", !isAdmin);
  if (isAdmin) fillEditor();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
$("backBtn").addEventListener("click", () => {
  $("invitation").classList.add("hidden"); $("gate").classList.remove("hidden");
  $("adminPanel").classList.add("hidden"); $("guestName").focus(); window.scrollTo({ top: 0, behavior: "smooth" });
});
$("closeAdmin").addEventListener("click", () => $("adminPanel").classList.add("hidden"));
$("adminForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const cover = await readImage($("editCover").files[0]);
    const background = await readImage($("editBackground").files[0]);
    currentConfig = { ...currentConfig,
      invitationLine: $("editInvitationLine").value.trim(), mainTitle: $("editMainTitle").value.trim(),
      mainMessage: $("editMessage").value.trim(), eventDate: $("editDate").value.trim(),
      eventPlace: $("editPlace").value.trim(), buttonText: $("editButtonText").value.trim(),
      fontFamily: $("editFont").value,
      ...(cover ? { coverImage: cover } : {}), ...(background ? { backgroundImage: background } : {})
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
    applyConfig(); alert("Đã lưu thay đổi trên trình duyệt này!");
  } catch (error) { alert(error.message || "Có lỗi khi lưu ảnh."); }
});
$("exportConfig").addEventListener("click", downloadConfig);
