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

  var REGIONS = [
    { id: "north", name: "ภาคเหนือ", province: "เชียงใหม่" },
    { id: "central", name: "ภาคกลาง", province: "กรุงเทพมหานคร" },
    { id: "northeast", name: "ภาคตะวันออกเฉียงเหนือ", province: "นครราชสีมา" },
    { id: "south", name: "ภาคใต้", province: "สงขลา" },
    { id: "east", name: "ภาคตะวันออก", province: "ชลบุรี" },
    { id: "west", name: "ภาคตะวันตก", province: "กาญจนบุรี" }
  ];

  // Baseline daily new-case level + regional multiplier + 14-day risk thresholds per disease.
  var DISEASE_CONFIG = {
    dengue: {
      baseline: 6,
      regionFactor: { north: 1.1, central: 1.4, northeast: 1.2, south: 1.6, east: 1.3, west: 0.9 },
      thresholds14: { warning: 60, danger: 110 }
    },
    influenza: {
      baseline: 5,
      regionFactor: { north: 1.3, central: 1.2, northeast: 1.0, south: 0.8, east: 0.9, west: 0.9 },
      thresholds14: { warning: 55, danger: 95 }
    },
    covid19: {
      baseline: 4,
      regionFactor: { north: 0.8, central: 1.6, northeast: 0.9, south: 1.3, east: 1.1, west: 0.7 },
      thresholds14: { warning: 45, danger: 80 }
    },
    hfmd: {
      baseline: 2.5,
      regionFactor: { north: 1.0, central: 1.4, northeast: 1.1, south: 0.9, east: 1.0, west: 0.8 },
      thresholds14: { warning: 30, danger: 55 }
    },
    foodpoison: {
      baseline: 1.3,
      regionFactor: { north: 0.9, central: 1.1, northeast: 1.3, south: 0.9, east: 1.2, west: 0.8 },
      thresholds14: { warning: 16, danger: 30 }
    }
  };

  var DISEASE_IDS = Object.keys(DISEASE_CONFIG);
  var DAYS_TOTAL = 30; // length of generated daily series (index 0 = 29 days ago ... index 29 = today)

  var ALERTS = [
    { id: 1, diseaseId: "dengue", regionId: "south", province: "สงขลา", severity: "danger", hoursAgo: 3,
      message: "จำนวนผู้ป่วยไข้เลือดออกในเขตเทศบาลเพิ่มขึ้นเกิน 3 เท่าของค่าเฉลี่ย 7 วัน" },
    { id: 2, diseaseId: "covid19", regionId: "central", province: "กรุงเทพมหานคร (บางนา)", severity: "warning", hoursAgo: 9,
      message: "ตรวจพบคลัสเตอร์โควิด-19 ในสถานประกอบการย่านบางนา จำนวน 14 ราย" },
    { id: 3, diseaseId: "influenza", regionId: "north", province: "เชียงใหม่", severity: "warning", hoursAgo: 27,
      message: "โรงเรียนในอำเภอเมืองเชียงใหม่รายงานนักเรียนป่วยไข้หวัดใหญ่ ปิด 5 ห้องเรียน" },
    { id: 4, diseaseId: "hfmd", regionId: "central", province: "ปทุมธานี", severity: "warning", hoursAgo: 30,
      message: "ศูนย์เด็กเล็กพบเด็กป่วยโรคมือ เท้า ปาก 12 รายภายในสัปดาห์เดียว" },
    { id: 5, diseaseId: "dengue", regionId: "northeast", province: "อุบลราชธานี", severity: "danger", hoursAgo: 50,
      message: "อำเภอวารินชำราบยกระดับเป็นพื้นที่ระบาดไข้เลือดออก หลังพบผู้ป่วยสะสม 68 ราย" },
    { id: 6, diseaseId: "foodpoison", regionId: "east", province: "ชลบุรี (ศรีราชา)", severity: "warning", hoursAgo: 70,
      message: "พบผู้ป่วยอาหารเป็นพิษหลังงานเลี้ยงในอำเภอศรีราชา จำนวน 22 ราย" },
    { id: 7, diseaseId: "covid19", regionId: "south", province: "ภูเก็ต", severity: "warning", hoursAgo: 130,
      message: "พบผู้ติดเชื้อโควิด-19 ในกลุ่มนักท่องเที่ยวต่างชาติ 7 ราย" },
    { id: 8, diseaseId: "dengue", regionId: "west", province: "กาญจนบุรี", severity: "danger", hoursAgo: 200,
      message: "ยอดผู้ป่วยไข้เลือดออกสะสมทั้งจังหวัดเกิน 150 ราย ยกระดับมาตรการเฝ้าระวังขั้นสูง" }
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

  function generateSeries(diseaseId, regionId) {
    var cfg = DISEASE_CONFIG[diseaseId];
    var base = cfg.baseline * cfg.regionFactor[regionId];
    var rng = mulberry32(hashSeed(diseaseId + "|" + regionId));
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

  // Cache: seriesCache[diseaseId][regionId] = number[30]
  var seriesCache = {};
  DISEASE_IDS.forEach(function (d) {
    seriesCache[d] = {};
    REGIONS.forEach(function (r) {
      seriesCache[d][r.id] = generateSeries(d, r.id);
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

  // Series for a disease filter ("all" = summed across all diseases) for one region.
  function seriesFor(diseaseId, regionId) {
    if (diseaseId === "all") {
      return sumArrays(DISEASE_IDS.map(function (d) { return seriesCache[d][regionId]; }));
    }
    return seriesCache[diseaseId][regionId];
  }

  function periodSum(series, rangeDays) {
    var slice = series.slice(DAYS_TOTAL - rangeDays);
    return slice.reduce(function (a, b) { return a + b; }, 0);
  }

  // "Active cases" snapshot: trailing 14-day sum scaled up slightly to represent
  // an ongoing monitored caseload (not just new cases).
  function activeCasesFor(diseaseId, regionId) {
    var series = seriesFor(diseaseId, regionId);
    return Math.round(periodSum(series, 14) * 1.15);
  }

  function newCasesTodayFor(diseaseId, regionId) {
    var series = seriesFor(diseaseId, regionId);
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

  function riskLevelFor(diseaseId, regionId, rangeDays) {
    var series = seriesFor(diseaseId, regionId);
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
    region: "all",
    range: 14
  };

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  var els = {
    filterDisease: document.getElementById("filter-disease"),
    filterRegion: document.getElementById("filter-region"),
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

    regionGrid: document.getElementById("region-grid"),
    regionPanelSubtitle: document.getElementById("region-panel-subtitle"),

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

    var optAllRegion = document.createElement("option");
    optAllRegion.value = "all";
    optAllRegion.textContent = "ทุกภูมิภาค (All Regions)";
    els.filterRegion.appendChild(optAllRegion);
    REGIONS.forEach(function (r) {
      var opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.name;
      els.filterRegion.appendChild(opt);
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
  function relevantRegionIds() {
    return state.region === "all" ? REGIONS.map(function (r) { return r.id; }) : [state.region];
  }

  function renderKPIs() {
    var regionIds = relevantRegionIds();
    var diseaseId = state.disease;

    // Total Active Cases
    var totalActive = 0;
    regionIds.forEach(function (rid) { totalActive += activeCasesFor(diseaseId, rid); });

    // New Cases Today
    var totalNewToday = 0;
    regionIds.forEach(function (rid) { totalNewToday += newCasesTodayFor(diseaseId, rid); });

    // Trend comparison: last 7 days vs prior 7 days (independent of range filter)
    var last7 = 0, prior7 = 0;
    regionIds.forEach(function (rid) {
      var series = seriesFor(diseaseId, rid);
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
    regionIds.forEach(function (rid) {
      var risk = riskLevelFor(diseaseId, rid, state.range);
      if (risk === "warning" || risk === "danger") zoneCount++;
      if (RISK_RANK[risk] > RISK_RANK[worstRisk]) worstRisk = risk;
    });

    els.kpiOutbreakZones.textContent = zoneCount;
    els.kpiOutbreakZonesNote.textContent = "จากทั้งหมด " + regionIds.length + " พื้นที่ที่แสดงผล";

    els.kpiRiskLevel.textContent = RISK_LABEL[worstRisk];
    els.kpiRiskLevelNote.className = "kpi-trend badge-" + worstRisk;
    els.kpiRiskLevelNote.textContent = zoneCount === 0
      ? "ไม่มีพื้นที่เข้าเกณฑ์เฝ้าระวัง"
      : zoneCount + " พื้นที่เข้าเกณฑ์เฝ้าระวัง/วิกฤต";

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
     Render: Region risk grid
     --------------------------------------------------------- */
  function renderRegionGrid() {
    els.regionGrid.innerHTML = "";
    var rangeLabel = state.range + " วัน";
    els.regionPanelSubtitle.textContent = "เคสสะสมช่วง " + rangeLabel + "ล่าสุด";

    REGIONS.forEach(function (region) {
      var series = seriesFor(state.disease, region.id);
      var cases = periodSum(series, state.range);
      var risk = riskLevelFor(state.disease, region.id, state.range);
      var isDimmed = state.region !== "all" && state.region !== region.id;

      var cell = document.createElement("div");
      cell.className = "region-cell risk-" + risk;
      if (isDimmed) {
        cell.style.opacity = "0.35";
      }

      cell.innerHTML =
        '<div class="region-cell-top">' +
          '<span class="region-name">' + region.name + '</span>' +
          '<span class="risk-dot risk-' + risk + '"></span>' +
        '</div>' +
        '<span class="region-cases">' + fmt(cases) + '</span>' +
        '<span class="region-cases-label">เคสใน ' + rangeLabel + ' &middot; ศูนย์กลาง: ' + region.province + '</span>';

      els.regionGrid.appendChild(cell);
    });
  }

  /* ---------------------------------------------------------
     Render: Trend chart (inline SVG, bars + moving-average line)
     --------------------------------------------------------- */
  function renderChart() {
    var regionIds = relevantRegionIds();
    var combined = sumArrays(regionIds.map(function (rid) { return seriesFor(state.disease, rid); }));
    var data = combined.slice(DAYS_TOTAL - state.range); // last N days

    var diseaseName = DISEASES.filter(function (d) { return d.id === state.disease; })[0].name;
    var regionName = state.region === "all" ? "ทุกภูมิภาค" :
      REGIONS.filter(function (r) { return r.id === state.region; })[0].name;
    els.chartPanelSubtitle.textContent = diseaseName + " · " + regionName + " · " + state.range + " วันล่าสุด";

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
      var matchesRegion = state.region === "all" || a.regionId === state.region;
      var matchesRange = (a.hoursAgo / 24) <= state.range;
      return matchesDisease && matchesRegion && matchesRange;
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
      var regionName = REGIONS.filter(function (r) { return r.id === a.regionId; })[0].name;
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
            '<span>' + regionName + ' · ' + a.province + '</span>' +
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
    renderRegionGrid();
    renderChart();
    renderAlerts();
  }

  function init() {
    populateFilters();
    els.filterDisease.value = state.disease;
    els.filterRegion.value = state.region;
    els.filterRange.value = String(state.range);

    els.filterDisease.addEventListener("change", function () {
      state.disease = els.filterDisease.value;
      renderAll();
    });
    els.filterRegion.addEventListener("change", function () {
      state.region = els.filterRegion.value;
      renderAll();
    });
    els.filterRange.addEventListener("change", function () {
      state.range = parseInt(els.filterRange.value, 10);
      renderAll();
    });
    els.btnReset.addEventListener("click", function () {
      state.disease = "all";
      state.region = "all";
      state.range = 14;
      els.filterDisease.value = state.disease;
      els.filterRegion.value = state.region;
      els.filterRange.value = String(state.range);
      renderAll();
    });

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
