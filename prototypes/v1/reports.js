/* =========================================================
   AI Disease Surveillance & Response Platform
   Reports — mock executive summary (daily/weekly toggle), KPI
   cards, generated summary text, and send-history log.
   (separate script: own DOM/state, no cross-page import; KPI
   numbers are standalone mock values chosen to stay consistent
   in spirit with the other v1 pages' mock data wherever possible
   — see BUILD-PLAN.md รอบ 6 assumption — not a live query across
   pages.)
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

  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"></path><path d="M22 2 15 22l-4-9-9-4 20-7Z"></path></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';
  var ICON_DOWNLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13"></path><path d="M7 12l5 5 5-5"></path><path d="M4 21h16"></path></svg>';

  /* ---------------------------------------------------------
     Mock KPI data per period. Sourced/kept consistent where
     possible with:
       - จำนวนเคสรวม (daily): CASES.length in case-intake.js (6
         mock cases received via Case Intake) — weekly adds a
         cumulative estimate across the week including the cases
         under investigation in case-analysis.js (9 cases).
       - พื้นที่ควบคุมโรคแล้ว (พ่นแล้ว): TEAMS status in
         field-tracking.js (4 teams/zones planned, 1 "พ่นแล้ว" today).
       - รูปถ่ายผ่าน QC: PHOTOS array in field-tracking.js
         (8 photos, 6 pass location+time match today).
       - HI/CI: standard dengue-vector epidemiology mock indices
         (House Index / Container Index); HI < 10 is treated as
         "อยู่ในเกณฑ์ควบคุมได้" per WHO/DDC guidance used for the
         report wording only (not a live calculation).
       - รายงานสอบสวนที่ส่งแล้ว: standalone mock count aligned in
         spirit with the "ส่งให้ผู้บริหาร" action in case-analysis.js,
         not read from its live state.
     --------------------------------------------------------- */
  var PERIOD_DATA = {
    daily: {
      label: "รายวัน",
      rangeLabel: "ข้อมูล ณ วันที่ 20 ส.ค. 2569",
      reportRangeText: "วันนี้ (20 ส.ค. 2569)",
      totalCases: 6,
      totalCasesTrendPct: 20,
      totalCasesTrendLabel: "เทียบเมื่อวาน",
      sprayedDone: 1,
      sprayedTotal: 4,
      qcPass: 6,
      qcTotal: 8,
      hi: 7,
      ci: 3,
      reportsSent: 2
    },
    weekly: {
      label: "รายสัปดาห์",
      rangeLabel: "ข้อมูลสะสม 14–20 ส.ค. 2569",
      reportRangeText: "สัปดาห์นี้ (14–20 ส.ค. 2569)",
      totalCases: 34,
      totalCasesTrendPct: -8,
      totalCasesTrendLabel: "เทียบสัปดาห์ก่อนหน้า",
      sprayedDone: 3,
      sprayedTotal: 4,
      qcPass: 42,
      qcTotal: 51,
      hi: 9,
      ci: 4,
      reportsSent: 5
    }
  };

  /* ---------------------------------------------------------
     Mock report send-history log (static, spans both report
     types — not filtered by the daily/weekly toggle above)
     --------------------------------------------------------- */
  var HISTORY = [
    { dateLabel: "20 ส.ค. 2569 (รายวัน)", type: "รายงานประจำวัน", channel: "LINE (กลุ่มผู้บริหาร)", status: "sent" },
    { dateLabel: "19 ส.ค. 2569 (รายวัน)", type: "รายงานประจำวัน", channel: "LINE (กลุ่มผู้บริหาร)", status: "sent" },
    { dateLabel: "18 ส.ค. 2569 (รายวัน)", type: "รายงานประจำวัน", channel: "PDF (อีเมล)", status: "sent" },
    { dateLabel: "13–19 ส.ค. 2569 (รายสัปดาห์)", type: "รายงานประจำสัปดาห์", channel: "LINE + PDF (กลุ่มผู้บริหาร)", status: "sent" },
    { dateLabel: "6–12 ส.ค. 2569 (รายสัปดาห์)", type: "รายงานประจำสัปดาห์", channel: "PDF (อีเมล)", status: "sent" }
  ];

  var STATUS_LABEL = { sent: "ส่งแล้ว" };

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  var state = {
    period: "daily"
  };

  var lineSentAtLabel = "";
  var pdfDownloadedAtLabel = "";

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    btnPeriodDaily: document.getElementById("btn-period-daily"),
    btnPeriodWeekly: document.getElementById("btn-period-weekly"),
    periodRangeNote: document.getElementById("period-range-note"),

    kpiTotalCases: document.getElementById("kpi-total-cases"),
    kpiTotalCasesTrend: document.getElementById("kpi-total-cases-trend"),
    kpiSprayedPct: document.getElementById("kpi-sprayed-pct"),
    kpiSprayedPctNote: document.getElementById("kpi-sprayed-pct-note"),
    kpiQcPct: document.getElementById("kpi-qc-pct"),
    kpiQcPctNote: document.getElementById("kpi-qc-pct-note"),
    kpiHici: document.getElementById("kpi-hici"),
    kpiHiciNote: document.getElementById("kpi-hici-note"),
    kpiReportsSent: document.getElementById("kpi-reports-sent"),
    kpiReportsSentNote: document.getElementById("kpi-reports-sent-note"),

    btnGenerateSummary: document.getElementById("btn-generate-summary"),
    summaryTextarea: document.getElementById("summary-textarea"),
    btnSendLine: document.getElementById("btn-send-line"),
    btnDownloadPdf: document.getElementById("btn-download-pdf"),
    summaryStatus: document.getElementById("summary-status"),

    historySubtitle: document.getElementById("history-subtitle"),
    historyTableBody: document.getElementById("history-table-body")
  };

  /* ---------------------------------------------------------
     Render: period toggle buttons + range note
     --------------------------------------------------------- */
  function renderPeriodToggle() {
    var isDaily = state.period === "daily";

    els.btnPeriodDaily.className = "btn " + (isDaily ? "btn-primary" : "btn-outline") + " period-toggle-btn";
    els.btnPeriodDaily.setAttribute("aria-pressed", isDaily ? "true" : "false");
    els.btnPeriodWeekly.className = "btn " + (!isDaily ? "btn-primary" : "btn-outline") + " period-toggle-btn";
    els.btnPeriodWeekly.setAttribute("aria-pressed", !isDaily ? "true" : "false");

    els.periodRangeNote.textContent = PERIOD_DATA[state.period].rangeLabel;
  }

  /* ---------------------------------------------------------
     Render: KPI cards
     --------------------------------------------------------- */
  function pct(part, total) {
    return total === 0 ? 0 : Math.round((part / total) * 100);
  }

  function setTrendBadge(el, pctChange, label) {
    var cls, arrow;
    if (pctChange > 0) { cls = "up-bad"; arrow = "▲"; }
    else if (pctChange < 0) { cls = "down-good"; arrow = "▼"; }
    else { cls = "neutral"; arrow = "–"; }
    el.className = "kpi-trend " + cls;
    el.textContent = arrow + " " + Math.abs(pctChange) + "% " + label;
  }

  function renderKPIs() {
    var d = PERIOD_DATA[state.period];

    els.kpiTotalCases.textContent = d.totalCases.toLocaleString("th-TH") + " ราย";
    setTrendBadge(els.kpiTotalCasesTrend, d.totalCasesTrendPct, d.totalCasesTrendLabel);

    var sprayedPct = pct(d.sprayedDone, d.sprayedTotal);
    els.kpiSprayedPct.textContent = sprayedPct + "%";
    els.kpiSprayedPctNote.className = "kpi-trend neutral";
    els.kpiSprayedPctNote.textContent = d.sprayedDone + " จาก " + d.sprayedTotal + " โซนที่วางแผนไว้";

    var qcPct = pct(d.qcPass, d.qcTotal);
    var qcFail = d.qcTotal - d.qcPass;
    els.kpiQcPct.textContent = qcPct + "%";
    els.kpiQcPctNote.className = "kpi-trend " + (qcFail > 0 ? "badge-warning" : "badge-success");
    els.kpiQcPctNote.textContent = d.qcPass + " จาก " + d.qcTotal + " รูป" + (qcFail > 0 ? " · ต้องตรวจสอบเพิ่ม " + qcFail + " รูป" : " · ผ่านทั้งหมด");

    els.kpiHici.textContent = d.hi + " / " + d.ci;
    var hiOk = d.hi < 10;
    els.kpiHiciNote.className = "kpi-trend " + (hiOk ? "badge-success" : "badge-warning");
    els.kpiHiciNote.textContent = "HI " + d.hi + " · CI " + d.ci + " — " + (hiOk ? "อยู่ในเกณฑ์ควบคุมได้ (HI < 10)" : "ควรเร่งสำรวจ/ทำลายแหล่งเพาะพันธุ์ลูกน้ำยุงลาย");

    els.kpiReportsSent.textContent = d.reportsSent + " ฉบับ";
    els.kpiReportsSentNote.className = "kpi-trend neutral";
    els.kpiReportsSentNote.textContent = "ส่งผู้บริหารแล้วในช่วงนี้";
  }

  /* ---------------------------------------------------------
     Summary report text generation — template filled in from
     the current period's KPI values (not free-form AI
     generation, see BUILD-PLAN.md assumption)
     --------------------------------------------------------- */
  function buildSummaryText() {
    var d = PERIOD_DATA[state.period];
    var sprayedPct = pct(d.sprayedDone, d.sprayedTotal);
    var qcPct = pct(d.qcPass, d.qcTotal);
    var qcFail = d.qcTotal - d.qcPass;
    var hiOk = d.hi < 10;
    var trendWord = d.totalCasesTrendPct > 0 ? "เพิ่มขึ้น" : (d.totalCasesTrendPct < 0 ? "ลดลง" : "ทรงตัว");

    var lines = [
      "รายงานสรุปสถานการณ์เฝ้าระวังและควบคุมโรค (" + d.label + ")",
      "ช่วงเวลา: " + d.reportRangeText,
      "สร้างเมื่อ: " + formatThaiDateTime(new Date()),
      "",
      "1. ภาพรวมจำนวนผู้ป่วย",
      "   จำนวนเคสรวมในช่วงนี้: " + d.totalCases + " ราย (" + trendWord + " " + Math.abs(d.totalCasesTrendPct) + "% " + d.totalCasesTrendLabel + ")",
      "",
      "2. สถานะควบคุมโรค (พ่นสารเคมีกำจัดยุงลาย)",
      "   พื้นที่ที่ปฏิบัติงานพ่นสารเคมีแล้ว: " + d.sprayedDone + " จาก " + d.sprayedTotal + " โซนที่วางแผนไว้ (" + sprayedPct + "%)",
      "",
      "3. คุณภาพข้อมูลภาคสนาม (AI Vision QC)",
      "   รูปถ่ายยืนยันที่ผ่านการตรวจสอบพิกัด/เวลาอัตโนมัติ: " + d.qcPass + " จาก " + d.qcTotal + " รูป (" + qcPct + "%)" +
        (qcFail > 0 ? " — เหลือ " + qcFail + " รูปที่ต้องตรวจสอบด้วยมือ" : " — ผ่านครบทุกรูป"),
      "",
      "4. ดัชนีลูกน้ำยุงลาย (HI/CI)",
      "   House Index (HI): " + d.hi + "   Container Index (CI): " + d.ci,
      "   สถานะ: " + (hiOk
        ? "อยู่ในเกณฑ์ควบคุมได้ (HI ต่ำกว่า 10)"
        : "เกินเกณฑ์ที่ควบคุมได้ (HI ตั้งแต่ 10 ขึ้นไป) ควรเร่งดำเนินการสำรวจและทำลายแหล่งเพาะพันธุ์ลูกน้ำยุงลายเพิ่มเติม"),
      "",
      "5. รายงานสอบสวนโรค",
      "   ส่งให้ผู้บริหารแล้วในช่วงนี้: " + d.reportsSent + " ฉบับ",
      "",
      "ข้อเสนอแนะ: ทีมควบคุมโรคควรเร่งปฏิบัติงานในโซนที่ยังไม่ได้พ่นสารเคมีให้ครบตามแผน และทีมภาคสนามควรตรวจสอบรูปถ่ายที่พิกัด/เวลาไม่ตรงด้วยมือโดยเร็ว เพื่อยืนยันความครอบคลุมของการควบคุมโรคในพื้นที่",
      "",
      "หมายเหตุ: รายงานนี้สร้างจากตัวชี้วัดรวมของทุกทีมในระบบ โปรดตรวจสอบความถูกต้องและปรับแก้ก่อนส่งให้ผู้บริหารจริง"
    ];
    return lines.join("\n");
  }

  function generateSummary() {
    els.summaryTextarea.value = buildSummaryText();
    lineSentAtLabel = "";
    pdfDownloadedAtLabel = "";
    els.btnSendLine.disabled = false;
    els.btnDownloadPdf.disabled = false;
    renderSummaryStatus();
  }

  /* ---------------------------------------------------------
     Send/download mock actions — status badges with timestamp
     --------------------------------------------------------- */
  function renderSummaryStatus() {
    var parts = [];
    if (lineSentAtLabel) {
      parts.push('<span class="badge badge-confirmed">' + ICON_SEND + "ส่งผ่าน LINE แล้ว &middot; " + escapeHtml(lineSentAtLabel) + "</span>");
    }
    if (pdfDownloadedAtLabel) {
      parts.push('<span class="badge badge-confirmed">' + ICON_DOWNLOAD + "ดาวน์โหลด PDF แล้ว &middot; " + escapeHtml(pdfDownloadedAtLabel) + "</span>");
    }
    els.summaryStatus.innerHTML = parts.join("");
  }

  function sendViaLine() {
    var text = els.summaryTextarea.value.trim();
    if (!text) return;
    lineSentAtLabel = formatThaiDateTime(new Date());
    renderSummaryStatus();
  }

  function downloadPdf() {
    var text = els.summaryTextarea.value.trim();
    if (!text) return;
    pdfDownloadedAtLabel = formatThaiDateTime(new Date());
    renderSummaryStatus();
  }

  /* ---------------------------------------------------------
     Render: report send-history table (static log)
     --------------------------------------------------------- */
  function renderHistoryTable() {
    els.historySubtitle.textContent = HISTORY.length + " รายการล่าสุด";
    els.historyTableBody.innerHTML = "";

    HISTORY.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td><span class=\"cell-primary\">" + escapeHtml(row.dateLabel) + "</span></td>" +
        "<td>" + escapeHtml(row.type) + "</td>" +
        "<td>" + escapeHtml(row.channel) + "</td>" +
        "<td><span class=\"badge badge-confirmed\">" + ICON_CHECK + escapeHtml(STATUS_LABEL[row.status]) + "</span></td>";
      els.historyTableBody.appendChild(tr);
    });
  }

  /* ---------------------------------------------------------
     Period switching — resets the in-progress draft, since a
     generated summary corresponds to one specific period
     --------------------------------------------------------- */
  function setPeriod(period) {
    if (state.period === period) return;
    state.period = period;

    els.summaryTextarea.value = "";
    els.btnSendLine.disabled = true;
    els.btnDownloadPdf.disabled = true;
    lineSentAtLabel = "";
    pdfDownloadedAtLabel = "";
    renderSummaryStatus();

    renderPeriodToggle();
    renderKPIs();
  }

  /* ---------------------------------------------------------
     Event wiring
     --------------------------------------------------------- */
  function initEvents() {
    els.btnPeriodDaily.addEventListener("click", function () { setPeriod("daily"); });
    els.btnPeriodWeekly.addEventListener("click", function () { setPeriod("weekly"); });
    els.btnGenerateSummary.addEventListener("click", generateSummary);
    els.btnSendLine.addEventListener("click", sendViaLine);
    els.btnDownloadPdf.addEventListener("click", downloadPdf);
  }

  function init() {
    renderPeriodToggle();
    renderKPIs();
    renderHistoryTable();
    initEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
