/* =========================================================
   AI Disease Surveillance & Response Platform
   ASM Coordination — mock LINE OA photo intake (AI vision status
   summary) / advance-notice queue for spray reminders (day 0 and
   day 0+7). Separate script: own DOM/state, no cross-page import;
   area names align with the mock zones used in field-tracking.js/
   control-plan.js, per BUILD-PLAN.md assumption for รอบ 5.
   ========================================================= */
(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var ICON_PHOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"></path><circle cx="12" cy="13" r="4"></circle></svg>';

  /* ---------------------------------------------------------
     Mock photos received via LINE OA — AI vision groups by area/
     date and summarizes spray status automatically. "daysAgo" is
     relative to the reference "today" used across other v1 pages
     (20 ส.ค. 2569), so the date-range filter can work the same
     way as the 7/14/30-day pattern used in script.js.
     --------------------------------------------------------- */
  var PHOTOS = [
    { id: 1, asm: "อสม.สมหญิง ใจดี", area: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์", dateLabel: "20 ส.ค. 2569", daysAgo: 0, status: "done" },
    { id: 2, asm: "อสม.ประยูร แสงทอง", area: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์", dateLabel: "20 ส.ค. 2569", daysAgo: 0, status: "done" },
    { id: 3, asm: "อสม.มาลี ศรีสุข", area: "ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา", dateLabel: "19 ส.ค. 2569", daysAgo: 1, status: "not_done" },
    { id: 4, asm: "อสม.สมชาย รุ่งเรือง", area: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่", dateLabel: "19 ส.ค. 2569", daysAgo: 1, status: "done" },
    { id: 5, asm: "อสม.บุญมี พูลสวัสดิ์", area: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่", dateLabel: "18 ส.ค. 2569", daysAgo: 2, status: "done" },
    { id: 6, asm: "อสม.วิไล คำแก้ว", area: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย", dateLabel: "20 ส.ค. 2569", daysAgo: 0, status: "not_done" },
    { id: 7, asm: "อสม.สุพจน์ ทองดี", area: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย", dateLabel: "17 ส.ค. 2569", daysAgo: 3, status: "done" },
    { id: 8, asm: "อสม.รัตนา ใจเย็น", area: "ต.คลองใหญ่ หมู่ 2 บ้านคลองสวย", dateLabel: "16 ส.ค. 2569", daysAgo: 4, status: "done" },
    { id: 9, asm: "อสม.ประเสริฐ มั่นคง", area: "ต.คลองใหญ่ หมู่ 2 บ้านคลองสวย", dateLabel: "14 ส.ค. 2569", daysAgo: 6, status: "not_done" },
    { id: 10, asm: "อสม.สมหญิง ใจดี", area: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์", dateLabel: "13 ส.ค. 2569", daysAgo: 7, status: "done" }
  ];

  var STATUS_LABEL = { done: "พ่นแล้ว", not_done: "ยังไม่พ่น" };
  var STATUS_BADGE_CLASS = { done: "badge-success", not_done: "badge-warning" };

  var AREAS = [];
  PHOTOS.forEach(function (p) {
    if (AREAS.indexOf(p.area) === -1) AREAS.push(p.area);
  });

  /* ---------------------------------------------------------
     Mock advance-notice queue — one row per area/cluster, with
     the two scheduled LINE reminders (1 day before day 0, and
     1 day before day 0+7). Message previews reference the row's
     own area/date values.
     --------------------------------------------------------- */
  var QUEUE = [
    {
      id: 1,
      area: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์",
      day0Label: "15 ส.ค. 2569",
      reminder1: { dateLabel: "14 ส.ค. 2569", status: "sent" },
      reminder2: { dateLabel: "21 ส.ค. 2569", status: "pending" }
    },
    {
      id: 2,
      area: "ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา",
      day0Label: "18 ส.ค. 2569",
      reminder1: { dateLabel: "17 ส.ค. 2569", status: "sent" },
      reminder2: { dateLabel: "24 ส.ค. 2569", status: "pending" }
    },
    {
      id: 3,
      area: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่",
      day0Label: "19 ส.ค. 2569",
      reminder1: { dateLabel: "18 ส.ค. 2569", status: "sent" },
      reminder2: { dateLabel: "25 ส.ค. 2569", status: "pending" }
    },
    {
      id: 4,
      area: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย",
      day0Label: "20 ส.ค. 2569",
      reminder1: { dateLabel: "19 ส.ค. 2569", status: "sent" },
      reminder2: { dateLabel: "26 ส.ค. 2569", status: "pending" }
    },
    {
      id: 5,
      area: "ต.คลองใหญ่ หมู่ 2 บ้านคลองสวย",
      day0Label: "13 ส.ค. 2569",
      reminder1: { dateLabel: "12 ส.ค. 2569", status: "sent" },
      reminder2: { dateLabel: "19 ส.ค. 2569", status: "sent" }
    }
  ];

  var QUEUE_STATUS_LABEL = { sent: "ส่งแล้ว", pending: "รอส่ง" };
  var QUEUE_STATUS_BADGE_CLASS = { sent: "badge-success", pending: "badge-neutral" };

  function buildReminder2Message(row) {
    return "เรียน อสม. และประชาชนในพื้นที่ " + row.area + "\n" +
      "แจ้งกำหนดพ่นสารเคมีกำจัดยุงลาย รอบที่ 2 (ครบ 7 วันจากรอบแรก) ในวันที่ " + row.reminder2.dateLabel + "\n" +
      "กรุณาเตรียมพื้นที่เช่นเดิม ขอบคุณที่ให้ความร่วมมือ\n" +
      "— ทีมควบคุมโรค อสม. (ส่งอัตโนมัติล่วงหน้า 1 วัน)";
  }

  function buildReminder1Message(row) {
    return "เรียน อสม. และประชาชนในพื้นที่ " + row.area + "\n" +
      "แจ้งกำหนดพ่นสารเคมีกำจัดยุงลาย รอบที่ 1 ในวันที่ " + row.day0Label + "\n" +
      "กรุณาเปิดประตูบ้าน เก็บของออกจากบริเวณที่จะพ่น และงดใช้พื้นที่ในช่วงเวลาดำเนินการ\n" +
      "— ทีมควบคุมโรค อสม. (ส่งอัตโนมัติล่วงหน้า 1 วัน)";
  }

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  var state = {
    area: "all",
    range: 14
  };

  var expandedRows = {};

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    filterArea: document.getElementById("asm-filter-area"),
    filterRange: document.getElementById("asm-filter-range"),
    btnReset: document.getElementById("btn-reset-asm-filters"),
    photoGrid: document.getElementById("asm-photo-grid"),
    photoGridSubtitle: document.getElementById("photo-grid-subtitle"),
    queueTableBody: document.getElementById("queue-table-body")
  };

  /* ---------------------------------------------------------
     Populate filter dropdowns
     --------------------------------------------------------- */
  function populateFilters() {
    var optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = "ทุกพื้นที่ (All Areas)";
    els.filterArea.appendChild(optAll);
    AREAS.forEach(function (a) {
      var opt = document.createElement("option");
      opt.value = a;
      opt.textContent = a;
      els.filterArea.appendChild(opt);
    });
  }

  /* ---------------------------------------------------------
     Render: Photo intake grid (client-side filter by area + date range)
     --------------------------------------------------------- */
  function renderPhotoGrid() {
    var filtered = PHOTOS.filter(function (p) {
      var matchesArea = state.area === "all" || p.area === state.area;
      var matchesRange = p.daysAgo <= state.range;
      return matchesArea && matchesRange;
    });

    var doneCount = filtered.filter(function (p) { return p.status === "done"; }).length;
    els.photoGridSubtitle.textContent = filtered.length + " รูป · พ่นแล้ว " + doneCount + " รูป · ยังไม่พ่น " + (filtered.length - doneCount) + " รูป (สรุปโดย AI vision อัตโนมัติจากรูปที่ อสม. ส่งเข้ามาผ่าน LINE OA)";

    els.photoGrid.innerHTML = "";

    if (filtered.length === 0) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "ไม่พบรูปภาพตามเงื่อนไขตัวกรองที่เลือก";
      els.photoGrid.appendChild(empty);
      return;
    }

    filtered.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "photo-card";
      card.innerHTML =
        '<div class="photo-card-thumb">' + ICON_PHOTO + '</div>' +
        '<div class="photo-card-body">' +
          '<span class="photo-card-team">' + escapeHtml(p.asm) + '</span>' +
          '<span class="photo-card-meta">' +
            '<span>พื้นที่: ' + escapeHtml(p.area) + '</span>' +
            '<span>วันที่ส่ง: ' + escapeHtml(p.dateLabel) + '</span>' +
          '</span>' +
          '<span class="photo-card-badges">' +
            '<span class="badge ' + STATUS_BADGE_CLASS[p.status] + '">' + STATUS_LABEL[p.status] + ' (สรุปโดย AI)</span>' +
          '</span>' +
        '</div>';
      els.photoGrid.appendChild(card);
    });
  }

  /* ---------------------------------------------------------
     Render: Advance-notice queue table
     --------------------------------------------------------- */
  function renderQueueTable() {
    els.queueTableBody.innerHTML = "";

    QUEUE.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><span class="cell-primary">' + escapeHtml(row.area) + '</span></td>' +
        '<td>' + escapeHtml(row.day0Label) + '</td>' +
        '<td>' +
          '<div class="geo-cell">' +
            '<span>กำหนดส่ง: ' + escapeHtml(row.reminder1.dateLabel) + '</span>' +
            '<span class="badge ' + QUEUE_STATUS_BADGE_CLASS[row.reminder1.status] + '">' + QUEUE_STATUS_LABEL[row.reminder1.status] + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div class="geo-cell">' +
            '<span>กำหนดส่ง: ' + escapeHtml(row.reminder2.dateLabel) + '</span>' +
            '<span class="badge ' + QUEUE_STATUS_BADGE_CLASS[row.reminder2.status] + '">' + QUEUE_STATUS_LABEL[row.reminder2.status] + '</span>' +
          '</div>' +
        '</td>' +
        '<td><button type="button" class="btn btn-outline btn-sm btn-toggle-preview" data-row-id="' + row.id + '">' + (expandedRows[row.id] ? "ซ่อนตัวอย่างข้อความ" : "ดูตัวอย่างข้อความ") + '</button></td>';
      els.queueTableBody.appendChild(tr);

      if (expandedRows[row.id]) {
        var previewTr = document.createElement("tr");
        previewTr.className = "row-preview";
        var td = document.createElement("td");
        td.colSpan = 5;
        td.innerHTML =
          '<div class="line-preview-box">' +
            '<div class="line-preview-label">ข้อความตัวอย่าง — แจ้งเตือนล่วงหน้า รอบที่ 1 (ส่ง ' + escapeHtml(row.reminder1.dateLabel) + ')</div>' +
            '<p class="line-preview-text">' + escapeHtml(buildReminder1Message(row)) + '</p>' +
          '</div>' +
          '<div class="line-preview-box">' +
            '<div class="line-preview-label">ข้อความตัวอย่าง — แจ้งเตือนล่วงหน้า รอบที่ 2 (ส่ง ' + escapeHtml(row.reminder2.dateLabel) + ')</div>' +
            '<p class="line-preview-text">' + escapeHtml(buildReminder2Message(row)) + '</p>' +
          '</div>';
        previewTr.appendChild(td);
        els.queueTableBody.appendChild(previewTr);
      }
    });
  }

  function toggleRowPreview(id) {
    expandedRows[id] = !expandedRows[id];
    renderQueueTable();
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */
  function initEvents() {
    els.filterArea.addEventListener("change", function () {
      state.area = els.filterArea.value;
      renderPhotoGrid();
    });
    els.filterRange.addEventListener("change", function () {
      state.range = parseInt(els.filterRange.value, 10);
      renderPhotoGrid();
    });
    els.btnReset.addEventListener("click", function () {
      state.area = "all";
      state.range = 14;
      els.filterArea.value = state.area;
      els.filterRange.value = String(state.range);
      renderPhotoGrid();
    });

    els.queueTableBody.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-toggle-preview");
      if (btn) toggleRowPreview(parseInt(btn.getAttribute("data-row-id"), 10));
    });
  }

  function init() {
    populateFilters();
    els.filterArea.value = state.area;
    els.filterRange.value = String(state.range);
    renderPhotoGrid();
    renderQueueTable();
    initEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
