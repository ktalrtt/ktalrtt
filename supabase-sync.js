/* Realtime presence for the shared yearbook lobby. Uses only the public publishable key. */
(() => {
  const cfg = window.YEARBOOK_SUPABASE || {};
  if (!cfg.url || !cfg.publishableKey || !window.supabase?.createClient) {
    console.warn("Supabase chưa được cấu hình. Kiểm tra supabase-config.js và kết nối mạng.");
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    realtime: { params: { eventsPerSecond: 5 } }
  });
  const roomId = "yearbook-main-lobby";
  const storageKey = "kyyeu-realtime-client-id";
  let clientId = localStorage.getItem(storageKey);
  if (!clientId) {
    clientId = window.crypto?.randomUUID?.() || ("guest-" + Math.random().toString(36).slice(2));
    localStorage.setItem(storageKey, clientId);
  }
  let channel = null;
  let currentName = "";
  let joined = false;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function ensurePanel() {
    if (document.getElementById("realtimeLobbyPanel")) return;
    const stage = document.getElementById("worldStage");
    if (!stage) return;
    const panel = document.createElement("section");
    panel.id = "realtimeLobbyPanel";
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML = '<div class="rt-head"><div><span class="rt-kicker">LIVE CLASSROOM</span><h2>Thành viên đang có mặt</h2></div><span class="rt-count" id="rtCount">0 online</span></div><div class="rt-members" id="rtMembers"><span class="rt-muted">Đang kết nối sảnh chung…</span></div><p class="rt-status" id="rtStatus">Đang khởi tạo kết nối thời gian thực…</p>';
    stage.insertAdjacentElement("afterend", panel);
    const style = document.createElement("style");
    style.textContent = '#realtimeLobbyPanel{position:relative;z-index:3;width:min(100% - 32px,1000px);margin:18px auto 30px;padding:20px 22px;border:1px solid #ffffff24;border-radius:18px;background:linear-gradient(135deg,#11172beF,#211b35ed);color:#fff;box-shadow:0 18px 50px #080b1b35}#realtimeLobbyPanel .rt-head{display:flex;align-items:center;justify-content:space-between;gap:12px}#realtimeLobbyPanel .rt-kicker{font-size:9px;letter-spacing:.2em;color:#d9b98d}#realtimeLobbyPanel h2{font-size:clamp(17px,2.5vw,22px);margin:6px 0 0;color:#fff}#realtimeLobbyPanel .rt-count{white-space:nowrap;border:1px solid #b7e4ca55;border-radius:99px;padding:7px 11px;color:#b7e4ca;font-size:11px}#realtimeLobbyPanel .rt-members{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;min-height:34px}#realtimeLobbyPanel .rt-person{display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid #ffffff20;border-radius:99px;background:#ffffff0c;font-size:12px}#realtimeLobbyPanel .rt-dot{width:7px;height:7px;border-radius:50%;background:#8de0ad;box-shadow:0 0 10px #8de0ad}#realtimeLobbyPanel .rt-muted,#realtimeLobbyPanel .rt-status{color:#c4c4d2;font-size:11px}#realtimeLobbyPanel .rt-status{margin:13px 0 0;opacity:.8}@media(max-width:600px){#realtimeLobbyPanel{padding:16px;margin:14px auto 22px}#realtimeLobbyPanel .rt-person{font-size:11px}}';
    document.head.appendChild(style);
  }

  function renderPresence() {
    ensurePanel();
    const membersEl = document.getElementById("rtMembers");
    const countEl = document.getElementById("rtCount");
    if (!membersEl || !countEl || !channel) return;
    const state = channel.presenceState();
    const members = Object.values(state).flat().map(item => item || {}).filter(item => item.name);
    members.sort((a,b) => String(a.name).localeCompare(String(b.name), "vi"));
    countEl.textContent = members.length + " online";
    membersEl.innerHTML = members.length
      ? members.map(item => '<span class="rt-person"><i class="rt-dot"></i>' + escapeHtml(item.name) + (item.client_id === clientId ? ' <b>(bạn)</b>' : '') + '</span>').join("")
      : '<span class="rt-muted">Chưa có ai trong sảnh. Hãy mời bạn bè cùng tham gia nhé!</span>';
  }

  function setStatus(message, good = false) {
    ensurePanel();
    const el = document.getElementById("rtStatus");
    if (el) { el.textContent = message; el.style.color = good ? "#b7e4ca" : "#c4c4d2"; }
  }

  async function joinRoom(name) {
    currentName = String(name || "").trim().slice(0, 50);
    if (!currentName) return;
    ensurePanel();
    if (channel) {
      try { await channel.untrack(); } catch (_) {}
      try { await client.removeChannel(channel); } catch (_) {}
      channel = null;
    }
    joined = false;
    setStatus("Đang kết nối sảnh chung…");
    channel = client.channel(roomId, { config: { presence: { key: clientId } } });
    channel.on("presence", { event: "sync" }, renderPresence);
    channel.on("presence", { event: "join" }, renderPresence);
    channel.on("presence", { event: "leave" }, renderPresence);
    channel.subscribe(async status => {
      if (status === "SUBSCRIBED") {
        try {
          await channel.track({ name: currentName, client_id: clientId, joined_at: new Date().toISOString() });
          joined = true;
          setStatus("Đã kết nối sảnh chung. Danh sách sẽ tự cập nhật khi có người vào hoặc rời đi.", true);
          renderPresence();
        } catch (error) {
          console.error("Không thể tham gia sảnh Realtime:", error);
          setStatus("Kết nối được nhưng chưa thể đăng ký trạng thái online. Hãy tải lại trang.");
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        joined = false;
        setStatus("Mất kết nối thời gian thực. Kiểm tra cấu hình Supabase hoặc tải lại trang.");
      }
    });
  }

  async function leaveRoom() {
    joined = false;
    if (!channel) return;
    try { await channel.untrack(); } catch (_) {}
    try { await client.removeChannel(channel); } catch (_) {}
    channel = null;
    const panel = document.getElementById("realtimeLobbyPanel");
    if (panel) panel.remove();
  }

  document.getElementById("nameForm")?.addEventListener("submit", event => {
    const input = document.getElementById("guestName");
    const name = input?.value?.trim();
    if (name) joinRoom(name);
  });
  document.getElementById("logoutBtn")?.addEventListener("click", leaveRoom);

  // Restore the presence after a refresh when the guest session is still active.
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      if (sessionStorage.getItem("kyyeu-entered-session") === "1") {
        joinRoom(sessionStorage.getItem("kyyeu-guest-name") || localStorage.getItem("remembered-guest-name") || "Khách");
      }
    }, 900);
  });
  window.addEventListener("pagehide", () => {
    if (channel) { try { channel.untrack(); } catch (_) {} }
  });
})();
