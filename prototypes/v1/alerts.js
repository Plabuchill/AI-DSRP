/* =========================================================
   AI Disease Surveillance & Response Platform
   Alerts — Alert & Response Management (assign / update status /
   close case), client-side filtering.

   Data note: ALERTS below is a standalone copy of the 8 mock
   alerts defined in script.js (Outbreak Dashboard "Recent Alerts"
   panel), extended with workflow fields (status, assignedTeam,
   closeNote). This page keeps its own state — it does not import
   or sync back to script.js/index.html (see BUILD-PLAN.md รอบ 7
   assumption).
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

  /* ---------------------------------------------------------
     Thai date/time formatting for "now" action timestamps
     (same pattern as reports.js)
     --------------------------------------------------------- */
  var THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  function pad2(n) { return n < 10 ? "0" + n : String(n); }

  function formatThaiDateTime(date) {
    var d = date.getDate();
    var m = THAI_MONTHS[date.getMonth()];
    var y = date.getFullYear() + 543;
    return d + " " + m + " " + y + ", " + pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + " น.";
  }

  /* ---------------------------------------------------------
     Reference data — disease/region labels copied from
     script.js; team names copied from case-intake.js (ทีมสอบสวน
     โรค เขต 1-5) and field-tracking.js/control-plan.js (ทีมพ่น 1-4)
     --------------------------------------------------------- */
  var DISEASE_NAMES = {
    dengue: "ไข้เลือดออก (Dengue Fever)",
    influenza: "ไข้หวัดใหญ่ (Influenza)",
    covid19: "โควิด-19 (COVID-19)",
    hfmd: "มือ เท้า ปาก (HFMD)",
    foodpoison: "อาหารเป็นพิษ (Food Poisoning)"
  };

  var REGION_NAMES = {
    north: "ภาคเหนือ",
    central: "ภาคกลาง",
    northeast: "ภาคตะวันออกเฉียงเหนือ",
    south: "ภาคใต้",
    east: "ภาคตะวันออก",
    west: "ภาคตะวันตก"
  };

  var TEAMS = [
    "ทีมสอบสวนโรค เขต 1",
    "ทีมสอบสวนโรค เขต 2",
    "ทีมสอบสวนโรค เขต 3",
    "ทีมสอบสวนโรค เขต 4",
    "ทีมสอบสวนโรค เขต 5",
    "ทีมพ่น 1",
    "ทีมพ่น 2",
    "ทีมพ่น 3",
    "ทีมพ่น 4"
  ];

  var STATUS_LABEL = { new: "ใหม่", in_progress: "กำลังดำเนินการ", closed: "ปิดเคสแล้ว" };
  var STATUS_BADGE_CLASS = { new: "badge-neutral", in_progress: "badge-inprogress", closed: "badge-confirmed" };
  var SEVERITY_LABEL = { warning: "เฝ้าระวัง", danger: "วิกฤต" };

  /* ---------------------------------------------------------
     Mock alerts — extends the 8-item ALERTS array from
     script.js with a workflow state, spread across new /
     in_progress / closed so the demo shows every UI state.
     `closing` is transient UI-only state (not part of the
     "real" data model) tracking whether the close-case editor
     is currently open for that row.
     --------------------------------------------------------- */
  var ALERTS = [
    {
      id: 1, diseaseId: "dengue", regionId: "south", province: "สงขลา", severity: "danger", hoursAgo: 3,
      message: "จำนวนผู้ป่วยไข้เลือดออกในเขตเทศบาลเพิ่มขึ้นเกิน 3 เท่าของค่าเฉลี่ย 7 วัน",
      status: "new", assignedTeam: null, assignedAtLabel: null, closeNote: null, closedAtLabel: null, closing: false
    },
    {
      id: 2, diseaseId: "covid19", regionId: "central", province: "กรุงเทพมหานคร (บางนา)", severity: "warning", hoursAgo: 9,
      message: "ตรวจพบคลัสเตอร์โควิด-19 ในสถานประกอบการย่านบางนา จำนวน 14 ราย",
      status: "in_progress", assignedTeam: "ทีมสอบสวนโรค เขต 2", assignedAtLabel: "19 ส.ค. 2569, 14:20 น.",
      closeNote: null, closedAtLabel: null, closing: false
    },
    {
      id: 3, diseaseId: "influenza", regionId: "north", province: "เชียงใหม่", severity: "warning", hoursAgo: 27,
      message: "โรงเรียนในอำเภอเมืองเชียงใหม่รายงานนักเรียนป่วยไข้หวัดใหญ่ ปิด 5 ห้องเรียน",
      status: "new", assignedTeam: null, assignedAtLabel: null, closeNote: null, closedAtLabel: null, closing: false
    },
    {
      id: 4, diseaseId: "hfmd", regionId: "central", province: "ปทุมธานี", severity: "warning", hoursAgo: 30,
      message: "ศูนย์เด็กเล็กพบเด็กป่วยโรคมือ เท้า ปาก 12 รายภายในสัปดาห์เดียว",
      status: "in_progress", assignedTeam: "ทีมสอบสวนโรค เขต 1", assignedAtLabel: "19 ส.ค. 2569, 10:05 น.",
      closeNote: null, closedAtLabel: null, closing: false
    },
    {
      id: 5, diseaseId: "dengue", regionId: "northeast", province: "อุบลราชธานี", severity: "danger", hoursAgo: 50,
      message: "อำเภอวารินชำราบยกระดับเป็นพื้นที่ระบาดไข้เลือดออก หลังพบผู้ป่วยสะสม 68 ราย",
      status: "in_progress", assignedTeam: "ทีมพ่น 3", assignedAtLabel: "18 ส.ค. 2569, 09:30 น.",
      closeNote: null, closedAtLabel: null, closing: false
    },
    {
      id: 6, diseaseId: "foodpoison", regionId: "east", province: "ชลบุรี (ศรีราชา)", severity: "warning", hoursAgo: 70,
      message: "พบผู้ป่วยอาหารเป็นพิษหลังงานเลี้ยงในอำเภอศรีราชา จำนวน 22 ราย",
      status: "closed", assignedTeam: "ทีมสอบสวนโรค เขต 3", assignedAtLabel: "17 ส.ค. 2569, 13:10 น.",
      closeNote: "สอบสวนพบต้นตอจากอาหารทะเลในงานเลี้ยง แจ้งเตือนร้านค้าที่เกี่ยวข้องแล้ว และเฝ้าระวังผู้ร่วมโต๊ะครบทุกรายแล้ว ไม่พบผู้ป่วยเพิ่มภายใน 3 วันหลังสอบสวน",
      closedAtLabel: "18 ส.ค. 2569, 16:40 น.", closing: false
    },
    {
      id: 7, diseaseId: "covid19", regionId: "south", province: "ภูเก็ต", severity: "warning", hoursAgo: 130,
      message: "พบผู้ติดเชื้อโควิด-19 ในกลุ่มนักท่องเที่ยวต่างชาติ 7 ราย",
      status: "closed", assignedTeam: "ทีมสอบสวนโรค เขต 5", assignedAtLabel: "14 ส.ค. 2569, 08:15 น.",
      closeNote: "ตรวจสอบผู้สัมผัสเสี่ยงสูงครบถ้วนแล้ว ไม่พบการแพร่ระบาดต่อในพื้นที่ ปิดเคสตามเกณฑ์เฝ้าระวังปกติ",
      closedAtLabel: "15 ส.ค. 2569, 11:00 น.", closing: false
    },
    {
      id: 8, diseaseId: "dengue", regionId: "west", province: "กาญจนบุรี", severity: "danger", hoursAgo: 200,
      message: "ยอดผู้ป่วยไข้เลือดออกสะสมทั้งจังหวัดเกิน 150 ราย ยกระดับมาตรการเฝ้าระวังขั้นสูง",
      status: "new", assignedTeam: null, assignedAtLabel: null, closeNote: null, closedAtLabel: null, closing: false
    }
  ];

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  var state = {
    status: "all",
    severity: "all"
  };

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    filterStatus: document.getElementById("filter-status"),
    filterSeverity: document.getElementById("filter-severity"),
    btnReset: document.getElementById("btn-reset-filters"),
    resultNote: document.getElementById("filter-result-note"),
    tableBody: document.getElementById("alerts-table-body")
  };

  /* ---------------------------------------------------------
     Formatting helpers
     --------------------------------------------------------- */
  function formatHoursAgo(hoursAgo) {
    if (hoursAgo < 1) return "เมื่อสักครู่";
    if (hoursAgo < 24) return hoursAgo + " ชั่วโมงที่แล้ว";
    return Math.floor(hoursAgo / 24) + " วันที่แล้ว";
  }

  function findAlert(id) {
    for (var i = 0; i < ALERTS.length; i++) {
      if (ALERTS[i].id === id) return ALERTS[i];
    }
    return null;
  }

  /* ---------------------------------------------------------
     Build the "ทีมที่มอบหมาย / การดำเนินการ" cell markup per
     workflow status (this is where assign / update-status /
     close-case all live)
     --------------------------------------------------------- */
  function teamOptionsHtml() {
    var opts = ['<option value="">เลือกทีม...</option>'];
    TEAMS.forEach(function (t) {
      opts.push('<option value="' + escapeHtml(t) + '">' + escapeHtml(t) + '</option>');
    });
    return opts.join("");
  }

  function buildActionCellHtml(a) {
    if (a.status === "new") {
      return (
        '<div class="assign-controls">' +
          '<select class="input-inline team-select" data-action="team-select" data-id="' + a.id + '" aria-label="เลือกทีมที่จะมอบหมาย">' +
            teamOptionsHtml() +
          '</select>' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="assign" data-id="' + a.id + '" disabled>มอบหมาย</button>' +
        '</div>'
      );
    }

    if (a.status === "in_progress" && !a.closing) {
      return (
        '<div class="assign-controls">' +
          '<span class="cell-primary">' + escapeHtml(a.assignedTeam) + '</span>' +
          '<span class="cell-secondary">มอบหมายเมื่อ ' + escapeHtml(a.assignedAtLabel) + '</span>' +
          '<button type="button" class="btn btn-outline btn-sm" data-action="start-close" data-id="' + a.id + '">ปิดเคส</button>' +
        '</div>'
      );
    }

    if (a.status === "in_progress" && a.closing) {
      return (
        '<div class="close-editor">' +
          '<span class="cell-primary">' + escapeHtml(a.assignedTeam) + '</span>' +
          '<textarea class="input-inline close-note-textarea" data-action="close-note-input" data-id="' + a.id + '" rows="3" placeholder="บันทึกสรุปผลก่อนปิดเคส (จำเป็นต้องกรอก)"></textarea>' +
          '<div class="row-actions">' +
            '<button type="button" class="btn btn-primary btn-sm" data-action="confirm-close" data-id="' + a.id + '" disabled>ยืนยันปิดเคส</button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-action="cancel-close" data-id="' + a.id + '">ยกเลิก</button>' +
          '</div>' +
        '</div>'
      );
    }

    // closed
    return (
      '<div class="assign-controls">' +
        '<span class="cell-primary">' + escapeHtml(a.assignedTeam) + '</span>' +
        '<span class="cell-secondary">ปิดเคสเมื่อ ' + escapeHtml(a.closedAtLabel) + '</span>' +
      '</div>'
    );
  }

  function buildRowHtml(a) {
    var diseaseName = DISEASE_NAMES[a.diseaseId] || a.diseaseId;
    var regionName = REGION_NAMES[a.regionId] || a.regionId;

    return (
      '<td><span class="cell-primary">' + escapeHtml(diseaseName) + '</span></td>' +
      '<td><span class="cell-primary">' + escapeHtml(regionName) + '</span><span class="cell-secondary">' + escapeHtml(a.province) + '</span></td>' +
      '<td><span class="badge badge-' + a.severity + '">' + escapeHtml(SEVERITY_LABEL[a.severity]) + '</span></td>' +
      '<td>' + escapeHtml(formatHoursAgo(a.hoursAgo)) + '</td>' +
      '<td>' + escapeHtml(a.message) + '</td>' +
      '<td><span class="badge ' + STATUS_BADGE_CLASS[a.status] + '">' + escapeHtml(STATUS_LABEL[a.status]) + '</span></td>' +
      '<td>' + buildActionCellHtml(a) + '</td>'
    );
  }

  function buildClosedNoteRowHtml(a) {
    return (
      '<tr class="row-preview"><td colspan="7">' +
        '<div class="line-preview-box">' +
          '<div class="line-preview-label">บันทึกสรุปการปิดเคส &middot; ' + escapeHtml(a.closedAtLabel) + '</div>' +
          '<p class="line-preview-text">' + escapeHtml(a.closeNote) + '</p>' +
        '</div>' +
      '</td></tr>'
    );
  }

  /* ---------------------------------------------------------
     Render: alerts table (filtered)
     --------------------------------------------------------- */
  function renderTable() {
    var filtered = ALERTS.filter(function (a) {
      var matchesStatus = state.status === "all" || a.status === state.status;
      var matchesSeverity = state.severity === "all" || a.severity === state.severity;
      return matchesStatus && matchesSeverity;
    });

    els.resultNote.textContent = "แสดง " + filtered.length + " จาก " + ALERTS.length + " รายการ";

    els.tableBody.innerHTML = "";

    if (filtered.length === 0) {
      var emptyTr = document.createElement("tr");
      emptyTr.innerHTML = '<td colspan="7"><div class="empty-state">ไม่พบการแจ้งเตือนตามเงื่อนไขตัวกรองที่เลือก</div></td>';
      els.tableBody.appendChild(emptyTr);
      return;
    }

    filtered.forEach(function (a) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-row-id", String(a.id));
      tr.innerHTML = buildRowHtml(a);
      els.tableBody.appendChild(tr);

      if (a.status === "closed") {
        var previewWrap = document.createElement("tbody");
        previewWrap.innerHTML = buildClosedNoteRowHtml(a);
        els.tableBody.appendChild(previewWrap.firstElementChild);
      }
    });
  }

  /* ---------------------------------------------------------
     Row action handlers (event delegation on tbody)
     --------------------------------------------------------- */
  function handleTableClick(evt) {
    var target = evt.target.closest("[data-action]");
    if (!target) return;
    var action = target.getAttribute("data-action");
    var id = parseInt(target.getAttribute("data-id"), 10);
    var alertItem = findAlert(id);
    if (!alertItem) return;

    if (action === "assign") {
      var row = target.closest("tr");
      var select = row.querySelector('[data-action="team-select"][data-id="' + id + '"]');
      var team = select ? select.value : "";
      if (!team) return;
      alertItem.status = "in_progress";
      alertItem.assignedTeam = team;
      alertItem.assignedAtLabel = formatThaiDateTime(new Date());
      renderTable();
      return;
    }

    if (action === "start-close") {
      alertItem.closing = true;
      renderTable();
      return;
    }

    if (action === "cancel-close") {
      alertItem.closing = false;
      renderTable();
      return;
    }

    if (action === "confirm-close") {
      var row2 = target.closest("tr");
      var textarea = row2.querySelector('[data-action="close-note-input"][data-id="' + id + '"]');
      var note = textarea ? textarea.value.trim() : "";
      if (!note) return;
      alertItem.status = "closed";
      alertItem.closeNote = note;
      alertItem.closedAtLabel = formatThaiDateTime(new Date());
      alertItem.closing = false;
      renderTable();
      return;
    }
  }

  function handleTableChange(evt) {
    var target = evt.target;
    if (target.getAttribute && target.getAttribute("data-action") === "team-select") {
      var id = parseInt(target.getAttribute("data-id"), 10);
      var row = target.closest("tr");
      var btn = row.querySelector('[data-action="assign"][data-id="' + id + '"]');
      if (btn) btn.disabled = !target.value;
    }
  }

  function handleTableInput(evt) {
    var target = evt.target;
    if (target.getAttribute && target.getAttribute("data-action") === "close-note-input") {
      var id = parseInt(target.getAttribute("data-id"), 10);
      var row = target.closest("tr");
      var btn = row.querySelector('[data-action="confirm-close"][data-id="' + id + '"]');
      if (btn) btn.disabled = target.value.trim().length === 0;
    }
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */
  function init() {
    els.filterStatus.addEventListener("change", function () {
      state.status = els.filterStatus.value;
      renderTable();
    });
    els.filterSeverity.addEventListener("change", function () {
      state.severity = els.filterSeverity.value;
      renderTable();
    });
    els.btnReset.addEventListener("click", function () {
      state.status = "all";
      state.severity = "all";
      els.filterStatus.value = state.status;
      els.filterSeverity.value = state.severity;
      renderTable();
    });

    els.tableBody.addEventListener("click", handleTableClick);
    els.tableBody.addEventListener("change", handleTableChange);
    els.tableBody.addEventListener("input", handleTableInput);

    renderTable();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
