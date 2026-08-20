/* =========================================================
   AI Disease Surveillance & Response Platform
   Field Tracking — mock real-time spray-team tracking map / AI
   vision photo QC grid (separate script: own DOM/state, no
   cross-page import; team/zone names align with the mock areas
   in control-plan.js but are a fresh mock dataset here, per
   BUILD-PLAN.md assumption for รอบ 4)
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Status order for "จำลองอัปเดตตำแหน่ง": ยังไม่ถึง -> กำลังพ่น -> พ่นแล้ว.
     Positions are abstract percentages (0-100) on the same
     640x380 village-grid canvas used in case-intake.js/case-analysis.js.
     depot = starting/base position, zoneCenter = the planned spray
     zone's center; the pin's current position moves from depot
     towards zoneCenter as status advances (mock, no real GPS log).
     --------------------------------------------------------- */
  var STATUS_ORDER = ["not_arrived", "spraying", "done"];
  var STATUS_LABEL = { not_arrived: "ยังไม่ถึงพื้นที่", spraying: "กำลังพ่น", done: "พ่นแล้ว" };
  var STATUS_BADGE_CLASS = { not_arrived: "badge-neutral", spraying: "badge-inprogress", done: "badge-success" };
  var STATUS_PIN_CLASS = { not_arrived: "pin-not-arrived", spraying: "pin-spraying", done: "pin-done" };

  var TEAMS = [
    {
      id: 1,
      name: "ทีมพ่น 1",
      zoneName: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์",
      zoneColor: "#8A9A5B", // --color-secondary
      radius: 60,
      depot: { x: 6, y: 90 },
      zoneCenter: { x: 22, y: 50 },
      status: "spraying",
      lastUpdateLabel: "20 ส.ค. 2569, 09:20 น."
    },
    {
      id: 2,
      name: "ทีมพ่น 2",
      zoneName: "ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา",
      zoneColor: "#C9A66B", // --color-accent
      radius: 50,
      depot: { x: 6, y: 90 },
      zoneCenter: { x: 30, y: 78 },
      status: "not_arrived",
      lastUpdateLabel: "20 ส.ค. 2569, 08:45 น."
    },
    {
      id: 3,
      name: "ทีมพ่น 3",
      zoneName: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่ + ศูนย์เด็กเล็ก",
      zoneColor: "#7A6A53", // --color-primary
      radius: 55,
      depot: { x: 94, y: 6 },
      zoneCenter: { x: 62, y: 25 },
      status: "done",
      lastUpdateLabel: "19 ส.ค. 2569, 15:10 น."
    },
    {
      id: 4,
      name: "ทีมพ่น 4",
      zoneName: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย",
      zoneColor: "#8A9A5B", // --color-secondary
      radius: 50,
      depot: { x: 94, y: 6 },
      zoneCenter: { x: 75, y: 65 },
      status: "not_arrived",
      lastUpdateLabel: "20 ส.ค. 2569, 08:50 น."
    }
  ];

  function getTeamById(id) {
    for (var i = 0; i < TEAMS.length; i++) {
      if (TEAMS[i].id === id) return TEAMS[i];
    }
    return null;
  }

  function currentPos(team) {
    if (team.status === "not_arrived") return team.depot;
    if (team.status === "done") return team.zoneCenter;
    return { x: (team.depot.x + team.zoneCenter.x) / 2, y: (team.depot.y + team.zoneCenter.y) / 2 };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------------------------------------------------------
     Thai date/time formatting for "now" timestamps
     --------------------------------------------------------- */
  var THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  function pad2(n) { return n < 10 ? "0" + n : String(n); }

  function formatThaiDateTime(date) {
    var d = date.getDate();
    var m = THAI_MONTHS[date.getMonth()];
    var y = date.getFullYear() + 543;
    return d + " " + m + " " + y + ", " + pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + " น.";
  }

  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';
  var ICON_REFRESH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path></svg>';
  var ICON_CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"></path><circle cx="12" cy="13" r="4"></circle></svg>';

  /* ---------------------------------------------------------
     Mock field photos — AI vision QC results (location/time match
     against the planned spray zone & workplan schedule). 6 pass,
     2 fail, matching BUILD-PLAN.md assumption ("รูปเป็น placeholder
     icon ไม่ใช่ไฟล์รูปจริง").
     --------------------------------------------------------- */
  var PHOTOS = [
    { id: 1, team: "ทีมพ่น 1", timeLabel: "20 ส.ค. 2569, 09:15 น.", area: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์", locationMatch: true, timeMatch: true, manualChecked: false },
    { id: 2, team: "ทีมพ่น 1", timeLabel: "20 ส.ค. 2569, 09:42 น.", area: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์", locationMatch: true, timeMatch: true, manualChecked: false },
    { id: 3, team: "ทีมพ่น 2", timeLabel: "20 ส.ค. 2569, 10:05 น.", area: "ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา", locationMatch: false, locationNote: "พิกัดภาพห่างจากขอบเขตพื้นที่ที่วางแผน ~850 เมตร", timeMatch: true, manualChecked: false },
    { id: 4, team: "ทีมพ่น 3", timeLabel: "19 ส.ค. 2569, 14:20 น.", area: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่", locationMatch: true, timeMatch: true, manualChecked: false },
    { id: 5, team: "ทีมพ่น 3", timeLabel: "19 ส.ค. 2569, 14:55 น.", area: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่", locationMatch: true, timeMatch: true, manualChecked: false },
    { id: 6, team: "ทีมพ่น 4", timeLabel: "20 ส.ค. 2569, 08:50 น.", area: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย", locationMatch: true, timeMatch: false, timeNote: "ถ่ายก่อนเวลาปฏิบัติงานที่แจ้งไว้ประมาณ 40 นาที", manualChecked: false },
    { id: 7, team: "ทีมพ่น 4", timeLabel: "20 ส.ค. 2569, 09:30 น.", area: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย", locationMatch: true, timeMatch: true, manualChecked: false },
    { id: 8, team: "ทีมพ่น 2", timeLabel: "20 ส.ค. 2569, 10:30 น.", area: "ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา", locationMatch: true, timeMatch: true, manualChecked: false }
  ];

  function getPhotoById(id) {
    for (var i = 0; i < PHOTOS.length; i++) {
      if (PHOTOS[i].id === id) return PHOTOS[i];
    }
    return null;
  }

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    trackingMapSubtitle: document.getElementById("tracking-map-subtitle"),
    trackingMapWrap: document.getElementById("tracking-map-wrap"),
    teamListSubtitle: document.getElementById("team-list-subtitle"),
    teamList: document.getElementById("team-list"),
    photoGridSubtitle: document.getElementById("photo-grid-subtitle"),
    photoGrid: document.getElementById("photo-grid")
  };

  /* ---------------------------------------------------------
     Render: Real-time tracking map (inline SVG — abstract village
     grid reused from case-intake.js/case-analysis.js, dashed
     ellipse per planned spray zone + colored pin per team's
     current status)
     --------------------------------------------------------- */
  function buildTrackingMapSVG() {
    var W = 640, H = 380;
    var parts = [];

    parts.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="แผนที่ติดตามทีมพ่นเทียบกับโซนที่วางแผนไว้">');
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#F5F1EA" stroke="#DCD3C4" stroke-width="1"></rect>');

    var step = 64;
    for (var gx = step; gx < W; gx += step) {
      parts.push('<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + H + '" stroke="#DCD3C4" stroke-width="1" stroke-opacity="0.6"></line>');
    }
    for (var gy = step; gy < H; gy += step) {
      parts.push('<line x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="#DCD3C4" stroke-width="1" stroke-opacity="0.6"></line>');
    }

    parts.push('<line x1="0" y1="' + (H * 0.6) + '" x2="' + W + '" y2="' + (H * 0.48) + '" stroke="#B3A996" stroke-width="3" stroke-dasharray="10 8" stroke-opacity="0.6"></line>');
    parts.push('<text x="12" y="20" font-size="11" fill="#6E6355" font-family="Inter, system-ui, sans-serif">แผนที่จำลอง — ไม่อ้างอิงพิกัดจริง</text>');

    var pinColorMap = { not_arrived: "#B3A996", spraying: "#C9A66B", done: "#6B8E5A" };

    // Planned spray zones (dashed ellipses), drawn first behind pins
    TEAMS.forEach(function (team) {
      var cx = (team.zoneCenter.x / 100) * W;
      var cy = (team.zoneCenter.y / 100) * H;
      var r = team.radius;
      parts.push('<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 0.72) + '" fill="' + team.zoneColor + '" fill-opacity="0.10" stroke="' + team.zoneColor + '" stroke-width="1.5" stroke-dasharray="6 5"></ellipse>');
      parts.push('<text x="' + cx + '" y="' + (cy - r * 0.72 - 10) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#33291F" font-family="Inter, system-ui, sans-serif">' + escapeHtml(team.name) + '</text>');
      parts.push('<text x="' + cx + '" y="' + (cy - r * 0.72 + 4) + '" text-anchor="middle" font-size="9" fill="#6E6355" font-family="Inter, system-ui, sans-serif">' + escapeHtml(team.zoneName) + '</text>');
    });

    // Team pins on top, at current position based on status
    TEAMS.forEach(function (team) {
      var pos = currentPos(team);
      var px = (pos.x / 100) * W;
      var py = (pos.y / 100) * H;
      var color = pinColorMap[team.status];

      parts.push('<g class="team-pin-group">');
      parts.push('<circle cx="' + px + '" cy="' + py + '" r="8" fill="' + color + '" fill-opacity="0.18" stroke="' + color + '" stroke-width="1.5"></circle>');
      parts.push('<circle cx="' + px + '" cy="' + py + '" r="6" fill="' + color + '"></circle>');
      parts.push('<text x="' + px + '" y="' + (py + 20) + '" text-anchor="middle" font-size="10" font-weight="600" fill="#33291F" font-family="Inter, system-ui, sans-serif">' + escapeHtml(team.name) + '</text>');
      parts.push('<title>' + escapeHtml(team.name) + ' — ' + escapeHtml(team.zoneName) + ' · ' + STATUS_LABEL[team.status] + ' · อัปเดตล่าสุด ' + escapeHtml(team.lastUpdateLabel) + '</title>');
      parts.push('</g>');
    });

    parts.push('</svg>');
    return parts.join('');
  }

  function renderTrackingMap() {
    els.trackingMapWrap.innerHTML = buildTrackingMapSVG();
    var doneCount = TEAMS.filter(function (t) { return t.status === "done"; }).length;
    els.trackingMapSubtitle.textContent = TEAMS.length + " ทีม · พ่นแล้ว " + doneCount + " ทีม (จำลอง เนื่องจาก LINE ไม่มี continuous location API จริง)";
  }

  /* ---------------------------------------------------------
     Render: Team list (side panel — status + last update +
     "จำลองอัปเดตตำแหน่ง" action)
     --------------------------------------------------------- */
  function renderTeamList() {
    var doneCount = TEAMS.filter(function (t) { return t.status === "done"; }).length;
    els.teamListSubtitle.textContent = doneCount + " จาก " + TEAMS.length + " ทีมพ่นเสร็จแล้ว";

    els.teamList.innerHTML = "";
    TEAMS.forEach(function (team) {
      var item = document.createElement("div");
      item.className = "team-item";
      item.innerHTML =
        '<div class="team-item-top">' +
          '<span class="team-name">' + escapeHtml(team.name) + '</span>' +
          '<span class="badge ' + STATUS_BADGE_CLASS[team.status] + '">' + STATUS_LABEL[team.status] + '</span>' +
        '</div>' +
        '<div class="team-meta">' +
          '<span>พื้นที่รับผิดชอบ: ' + escapeHtml(team.zoneName) + '</span>' +
          '<span>อัปเดตล่าสุด: ' + escapeHtml(team.lastUpdateLabel) + '</span>' +
        '</div>' +
        '<div class="team-actions">' +
          (team.status === "done"
            ? '<span class="confirmed-check">' + ICON_CHECK + 'ปฏิบัติงานเสร็จสิ้น</span>'
            : '<button type="button" class="btn btn-outline btn-sm btn-advance-status" data-team-id="' + team.id + '">' + ICON_REFRESH + 'จำลองอัปเดตตำแหน่ง</button>') +
        '</div>';
      els.teamList.appendChild(item);
    });
  }

  function advanceTeamStatus(id) {
    var team = getTeamById(id);
    if (!team) return;
    var idx = STATUS_ORDER.indexOf(team.status);
    if (idx === -1 || idx >= STATUS_ORDER.length - 1) return;

    team.status = STATUS_ORDER[idx + 1];
    team.lastUpdateLabel = formatThaiDateTime(new Date());

    renderTrackingMap();
    renderTeamList();
  }

  /* ---------------------------------------------------------
     Render: AI vision QC photo grid
     --------------------------------------------------------- */
  function matchBadgeHtml(isMatch, label) {
    return isMatch
      ? '<span class="badge badge-success">' + escapeHtml(label) + 'ตรง</span>'
      : '<span class="badge badge-warning">' + escapeHtml(label) + 'ไม่ตรง</span>';
  }

  function renderPhotoGrid() {
    var failCount = PHOTOS.filter(function (p) { return !p.locationMatch || !p.timeMatch; }).length;
    els.photoGridSubtitle.textContent = PHOTOS.length + " รูป · ผ่านการตรวจสอบอัตโนมัติ " + (PHOTOS.length - failCount) + " รูป · ต้องตรวจสอบเพิ่มเติม " + failCount + " รูป";

    els.photoGrid.innerHTML = "";
    PHOTOS.forEach(function (p) {
      var needsCheck = !p.locationMatch || !p.timeMatch;
      var card = document.createElement("div");
      card.className = "photo-card";

      var badgesHtml =
        matchBadgeHtml(p.locationMatch, "พิกัด") +
        (!p.locationMatch && p.locationNote ? '<span class="photo-card-badge-note">' + escapeHtml(p.locationNote) + '</span>' : "") +
        matchBadgeHtml(p.timeMatch, "เวลา") +
        (!p.timeMatch && p.timeNote ? '<span class="photo-card-badge-note">' + escapeHtml(p.timeNote) + '</span>' : "");

      var actionHtml = "";
      if (needsCheck) {
        actionHtml = p.manualChecked
          ? '<span class="badge badge-success">' + ICON_CHECK + 'ตรวจสอบแล้ว</span>'
          : '<button type="button" class="btn btn-outline btn-sm btn-manual-check" data-photo-id="' + p.id + '">ตรวจสอบด้วยมือ</button>';
      }

      card.innerHTML =
        '<div class="photo-card-thumb">' + ICON_CAMERA + '</div>' +
        '<div class="photo-card-body">' +
          '<span class="photo-card-team">' + escapeHtml(p.team) + '</span>' +
          '<span class="photo-card-meta">' +
            '<span>ถ่ายเมื่อ ' + escapeHtml(p.timeLabel) + '</span>' +
            '<span>พื้นที่ที่ควรพ่น: ' + escapeHtml(p.area) + '</span>' +
          '</span>' +
          '<span class="photo-card-badges">' + badgesHtml + '</span>' +
          (actionHtml ? '<span class="photo-card-actions">' + actionHtml + '</span>' : "") +
        '</div>';
      els.photoGrid.appendChild(card);
    });
  }

  function manualCheckPhoto(id) {
    var photo = getPhotoById(id);
    if (!photo || photo.manualChecked) return;
    photo.manualChecked = true;
    renderPhotoGrid();
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */
  function initEvents() {
    els.teamList.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-advance-status");
      if (btn) advanceTeamStatus(parseInt(btn.getAttribute("data-team-id"), 10));
    });

    els.photoGrid.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-manual-check");
      if (btn) manualCheckPhoto(parseInt(btn.getAttribute("data-photo-id"), 10));
    });
  }

  function init() {
    renderTrackingMap();
    renderTeamList();
    renderPhotoGrid();
    initEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
