/* =========================================================
   AI Disease Surveillance & Response Platform
   Case Intake — mock OCR review / notification / spot map pipeline
   (separate script from script.js: this page has its own DOM/state,
   dashboard's script.js is not reused here to avoid id collisions)
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Reference data — 5 investigation teams (เขต 1-5, mock)
     --------------------------------------------------------- */
  var TEAMS = {
    1: "ทีมสอบสวนโรค เขต 1",
    2: "ทีมสอบสวนโรค เขต 2",
    3: "ทีมสอบสวนโรค เขต 3",
    4: "ทีมสอบสวนโรค เขต 4",
    5: "ทีมสอบสวนโรค เขต 5"
  };

  /* ---------------------------------------------------------
     Subdistrict (ตำบล) -> investigation team (zone) mapping.
     Derived from the known service areas of each team (mock),
     used to re-route a case automatically when its subdistrict
     is corrected during inline edit. Unknown subdistrict values
     keep the case's existing team assignment unchanged.
     --------------------------------------------------------- */
  var SUBDISTRICT_TEAM_MAP = {
    "บ้านเป็ด": 3,
    "หนองบัว": 3,
    "ท่าช้าง": 2,
    "สันติสุข": 1,
    "คลองใหญ่": 4,
    "เกาะแก้ว": 5
  };

  /* ---------------------------------------------------------
     Mock cases — OCR-extracted data awaiting human review.
     Case #1 is pre-seeded as already confirmed, to show the
     "downstream" state (notification log + pinned on map) on load.
     --------------------------------------------------------- */
  var CASES = [
    {
      id: 1,
      fileName: "รพ.สต.บ้านเป็ด_290857_case01.pdf",
      fileType: "PDF",
      fileSize: "842 KB",
      uploadedLabel: "19 ส.ค. 2569, 13:40 น.",
      patientName: "กิตติ มั่นคง",
      hn: "HN-57765",
      houseNo: "45",
      villageNo: "3",
      village: "บ้านเป็ดใหม่",
      subdistrict: "บ้านเป็ด",
      district: "เมือง",
      province: "ขอนแก่น",
      onsetDate: "14 ส.ค. 2569",
      labResult: "มือ เท้า ปาก (HFMD) — Positive",
      zone: 3,
      geoAccuracy: "high",
      geoAdjusted: false,
      status: "confirmed",
      mapX: 22, mapY: 68,
      seedLogTimestamp: "19 ส.ค. 2569, 14:02 น."
    },
    {
      id: 2,
      fileName: "รพช.เมืองขอนแก่น_scan_0231.jpg",
      fileType: "JPEG",
      fileSize: "1.4 MB",
      uploadedLabel: "20 ส.ค. 2569, 08:05 น.",
      patientName: "สมหญิง ใจดี",
      hn: "HN-58231",
      houseNo: "12",
      villageNo: "4",
      village: "บ้านโนนสวรรค์",
      subdistrict: "หนองบัว",
      district: "เมือง",
      province: "ขอนแก่น",
      onsetDate: "15 ส.ค. 2569",
      labResult: "ไข้เลือดออก (Dengue NS1) — Positive",
      zone: 3,
      geoAccuracy: "low",
      geoAdjusted: false,
      status: "pending",
      mapX: 30, mapY: 45
    },
    {
      id: 3,
      fileName: "รพ.นครราชสีมา_report_60142.pdf",
      fileType: "PDF",
      fileSize: "763 KB",
      uploadedLabel: "20 ส.ค. 2569, 08:12 น.",
      patientName: "ประเสริฐ ศรีสุข",
      hn: "HN-60142",
      houseNo: "5",
      villageNo: "2",
      village: "บ้านท่าช้าง",
      subdistrict: "ท่าช้าง",
      district: "เมือง",
      province: "นครราชสีมา",
      onsetDate: "16 ส.ค. 2569",
      labResult: "ไข้หวัดใหญ่ (Influenza A) — Positive",
      zone: 2,
      geoAccuracy: "high",
      geoAdjusted: false,
      status: "pending",
      mapX: 55, mapY: 30
    },
    {
      id: 4,
      fileName: "รพ.แม่ริม_lab_59987.pdf",
      fileType: "PDF",
      fileSize: "690 KB",
      uploadedLabel: "20 ส.ค. 2569, 08:20 น.",
      patientName: "วาสนา บุญมี",
      hn: "HN-59987",
      houseNo: "33",
      villageNo: "7",
      village: "บ้านสันติสุข",
      subdistrict: "สันติสุข",
      district: "แม่ริม",
      province: "เชียงใหม่",
      onsetDate: "17 ส.ค. 2569",
      labResult: "โควิด-19 (RT-PCR) — Positive",
      zone: 1,
      geoAccuracy: "high",
      geoAdjusted: false,
      status: "pending",
      mapX: 78, mapY: 55
    },
    {
      id: 5,
      fileName: "รพ.บางละมุง_foodpoison_61200.jpg",
      fileType: "JPEG",
      fileSize: "1.1 MB",
      uploadedLabel: "20 ส.ค. 2569, 08:31 น.",
      patientName: "อนุชา ทองแท้",
      hn: "HN-61200",
      houseNo: "8",
      villageNo: "1",
      village: "บ้านคลองใหญ่",
      subdistrict: "คลองใหญ่",
      district: "บางละมุง",
      province: "ชลบุรี",
      onsetDate: "18 ส.ค. 2569",
      labResult: "อาหารเป็นพิษ — ยืนยันทางคลินิก",
      zone: 4,
      geoAccuracy: "low",
      geoAdjusted: false,
      status: "pending",
      mapX: 45, mapY: 80
    },
    {
      id: 6,
      fileName: "รพ.สต.เกาะแก้ว_dengue_58890.pdf",
      fileType: "PDF",
      fileSize: "905 KB",
      uploadedLabel: "20 ส.ค. 2569, 08:44 น.",
      patientName: "ละออ แสงจันทร์",
      hn: "HN-58890",
      houseNo: "21",
      villageNo: "5",
      village: "บ้านหาดทราย",
      subdistrict: "เกาะแก้ว",
      district: "เมือง",
      province: "สงขลา",
      onsetDate: "19 ส.ค. 2569",
      labResult: "ไข้เลือดออก (Dengue NS1) — Positive",
      zone: 5,
      geoAccuracy: "high",
      geoAdjusted: false,
      status: "pending",
      mapX: 65, mapY: 20
    }
  ];

  // Notification log — seeded with the log entry for the pre-confirmed case.
  var NOTIFICATIONS = [
    {
      caseId: 1,
      teamName: TEAMS[3],
      timestampLabel: CASES[0].seedLogTimestamp,
      patientName: CASES[0].patientName,
      subdistrict: CASES[0].subdistrict
    }
  ];

  function getCaseById(id) {
    for (var i = 0; i < CASES.length; i++) {
      if (CASES[i].id === id) return CASES[i];
    }
    return null;
  }

  // Id of the row currently in inline-edit mode (null = no row being edited).
  // Only one row can be edited at a time.
  var editingId = null;

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

  /* ---------------------------------------------------------
     Shared inline icons (thin-line, monochrome — matches DESIGN.md)
     --------------------------------------------------------- */
  var ICON_FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6l1 4H8l1-4Z"></path><path d="M6 6h12l1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 6Z"></path></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"></path><path d="M22 2 15 22l-4-9-9-4 20-7Z"></path></svg>';
  var ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"></path></svg>';

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    dropzone: document.getElementById("dropzone"),
    uploadFileList: document.getElementById("upload-file-list"),
    ocrPanelSubtitle: document.getElementById("ocr-panel-subtitle"),
    ocrTableBody: document.getElementById("ocr-table-body"),
    spotmapWrap: document.getElementById("spotmap-wrap"),
    notifPanelSubtitle: document.getElementById("notif-panel-subtitle"),
    notificationLog: document.getElementById("notification-log")
  };

  /* ---------------------------------------------------------
     Render: Upload file list (sample data; status label reflects
     whether the row has since been confirmed by a human)
     --------------------------------------------------------- */
  function renderUploadList() {
    els.uploadFileList.innerHTML = "";
    CASES.forEach(function (c) {
      var confirmed = c.status === "confirmed";
      var statusHtml = confirmed
        ? '<span class="badge badge-confirmed upload-file-status">ประมวลผลและแจ้งเตือนแล้ว</span>'
        : '<span class="badge badge-neutral upload-file-status">แปลงข้อมูลสำเร็จ &middot; พร้อมตรวจสอบ</span>';

      var item = document.createElement("div");
      item.className = "upload-file-item";
      item.innerHTML =
        '<div class="upload-file-icon">' + ICON_FILE + "</div>" +
        '<div class="upload-file-info">' +
          '<span class="upload-file-name">' + c.fileName + "</span>" +
          '<span class="upload-file-meta">' +
            "<span>" + c.fileType + " &middot; " + c.fileSize + "</span>" +
            "<span>อัปโหลดเมื่อ " + c.uploadedLabel + "</span>" +
          "</span>" +
        "</div>" +
        statusHtml;
      els.uploadFileList.appendChild(item);
    });
  }

  /* ---------------------------------------------------------
     Render: OCR review table
     --------------------------------------------------------- */
  function geoCellHtml(c) {
    if (c.geoAccuracy === "high") {
      return '<div class="geo-cell"><span class="geo-note">พิกัดแม่นยำสูง</span></div>';
    }
    if (c.geoAdjusted) {
      return (
        '<div class="geo-cell">' +
          '<span class="badge badge-adjusted">ปรับพิกัดด้วยมือแล้ว</span>' +
          '<button type="button" class="btn btn-outline btn-sm btn-toggle-geo" data-id="' + c.id + '">เลิกทำ</button>' +
        "</div>"
      );
    }
    return (
      '<div class="geo-cell">' +
        '<span class="badge badge-flag">พิกัดแม่นยำต่ำ</span>' +
        '<button type="button" class="btn btn-outline btn-sm btn-toggle-geo" data-id="' + c.id + '">ปรับพิกัดด้วยมือ</button>' +
      "</div>"
    );
  }

  function actionCellHtml(c, editing) {
    if (c.status === "confirmed") {
      return '<span class="confirmed-check">' + ICON_CHECK + "ยืนยันแล้ว</span>";
    }
    if (editing) {
      return (
        '<div class="row-actions">' +
          '<button type="button" class="btn btn-primary btn-sm btn-save-edit" data-id="' + c.id + '">บันทึก</button>' +
          '<button type="button" class="btn btn-outline btn-sm btn-cancel-edit" data-id="' + c.id + '">ยกเลิก</button>' +
        "</div>"
      );
    }
    return (
      '<div class="row-actions">' +
        '<button type="button" class="btn btn-outline btn-sm btn-edit-row" data-id="' + c.id + '">' + ICON_EDIT + "แก้ไข</button>" +
        '<button type="button" class="btn btn-primary btn-sm btn-confirm" data-id="' + c.id + '">ยืนยัน</button>' +
      "</div>"
    );
  }

  /* -- Editable cells: ชื่อ-สกุล/HN, ที่อยู่/ตำบล-หมู่บ้าน, วันป่วย, ผลตรวจ.
     Each renders either plain text (default) or inline <input> fields
     (when the row is the one currently being edited). -- */
  function nameCellHtml(c, editing) {
    if (editing) {
      return (
        '<div class="edit-field-group">' +
          '<input type="text" class="input-inline" data-field="patientName" value="' + escapeHtml(c.patientName) + '" placeholder="ชื่อ-สกุล" aria-label="ชื่อ-สกุล">' +
          '<input type="text" class="input-inline" data-field="hn" value="' + escapeHtml(c.hn) + '" placeholder="HN" aria-label="HN">' +
        "</div>"
      );
    }
    return '<span class="cell-primary">' + escapeHtml(c.patientName) + '</span><span class="cell-secondary">' + escapeHtml(c.hn) + "</span>";
  }

  function addressCellHtml(c, editing) {
    if (editing) {
      return (
        '<div class="edit-field-group">' +
          '<div class="edit-field-row">' +
            '<input type="text" class="input-inline input-inline-xs" data-field="houseNo" value="' + escapeHtml(c.houseNo) + '" placeholder="เลขที่" aria-label="บ้านเลขที่">' +
            '<input type="text" class="input-inline input-inline-xs" data-field="villageNo" value="' + escapeHtml(c.villageNo) + '" placeholder="หมู่" aria-label="หมู่ที่">' +
            '<input type="text" class="input-inline" data-field="village" value="' + escapeHtml(c.village) + '" placeholder="ชื่อหมู่บ้าน" aria-label="ชื่อหมู่บ้าน">' +
          "</div>" +
          '<input type="text" class="input-inline" data-field="subdistrict" value="' + escapeHtml(c.subdistrict) + '" placeholder="ตำบล" aria-label="ตำบล">' +
          '<span class="cell-secondary edit-hint">อ.' + escapeHtml(c.district) + " จ." + escapeHtml(c.province) + " &middot; ทีมรับผิดชอบจะปรับอัตโนมัติเมื่อบันทึก ถ้าตำบลตรงกับพื้นที่ที่ระบบรู้จัก</span>" +
        "</div>"
      );
    }
    return (
      '<span class="cell-primary">บ้านเลขที่ ' + escapeHtml(c.houseNo) + " หมู่ " + escapeHtml(c.villageNo) + " " + escapeHtml(c.village) + "</span>" +
      '<span class="cell-secondary">ต.' + escapeHtml(c.subdistrict) + " อ." + escapeHtml(c.district) + " จ." + escapeHtml(c.province) + "</span>" +
      '<span class="cell-secondary">ทีมรับผิดชอบ: ' + TEAMS[c.zone] + "</span>"
    );
  }

  function onsetCellHtml(c, editing) {
    if (editing) {
      return '<input type="text" class="input-inline" data-field="onsetDate" value="' + escapeHtml(c.onsetDate) + '" placeholder="วันป่วย" aria-label="วันป่วย">';
    }
    return escapeHtml(c.onsetDate);
  }

  function labResultCellHtml(c, editing) {
    if (editing) {
      return '<input type="text" class="input-inline" data-field="labResult" value="' + escapeHtml(c.labResult) + '" placeholder="ผลตรวจ" aria-label="ผลตรวจ">';
    }
    return escapeHtml(c.labResult);
  }

  function renderOCRTable() {
    els.ocrTableBody.innerHTML = "";

    CASES.forEach(function (c) {
      var confirmed = c.status === "confirmed";
      var editing = c.id === editingId;
      var tr = document.createElement("tr");
      tr.className = confirmed ? "row-confirmed" : (editing ? "row-editing" : "");
      tr.setAttribute("data-row-id", c.id);
      tr.innerHTML =
        "<td>" +
          '<a class="file-link" href="#" data-file="' + c.fileName + '" title="เปิดไฟล์ต้นฉบับใน Google Drive (จำลอง)">' +
            ICON_FILE + "ไฟล์ต้นฉบับ" +
          "</a>" +
        "</td>" +
        "<td>" + nameCellHtml(c, editing) + "</td>" +
        "<td>" + addressCellHtml(c, editing) + "</td>" +
        "<td>" + onsetCellHtml(c, editing) + "</td>" +
        "<td>" + labResultCellHtml(c, editing) + "</td>" +
        "<td>" + geoCellHtml(c) + "</td>" +
        "<td>" +
          (confirmed
            ? '<span class="badge badge-confirmed">ยืนยันแล้ว</span>'
            : '<span class="badge badge-neutral">รอตรวจสอบ</span>') +
        "</td>" +
        "<td>" + actionCellHtml(c, editing) + "</td>";
      els.ocrTableBody.appendChild(tr);
    });

    var pending = CASES.filter(function (c) { return c.status === "pending"; }).length;
    var doneCount = CASES.length - pending;
    els.ocrPanelSubtitle.textContent = "รอตรวจสอบ " + pending + " รายการ · ยืนยันแล้ว " + doneCount + " รายการ";
  }

  /* ---------------------------------------------------------
     Render: Notification log (reuses .alert-list/.alert-item
     visual pattern from the dashboard for consistency)
     --------------------------------------------------------- */
  function renderNotificationLog() {
    els.notifPanelSubtitle.textContent = "ส่งแจ้งเตือนแล้ว " + NOTIFICATIONS.length + " ครั้ง";
    els.notificationLog.innerHTML = "";

    if (NOTIFICATIONS.length === 0) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "ยังไม่มีการแจ้งเตือนทีมสอบสวนโรค";
      els.notificationLog.appendChild(empty);
      return;
    }

    NOTIFICATIONS.forEach(function (n) {
      var item = document.createElement("div");
      item.className = "alert-item";
      item.innerHTML =
        '<div class="alert-icon badge-confirmed">' + ICON_SEND + "</div>" +
        '<div class="alert-body">' +
          '<div class="alert-top-row">' +
            '<span class="alert-title">' + n.teamName + "</span>" +
            '<span class="badge badge-confirmed">ส่งแล้ว</span>' +
          "</div>" +
          '<p class="body-secondary" style="font-size:14px;color:var(--color-text-primary)">' +
            "เคสผู้ป่วย " + n.patientName + " &middot; ต." + n.subdistrict +
          "</p>" +
          '<div class="alert-meta"><span>' + n.timestampLabel + "</span></div>" +
        "</div>";
      els.notificationLog.appendChild(item);
    });
  }

  /* ---------------------------------------------------------
     Render: Spot map (inline SVG — abstract village grid,
     pins for confirmed cases + 100m radius rings)
     --------------------------------------------------------- */
  function buildSpotMapSVG() {
    var W = 640, H = 380;
    var confirmed = CASES.filter(function (c) { return c.status === "confirmed"; });
    var parts = [];

    parts.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="แผนที่จุดเกิดเหตุระดับตำบลหมู่บ้าน">');
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#F5F1EA" stroke="#DCD3C4" stroke-width="1"></rect>');

    var step = 64;
    for (var gx = step; gx < W; gx += step) {
      parts.push('<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + H + '" stroke="#DCD3C4" stroke-width="1" stroke-opacity="0.6"></line>');
    }
    for (var gy = step; gy < H; gy += step) {
      parts.push('<line x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="#DCD3C4" stroke-width="1" stroke-opacity="0.6"></line>');
    }

    // simple road line for visual orientation only (abstract, not geodata)
    parts.push('<line x1="0" y1="' + (H * 0.62) + '" x2="' + W + '" y2="' + (H * 0.5) + '" stroke="#B3A996" stroke-width="3" stroke-dasharray="10 8" stroke-opacity="0.6"></line>');
    parts.push('<text x="12" y="20" font-size="11" fill="#6E6355" font-family="Inter, system-ui, sans-serif">แผนที่จำลอง — ไม่อ้างอิงพิกัดจริง</text>');

    if (confirmed.length === 0) {
      parts.push('<text x="' + (W / 2) + '" y="' + (H / 2) + '" text-anchor="middle" font-size="13" fill="#6E6355" font-family="Inter, system-ui, sans-serif">ยังไม่มีเคสที่ยืนยันแล้วบนแผนที่</text>');
    }

    confirmed.forEach(function (c) {
      var px = (c.mapX / 100) * W;
      var py = (c.mapY / 100) * H;
      var flagged = c.geoAccuracy === "low" && !c.geoAdjusted;
      var adjusted = c.geoAccuracy === "low" && c.geoAdjusted;
      var color = flagged ? "#C9A66B" : (adjusted ? "#7A6A53" : "#8A9A5B");
      var dash = flagged ? ' stroke-dasharray="5 4"' : "";
      var statusLabel = flagged ? "พิกัดแม่นยำต่ำ (ยังไม่ปรับ)" : (adjusted ? "ปรับพิกัดด้วยมือแล้ว" : "พิกัดแม่นยำสูง");

      parts.push('<g class="spot-pin-group">');
      parts.push('<circle cx="' + px + '" cy="' + py + '" r="30" fill="' + color + '" fill-opacity="0.14" stroke="' + color + '" stroke-width="1.5"' + dash + '></circle>');
      parts.push('<circle cx="' + px + '" cy="' + py + '" r="6" fill="' + color + '"></circle>');
      parts.push('<text x="' + px + '" y="' + (py - 14) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#33291F" font-family="Inter, system-ui, sans-serif">' + c.patientName.split(" ")[0] + "</text>");
      parts.push('<text x="' + px + '" y="' + (py + 22) + '" text-anchor="middle" font-size="10" fill="#6E6355" font-family="Inter, system-ui, sans-serif">ต.' + c.subdistrict + "</text>");
      parts.push("<title>" + c.patientName + " (" + c.hn + ") — ต." + c.subdistrict + " อ." + c.district + " จ." + c.province + " · " + TEAMS[c.zone] + " · " + statusLabel + "</title>");
      parts.push("</g>");
    });

    parts.push("</svg>");
    return parts.join("");
  }

  function renderSpotMap() {
    els.spotmapWrap.innerHTML = buildSpotMapSVG();
  }

  /* ---------------------------------------------------------
     Actions
     --------------------------------------------------------- */
  function confirmCase(id) {
    var c = getCaseById(id);
    if (!c || c.status === "confirmed") return;

    c.status = "confirmed";
    var now = new Date();
    NOTIFICATIONS.unshift({
      caseId: c.id,
      teamName: TEAMS[c.zone],
      timestampLabel: formatThaiDateTime(now),
      patientName: c.patientName,
      subdistrict: c.subdistrict
    });

    renderOCRTable();
    renderUploadList();
    renderNotificationLog();
    renderSpotMap();
  }

  function toggleGeoAdjust(id) {
    var c = getCaseById(id);
    if (!c || c.geoAccuracy !== "low") return;
    c.geoAdjusted = !c.geoAdjusted;
    renderOCRTable();
    renderSpotMap();
  }

  /* -- Inline edit of an OCR row (pending rows only): start / cancel / save -- */
  function startEdit(id) {
    var c = getCaseById(id);
    if (!c || c.status === "confirmed") return;
    editingId = id;
    renderOCRTable();
  }

  function cancelEdit() {
    editingId = null;
    renderOCRTable();
  }

  function saveEdit(id, rowEl) {
    var c = getCaseById(id);
    if (!c || !rowEl) return;

    var inputs = rowEl.querySelectorAll("[data-field]");
    var newSubdistrict = null;
    inputs.forEach(function (input) {
      var field = input.getAttribute("data-field");
      var value = input.value.trim();
      c[field] = value;
      if (field === "subdistrict") newSubdistrict = value;
    });

    // Auto-route: if the corrected subdistrict matches a known area, reassign
    // the responsible team. Unknown subdistrict values keep the current team.
    if (newSubdistrict && SUBDISTRICT_TEAM_MAP.hasOwnProperty(newSubdistrict)) {
      c.zone = SUBDISTRICT_TEAM_MAP[newSubdistrict];
    }

    editingId = null;
    renderOCRTable();
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */
  function initEvents() {
    // Event delegation for confirm / geo-toggle buttons and mock file links
    els.ocrTableBody.addEventListener("click", function (e) {
      var editBtn = e.target.closest(".btn-edit-row");
      if (editBtn) {
        startEdit(parseInt(editBtn.getAttribute("data-id"), 10));
        return;
      }
      var saveBtn = e.target.closest(".btn-save-edit");
      if (saveBtn) {
        saveEdit(parseInt(saveBtn.getAttribute("data-id"), 10), saveBtn.closest("tr"));
        return;
      }
      var cancelBtn = e.target.closest(".btn-cancel-edit");
      if (cancelBtn) {
        cancelEdit();
        return;
      }
      var confirmBtn = e.target.closest(".btn-confirm");
      if (confirmBtn) {
        confirmCase(parseInt(confirmBtn.getAttribute("data-id"), 10));
        return;
      }
      var geoBtn = e.target.closest(".btn-toggle-geo");
      if (geoBtn) {
        toggleGeoAdjust(parseInt(geoBtn.getAttribute("data-id"), 10));
        return;
      }
      var fileLink = e.target.closest(".file-link");
      if (fileLink) {
        e.preventDefault();
      }
    });

    // Dropzone — mock drag/drop visual feedback only (no real file handling)
    if (els.dropzone) {
      ["dragenter", "dragover"].forEach(function (evt) {
        els.dropzone.addEventListener(evt, function (e) {
          e.preventDefault();
          els.dropzone.classList.add("dragover");
        });
      });
      ["dragleave", "drop"].forEach(function (evt) {
        els.dropzone.addEventListener(evt, function (e) {
          e.preventDefault();
          els.dropzone.classList.remove("dragover");
        });
      });
    }
  }

  function init() {
    renderUploadList();
    renderOCRTable();
    renderNotificationLog();
    renderSpotMap();
    initEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
