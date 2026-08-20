/* =========================================================
   AI Disease Surveillance & Response Platform
   Control Plan — mock approval-request drafting / control workplan
   drafting (separate script: own DOM/state, no cross-page import;
   area names are kept consistent with case-analysis.js/case-intake.js
   mock data but not read from their live state, per BUILD-PLAN.md
   assumption for รอบ 4)
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Mock areas eligible for chemical spraying / vector control —
     names/context align with the confirmed clusters in
     case-analysis.js (ต.หนองบัว, ต.บ้านเป็ด) and the dengue case
     seeded in case-intake.js (ต.เกาะแก้ว), kept as a fresh mock
     dataset here rather than importing cross-page state.

     รอบ 9 (2026-08-20): each area now has 2 selectable locations —
     "home" (ที่อยู่/บ้านผู้ป่วย) and "work" (สถานที่ทำงาน/เรียน) —
     each with its own mock map coordinate (mockX/mockY, 0-100, for
     the mini-map SVG only — not a real geographic coordinate) and
     baseHouseholdsAt100m: a mock household-density figure at a
     100m radius, used to scale the "households affected" number
     as (radius/100)^2 when the user picks a wider radius. Home
     locations' baseHouseholdsAt100m is back-calculated so that,
     at each area's original default radius, the household count
     matches the figure hardcoded before this round (86/54/40/48).
     --------------------------------------------------------- */
  var AREAS = [
    {
      id: 1,
      name: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์",
      clusterRef: "กลุ่มไข้เลือดออก ต.หนองบัว (ยืนยันแล้ว)",
      riskLevel: "สูง",
      locations: [
        { type: "home", label: "ที่อยู่ (บ้าน)", mockX: 15, mockY: 25, baseHouseholdsAt100m: 38, defaultRadius: 150 },
        { type: "work", label: "สถานที่ทำงาน/เรียน", name: "โรงเรียนบ้านโนนสวรรค์", mockX: 22, mockY: 15, baseHouseholdsAt100m: 25, defaultRadius: 100 }
      ]
    },
    {
      id: 2,
      name: "ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา",
      clusterRef: "กลุ่มไข้เลือดออก ต.หนองบัว (ยืนยันแล้ว)",
      riskLevel: "สูง",
      locations: [
        { type: "home", label: "ที่อยู่ (บ้าน)", mockX: 30, mockY: 55, baseHouseholdsAt100m: 54, defaultRadius: 100 },
        { type: "work", label: "สถานที่ทำงาน/เรียน", name: "ตลาดสดหนองบัวพัฒนา", mockX: 38, mockY: 62, baseHouseholdsAt100m: 32, defaultRadius: 100 }
      ]
    },
    {
      id: 3,
      name: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่ + ศูนย์เด็กเล็ก",
      clusterRef: "กลุ่มมือ เท้า ปาก ต.บ้านเป็ด (รอยืนยัน)",
      riskLevel: "ปานกลาง",
      locations: [
        { type: "home", label: "ที่อยู่ (บ้าน)", mockX: 62, mockY: 20, baseHouseholdsAt100m: 40, defaultRadius: 100 },
        { type: "work", label: "สถานที่ทำงาน/เรียน", name: "ศูนย์พัฒนาเด็กเล็กบ้านเป็ด", mockX: 70, mockY: 28, baseHouseholdsAt100m: 45, defaultRadius: 100 }
      ]
    },
    {
      id: 4,
      name: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย",
      clusterRef: "เคสไข้เลือดออกยืนยันใหม่ (จาก Case Intake)",
      riskLevel: "ปานกลาง",
      locations: [
        { type: "home", label: "ที่อยู่ (บ้าน)", mockX: 80, mockY: 70, baseHouseholdsAt100m: 48, defaultRadius: 100 },
        { type: "work", label: "สถานที่ทำงาน/เรียน", name: "แพปลาชุมชนบ้านหาดทราย", mockX: 88, mockY: 78, baseHouseholdsAt100m: 20, defaultRadius: 100 }
      ]
    }
  ];

  var RADIUS_OPTIONS = [100, 150, 200];

  // Pre-select the "home" location of every area by default — replicates the
  // previous demo (all 4 areas had a usable default) now that the workplan
  // table (รอบ 9) reads its team<->area binding from this same selection pool
  // instead of a hardcoded getAreaById() reference.
  var selectedKeys = ["1-home", "2-home", "3-home", "4-home"];

  // radius chosen per (area+location) key — lazily defaulted from
  // location.defaultRadius the first time a key is read.
  var radiusByKey = {};

  function getAreaById(id) {
    for (var i = 0; i < AREAS.length; i++) {
      if (AREAS[i].id === id) return AREAS[i];
    }
    return null;
  }

  function getLocationKey(areaId, locType) {
    return areaId + "-" + locType;
  }

  function findLocation(areaId, locType) {
    var area = getAreaById(areaId);
    if (!area) return null;
    for (var i = 0; i < area.locations.length; i++) {
      if (area.locations[i].type === locType) return area.locations[i];
    }
    return null;
  }

  function getRadiusForKey(key, loc) {
    if (radiusByKey[key] === undefined) radiusByKey[key] = loc.defaultRadius || 100;
    return radiusByKey[key];
  }

  function computeHouseholds(loc, radius) {
    return Math.round(loc.baseHouseholdsAt100m * Math.pow(radius / 100, 2));
  }

  /* ---------------------------------------------------------
     Pool of currently-selected (area + location) items, each with
     the radius/household figures resolved from current state.
     Shared by both the approval-draft panel and the workplan
     schedule table below.
     --------------------------------------------------------- */
  function getSelectedPool() {
    var pool = [];
    AREAS.forEach(function (area) {
      area.locations.forEach(function (loc) {
        var key = getLocationKey(area.id, loc.type);
        if (selectedKeys.indexOf(key) === -1) return;
        var radius = getRadiusForKey(key, loc);
        pool.push({
          key: key,
          area: area,
          loc: loc,
          radius: radius,
          households: computeHouseholds(loc, radius)
        });
      });
    });
    return pool;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function locDescriptor(loc) {
    return loc.type === "home" ? "ที่อยู่ (บ้าน)" : ("สถานที่ทำงาน/เรียน: " + loc.name);
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

  function formatThaiDate(date) {
    var d = date.getDate();
    var m = THAI_MONTHS[date.getMonth()];
    var y = date.getFullYear() + 543;
    return d + " " + m + " " + y;
  }

  /* ---------------------------------------------------------
     Date-input (<input type="date">) helpers — parse/format the
     "YYYY-MM-DD" value using local date components (avoids the
     UTC-midnight parsing pitfall of `new Date(str)`).
     --------------------------------------------------------- */
  function toDateInputValue(date) {
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
  }

  function parseDateInputValue(str) {
    var parts = String(str).split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  /* ---------------------------------------------------------
     24-hour time <select> options — guarantees a 24h display
     regardless of browser/OS locale (native <input type="time">
     can render an AM/PM picker on some locales).
     --------------------------------------------------------- */
  var HOUR_OPTIONS = [];
  for (var _h = 0; _h < 24; _h++) HOUR_OPTIONS.push(pad2(_h));
  var MINUTE_OPTIONS = ["00", "15", "30", "45"];

  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"></path><path d="M22 2 15 22l-4-9-9-4 20-7Z"></path></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    areaSelectList: document.getElementById("area-select-list"),
    areaSelectSummary: document.getElementById("area-select-summary"),
    miniMapWrap: document.getElementById("control-plan-mini-map-wrap"),
    btnGenerateApproval: document.getElementById("btn-generate-approval"),
    approvalTextarea: document.getElementById("approval-textarea"),
    btnSendApproval: document.getElementById("btn-send-approval"),
    btnMockApprove: document.getElementById("btn-mock-approve"),
    approvalStatus: document.getElementById("approval-status"),
    btnGenerateWorkplan: document.getElementById("btn-generate-workplan"),
    workplanTextarea: document.getElementById("workplan-textarea"),
    btnConfirmWorkplan: document.getElementById("btn-confirm-workplan"),
    workplanStatus: document.getElementById("workplan-status"),
    workplanScheduleBody: document.getElementById("workplan-schedule-body")
  };

  /* ---------------------------------------------------------
     Control workplan schedule state — one row per spray team
     (1-4), each with an editable date + 24h hour/minute select.
     Default values replicate the old hardcoded logic (team 1-2 =
     tomorrow, team 3-4 = day after tomorrow, 08:00 / 09:00) but
     no longer store an `area` object directly — instead each row
     is bound (boundKey) to one of the (area+location) items the
     user has checked in the area-select panel above, resolved by
     resolveWorkplanBindings() (รอบ 9).
     --------------------------------------------------------- */
  var today0 = new Date();
  var day1 = new Date(today0.getTime() + 1 * 24 * 60 * 60 * 1000);
  var day2 = new Date(today0.getTime() + 2 * 24 * 60 * 60 * 1000);

  var workplanSchedule = [
    { teamId: 1, teamLabel: "ทีมพ่น 1", date: toDateInputValue(day1), hour: "08", minute: "00", boundKey: null },
    { teamId: 2, teamLabel: "ทีมพ่น 2", date: toDateInputValue(day1), hour: "09", minute: "00", boundKey: null },
    { teamId: 3, teamLabel: "ทีมพ่น 3", date: toDateInputValue(day2), hour: "08", minute: "00", boundKey: null },
    { teamId: 4, teamLabel: "ทีมพ่น 4", date: toDateInputValue(day2), hour: "09", minute: "00", boundKey: null }
  ];

  // Preferred legacy team <-> area(home) binding, kept only as a
  // preference when that key is present in the current selection pool.
  var LEGACY_TEAM_KEY = { 1: "1-home", 2: "2-home", 3: "3-home", 4: "4-home" };

  function resolveWorkplanBindings() {
    var pool = getSelectedPool();
    var poolKeys = pool.map(function (item) { return item.key; });
    var used = {};

    workplanSchedule.forEach(function (entry) { entry.boundKey = null; });

    // pass 1: legacy preferred key per team, if still in the pool
    workplanSchedule.forEach(function (entry) {
      var preferred = LEGACY_TEAM_KEY[entry.teamId];
      if (preferred && poolKeys.indexOf(preferred) !== -1 && !used[preferred]) {
        entry.boundKey = preferred;
        used[preferred] = true;
      }
    });

    // pass 2: fill any team still unbound with any unused pool item (in order)
    workplanSchedule.forEach(function (entry) {
      if (entry.boundKey) return;
      for (var i = 0; i < pool.length; i++) {
        if (!used[pool[i].key]) {
          entry.boundKey = pool[i].key;
          used[pool[i].key] = true;
          break;
        }
      }
    });
  }

  function findPoolItem(pool, key) {
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].key === key) return pool[i];
    }
    return null;
  }

  function scheduleTimestamp(entry) {
    if (!entry.date || !entry.hour || !entry.minute) return Number.MAX_SAFE_INTEGER;
    var dateParts = entry.date.split("-");
    if (dateParts.length !== 3) return Number.MAX_SAFE_INTEGER;
    var dt = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10),
      parseInt(entry.hour, 10),
      parseInt(entry.minute, 10)
    );
    return dt.getTime();
  }

  function sortWorkplanSchedule() {
    workplanSchedule.sort(function (a, b) { return scheduleTimestamp(a) - scheduleTimestamp(b); });
  }

  /* ---------------------------------------------------------
     Render: workplan schedule table (sorted soonest -> latest) —
     inline date input + 24h hour/minute <select> pair reuse
     .input-inline per DESIGN.md Input/Form guideline
     --------------------------------------------------------- */
  function renderWorkplanSchedule() {
    sortWorkplanSchedule();
    resolveWorkplanBindings();
    var pool = getSelectedPool();

    els.workplanScheduleBody.innerHTML = "";
    workplanSchedule.forEach(function (entry) {
      var poolItem = entry.boundKey ? findPoolItem(pool, entry.boundKey) : null;
      var areaCellHtml = poolItem
        ? '<span class="cell-primary">' + escapeHtml(poolItem.area.name) + ' &mdash; ' + escapeHtml(locDescriptor(poolItem.loc)) + '</span>' +
          '<span class="cell-secondary">' + poolItem.households + ' หลังคาเรือน (รัศมี ' + poolItem.radius + ' ม.) &middot; ' + escapeHtml(poolItem.area.clusterRef) + '</span>'
        : '<span class="cell-secondary">ยังไม่เลือกพื้นที่ &mdash; กรุณาเลือกพื้นที่/ตำแหน่งในส่วน &ldquo;ร่างใบขออนุมัติเบิกน้ำมัน/น้ำยาเคมี&rdquo; ก่อน</span>';

      var hourOptionsHtml = HOUR_OPTIONS.map(function (h) {
        return '<option value="' + h + '"' + (h === entry.hour ? " selected" : "") + '>' + h + '</option>';
      }).join("");
      var minuteOptionsHtml = MINUTE_OPTIONS.map(function (m) {
        return '<option value="' + m + '"' + (m === entry.minute ? " selected" : "") + '>' + m + '</option>';
      }).join("");

      var tr = document.createElement("tr");
      tr.setAttribute("data-team-id", entry.teamId);
      tr.innerHTML =
        "<td><span class=\"cell-primary\">" + escapeHtml(entry.teamLabel) + "</span></td>" +
        "<td>" + areaCellHtml + "</td>" +
        "<td><input type=\"date\" class=\"input-inline\" data-field=\"date\" value=\"" + escapeHtml(entry.date) + "\" aria-label=\"วันที่ปฏิบัติงาน " + escapeHtml(entry.teamLabel) + "\"></td>" +
        "<td><span class=\"time-select-group\">" +
          "<select class=\"input-inline select-hm\" data-field=\"hour\" aria-label=\"ชั่วโมงเริ่มปฏิบัติงาน (24 ชม.) " + escapeHtml(entry.teamLabel) + "\">" + hourOptionsHtml + "</select>" +
          "<span class=\"time-select-sep\">:</span>" +
          "<select class=\"input-inline select-hm\" data-field=\"minute\" aria-label=\"นาทีเริ่มปฏิบัติงาน " + escapeHtml(entry.teamLabel) + "\">" + minuteOptionsHtml + "</select>" +
        "</span></td>";
      els.workplanScheduleBody.appendChild(tr);
    });
  }

  /* ---------------------------------------------------------
     Approval request state machine: draft -> sent (รออนุมัติ) -> approved
     --------------------------------------------------------- */
  var approvalState = "draft"; // "draft" | "sent" | "approved"
  var approvalSentAtLabel = "";
  var approvalApprovedAtLabel = "";

  /* ---------------------------------------------------------
     Render: mini-map (inline SVG — abstract village grid, same
     visual language as the spot map in case-intake.js /
     case-analysis.js / field-tracking.js) showing only the
     currently-selected (area+location) items, with a radius ring
     sized relative to the radius chosen per row.
     --------------------------------------------------------- */
  function buildMiniMapSVG(pool) {
    var W = 640, H = 380;
    var parts = [];

    parts.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="แผนที่จำลองตำแหน่งและรัศมีที่เลือกพ่นสารเคมี">');
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#F5F1EA" stroke="#DCD3C4" stroke-width="1"></rect>');

    var step = 64;
    for (var gx = step; gx < W; gx += step) {
      parts.push('<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + H + '" stroke="#DCD3C4" stroke-width="1" stroke-opacity="0.6"></line>');
    }
    for (var gy = step; gy < H; gy += step) {
      parts.push('<line x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="#DCD3C4" stroke-width="1" stroke-opacity="0.6"></line>');
    }

    // simple road line for visual orientation only (abstract, not geodata)
    parts.push('<line x1="0" y1="' + (H * 0.58) + '" x2="' + W + '" y2="' + (H * 0.46) + '" stroke="#B3A996" stroke-width="3" stroke-dasharray="10 8" stroke-opacity="0.6"></line>');
    parts.push('<text x="12" y="20" font-size="11" fill="#6E6355" font-family="Inter, system-ui, sans-serif">แผนที่จำลอง — ไม่อ้างอิงพิกัดจริง</text>');

    if (pool.length === 0) {
      parts.push('<text x="' + (W / 2) + '" y="' + (H / 2) + '" text-anchor="middle" font-size="13" fill="#6E6355" font-family="Inter, system-ui, sans-serif">ยังไม่ได้เลือกพื้นที่/ตำแหน่งบนแผนที่</text>');
    }

    pool.forEach(function (item) {
      var px = (item.loc.mockX / 100) * W;
      var py = (item.loc.mockY / 100) * H;
      var isHome = item.loc.type === "home";
      var color = isHome ? "#8A9A5B" : "#7A6A53"; // secondary = home, primary = work/school, matches .pin-normal/.pin-adjusted
      var pixelRadius = 22 * (item.radius / 100);
      var pinTitle = escapeHtml(item.area.name) + " — " + escapeHtml(locDescriptor(item.loc)) + " &middot; รัศมี " + item.radius + " ม. &middot; " + item.households + " หลังคาเรือน (ประมาณ)";

      parts.push('<g class="minimap-pin-group">');
      parts.push('<circle cx="' + px + '" cy="' + py + '" r="' + pixelRadius + '" fill="' + color + '" fill-opacity="0.14" stroke="' + color + '" stroke-width="1.5"></circle>');
      parts.push('<circle cx="' + px + '" cy="' + py + '" r="6" fill="' + color + '"></circle>');
      parts.push('<text x="' + px + '" y="' + (py - pixelRadius - 8) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#33291F" font-family="Inter, system-ui, sans-serif">' + (isHome ? "บ้าน" : "ที่ทำงาน/เรียน") + '</text>');
      parts.push('<text x="' + px + '" y="' + (py + pixelRadius + 16) + '" text-anchor="middle" font-size="10" fill="#6E6355" font-family="Inter, system-ui, sans-serif">' + escapeHtml(item.area.name.split(" ")[0]) + '</text>');
      parts.push('<title>' + pinTitle + '</title>');
      parts.push('</g>');
    });

    parts.push('</svg>');
    return parts.join("");
  }

  function renderMiniMap(pool) {
    els.miniMapWrap.innerHTML = buildMiniMapSVG(pool);
  }

  /* ---------------------------------------------------------
     Render: area/location selection list + running summary +
     mini-map. Each area renders a small group with 2 rows
     (home / work-or-school), each independently checkable with
     its own radius <select> (100/150/200 m) driving a live
     household estimate = baseHouseholdsAt100m * (radius/100)^2.
     --------------------------------------------------------- */
  function buildLocationRow(area, loc) {
    var key = getLocationKey(area.id, loc.type);
    var checked = selectedKeys.indexOf(key) !== -1;
    var radius = getRadiusForKey(key, loc);
    var households = computeHouseholds(loc, radius);
    var inputId = "loc-" + key;
    var label = loc.type === "home" ? loc.label : (loc.label + ": " + loc.name);

    var radiusOptionsHtml = RADIUS_OPTIONS.map(function (r) {
      return '<option value="' + r + '"' + (r === radius ? " selected" : "") + '>' + r + " เมตร</option>";
    }).join("");

    return (
      '<div class="area-select-item">' +
        '<input type="checkbox" id="' + inputId + '" data-area-id="' + area.id + '" data-loc-type="' + loc.type + '"' + (checked ? " checked" : "") + '>' +
        '<label class="area-select-body" for="' + inputId + '">' +
          '<span class="area-select-top">' +
            '<span class="area-select-name">' + escapeHtml(label) + '</span>' +
          '</span>' +
          '<span class="area-select-meta">' +
            '<span>' + households + ' หลังคาเรือน (ประมาณจากรัศมีที่เลือก)</span>' +
          '</span>' +
        '</label>' +
        '<div class="area-select-controls">' +
          '<label class="area-select-radius-label">รัศมี ' +
            '<select class="input-inline input-inline-sm radius-select" data-area-id="' + area.id + '" data-loc-type="' + loc.type + '" aria-label="รัศมีที่ต้องพ่น &mdash; ' + escapeHtml(area.name) + ' (' + escapeHtml(label) + ')">' + radiusOptionsHtml + '</select>' +
          '</label>' +
        '</div>' +
      '</div>'
    );
  }

  function buildAreaGroup(area) {
    var rows = area.locations.map(function (loc) { return buildLocationRow(area, loc); }).join("");
    return (
      '<div class="area-select-group">' +
        '<div class="area-select-group-head">' +
          '<span class="area-select-name">' + escapeHtml(area.name) + '</span>' +
          '<span class="badge badge-' + (area.riskLevel === "สูง" ? "warning" : "neutral") + '">ความเสี่ยง' + escapeHtml(area.riskLevel) + '</span>' +
        '</div>' +
        '<div class="area-select-group-meta">อ้างอิง: ' + escapeHtml(area.clusterRef) + '</div>' +
        '<div class="area-select-locations">' + rows + '</div>' +
      '</div>'
    );
  }

  function renderAreaList() {
    els.areaSelectList.innerHTML = AREAS.map(buildAreaGroup).join("");

    var pool = getSelectedPool();
    var totalHouseholds = pool.reduce(function (sum, item) { return sum + item.households; }, 0);
    els.areaSelectSummary.textContent = pool.length === 0
      ? "ยังไม่ได้เลือกพื้นที่/ตำแหน่ง — เลือกอย่างน้อย 1 รายการเพื่อสร้างร่างเอกสาร"
      : "เลือกแล้ว " + pool.length + " รายการ (พื้นที่/ตำแหน่ง) · รวม " + totalHouseholds + " หลังคาเรือน (ประมาณ)";

    els.btnGenerateApproval.disabled = pool.length === 0;

    renderMiniMap(pool);
  }

  /* ---------------------------------------------------------
     Approval document generation — official-style template
     filled in from the selected (area+location+radius) pool's
     real computed mock data
     --------------------------------------------------------- */
  function buildApprovalText(pool) {
    var totalHouseholds = pool.reduce(function (sum, item) { return sum + item.households; }, 0);
    var maxRadius = Math.max.apply(null, pool.map(function (item) { return item.radius; }));

    var areaListText = pool.map(function (item, i) {
      return (i + 1) + ". " + item.area.name + " — " + locDescriptor(item.loc) + " — " + item.households + " หลังคาเรือน, รัศมีพ่น " + item.radius + " เมตร (" + item.area.clusterRef + ")";
    }).join("\n");

    var lines = [
      "บันทึกข้อความ",
      "เรื่อง ขออนุมัติเบิกน้ำมันเชื้อเพลิงและน้ำยาเคมีกำจัดยุงลาย เพื่อปฏิบัติงานควบคุมโรคในพื้นที่ระบาด",
      "เรียน ผู้อำนวยการกองสาธารณสุขและสิ่งแวดล้อม",
      "",
      "ตามที่งานเฝ้าระวังโรคตรวจพบกลุ่มผู้ป่วยที่เชื่อมโยงกันในพื้นที่/ตำแหน่งดังต่อไปนี้ จำนวนรวม " + pool.length + " ตำแหน่ง (ที่อยู่บ้าน/สถานที่ทำงาน-เรียน) ครอบคลุม " + totalHouseholds + " หลังคาเรือน จึงมีความจำเป็นต้องปฏิบัติงานพ่นสารเคมีกำจัดยุงลายและแหล่งเพาะพันธุ์ในรัศมีสูงสุด " + maxRadius + " เมตรจากตำแหน่งดังกล่าว เพื่อควบคุมการแพร่ระบาดโดยเร็ว รายละเอียดพื้นที่มีดังนี้",
      "",
      areaListText,
      "",
      "จึงขออนุมัติเบิกน้ำมันเชื้อเพลิงสำหรับเครื่องพ่นละอองฝอย (ULV) และน้ำยาเคมีกำจัดยุงลาย ตามจำนวนหลังคาเรือนและรัศมีพื้นที่ข้างต้น เพื่อให้ทีมควบคุมโรคสามารถปฏิบัติงานได้ทันต่อสถานการณ์",
      "",
      "จึงเรียนมาเพื่อพิจารณาอนุมัติ",
      "",
      "ผู้ขออนุมัติ: สมศักดิ์ สุขวัฒน์ (เจ้าหน้าที่เฝ้าระวังโรค)",
      "วันที่ยื่นขออนุมัติ: " + formatThaiDate(new Date()),
      "",
      "หมายเหตุ: ร่างเอกสารนี้สร้างโดยระบบ AI จากพื้นที่/ตำแหน่งและรัศมีที่เลือกไว้ในระบบ (แผนที่จำลอง ไม่อ้างอิงพิกัดจริง) โปรดตรวจสอบความถูกต้องและปรับแก้ก่อนยื่นขออนุมัติจริง"
    ];
    return lines.join("\n");
  }

  function generateApproval() {
    var pool = getSelectedPool();
    if (pool.length === 0) return;

    els.approvalTextarea.value = buildApprovalText(pool);
    approvalState = "draft";
    els.btnSendApproval.disabled = false;
    els.btnMockApprove.style.display = "none";
    els.approvalStatus.innerHTML = "";
  }

  function sendApproval() {
    var text = els.approvalTextarea.value.trim();
    if (!text) return;

    approvalState = "sent";
    approvalSentAtLabel = formatThaiDateTime(new Date());
    els.approvalStatus.innerHTML = '<span class="badge badge-warning">รออนุมัติ &middot; ส่งเมื่อ ' + escapeHtml(approvalSentAtLabel) + "</span>";
    els.btnSendApproval.disabled = true;
    els.btnMockApprove.style.display = "";
  }

  function mockApprove() {
    if (approvalState !== "sent") return;

    approvalState = "approved";
    approvalApprovedAtLabel = formatThaiDateTime(new Date());
    els.approvalStatus.innerHTML = '<span class="badge badge-confirmed">' + ICON_CHECK + "อนุมัติแล้ว &middot; " + escapeHtml(approvalApprovedAtLabel) + "</span>";
    els.btnMockApprove.style.display = "none";
  }

  /* ---------------------------------------------------------
     Control workplan generation — template text filled in with
     mock spray-team assignments/dates/steps (not free-form AI
     generation, see BUILD-PLAN.md assumption)
     --------------------------------------------------------- */
  function buildWorkplanText() {
    sortWorkplanSchedule(); // ensure the wording order matches the table's current (soonest -> latest) order
    resolveWorkplanBindings();
    var pool = getSelectedPool();

    var assignmentLines = workplanSchedule.map(function (entry, i) {
      var poolItem = entry.boundKey ? findPoolItem(pool, entry.boundKey) : null;
      var whenText = (entry.date && entry.hour && entry.minute)
        ? "ปฏิบัติงาน " + formatThaiDate(parseDateInputValue(entry.date)) + " เวลา " + entry.hour + ":" + entry.minute + " น."
        : "ยังไม่กำหนดวันที่/เวลาปฏิบัติงาน";
      var areaText = poolItem
        ? poolItem.area.name + " — " + locDescriptor(poolItem.loc) + " (" + poolItem.households + " หลังคาเรือน, รัศมี " + poolItem.radius + " ม.)"
        : "ยังไม่เลือกพื้นที่/ตำแหน่ง";
      return (i + 1) + ". " + entry.teamLabel + " — รับผิดชอบ " + areaText + " — " + whenText;
    });

    var lines = [
      "แผนปฏิบัติงานควบคุมโรค (ร่างโดยระบบ AI)",
      "สร้างเมื่อ: " + formatThaiDateTime(new Date()),
      "",
      "การมอบหมายทีม:"
    ].concat(assignmentLines).concat([
      "",
      "ขั้นตอนปฏิบัติงาน:",
      "1. ประชุมทีมและตรวจสอบอุปกรณ์/น้ำยาเคมีก่อนออกปฏิบัติงาน 07:30 น.",
      "2. แจ้ง อสม./ผู้นำชุมชนในพื้นที่ล่วงหน้า 1 วัน ให้เตรียมเปิดบ้านรับทีมพ่น",
      "3. พ่นสารเคมีกำจัดยุงลายภายในและรอบบ้านตามรัศมีที่กำหนด เริ่มจากตำแหน่งผู้ป่วยออกไปยังรอบนอก",
      "4. สำรวจและทำลายแหล่งเพาะพันธุ์ลูกน้ำยุงลาย (ภาชนะขังน้ำ) ควบคู่กับการพ่นสารเคมี",
      "5. บันทึกภาพถ่ายหน้าบ้าน/สถานที่ที่พ่นแล้วทุกจุด พร้อมพิกัดและเวลา เพื่อใช้ตรวจสอบย้อนหลัง",
      "6. รายงานผลความคืบหน้าผ่านหน้า Field Tracking ทุก 2 ชั่วโมงระหว่างปฏิบัติงาน",
      "",
      "มาตรการป้องกันทีมปฏิบัติงาน:",
      "- สวมอุปกรณ์ป้องกันส่วนบุคคล (PPE): หน้ากาก แว่นตา ถุงมือ เสื้อแขนยาว ตลอดการพ่นสารเคมี",
      "- หลีกเลี่ยงการพ่นสารเคมีในบริเวณที่มีอาหาร/แหล่งน้ำดื่มโดยไม่ปิดคลุมป้องกันก่อน",
      "- พักดื่มน้ำและล้างมือทุก 1 ชั่วโมง งดสูบบุหรี่ระหว่างพ่นสารเคมี",
      "",
      "หมายเหตุ: ร่างแผนนี้สร้างโดยระบบ AI จากพื้นที่/ตำแหน่งที่เลือกไว้ในระบบ โปรดตรวจสอบความถูกต้องและปรับแก้ให้เหมาะกับสถานการณ์จริงก่อนใช้งาน"
    ]);
    return lines.join("\n");
  }

  function generateWorkplan() {
    els.workplanTextarea.value = buildWorkplanText();
    els.btnConfirmWorkplan.disabled = false;
    els.workplanStatus.innerHTML = "";
  }

  function confirmWorkplan() {
    var text = els.workplanTextarea.value.trim();
    if (!text) return;

    els.workplanStatus.innerHTML = '<span class="badge badge-confirmed">' + ICON_CHECK + "ยืนยันใช้แผนนี้แล้ว &middot; " + formatThaiDateTime(new Date()) + "</span>";
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */
  function initEvents() {
    els.areaSelectList.addEventListener("change", function (e) {
      var checkbox = e.target.closest('input[type="checkbox"][data-area-id]');
      if (checkbox) {
        var key = getLocationKey(parseInt(checkbox.getAttribute("data-area-id"), 10), checkbox.getAttribute("data-loc-type"));
        var idx = selectedKeys.indexOf(key);
        if (checkbox.checked && idx === -1) {
          selectedKeys.push(key);
        } else if (!checkbox.checked && idx !== -1) {
          selectedKeys.splice(idx, 1);
        }
        renderAreaList();
        renderWorkplanSchedule();
        return;
      }

      var radiusSelect = e.target.closest("select.radius-select");
      if (radiusSelect) {
        var rKey = getLocationKey(parseInt(radiusSelect.getAttribute("data-area-id"), 10), radiusSelect.getAttribute("data-loc-type"));
        radiusByKey[rKey] = parseInt(radiusSelect.value, 10);
        renderAreaList();
        renderWorkplanSchedule();
        return;
      }
    });

    els.workplanScheduleBody.addEventListener("change", function (e) {
      var input = e.target.closest("[data-field]");
      if (!input) return;
      var tr = input.closest("tr[data-team-id]");
      if (!tr) return;
      var teamId = parseInt(tr.getAttribute("data-team-id"), 10);
      var entry = null;
      for (var i = 0; i < workplanSchedule.length; i++) {
        if (workplanSchedule[i].teamId === teamId) { entry = workplanSchedule[i]; break; }
      }
      if (!entry) return;
      var field = input.getAttribute("data-field"); // "date" | "hour" | "minute"
      entry[field] = input.value;
      renderWorkplanSchedule(); // re-sorts (soonest -> latest), re-resolves bindings, and re-renders the whole table
    });

    els.btnGenerateApproval.addEventListener("click", generateApproval);
    els.btnSendApproval.addEventListener("click", sendApproval);
    els.btnMockApprove.addEventListener("click", mockApprove);
    els.btnGenerateWorkplan.addEventListener("click", generateWorkplan);
    els.btnConfirmWorkplan.addEventListener("click", confirmWorkplan);
  }

  function init() {
    renderAreaList();
    renderWorkplanSchedule();
    initEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
