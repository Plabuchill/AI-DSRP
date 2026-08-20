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
     --------------------------------------------------------- */
  var AREAS = [
    {
      id: 1,
      name: "ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์",
      clusterRef: "กลุ่มไข้เลือดออก ต.หนองบัว (ยืนยันแล้ว)",
      households: 86,
      radius: 150,
      riskLevel: "สูง"
    },
    {
      id: 2,
      name: "ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา",
      clusterRef: "กลุ่มไข้เลือดออก ต.หนองบัว (ยืนยันแล้ว)",
      households: 54,
      radius: 100,
      riskLevel: "สูง"
    },
    {
      id: 3,
      name: "ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่ + ศูนย์เด็กเล็ก",
      clusterRef: "กลุ่มมือ เท้า ปาก ต.บ้านเป็ด (รอยืนยัน)",
      households: 40,
      radius: 100,
      riskLevel: "ปานกลาง"
    },
    {
      id: 4,
      name: "ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย",
      clusterRef: "เคสไข้เลือดออกยืนยันใหม่ (จาก Case Intake)",
      households: 48,
      radius: 100,
      riskLevel: "ปานกลาง"
    }
  ];

  var selectedAreaIds = [1, 2]; // pre-select the two hottest zones for a realistic demo default

  function getAreaById(id) {
    for (var i = 0; i < AREAS.length; i++) {
      if (AREAS[i].id === id) return AREAS[i];
    }
    return null;
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

  function formatThaiDate(date) {
    var d = date.getDate();
    var m = THAI_MONTHS[date.getMonth()];
    var y = date.getFullYear() + 543;
    return d + " " + m + " " + y;
  }

  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"></path><path d="M22 2 15 22l-4-9-9-4 20-7Z"></path></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    areaSelectList: document.getElementById("area-select-list"),
    areaSelectSummary: document.getElementById("area-select-summary"),
    btnGenerateApproval: document.getElementById("btn-generate-approval"),
    approvalTextarea: document.getElementById("approval-textarea"),
    btnSendApproval: document.getElementById("btn-send-approval"),
    btnMockApprove: document.getElementById("btn-mock-approve"),
    approvalStatus: document.getElementById("approval-status"),
    btnGenerateWorkplan: document.getElementById("btn-generate-workplan"),
    workplanTextarea: document.getElementById("workplan-textarea"),
    btnConfirmWorkplan: document.getElementById("btn-confirm-workplan"),
    workplanStatus: document.getElementById("workplan-status")
  };

  /* ---------------------------------------------------------
     Approval request state machine: draft -> sent (รออนุมัติ) -> approved
     --------------------------------------------------------- */
  var approvalState = "draft"; // "draft" | "sent" | "approved"
  var approvalSentAtLabel = "";
  var approvalApprovedAtLabel = "";

  /* ---------------------------------------------------------
     Render: area selection list + running summary
     --------------------------------------------------------- */
  function renderAreaList() {
    els.areaSelectList.innerHTML = "";
    AREAS.forEach(function (area) {
      var checked = selectedAreaIds.indexOf(area.id) !== -1;
      var label = document.createElement("label");
      label.className = "area-select-item";
      label.innerHTML =
        '<input type="checkbox" data-area-id="' + area.id + '"' + (checked ? " checked" : "") + '>' +
        '<span class="area-select-body">' +
          '<span class="area-select-top">' +
            '<span class="area-select-name">' + escapeHtml(area.name) + "</span>" +
            '<span class="badge badge-' + (area.riskLevel === "สูง" ? "warning" : "neutral") + '">ความเสี่ยง' + escapeHtml(area.riskLevel) + "</span>" +
          "</span>" +
          '<span class="area-select-meta">' +
            "<span>อ้างอิง: " + escapeHtml(area.clusterRef) + "</span>" +
            "<span>" + area.households + " หลังคาเรือน &middot; รัศมีที่ต้องพ่น " + area.radius + " เมตร</span>" +
          "</span>" +
        "</span>";
      els.areaSelectList.appendChild(label);
    });

    var selectedAreas = AREAS.filter(function (a) { return selectedAreaIds.indexOf(a.id) !== -1; });
    var totalHouseholds = selectedAreas.reduce(function (sum, a) { return sum + a.households; }, 0);
    els.areaSelectSummary.textContent = selectedAreas.length === 0
      ? "ยังไม่ได้เลือกพื้นที่ — เลือกอย่างน้อย 1 พื้นที่เพื่อสร้างร่างเอกสาร"
      : "เลือกแล้ว " + selectedAreas.length + " พื้นที่ · รวม " + totalHouseholds + " หลังคาเรือน";

    els.btnGenerateApproval.disabled = selectedAreas.length === 0;
  }

  /* ---------------------------------------------------------
     Approval document generation — official-style template
     filled in from the selected areas' real mock data
     --------------------------------------------------------- */
  function buildApprovalText(selectedAreas) {
    var totalHouseholds = selectedAreas.reduce(function (sum, a) { return sum + a.households; }, 0);
    var maxRadius = Math.max.apply(null, selectedAreas.map(function (a) { return a.radius; }));

    var areaListText = selectedAreas.map(function (a, i) {
      return (i + 1) + ". " + a.name + " — " + a.households + " หลังคาเรือน, รัศมีพ่น " + a.radius + " เมตร (" + a.clusterRef + ")";
    }).join("\n");

    var lines = [
      "บันทึกข้อความ",
      "เรื่อง ขออนุมัติเบิกน้ำมันเชื้อเพลิงและน้ำยาเคมีกำจัดยุงลาย เพื่อปฏิบัติงานควบคุมโรคในพื้นที่ระบาด",
      "เรียน ผู้อำนวยการกองสาธารณสุขและสิ่งแวดล้อม",
      "",
      "ตามที่งานเฝ้าระวังโรคตรวจพบกลุ่มผู้ป่วยที่เชื่อมโยงกันในพื้นที่ดังต่อไปนี้ จำนวนรวม " + selectedAreas.length + " พื้นที่ ครอบคลุม " + totalHouseholds + " หลังคาเรือน จึงมีความจำเป็นต้องปฏิบัติงานพ่นสารเคมีกำจัดยุงลายและแหล่งเพาะพันธุ์ในรัศมีสูงสุด " + maxRadius + " เมตรจากบ้านผู้ป่วย เพื่อควบคุมการแพร่ระบาดโดยเร็ว รายละเอียดพื้นที่มีดังนี้",
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
      "หมายเหตุ: ร่างเอกสารนี้สร้างโดยระบบ AI จากข้อมูลพื้นที่ที่เลือกไว้ในระบบ โปรดตรวจสอบความถูกต้องและปรับแก้ก่อนยื่นขออนุมัติจริง"
    ];
    return lines.join("\n");
  }

  function generateApproval() {
    var selectedAreas = AREAS.filter(function (a) { return selectedAreaIds.indexOf(a.id) !== -1; });
    if (selectedAreas.length === 0) return;

    els.approvalTextarea.value = buildApprovalText(selectedAreas);
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
    var today = new Date();
    var day1 = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
    var day2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

    var lines = [
      "แผนปฏิบัติงานควบคุมโรค (ร่างโดยระบบ AI)",
      "สร้างเมื่อ: " + formatThaiDateTime(new Date()),
      "",
      "การมอบหมายทีม:",
      "1. ทีมพ่น 1 — รับผิดชอบ ต.หนองบัว หมู่ 4 บ้านโนนสวรรค์ (86 หลังคาเรือน) — ปฏิบัติงาน " + formatThaiDate(day1),
      "2. ทีมพ่น 2 — รับผิดชอบ ต.หนองบัว หมู่ 5 บ้านหนองบัวพัฒนา (54 หลังคาเรือน) — ปฏิบัติงาน " + formatThaiDate(day1),
      "3. ทีมพ่น 3 — รับผิดชอบ ต.บ้านเป็ด หมู่ 3 บ้านเป็ดใหม่ + ศูนย์เด็กเล็ก (40 หลังคาเรือน) — ปฏิบัติงาน " + formatThaiDate(day2),
      "4. ทีมพ่น 4 — รับผิดชอบ ต.เกาะแก้ว หมู่ 5 บ้านหาดทราย (48 หลังคาเรือน) — ปฏิบัติงาน " + formatThaiDate(day2),
      "",
      "ขั้นตอนปฏิบัติงาน:",
      "1. ประชุมทีมและตรวจสอบอุปกรณ์/น้ำยาเคมีก่อนออกปฏิบัติงาน 07:30 น.",
      "2. แจ้ง อสม./ผู้นำชุมชนในพื้นที่ล่วงหน้า 1 วัน ให้เตรียมเปิดบ้านรับทีมพ่น",
      "3. พ่นสารเคมีกำจัดยุงลายภายในและรอบบ้านตามรัศมีที่กำหนด เริ่มจากบ้านผู้ป่วยออกไปยังรอบนอก",
      "4. สำรวจและทำลายแหล่งเพาะพันธุ์ลูกน้ำยุงลาย (ภาชนะขังน้ำ) ควบคู่กับการพ่นสารเคมี",
      "5. บันทึกภาพถ่ายหน้าบ้านที่พ่นแล้วทุกจุด พร้อมพิกัดและเวลา เพื่อใช้ตรวจสอบย้อนหลัง",
      "6. รายงานผลความคืบหน้าผ่านหน้า Field Tracking ทุก 2 ชั่วโมงระหว่างปฏิบัติงาน",
      "",
      "มาตรการป้องกันทีมปฏิบัติงาน:",
      "- สวมอุปกรณ์ป้องกันส่วนบุคคล (PPE): หน้ากาก แว่นตา ถุงมือ เสื้อแขนยาว ตลอดการพ่นสารเคมี",
      "- หลีกเลี่ยงการพ่นสารเคมีในบริเวณที่มีอาหาร/แหล่งน้ำดื่มโดยไม่ปิดคลุมป้องกันก่อน",
      "- พักดื่มน้ำและล้างมือทุก 1 ชั่วโมง งดสูบบุหรี่ระหว่างพ่นสารเคมี",
      "",
      "หมายเหตุ: ร่างแผนนี้สร้างโดยระบบ AI จากข้อมูลพื้นที่ที่มีในระบบ โปรดตรวจสอบความถูกต้องและปรับแก้ให้เหมาะกับสถานการณ์จริงก่อนใช้งาน"
    ];
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
      var checkbox = e.target.closest("input[data-area-id]");
      if (!checkbox) return;
      var id = parseInt(checkbox.getAttribute("data-area-id"), 10);
      var idx = selectedAreaIds.indexOf(id);
      if (checkbox.checked && idx === -1) {
        selectedAreaIds.push(id);
      } else if (!checkbox.checked && idx !== -1) {
        selectedAreaIds.splice(idx, 1);
      }
      renderAreaList();
    });

    els.btnGenerateApproval.addEventListener("click", generateApproval);
    els.btnSendApproval.addEventListener("click", sendApproval);
    els.btnMockApprove.addEventListener("click", mockApprove);
    els.btnGenerateWorkplan.addEventListener("click", generateWorkplan);
    els.btnConfirmWorkplan.addEventListener("click", confirmWorkplan);
  }

  function init() {
    renderAreaList();
    initEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
