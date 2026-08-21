/* =========================================================
   AI Disease Surveillance & Response Platform
   Control Plan — mock approval-request drafting / control workplan
   drafting (separate script: own DOM/state, no cross-page import;
   area names are kept consistent with case-analysis.js/case-intake.js
   mock data but not read from their live state, per BUILD-PLAN.md
   assumption for รอบ 4)

   รอบ 10 (2026-08-20): the workplan schedule table now has one row
   per currently-selected (area+location) pool item (not a fixed set
   of 4 team rows), with a user-editable team <select> per row (any
   team can be assigned to any number of rows). Rows are grouped by
   assigned team (1->4) first, then sorted soonest->latest by date+
   time within the same team. See getOrCreateWorkplanEntry(),
   getSortedWorkplanRows(), sortWorkplanRows() below.

   รอบ 12 (2026-08-20): each area/mock case now has a patientName
   (shown in the area-selection checklist) and a caseFoundDate
   ("Day 0" anchor). The workplan row date is no longer a free-form
   day/month/ปี(พ.ศ.) select trio — it's a single Day 0/1/7 <select>
   (dayOffset) added to the row's area.caseFoundDate, per the
   standard dengue vector-control spraying schedule. Also added:
   a "พิมพ์เป็น PDF" button (window.print(), shown once the approval
   request has been sent) and the two panels' HTML order in
   control-plan.html was swapped (workplan panel first).
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
  // Mock "Day 0" anchor (วันพบเคส) per area, used by the workplan
  // schedule's Day 0/1/7 <select> (รอบ 12) — a fixed number of days
  // before "today" (varied per area for realism), normalized to
  // midnight so date-only arithmetic (+0/+1/+7 days) stays exact.
  function daysAgo(n) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d;
  }

  var AREAS = [
    {
      id: 1,
      name: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์",
      clusterRef: "กลุ่มไข้เลือดออก ต.หนองบัว (ยืนยันแล้ว)",
      riskLevel: "สูง",
      patientName: "นายกิตติ มั่นคง",
      caseFoundDate: daysAgo(3),
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
      patientName: "นางสาวสุพรรณี ใจดี",
      caseFoundDate: daysAgo(4),
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
      patientName: "เด็กชายอนุชา ศรีสุข",
      caseFoundDate: daysAgo(2),
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
      patientName: "นายประเสริฐ แสงทอง",
      caseFoundDate: daysAgo(5),
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

  // Format the Thai date for a workplan row's "Day 0/1/7" <select>
  // (รอบ 12) — the row no longer stores its own day/month/year; the
  // actual calendar date is derived from the row's area.caseFoundDate
  // (mock "วันพบเคส") plus the chosen dayOffset (0, 1, or 7 days).
  function formatThaiDateFromOffset(caseFoundDate, dayOffset) {
    var offset = parseInt(dayOffset, 10);
    var d = new Date(caseFoundDate.getFullYear(), caseFoundDate.getMonth(), caseFoundDate.getDate() + offset);
    return formatThaiDate(d);
  }

  /* ---------------------------------------------------------
     24-hour time <select> options — guarantees a 24h display
     regardless of browser/OS locale (native <input type="time">
     can render an AM/PM picker on some locales).
     --------------------------------------------------------- */
  var HOUR_OPTIONS = [];
  for (var _h = 0; _h < 24; _h++) HOUR_OPTIONS.push(pad2(_h));
  var MINUTE_OPTIONS = ["00", "15", "30", "45"];

  // "Day 0/1/7" <select> options for the workplan schedule table (รอบ 12)
  // — standard dengue vector-control spraying schedule: spray on the day
  // the case is found (Day 0), follow up the next day (Day 1), and once
  // more on Day 7. Values are day offsets added to the row's area's mock
  // caseFoundDate (see formatThaiDateFromOffset()/scheduleTimestamp()).
  var DAY_OFFSET_OPTIONS = [
    { value: 0, label: "Day 0 (วันพบเคส)" },
    { value: 1, label: "Day 1" },
    { value: 7, label: "Day 7" }
  ];

  var TEAM_OPTIONS = [1, 2, 3, 4];

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
    btnPrintApproval: document.getElementById("btn-print-approval"),
    approvalPrintView: document.getElementById("approval-print-view"),
    approvalStatus: document.getElementById("approval-status"),
    btnGenerateWorkplan: document.getElementById("btn-generate-workplan"),
    workplanTextarea: document.getElementById("workplan-textarea"),
    btnConfirmWorkplan: document.getElementById("btn-confirm-workplan"),
    workplanStatus: document.getElementById("workplan-status"),
    workplanScheduleBody: document.getElementById("workplan-schedule-body")
  };

  /* ---------------------------------------------------------
     Control workplan schedule state (รอบ 10, dates reworked รอบ 12) —
     one row per currently-selected (area+location) pool item, keyed by
     the same `key` used by selectedKeys/radiusByKey above, instead of
     the old "4 fixed teamId rows" model. Each entry holds its own
     editable {assignedTeamId, dayOffset, hour, minute} and is created
     lazily the first time its key is seen (and never deleted when the
     user unchecks the area — matches the radiusByKey caching pattern
     already used elsewhere in this file, so re-checking an area
     restores its previous schedule).

     รอบ 12: the row's calendar date is no longer stored directly as
     {day, month, year} — instead `dayOffset` ("0" | "1" | "7", stored
     as a string like hour/minute) is added to the row's own
     poolItem.area.caseFoundDate (mock "วันพบเคส" per area) to derive
     the actual Thai date, matching the standard dengue Day 0/1/7
     spraying schedule. See formatThaiDateFromOffset()/
     scheduleTimestamp() below — both now need the row's poolItem
     (for its area.caseFoundDate), not just the entry.
     --------------------------------------------------------- */
  var workplanEntryByKey = {};

  function getOrCreateWorkplanEntry(key, indexInPool) {
    if (!workplanEntryByKey[key]) {
      workplanEntryByKey[key] = {
        assignedTeamId: (indexInPool % 4) + 1, // round-robin 1->4 by selection order
        dayOffset: "0", // "0" | "1" | "7" — Day 0 (วันพบเคส) by default
        hour: indexInPool % 2 === 0 ? "08" : "09",
        minute: "00"
      };
    }
    return workplanEntryByKey[key];
  }

  // Needs poolItem (not just entry) so it can read poolItem.area.caseFoundDate
  // — the Day 0 anchor that dayOffset is added to.
  function scheduleTimestamp(entry, poolItem) {
    var base = poolItem.area.caseFoundDate;
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + parseInt(entry.dayOffset, 10),
      parseInt(entry.hour, 10),
      parseInt(entry.minute, 10)
    ).getTime();
  }

  // Two-level sort: group by assigned team (1->4) first, then by
  // date+time (soonest -> latest) within the same team.
  function sortWorkplanRows(rows) {
    rows.sort(function (a, b) {
      if (a.entry.assignedTeamId !== b.entry.assignedTeamId) {
        return a.entry.assignedTeamId - b.entry.assignedTeamId;
      }
      return scheduleTimestamp(a.entry, a.poolItem) - scheduleTimestamp(b.entry, b.poolItem);
    });
    return rows;
  }

  // Builds the current {poolItem, entry} rows (one per selected
  // area+location), lazily creating any missing schedule entry, then
  // sorts them per sortWorkplanRows(). Shared by the table renderer
  // and buildWorkplanText() so both always agree on row order.
  function getSortedWorkplanRows() {
    var pool = getSelectedPool();
    var rows = pool.map(function (item, i) {
      return { poolItem: item, entry: getOrCreateWorkplanEntry(item.key, i) };
    });
    return sortWorkplanRows(rows);
  }

  /* ---------------------------------------------------------
     Render: workplan schedule table, grouped by team (1->4) then
     sorted soonest -> latest within a team — team <select>, Day
     0/1/7 <select> (รอบ 12, replacing the day/month/ปี(พ.ศ.) select
     trio), and 24h hour/minute <select> pair all reuse .input-inline
     per DESIGN.md Input/Form guideline
     --------------------------------------------------------- */
  function buildWorkplanRowEl(poolItem, entry) {
    var rowLabel = escapeHtml(poolItem.area.name) + " — " + escapeHtml(locDescriptor(poolItem.loc));

    var teamOptionsHtml = TEAM_OPTIONS.map(function (t) {
      return '<option value="' + t + '"' + (t === entry.assignedTeamId ? " selected" : "") + '>ทีมพ่น ' + t + '</option>';
    }).join("");

    var dayOffsetOptionsHtml = DAY_OFFSET_OPTIONS.map(function (opt) {
      return '<option value="' + opt.value + '"' + (String(opt.value) === entry.dayOffset ? " selected" : "") + '>' + escapeHtml(opt.label) + '</option>';
    }).join("");
    var dayOffsetDateText = formatThaiDateFromOffset(poolItem.area.caseFoundDate, entry.dayOffset);

    var hourOptionsHtml = HOUR_OPTIONS.map(function (h) {
      return '<option value="' + h + '"' + (h === entry.hour ? " selected" : "") + '>' + h + '</option>';
    }).join("");
    var minuteOptionsHtml = MINUTE_OPTIONS.map(function (m) {
      return '<option value="' + m + '"' + (m === entry.minute ? " selected" : "") + '>' + m + '</option>';
    }).join("");

    var areaCellHtml =
      '<span class="cell-primary">' + escapeHtml(poolItem.area.name) + ' &mdash; ' + escapeHtml(locDescriptor(poolItem.loc)) + '</span>' +
      '<span class="cell-secondary">' + poolItem.households + ' หลังคาเรือน (รัศมี ' + poolItem.radius + ' ม.) &middot; ' + escapeHtml(poolItem.area.clusterRef) + '</span>';

    var tr = document.createElement("tr");
    tr.setAttribute("data-key", poolItem.key);
    tr.innerHTML =
      "<td><select class=\"input-inline\" data-field=\"team\" aria-label=\"ทีมพ่นที่รับผิดชอบ " + rowLabel + "\">" + teamOptionsHtml + "</select></td>" +
      "<td>" + areaCellHtml + "</td>" +
      "<td>" +
        "<select class=\"input-inline select-day-offset\" data-field=\"dayOffset\" aria-label=\"วันพ่น (Day 0/1/7) " + rowLabel + "\">" + dayOffsetOptionsHtml + "</select>" +
        "<span class=\"cell-secondary\">" + escapeHtml(dayOffsetDateText) + "</span>" +
      "</td>" +
      "<td><span class=\"time-select-group\">" +
        "<select class=\"input-inline select-hm\" data-field=\"hour\" aria-label=\"ชั่วโมงเริ่มปฏิบัติงาน (24 ชม.) " + rowLabel + "\">" + hourOptionsHtml + "</select>" +
        "<span class=\"time-select-sep\">:</span>" +
        "<select class=\"input-inline select-hm\" data-field=\"minute\" aria-label=\"นาทีเริ่มปฏิบัติงาน " + rowLabel + "\">" + minuteOptionsHtml + "</select>" +
      "</span></td>";
    return tr;
  }

  function renderWorkplanSchedule() {
    var rows = getSortedWorkplanRows();

    els.workplanScheduleBody.innerHTML = "";

    if (rows.length === 0) {
      var trEmpty = document.createElement("tr");
      trEmpty.innerHTML = '<td colspan="4"><span class="cell-secondary">ยังไม่เลือกพื้นที่ &mdash; กรุณาเลือกพื้นที่/ตำแหน่งในส่วน &ldquo;ร่างใบขออนุมัติเบิกน้ำมัน/น้ำยาเคมี&rdquo; ก่อน</span></td>';
      els.workplanScheduleBody.appendChild(trEmpty);
      return;
    }

    rows.forEach(function (row) {
      els.workplanScheduleBody.appendChild(buildWorkplanRowEl(row.poolItem, row.entry));
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
    var locLabel = loc.type === "home" ? loc.label : (loc.label + ": " + loc.name);
    var label = area.patientName + " — " + locLabel;

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
     Approval document generation — mirrors the real municipal
     paper form "บันทึกขออนุมัติจัดซื้อน้ำมันเชื้อเพลิง/แก๊ส"
     (ตัวอย่างจริงที่ผู้ใช้ให้มา 2026-08-20 รอบ 11) field-for-field,
     filled in from the selected (area+location+radius) pool's
     real computed mock data. App state (draft/sent/approved) is
     tracked separately via approvalState — this text only mirrors
     the paper form's blank signature lines, it isn't wired to them.
     --------------------------------------------------------- */
  var ULV_UNIT_SETS = ["022/023", "024/025", "026/027"];

  function buildApprovalText(pool) {
    var totalHouseholds = pool.reduce(function (sum, item) { return sum + item.households; }, 0);
    var ulvUnits = ULV_UNIT_SETS[(pool.length - 1) % ULV_UNIT_SETS.length];

    // Mock fuel-liter estimate: no real consumption data exists in this
    // prototype, so scale a plausible figure off the households/areas
    // covered — same "mock, needs human review" spirit as the rest of
    // this AI-drafted document.
    var dieselLiters = Math.max(10, Math.round(totalHouseholds * 0.5));
    var gasoholLiters = Math.max(5, pool.length * 5);
    var lubricantLiters = Math.max(2, pool.length * 2);

    var siteListText = pool.map(function (item, i) {
      return (i + 1) + ". " + item.area.name + " — " + locDescriptor(item.loc) + " (" + item.households + " หลังคาเรือน, รัศมี " + item.radius + " ม.)";
    }).join("\n");

    var lines = [
      "บิลที่ ..................................................",
      "เล่มที่/เลขที่ .......................................",
      "",
      "บันทึกขออนุมัติจัดซื้อน้ำมันเชื้อเพลิง/แก๊ส",
      "",
      "ส่วนราชการ เทศบาล กองการแพทย์ งานเวชกรรมสังคม",
      "ที่ ......................../.......................... ลงวันที่ " + formatThaiDate(new Date()),
      "เรื่อง ขออนุมัติจัดซื้อน้ำมันเชื้อเพลิงและหล่อลื่น โดยเฉพาะเจาะจง",
      "เรียน ผู้อำนวยการกองการแพทย์",
      "",
      "ข้าพเจ้า .................................................... พนักงานพ่นเคมี",
      "☑ หมอกควัน/ULV หมายเลข " + ulvUnits,
      "",
      "ได้ออกปฏิบัติงานพ่นเคมี หมอกควัน/ULV ครั้งที่ .......... ในการควบคุมการแพร่ระบาดของโรคไข้เลือดออก",
      "วันที่ " + formatThaiDate(new Date()) + " จำนวน " + pool.length + " แห่ง ณ",
      siteListText,
      "",
      "ขออนุมัติเบิกจ่ายน้ำมันเชื้อเพลิง ดังนี้",
      "☑ ดีเซล        จำนวน " + dieselLiters + " ลิตร        ☑ แก๊สโซฮอล์ 95   จำนวน " + gasoholLiters + " ลิตร",
      "☑ น้ำมันหล่อลื่น   จำนวน " + lubricantLiters + " ลิตร        ☐ อื่นๆ ....................... จำนวน ......... ลิตร",
      "",
      "จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ",
      "",
      "ลงชื่อ.................................................... พนักงานทีมพ่นเคมี",
      "(....................................................)",
      "",
      "ลงชื่อ.................................................... หัวหน้างาน",
      "(....................................................)",
      "",
      "ผู้อนุมัติ",
      "☐ ดีเซล        จำนวน ......... ลิตร        ☐ แก๊สโซฮอล์ 95   จำนวน ......... ลิตร",
      "☐ น้ำมันหล่อลื่น   จำนวน ......... ลิตร        ☐ อื่นๆ ....................... จำนวน ......... ลิตร",
      "ลงชื่อ.................................................... ผู้อนุมัติ",
      "(....................................................)",
      "",
      "กรรมการตรวจรับพัสดุ",
      "ได้ตรวจสอบปริมาณครบถ้วน ถูกต้องเรียบร้อยแล้ว",
      "ลงชื่อ.................................................... เจ้าหน้าที่ตรวจรับวัสดุเชื้อเพลิง",
      "(....................................................)",
      "",
      "หมายเหตุ: ร่างเอกสารนี้สร้างโดยระบบ AI ตามแบบฟอร์มจริงของหน่วยงาน จากพื้นที่/ตำแหน่งและรัศมีที่เลือกไว้ในระบบ (แผนที่จำลอง ไม่อ้างอิงพิกัดจริง; จำนวนน้ำมันเป็นตัวเลขประมาณการ) โปรดตรวจสอบความถูกต้อง กรอกช่องว่าง และลงนามจริงก่อนยื่นขออนุมัติ"
    ];
    return lines.join("\n");
  }

  // Keeps the hidden #approval-print-view <pre> (รอบ 12) in sync with the
  // editable textarea, so window.print() (triggered from "พิมพ์เป็น PDF")
  // always prints the latest text the user sees/edited — a plain <pre>
  // instead of the <textarea> itself so print output isn't clipped to a
  // scrollable box. Uses textContent (not innerHTML) so no HTML-escaping
  // is needed for arbitrary user-edited text.
  function syncApprovalPrintView() {
    if (els.approvalPrintView) els.approvalPrintView.textContent = els.approvalTextarea.value;
  }

  function generateApproval() {
    var pool = getSelectedPool();
    if (pool.length === 0) return;

    els.approvalTextarea.value = buildApprovalText(pool);
    syncApprovalPrintView();
    approvalState = "draft";
    els.btnSendApproval.disabled = false;
    els.btnMockApprove.style.display = "none";
    els.btnPrintApproval.style.display = "none";
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
    els.btnPrintApproval.style.display = "";
    syncApprovalPrintView();
  }

  function mockApprove() {
    if (approvalState !== "sent") return;

    approvalState = "approved";
    approvalApprovedAtLabel = formatThaiDateTime(new Date());
    els.approvalStatus.innerHTML = '<span class="badge badge-confirmed">' + ICON_CHECK + "อนุมัติแล้ว &middot; " + escapeHtml(approvalApprovedAtLabel) + "</span>";
    els.btnMockApprove.style.display = "none";
  }

  // "พิมพ์เป็น PDF" (รอบ 12) — no PDF library involved; this just opens
  // the browser's native print dialog (users choose "Save as PDF" as
  // the print destination there), styled via the @media print rules in
  // styles.css that hide everything except #approval-print-view.
  function printApproval() {
    syncApprovalPrintView();
    window.print();
  }

  /* ---------------------------------------------------------
     Control workplan generation — template text filled in with
     mock spray-team assignments/dates/steps (not free-form AI
     generation, see BUILD-PLAN.md assumption)
     --------------------------------------------------------- */
  function buildWorkplanText() {
    // Group by team (1->4), sorted soonest -> latest within each team —
    // matches the table's current row order (รอบ 10).
    var rows = getSortedWorkplanRows();

    var assignmentLines = rows.length === 0
      ? ["ยังไม่เลือกพื้นที่/ตำแหน่ง — กรุณาเลือกพื้นที่ในส่วน “ร่างใบขออนุมัติเบิกน้ำมัน/น้ำยาเคมี” ก่อนสร้างแผนปฏิบัติงาน"]
      : rows.map(function (row, i) {
          var poolItem = row.poolItem;
          var entry = row.entry;
          var areaText = poolItem.area.name + " — " + locDescriptor(poolItem.loc) + " (" + poolItem.households + " หลังคาเรือน, รัศมี " + poolItem.radius + " ม.)";
          var whenText = "ปฏิบัติงาน Day " + entry.dayOffset + " (" + formatThaiDateFromOffset(poolItem.area.caseFoundDate, entry.dayOffset) + ") เวลา " + entry.hour + ":" + entry.minute + " น.";
          return (i + 1) + ". ทีมพ่น " + entry.assignedTeamId + " — รับผิดชอบ " + areaText + " — " + whenText;
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
      var tr = input.closest("tr[data-key]");
      if (!tr) return;
      var key = tr.getAttribute("data-key");
      var entry = workplanEntryByKey[key];
      if (!entry) return;
      var field = input.getAttribute("data-field"); // "team" | "dayOffset" | "hour" | "minute"
      if (field === "team") {
        entry.assignedTeamId = parseInt(input.value, 10);
      } else {
        entry[field] = input.value; // dayOffset ("0"/"1"/"7") and hour/minute all stay as plain strings
      }
      renderWorkplanSchedule(); // re-sorts (team asc, then soonest -> latest) and re-renders the whole table
    });

    els.btnGenerateApproval.addEventListener("click", generateApproval);
    els.btnSendApproval.addEventListener("click", sendApproval);
    els.btnMockApprove.addEventListener("click", mockApprove);
    els.btnPrintApproval.addEventListener("click", printApproval);
    els.approvalTextarea.addEventListener("input", syncApprovalPrintView);
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
