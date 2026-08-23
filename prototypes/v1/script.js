/* =========================================================
   AI Disease Surveillance & Response Platform
   Outbreak Dashboard — mock data + client-side filtering
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Reference data
     --------------------------------------------------------- */
  var DISEASES = [
    { id: "all", name: "ทุกโรค (All Diseases)" },
    { id: "dengue", name: "ไข้เลือดออก (Dengue Fever)" },
    { id: "influenza", name: "ไข้หวัดใหญ่ (Influenza)" },
    { id: "covid19", name: "โควิด-19 (COVID-19)" },
    { id: "hfmd", name: "มือ เท้า ปาก (HFMD)" },
    { id: "foodpoison", name: "อาหารเป็นพิษ (Food Poisoning)" }
  ];

  // เขตบริการของเทศบาล 4 เขต แต่ละเขตประกอบด้วยชุมชนย่อย (รวม 63 ชุมชน)
  // และทีมสอบสวนโรคที่รับผิดชอบแต่ละชุมชน (เขต 1-5 — ชื่อทีมตรงกับ convention
  // ที่ใช้อยู่แล้วใน case-intake.js/alerts.js: "ทีมสอบสวนโรค เขต N")
  // รอบ 21 (2026-08-23): แทนที่ REGIONS เดิม (6 ภาคทั่วประเทศ) ด้วยโครงสร้าง
  // เขตบริการ/ชุมชนของเทศบาลเดียว ให้ตรงกับหน้าอื่นทั้งหมดในระบบ
  var ZONES = [
    {
      id: "zone1",
      name: "เขตบริการ 1",
      communities: [
        { name: "ราชเดชดำรง", teamId: 1 },
        { name: "วัดพระแก้ว", teamId: 1 },
        { name: "ดอยทอง", teamId: 1 },
        { name: "น้ำลัด", teamId: 1 },
        { name: "ทวีรัตน์", teamId: 1 },
        { name: "เทิดพระเกียรติ", teamId: 1 },
        { name: "เกาะลอย", teamId: 1 },
        { name: "วัดใหม่หน้าค่าย", teamId: 5 },
        { name: "ป่างิ้ว", teamId: 5 },
        { name: "ฮ่องลี่", teamId: 5 },
        { name: "หนองเหียงสันโค้งสามัคคี", teamId: 5 },
        { name: "รั้วเหล็กเหนือ", teamId: 5 },
        { name: "รั้วเหล็กใต้", teamId: 5 },
        { name: "กองยาว", teamId: 5 }
      ]
    },
    {
      id: "zone2",
      name: "เขตบริการ 2",
      communities: [
        { name: "ร่องเสือเต้น", teamId: 2 },
        { name: "บ้านใหม่", teamId: 2 },
        { name: "สามัคคีมั่นคง", teamId: 2 },
        { name: "ป่าตึงริมกก", teamId: 2 },
        { name: "สันต้นเปา", teamId: 2 },
        { name: "สันตาลเหลือง", teamId: 2 },
        { name: "ฝั่งหมิ่น", teamId: 2 },
        { name: "ป่าแดง", teamId: 2 },
        { name: "เอื้ออาทรริมกก", teamId: 2 },
        { name: "แควหวาย", teamId: 5 },
        { name: "ริมน้ำกก", teamId: 5 },
        { name: "กกโท้งใต้", teamId: 5 },
        { name: "มุสลิมกกโท้ง", teamId: 5 },
        { name: "บ้านไร่", teamId: 5 },
        { name: "เกาะทอง", teamId: 5 },
        { name: "วังดิน", teamId: 5 }
      ]
    },
    {
      id: "zone3",
      name: "เขตบริการ 3",
      communities: [
        { name: "หน้าสนามกีฬาฯ", teamId: 5 },
        { name: "ร่องปลาค้าว", teamId: 3 },
        { name: "หนองบัว", teamId: 3 },
        { name: "สันติสุข", teamId: 3 },
        { name: "สันหนอง", teamId: 3 },
        { name: "ดอยสะเก็น", teamId: 3 },
        { name: "ศรีทรายมูล", teamId: 3 },
        { name: "สันสลี", teamId: 3 },
        { name: "สันป่าก๊อ", teamId: 3 },
        { name: "สันขี้เบ้า", teamId: 3 },
        { name: "สันคอกช้าง", teamId: 5 },
        { name: "สันกลาง", teamId: 5 },
        { name: "สันป่าหนาด", teamId: 5 },
        { name: "ศรีเกิด", teamId: 5 },
        { name: "เจ็ดยอด", teamId: 5 },
        { name: "สันสุด", teamId: 5 }
      ]
    },
    {
      id: "zone4",
      name: "เขตบริการ 4",
      communities: [
        { name: "หัวฝาย", teamId: 4 },
        { name: "หน้าศูนย์วิจัยพืชสวน", teamId: 4 },
        { name: "หนองปึ๋ง", teamId: 4 },
        { name: "ดอยเขาควาย", teamId: 5 },
        { name: "รอยพระพุทธบาท", teamId: 5 },
        { name: "ดอยพระบาท", teamId: 5 },
        { name: "แม่กรณ์", teamId: 5 },
        { name: "เด่นห้า", teamId: 5 },
        { name: "สันโค้งน้อย", teamId: 5 },
        { name: "สันโค้งหลวง", teamId: 5 },
        { name: "ประตูเชียงใหม่สามัคคี", teamId: 5 },
        { name: "ธารน้ำกรณ์", teamId: 5 },
        { name: "สันป่าก่อเหนือ", teamId: 5 },
        { name: "สันป่าก่อไทยใหญ่", teamId: 5 },
        { name: "ป่าตึง", teamId: 5 },
        { name: "สันเมืองเหล็ก", teamId: 5 },
        { name: "ป่าส้าน", teamId: 5 }
      ]
    }
  ];

  function teamLabel(teamId) {
    return "ทีมสอบสวนโรค เขต " + teamId;
  }

  // Baseline daily new-case level + per-zone multiplier + 14-day risk thresholds per disease.
  var DISEASE_CONFIG = {
    dengue: {
      baseline: 6,
      zoneFactor: { zone1: 1.1, zone2: 1.4, zone3: 1.6, zone4: 0.9 },
      thresholds14: { warning: 60, danger: 110 }
    },
    influenza: {
      baseline: 5,
      zoneFactor: { zone1: 1.3, zone2: 1.1, zone3: 0.9, zone4: 0.8 },
      thresholds14: { warning: 55, danger: 95 }
    },
    covid19: {
      baseline: 4,
      zoneFactor: { zone1: 0.8, zone2: 1.6, zone3: 1.2, zone4: 0.9 },
      thresholds14: { warning: 45, danger: 80 }
    },
    hfmd: {
      baseline: 2.5,
      zoneFactor: { zone1: 1.0, zone2: 1.4, zone3: 1.0, zone4: 0.85 },
      thresholds14: { warning: 30, danger: 55 }
    },
    foodpoison: {
      baseline: 1.3,
      zoneFactor: { zone1: 0.9, zone2: 1.2, zone3: 1.3, zone4: 0.85 },
      thresholds14: { warning: 16, danger: 30 }
    }
  };

  var DISEASE_IDS = Object.keys(DISEASE_CONFIG);
  var DAYS_TOTAL = 30; // length of generated daily series (index 0 = 29 days ago ... index 29 = today)

  // รอบ 21: alert ทั้ง 8 รายการ อ้างอิงชุมชนจริงในเขตบริการ 1-4 แทนจังหวัดทั่วประเทศเดิม
  var ALERTS = [
    { id: 1, diseaseId: "dengue", zoneId: "zone3", community: "หนองบัว", severity: "danger", hoursAgo: 3,
      message: "จำนวนผู้ป่วยไข้เลือดออกในชุมชนหนองบัวเพิ่มขึ้นเกิน 3 เท่าของค่าเฉลี่ย 7 วัน" },
    { id: 2, diseaseId: "covid19", zoneId: "zone2", community: "ป่าตึงริมกก", severity: "warning", hoursAgo: 9,
      message: "ตรวจพบคลัสเตอร์โควิด-19 ในสถานประกอบการย่านชุมชนป่าตึงริมกก จำนวน 14 ราย" },
    { id: 3, diseaseId: "influenza", zoneId: "zone1", community: "วัดพระแก้ว", severity: "warning", hoursAgo: 27,
      message: "โรงเรียนในชุมชนวัดพระแก้วรายงานนักเรียนป่วยไข้หวัดใหญ่ ปิด 5 ห้องเรียน" },
    { id: 4, diseaseId: "hfmd", zoneId: "zone4", community: "หัวฝาย", severity: "warning", hoursAgo: 30,
      message: "ศูนย์เด็กเล็กในชุมชนหัวฝายพบเด็กป่วยโรคมือ เท้า ปาก 12 รายภายในสัปดาห์เดียว" },
    { id: 5, diseaseId: "dengue", zoneId: "zone2", community: "แควหวาย", severity: "danger", hoursAgo: 50,
      message: "ชุมชนแควหวายยกระดับเป็นพื้นที่ระบาดไข้เลือดออก หลังพบผู้ป่วยสะสม 68 ราย" },
    { id: 6, diseaseId: "foodpoison", zoneId: "zone3", community: "สันติสุข", severity: "warning", hoursAgo: 70,
      message: "พบผู้ป่วยอาหารเป็นพิษหลังงานเลี้ยงในชุมชนสันติสุข จำนวน 22 ราย" },
    { id: 7, diseaseId: "covid19", zoneId: "zone4", community: "หน้าศูนย์วิจัยพืชสวน", severity: "warning", hoursAgo: 130,
      message: "พบผู้มาติดต่อราชการติดเชื้อโควิด-19 บริเวณชุมชนหน้าศูนย์วิจัยพืชสวน 7 ราย" },
    { id: 8, diseaseId: "dengue", zoneId: "zone1", community: "เกาะลอย", severity: "danger", hoursAgo: 200,
      message: "ยอดผู้ป่วยไข้เลือดออกสะสมในชุมชนเกาะลอยเกิน 150 ราย ยกระดับมาตรการเฝ้าระวังขั้นสูง" }
  ];

  /* ---------------------------------------------------------
     Deterministic pseudo-random series generator
     (stable across reloads — same seed always yields same data)
     --------------------------------------------------------- */
  function hashSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generateSeries(diseaseId, zoneId) {
    var cfg = DISEASE_CONFIG[diseaseId];
    var base = cfg.baseline * cfg.zoneFactor[zoneId];
    var rng = mulberry32(hashSeed(diseaseId + "|" + zoneId));
    var arr = [];
    var val = base;
    for (var i = 0; i < DAYS_TOTAL; i++) {
      var noise = (rng() - 0.5) * base * 0.7;
      val = val * 0.65 + (base + noise) * 0.35;
      if (val < 0) val = 0;
      arr.push(val);
    }
    return arr.map(function (v) { return Math.round(v); });
  }

  // Cache: seriesCache[diseaseId][zoneId] = number[30]
  var seriesCache = {};
  DISEASE_IDS.forEach(function (d) {
    seriesCache[d] = {};
    ZONES.forEach(function (z) {
      seriesCache[d][z.id] = generateSeries(d, z.id);
    });
  });

  function sumArrays(arrays) {
    var len = DAYS_TOTAL;
    var out = new Array(len).fill(0);
    arrays.forEach(function (a) {
      for (var i = 0; i < len; i++) out[i] += a[i];
    });
    return out;
  }

  // Series for a disease filter ("all" = summed across all diseases) for one zone.
  function seriesFor(diseaseId, zoneId) {
    if (diseaseId === "all") {
      return sumArrays(DISEASE_IDS.map(function (d) { return seriesCache[d][zoneId]; }));
    }
    return seriesCache[diseaseId][zoneId];
  }

  function periodSum(series, rangeDays) {
    var slice = series.slice(DAYS_TOTAL - rangeDays);
    return slice.reduce(function (a, b) { return a + b; }, 0);
  }

  // "Active cases" snapshot: trailing 14-day sum scaled up slightly to represent
  // an ongoing monitored caseload (not just new cases).
  function activeCasesFor(diseaseId, zoneId) {
    var series = seriesFor(diseaseId, zoneId);
    return Math.round(periodSum(series, 14) * 1.15);
  }

  function newCasesTodayFor(diseaseId, zoneId) {
    var series = seriesFor(diseaseId, zoneId);
    return series[series.length - 1];
  }

  function thresholds14For(diseaseId) {
    if (diseaseId === "all") {
      var warning = 0, danger = 0;
      DISEASE_IDS.forEach(function (d) {
        warning += DISEASE_CONFIG[d].thresholds14.warning;
        danger += DISEASE_CONFIG[d].thresholds14.danger;
      });
      return { warning: warning, danger: danger };
    }
    return DISEASE_CONFIG[diseaseId].thresholds14;
  }

  function riskLevelFor(diseaseId, zoneId, rangeDays) {
    var series = seriesFor(diseaseId, zoneId);
    var sum = periodSum(series, rangeDays);
    var th = thresholds14For(diseaseId);
    var scale = rangeDays / 14;
    if (sum > th.danger * scale) return "danger";
    if (sum > th.warning * scale) return "warning";
    return "success";
  }

  var RISK_RANK = { success: 0, warning: 1, danger: 2 };
  var RISK_LABEL = { success: "ปกติ", warning: "เฝ้าระวัง", danger: "วิกฤต" };

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  var state = {
    disease: "all",
    zone: "all",
    range: 14,
    expandedZones: {}
  };

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    filterDisease: document.getElementById("filter-disease"),
    filterZone: document.getElementById("filter-zone"),
    filterRange: document.getElementById("filter-range"),
    btnReset: document.getElementById("btn-reset-filters"),

    kpiActiveCases: document.getElementById("kpi-active-cases"),
    kpiActiveCasesTrend: document.getElementById("kpi-active-cases-trend"),
    kpiNewToday: document.getElementById("kpi-new-today"),
    kpiNewTodayTrend: document.getElementById("kpi-new-today-trend"),
    kpiOutbreakZones: document.getElementById("kpi-outbreak-zones"),
    kpiOutbreakZonesNote: document.getElementById("kpi-outbreak-zones-note"),
    kpiRiskLevel: document.getElementById("kpi-risk-level"),
    kpiRiskLevelNote: document.getElementById("kpi-risk-level-note"),
    kpiRiskIconWrap: document.getElementById("kpi-risk-icon-wrap"),

    zoneGrid: document.getElementById("zone-grid"),
    zonePanelSubtitle: document.getElementById("zone-panel-subtitle"),

    chartWrap: document.getElementById("chart-wrap"),
    chartPanelSubtitle: document.getElementById("chart-panel-subtitle"),

    alertList: document.getElementById("alert-list")
  };

  /* ---------------------------------------------------------
     Populate filter dropdowns
     --------------------------------------------------------- */
  function populateFilters() {
    DISEASES.forEach(function (d) {
      var opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.name;
      els.filterDisease.appendChild(opt);
    });

    var optAllZone = document.createElement("option");
    optAllZone.value = "all";
    optAllZone.textContent = "ทุกเขตบริการ (All Zones)";
    els.filterZone.appendChild(optAllZone);
    ZONES.forEach(function (z) {
      var opt = document.createElement("option");
      opt.value = z.id;
      opt.textContent = z.name;
      els.filterZone.appendChild(opt);
    });
  }

  /* ---------------------------------------------------------
     Number formatting
     --------------------------------------------------------- */
  function fmt(n) {
    return n.toLocaleString("th-TH");
  }

  /* ---------------------------------------------------------
     Render: KPI cards
     --------------------------------------------------------- */
  function relevantZoneIds() {
    return state.zone === "all" ? ZONES.map(function (z) { return z.id; }) : [state.zone];
  }

  function renderKPIs() {
    var zoneIds = relevantZoneIds();
    var diseaseId = state.disease;

    // Total Active Cases
    var totalActive = 0;
    zoneIds.forEach(function (zid) { totalActive += activeCasesFor(diseaseId, zid); });

    // New Cases Today
    var totalNewToday = 0;
    zoneIds.forEach(function (zid) { totalNewToday += newCasesTodayFor(diseaseId, zid); });

    // Trend comparison: last 7 days vs prior 7 days (independent of range filter)
    var last7 = 0, prior7 = 0;
    zoneIds.forEach(function (zid) {
      var series = seriesFor(diseaseId, zid);
      last7 += series.slice(DAYS_TOTAL - 7).reduce(function (a, b) { return a + b; }, 0);
      prior7 += series.slice(DAYS_TOTAL - 14, DAYS_TOTAL - 7).reduce(function (a, b) { return a + b; }, 0);
    });
    var pctChange = prior7 === 0 ? 0 : Math.round(((last7 - prior7) / prior7) * 100);

    els.kpiActiveCases.textContent = fmt(totalActive);
    els.kpiNewToday.textContent = fmt(totalNewToday);

    setTrendBadge(els.kpiActiveCasesTrend, pctChange, "เทียบสัปดาห์ก่อนหน้า");
    setTrendBadge(els.kpiNewTodayTrend, pctChange, "เทียบสัปดาห์ก่อนหน้า");

    // Active Outbreak Zones + Overall Risk Level
    var zoneCount = 0;
    var worstRisk = "success";
    zoneIds.forEach(function (zid) {
      var risk = riskLevelFor(diseaseId, zid, state.range);
      if (risk === "warning" || risk === "danger") zoneCount++;
      if (RISK_RANK[risk] > RISK_RANK[worstRisk]) worstRisk = risk;
    });

    els.kpiOutbreakZones.textContent = zoneCount;
    els.kpiOutbreakZonesNote.textContent = "จากทั้งหมด " + zoneIds.length + " เขตบริการที่แสดงผล";

    els.kpiRiskLevel.textContent = RISK_LABEL[worstRisk];
    els.kpiRiskLevelNote.className = "kpi-trend badge-" + worstRisk;
    els.kpiRiskLevelNote.textContent = zoneCount === 0
      ? "ไม่มีเขตบริการเข้าเกณฑ์เฝ้าระวัง"
      : zoneCount + " เขตบริการเข้าเกณฑ์เฝ้าระวัง/วิกฤต";

    els.kpiRiskIconWrap.className = "kpi-icon tone-" + (worstRisk === "success" ? "success" : worstRisk);
  }

  function setTrendBadge(el, pct, label) {
    var cls, arrow;
    if (pct > 0) { cls = "up-bad"; arrow = "▲"; }
    else if (pct < 0) { cls = "down-good"; arrow = "▼"; }
    else { cls = "neutral"; arrow = "–"; }
    el.className = "kpi-trend " + cls;
    el.textContent = arrow + " " + Math.abs(pct) + "% " + label;
  }

  /* ---------------------------------------------------------
     Render: Zone risk grid ("map") + community accordion
     --------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderZoneGrid() {
    els.zoneGrid.innerHTML = "";
    var rangeLabel = state.range + " วัน";
    els.zonePanelSubtitle.textContent = "เคสสะสมช่วง " + rangeLabel + "ล่าสุด";

    ZONES.forEach(function (zone) {
      var series = seriesFor(state.disease, zone.id);
      var cases = periodSum(series, state.range);
      var risk = riskLevelFor(state.disease, zone.id, state.range);
      var isDimmed = state.zone !== "all" && state.zone !== zone.id;
      var isExpanded = !!state.expandedZones[zone.id];
      var listId = "zone-communities-" + zone.id;

      var cell = document.createElement("div");
      cell.className = "region-cell risk-" + risk + (isExpanded ? " expanded" : "");
      cell.dataset.zoneId = zone.id;
      if (isDimmed) {
        cell.style.opacity = "0.35";
      }

      var communityItemsHtml = zone.communities.map(function (c) {
        return '<div class="zone-community-item">' +
          '<span class="zone-community-name">' + escapeHtml(c.name) + '</span>' +
          '<span class="badge badge-neutral">' + escapeHtml(teamLabel(c.teamId)) + '</span>' +
        '</div>';
      }).join("");

      cell.innerHTML =
        '<div class="region-cell-top">' +
          '<span class="region-name">' + escapeHtml(zone.name) + '</span>' +
          '<span class="risk-dot risk-' + risk + '"></span>' +
        '</div>' +
        '<span class="region-cases">' + fmt(cases) + '</span>' +
        '<span class="region-cases-label">เคสใน ' + rangeLabel + ' &middot; ' + zone.communities.length + ' ชุมชน</span>' +
        '<button type="button" class="zone-toggle-btn" aria-expanded="' + (isExpanded ? "true" : "false") + '" aria-controls="' + listId + '">' +
          '<span class="zone-toggle-label">' + (isExpanded ? "ซ่อนรายชื่อชุมชน" : "ดูรายชื่อชุมชน") + '</span>' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>' +
        '</button>' +
        '<div class="zone-community-list" id="' + listId + '"' + (isExpanded ? "" : " hidden") + '>' +
          communityItemsHtml +
        '</div>';

      els.zoneGrid.appendChild(cell);
    });
  }

  // Event delegation: toggle a zone's community accordion without a full re-render
  // (reuses the .region-cell / .badge patterns already in styles.css — see รอบ 21
  // note there for why no new visual component was introduced).
  function onZoneGridClick(e) {
    var btn = e.target.closest(".zone-toggle-btn");
    if (!btn) return;
    var cell = btn.closest(".region-cell");
    if (!cell) return;
    var zoneId = cell.dataset.zoneId;
    var expanded = !state.expandedZones[zoneId];
    state.expandedZones[zoneId] = expanded;

    var list = cell.querySelector(".zone-community-list");
    list.hidden = !expanded;
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    btn.querySelector(".zone-toggle-label").textContent = expanded ? "ซ่อนรายชื่อชุมชน" : "ดูรายชื่อชุมชน";
    cell.classList.toggle("expanded", expanded);
  }

  /* ---------------------------------------------------------
     Render: Trend chart (inline SVG, bars + moving-average line)
     --------------------------------------------------------- */
  function renderChart() {
    var zoneIds = relevantZoneIds();
    var combined = sumArrays(zoneIds.map(function (zid) { return seriesFor(state.disease, zid); }));
    var data = combined.slice(DAYS_TOTAL - state.range); // last N days

    var diseaseName = DISEASES.filter(function (d) { return d.id === state.disease; })[0].name;
    var zoneName = state.zone === "all" ? "ทุกเขตบริการ" :
      ZONES.filter(function (z) { return z.id === state.zone; })[0].name;
    els.chartPanelSubtitle.textContent = diseaseName + " · " + zoneName + " · " + state.range + " วันล่าสุด";

    // 3-day moving average
    var movingAvg = data.map(function (_, i) {
      var start = Math.max(0, i - 2);
      var slice = data.slice(start, i + 1);
      return slice.reduce(function (a, b) { return a + b; }, 0) / slice.length;
    });

    var width = Math.max(560, data.length * 46);
    var height = 260;
    var padTop = 20, padBottom = 34, padLeft = 40, padRight = 16;
    var chartW = width - padLeft - padRight;
    var chartH = height - padTop - padBottom;

    var maxVal = Math.max.apply(null, data.concat(movingAvg));
    maxVal = maxVal <= 0 ? 1 : maxVal;
    var niceMax = Math.ceil(maxVal * 1.15 / 5) * 5 || 5;

    var barSlot = chartW / data.length;
    var barWidth = Math.min(28, barSlot * 0.55);

    function xFor(i) { return padLeft + barSlot * i + barSlot / 2; }
    function yFor(v) { return padTop + chartH - (v / niceMax) * chartH; }

    var svgParts = [];
    svgParts.push('<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="กราฟแนวโน้มผู้ป่วยรายวัน">');

    // gridlines + y-axis labels (4 steps)
    var steps = 4;
    for (var s = 0; s <= steps; s++) {
      var val = Math.round((niceMax / steps) * s);
      var y = yFor(val);
      svgParts.push('<line x1="' + padLeft + '" y1="' + y + '" x2="' + (width - padRight) + '" y2="' + y + '" stroke="#DCD3C4" stroke-width="1"></line>');
      svgParts.push('<text x="' + (padLeft - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#6E6355" font-family="Inter, system-ui, sans-serif">' + val + '</text>');
    }

    // bars — earth-tone secondary (status colors are reserved for threshold/severity cues only)
    data.forEach(function (v, i) {
      var x = xFor(i) - barWidth / 2;
      var y = yFor(v);
      var h = padTop + chartH - y;
      svgParts.push('<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + h + '" rx="3" fill="#8A9A5B" fill-opacity="0.85"></rect>');
    });

    // moving average line — accent ochre
    var linePoints = movingAvg.map(function (v, i) { return xFor(i) + "," + yFor(v); }).join(" ");
    svgParts.push('<polyline points="' + linePoints + '" fill="none" stroke="#C9A66B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></polyline>');
    movingAvg.forEach(function (v, i) {
      svgParts.push('<circle cx="' + xFor(i) + '" cy="' + yFor(v) + '" r="3" fill="#C9A66B"></circle>');
    });

    // x-axis day labels (skip some if too many)
    var labelEvery = data.length > 20 ? 3 : (data.length > 10 ? 2 : 1);
    data.forEach(function (v, i) {
      var daysAgo = data.length - 1 - i;
      if (i % labelEvery !== 0 && i !== data.length - 1) return;
      var label = daysAgo === 0 ? "วันนี้" : "-" + daysAgo + "ว.";
      svgParts.push('<text x="' + xFor(i) + '" y="' + (height - 10) + '" text-anchor="middle" font-size="11" fill="#6E6355" font-family="Inter, system-ui, sans-serif">' + label + '</text>');
    });

    svgParts.push('</svg>');
    els.chartWrap.innerHTML = svgParts.join("");
  }

  /* ---------------------------------------------------------
     Render: Recent Alerts
     --------------------------------------------------------- */
  function formatHoursAgo(hoursAgo) {
    if (hoursAgo < 1) return "เมื่อสักครู่";
    if (hoursAgo < 24) return hoursAgo + " ชั่วโมงที่แล้ว";
    return Math.floor(hoursAgo / 24) + " วันที่แล้ว";
  }

  function renderAlerts() {
    var filtered = ALERTS.filter(function (a) {
      var matchesDisease = state.disease === "all" || a.diseaseId === state.disease;
      var matchesZone = state.zone === "all" || a.zoneId === state.zone;
      var matchesRange = (a.hoursAgo / 24) <= state.range;
      return matchesDisease && matchesZone && matchesRange;
    });

    els.alertList.innerHTML = "";

    if (filtered.length === 0) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "ไม่พบการแจ้งเตือนตามเงื่อนไขตัวกรองที่เลือก";
      els.alertList.appendChild(empty);
      return;
    }

    filtered.forEach(function (a) {
      var diseaseName = DISEASES.filter(function (d) { return d.id === a.diseaseId; })[0].name;
      var zoneName = ZONES.filter(function (z) { return z.id === a.zoneId; })[0].name;
      var iconPath = a.severity === "danger"
        ? '<path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path>'
        : '<path d="M12 8v5M12 17h.01"></path><circle cx="12" cy="12" r="9"></circle>';

      var item = document.createElement("div");
      item.className = "alert-item";
      item.innerHTML =
        '<div class="alert-icon badge-' + a.severity + '">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + iconPath + '</svg>' +
        '</div>' +
        '<div class="alert-body">' +
          '<div class="alert-top-row">' +
            '<span class="alert-title">' + diseaseName + '</span>' +
            '<span class="badge badge-' + a.severity + '">' + (a.severity === "danger" ? "วิกฤต" : "เฝ้าระวัง") + '</span>' +
          '</div>' +
          '<p class="body-secondary" style="font-size:14px;color:var(--color-text-primary)">' + a.message + '</p>' +
          '<div class="alert-meta">' +
            '<span>' + zoneName + ' · ชุมชน' + a.community + '</span>' +
            '<span>' + formatHoursAgo(a.hoursAgo) + '</span>' +
          '</div>' +
        '</div>';
      els.alertList.appendChild(item);
    });
  }

  /* ---------------------------------------------------------
     Render all + wire up events
     --------------------------------------------------------- */
  function renderAll() {
    renderKPIs();
    renderZoneGrid();
    renderChart();
    renderAlerts();
  }

  function init() {
    populateFilters();
    els.filterDisease.value = state.disease;
    els.filterZone.value = state.zone;
    els.filterRange.value = String(state.range);

    els.filterDisease.addEventListener("change", function () {
      state.disease = els.filterDisease.value;
      renderAll();
    });
    els.filterZone.addEventListener("change", function () {
      state.zone = els.filterZone.value;
      renderAll();
    });
    els.filterRange.addEventListener("change", function () {
      state.range = parseInt(els.filterRange.value, 10);
      renderAll();
    });
    els.btnReset.addEventListener("click", function () {
      state.disease = "all";
      state.zone = "all";
      state.range = 14;
      els.filterDisease.value = state.disease;
      els.filterZone.value = state.zone;
      els.filterRange.value = String(state.range);
      renderAll();
    });

    els.zoneGrid.addEventListener("click", onZoneGridClick);

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
