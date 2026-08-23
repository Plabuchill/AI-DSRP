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
  // รอบ 22 (2026-08-23): เพิ่ม `population` ต่อเขต (mock, 15,000-25,000) สำหรับ
  // คำนวณอัตราป่วยต่อแสนประชากร
  var ZONES = [
    {
      id: "zone1",
      name: "เขตบริการ 1",
      population: 21000,
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
      population: 24000,
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
      population: 23500,
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
      population: 16000,
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
  var WEEKS_TOTAL = 52;

  // Mock "today" — anchors the date-range label and the weekly trend chart's
  // "current year" axis. Kept as a fixed constant so reloads stay stable.
  var TODAY_DATE = new Date(2026, 7, 23);
  var THAI_MONTHS_ABBR = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

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
     รอบ 22 — mock proportions used to derive the additional
     analytics panels below (gender / age / occupation / out-of-area
     / DF-DHF split / weekly seasonality). All values are illustrative
     mock ratios calibrated to look plausible, not real municipal data.
     --------------------------------------------------------- */
  var OUT_AREA_FRACTION = {
    dengue: 0.18, influenza: 0.15, covid19: 0.20, hfmd: 0.16, foodpoison: 0.17
  };

  var GENDER_MALE_FRACTION = {
    dengue: 0.57, influenza: 0.61, covid19: 0.55, hfmd: 0.63, foodpoison: 0.59
  };

  var AGE_BIN_LABELS = ["05-14 ปี", "15-24 ปี", "25-34 ปี", "35-44 ปี", "45-54 ปี"];
  var AGE_BIN_RANGES = [[5, 14], [15, 24], [25, 34], [35, 44], [45, 54]];
  // สัดส่วนประชากรตามช่วงอายุ เทียบกับประชากรรวมของเทศบาล (มิได้รวมเป็น 100%
  // เพราะไม่รวมช่วง 0-4 ปีและ 55 ปีขึ้นไปที่ไม่อยู่ในตารางนี้)
  var AGE_POPULATION_FRACTIONS = [0.14, 0.16, 0.18, 0.17, 0.15];

  var AGE_GROUP_PROPORTIONS = {
    dengue: [0.30, 0.28, 0.18, 0.14, 0.10],
    influenza: [0.22, 0.20, 0.18, 0.20, 0.20],
    covid19: [0.10, 0.22, 0.24, 0.22, 0.22],
    hfmd: [0.55, 0.25, 0.10, 0.06, 0.04],
    foodpoison: [0.12, 0.22, 0.22, 0.22, 0.22]
  };

  var OCCUPATION_ITEMS = [
    { label: "รับจ้าง", fraction: 0.35 },
    { label: "นักเรียน/นักศึกษา", fraction: 0.28 },
    { label: "ค้าขาย", fraction: 0.16 },
    { label: "ทหาร/ตำรวจ", fraction: 0.06 },
    { label: "อื่นๆ", fraction: 0.15 }
  ];

  var DF_DHF_SPLIT = { df: 0.87, dhf: 0.13 };

  // Seasonal profile per disease used by the weekly trend chart — peakWeek is
  // the ISO-ish week (1-52) where the curve tops out (dengue peaks in the
  // rainy season, ~ August), amp controls how pronounced the seasonality is.
  var WEEKLY_SEASON_CONFIG = {
    dengue: { peakWeek: 32, amp: 0.65, priorAmpFactor: 0.75, noiseAmp: 0.18 },
    influenza: { peakWeek: 3, amp: 0.45, priorAmpFactor: 0.80, noiseAmp: 0.15 },
    covid19: { peakWeek: 40, amp: 0.30, priorAmpFactor: 0.85, noiseAmp: 0.20 },
    hfmd: { peakWeek: 24, amp: 0.40, priorAmpFactor: 0.80, noiseAmp: 0.16 },
    foodpoison: { peakWeek: 16, amp: 0.35, priorAmpFactor: 0.80, noiseAmp: 0.22 }
  };

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

  function sumArrays(arrays, len) {
    var out = new Array(len).fill(0);
    arrays.forEach(function (a) {
      for (var i = 0; i < len; i++) out[i] += a[i];
    });
    return out;
  }

  // Series for a disease filter ("all" = summed across all diseases) for one zone.
  function seriesFor(diseaseId, zoneId) {
    if (diseaseId === "all") {
      return sumArrays(DISEASE_IDS.map(function (d) { return seriesCache[d][zoneId]; }), DAYS_TOTAL);
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
     รอบ 22 — cumulative totals, population, weighted disease
     averages (used to fold "all diseases" into a single number/array
     for every stat that is only mocked per-disease)
     --------------------------------------------------------- */
  function cumulativeCasesFor(diseaseId, zoneIds, rangeDays) {
    var total = 0;
    zoneIds.forEach(function (zid) { total += periodSum(seriesFor(diseaseId, zid), rangeDays); });
    return total;
  }

  function totalPopulationFor(zoneIds) {
    return ZONES.filter(function (z) { return zoneIds.indexOf(z.id) !== -1; })
      .reduce(function (sum, z) { return sum + z.population; }, 0);
  }

  function diseaseCaseWeight(diseaseId, zoneIds, rangeDays) {
    return cumulativeCasesFor(diseaseId, zoneIds, rangeDays);
  }

  // Folds a per-disease mock value (scalar or array of the same length) into a
  // single value for the current filter — case-count-weighted average across
  // all diseases when state.disease === "all", otherwise the disease's own value.
  function weightedDiseaseValue(diseaseId, zoneIds, rangeDays, valueFn) {
    if (diseaseId !== "all") return valueFn(diseaseId);
    var totalWeight = 0;
    var acc = null;
    DISEASE_IDS.forEach(function (d) {
      var w = diseaseCaseWeight(d, zoneIds, rangeDays);
      var v = valueFn(d);
      totalWeight += w;
      if (Array.isArray(v)) {
        if (!acc) acc = v.map(function () { return 0; });
        v.forEach(function (x, i) { acc[i] += x * w; });
      } else {
        acc = (acc || 0) + v * w;
      }
    });
    if (totalWeight === 0) return valueFn(DISEASE_IDS[0]);
    return Array.isArray(acc) ? acc.map(function (x) { return x / totalWeight; }) : acc / totalWeight;
  }

  // Largest-remainder rounding: distributes an integer `total` across
  // `weights` proportionally, guaranteeing the rounded parts sum to `total`.
  function roundDistribute(weights, total) {
    var sumW = weights.reduce(function (a, b) { return a + b; }, 0);
    if (sumW <= 0 || total <= 0) return weights.map(function () { return 0; });
    var raw = weights.map(function (w) { return (w / sumW) * total; });
    var rounded = raw.map(Math.floor);
    var remainder = total - rounded.reduce(function (a, b) { return a + b; }, 0);
    var fracOrder = raw.map(function (v, i) { return { i: i, frac: v - Math.floor(v) }; })
      .sort(function (a, b) { return b.frac - a.frac; });
    for (var k = 0; k < remainder; k++) {
      rounded[fracOrder[k % fracOrder.length].i]++;
    }
    return rounded;
  }

  function thaiDatePart(d) {
    return d.getDate() + " " + THAI_MONTHS_ABBR[d.getMonth()];
  }

  function formatThaiDateRange(start, end) {
    var endBeYear = end.getFullYear() + 543;
    var startBeYear = start.getFullYear() + 543;
    if (start.getMonth() === end.getMonth() && startBeYear === endBeYear) {
      return start.getDate() + " – " + thaiDatePart(end) + " " + endBeYear;
    }
    if (startBeYear === endBeYear) {
      return thaiDatePart(start) + " – " + thaiDatePart(end) + " " + endBeYear;
    }
    return thaiDatePart(start) + " " + startBeYear + " – " + thaiDatePart(end) + " " + endBeYear;
  }

  /* ---------------------------------------------------------
     รอบ 22 — weekly (52-week) series: current year vs. prior-year
     "median" baseline, per disease/zone, for the seasonal trend chart
     --------------------------------------------------------- */
  function generateWeeklySeries(diseaseId, zoneId) {
    var cfg = DISEASE_CONFIG[diseaseId];
    var season = WEEKLY_SEASON_CONFIG[diseaseId];
    var weeklyBase = cfg.baseline * 7 * cfg.zoneFactor[zoneId];
    var rng = mulberry32(hashSeed("weekly|" + diseaseId + "|" + zoneId));
    var current = [];
    var prior = [];
    for (var w = 1; w <= WEEKS_TOTAL; w++) {
      var angle = 2 * Math.PI * (w - season.peakWeek) / WEEKS_TOTAL;
      var weightCur = Math.max(0.15, 1 + season.amp * Math.cos(angle));
      var weightPrior = Math.max(0.15, 1 + season.amp * season.priorAmpFactor * Math.cos(angle));
      var noise = (rng() - 0.5) * season.noiseAmp * 2;
      current.push(Math.max(0, Math.round(weeklyBase * weightCur * (1 + noise))));
      prior.push(Math.max(0, Math.round(weeklyBase * weightPrior * 0.92)));
    }
    return { current: current, prior: prior };
  }

  var weeklyCache = {};
  DISEASE_IDS.forEach(function (d) {
    weeklyCache[d] = {};
    ZONES.forEach(function (z) { weeklyCache[d][z.id] = generateWeeklySeries(d, z.id); });
  });

  function weeklySeriesFor(diseaseId, zoneId) {
    if (diseaseId === "all") {
      return {
        current: sumArrays(DISEASE_IDS.map(function (d) { return weeklyCache[d][zoneId].current; }), WEEKS_TOTAL),
        prior: sumArrays(DISEASE_IDS.map(function (d) { return weeklyCache[d][zoneId].prior; }), WEEKS_TOTAL)
      };
    }
    return weeklyCache[diseaseId][zoneId];
  }

  function weeklyCombinedFor(diseaseId, zoneIds) {
    return {
      current: sumArrays(zoneIds.map(function (zid) { return weeklySeriesFor(diseaseId, zid).current; }), WEEKS_TOTAL),
      prior: sumArrays(zoneIds.map(function (zid) { return weeklySeriesFor(diseaseId, zid).prior; }), WEEKS_TOTAL)
    };
  }

  /* ---------------------------------------------------------
     รอบ 22 — mock case distribution across the 63 real communities,
     scaled so each zone's community total matches that zone's own
     (disease/range-filtered) case total exactly (largest-remainder
     rounding via roundDistribute)
     --------------------------------------------------------- */
  function communityCaseCounts(diseaseId, zoneIds, rangeDays) {
    var results = [];
    ZONES.forEach(function (zone) {
      if (zoneIds.indexOf(zone.id) === -1) return;
      var zoneTotal = periodSum(seriesFor(diseaseId, zone.id), rangeDays);
      var weights = zone.communities.map(function (c) {
        var rng = mulberry32(hashSeed("community|" + diseaseId + "|" + zone.id + "|" + c.name));
        return 0.4 + rng() * 1.2;
      });
      var counts = roundDistribute(weights, zoneTotal);
      zone.communities.forEach(function (c, idx) {
        results.push({ zoneId: zone.id, zoneName: zone.name, name: c.name, teamId: c.teamId, cases: counts[idx] });
      });
    });
    results.sort(function (a, b) { return b.cases - a.cases; });
    return results;
  }

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
    dateRangeNote: document.getElementById("date-range-note"),

    statNewTotal: document.getElementById("stat-new-total"),
    statNewOut: document.getElementById("stat-new-out"),
    statCumIn: document.getElementById("stat-cum-in"),
    statCumOut: document.getElementById("stat-cum-out"),
    statCumTotal: document.getElementById("stat-cum-total"),

    rateValue: document.getElementById("rate-value"),
    ratePopNote: document.getElementById("rate-pop-note"),

    genderTableBody: document.getElementById("gender-table-body"),

    zoneGrid: document.getElementById("zone-grid"),
    zonePanelSubtitle: document.getElementById("zone-panel-subtitle"),
    zoneRiskSummary: document.getElementById("zone-risk-summary"),

    chartWrap: document.getElementById("chart-wrap"),
    chartPanelSubtitle: document.getElementById("chart-panel-subtitle"),

    weeklyChartWrap: document.getElementById("weekly-chart-wrap"),
    weeklyChartSubtitle: document.getElementById("weekly-chart-subtitle"),
    weeklyLegendPrior: document.getElementById("weekly-legend-prior"),
    weeklyLegendCurrent: document.getElementById("weekly-legend-current"),

    ageTableBody: document.getElementById("age-table-body"),
    ageOldest: document.getElementById("age-oldest"),
    ageMedian: document.getElementById("age-median"),
    ageYoungest: document.getElementById("age-youngest"),

    diagnosisPieWrap: document.getElementById("diagnosis-pie-wrap"),
    diagnosisPieNote: document.getElementById("diagnosis-pie-note"),
    diagnosisPieLegend: document.getElementById("diagnosis-pie-legend"),

    occupationTableBody: document.getElementById("occupation-table-body"),

    communityTableBody: document.getElementById("community-table-body"),

    serviceZoneTableBody: document.getElementById("service-zone-table-body"),

    outsideAreaTableBody: document.getElementById("outside-area-table-body"),

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

  function fmt1(n) {
    return n.toLocaleString("th-TH", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function relevantZoneIds() {
    return state.zone === "all" ? ZONES.map(function (z) { return z.id; }) : [state.zone];
  }

  /* ---------------------------------------------------------
     Render: date-range note (replaces the old static "อัปเดตล่าสุด")
     --------------------------------------------------------- */
  function renderDateRangeNote() {
    var end = TODAY_DATE;
    var start = new Date(TODAY_DATE);
    start.setDate(start.getDate() - (state.range - 1));
    els.dateRangeNote.textContent = "ช่วงข้อมูล: " + formatThaiDateRange(start, end);
  }

  /* ---------------------------------------------------------
     Case breakdown shared by stat tiles / rate card / gender /
     age / outside-area panels — computed once per render pass
     --------------------------------------------------------- */
  function getCaseBreakdown() {
    var zoneIds = relevantZoneIds();
    var diseaseId = state.disease;
    var newTotalToday = 0;
    zoneIds.forEach(function (zid) { newTotalToday += newCasesTodayFor(diseaseId, zid); });

    var cumTotal = cumulativeCasesFor(diseaseId, zoneIds, state.range);
    var outFrac = weightedDiseaseValue(diseaseId, zoneIds, state.range, function (d) { return OUT_AREA_FRACTION[d]; });

    var newOutToday = Math.round(newTotalToday * outFrac);
    var newInToday = newTotalToday - newOutToday;
    var cumOutArea = Math.round(cumTotal * outFrac);
    var cumInArea = cumTotal - cumOutArea;

    return {
      newInToday: newInToday,
      newOutToday: newOutToday,
      newTotalToday: newTotalToday,
      cumInArea: cumInArea,
      cumOutArea: cumOutArea,
      cumTotal: cumTotal,
      outFrac: outFrac
    };
  }

  /* ---------------------------------------------------------
     Render: Stat tiles (5-up, replaces the old 4-card KPI grid)
     --------------------------------------------------------- */
  function renderStatTiles() {
    var b = getCaseBreakdown();
    els.statNewTotal.textContent = fmt(b.newTotalToday);
    els.statNewOut.textContent = fmt(b.newOutToday);
    els.statCumIn.textContent = fmt(b.cumInArea);
    els.statCumOut.textContent = fmt(b.cumOutArea);
    els.statCumTotal.textContent = fmt(b.cumTotal);
  }

  /* ---------------------------------------------------------
     Render: อัตราป่วยต่อแสนประชากร
     --------------------------------------------------------- */
  function renderRateCard() {
    var zoneIds = relevantZoneIds();
    var b = getCaseBreakdown();
    var pop = totalPopulationFor(zoneIds);
    var rate = pop ? (b.cumTotal / pop) * 100000 : 0;
    els.rateValue.textContent = fmt1(rate);
    els.ratePopNote.textContent = "จากประชากรฐาน " + fmt(pop) + " คน · เคสสะสม " + fmt(b.cumTotal) + " ราย ในช่วง " + state.range + " วันล่าสุด";
  }

  /* ---------------------------------------------------------
     Render: ตารางแยกตามเพศ
     --------------------------------------------------------- */
  function renderGenderTable() {
    var zoneIds = relevantZoneIds();
    var b = getCaseBreakdown();
    var maleFrac = weightedDiseaseValue(state.disease, zoneIds, state.range, function (d) { return GENDER_MALE_FRACTION[d]; });
    var total = b.cumTotal;
    var maleCount = Math.round(total * maleFrac);
    var femaleCount = total - maleCount;
    var malePct = total ? (maleCount / total * 100) : 0;
    var femalePct = total ? (femaleCount / total * 100) : 0;

    els.genderTableBody.innerHTML =
      '<tr><td>ชาย</td><td>' + fmt(maleCount) + '</td><td>' + fmt1(malePct) + '%</td>' +
        '<td><div class="cluster-confidence-bar"><div class="cluster-confidence-fill" style="width:' + malePct + '%;background:var(--color-primary)"></div></div></td></tr>' +
      '<tr><td>หญิง</td><td>' + fmt(femaleCount) + '</td><td>' + fmt1(femalePct) + '%</td>' +
        '<td><div class="cluster-confidence-bar"><div class="cluster-confidence-fill" style="width:' + femalePct + '%;background:var(--color-secondary)"></div></div></td></tr>';
  }

  /* ---------------------------------------------------------
     Render: Zone risk grid ("map") + community accordion
     --------------------------------------------------------- */
  function riskSummaryText(zoneIds) {
    var zoneCount = 0;
    var worstRisk = "success";
    zoneIds.forEach(function (zid) {
      var risk = riskLevelFor(state.disease, zid, state.range);
      if (risk === "warning" || risk === "danger") zoneCount++;
      if (RISK_RANK[risk] > RISK_RANK[worstRisk]) worstRisk = risk;
    });
    return zoneCount + " จาก " + zoneIds.length + " เขตบริการที่แสดงผลอยู่ในระดับเฝ้าระวังขึ้นไป · ระดับความเสี่ยงสูงสุด: " + RISK_LABEL[worstRisk];
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

    els.zoneRiskSummary.textContent = riskSummaryText(relevantZoneIds());
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
     Render: Daily trend chart (inline SVG, bars + moving-average line)
     --------------------------------------------------------- */
  function renderChart() {
    var zoneIds = relevantZoneIds();
    var combined = sumArrays(zoneIds.map(function (zid) { return seriesFor(state.disease, zid); }), DAYS_TOTAL);
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
     Render: Weekly seasonal trend chart (52 สัปดาห์ ปีปัจจุบัน vs
     ค่ามัธยฐานปีก่อน) — separate panel from the daily chart above
     --------------------------------------------------------- */
  function renderWeeklyChart() {
    var zoneIds = relevantZoneIds();
    var combined = weeklyCombinedFor(state.disease, zoneIds);
    var current = combined.current;
    var prior = combined.prior;

    var diseaseName = DISEASES.filter(function (d) { return d.id === state.disease; })[0].name;
    var zoneName = state.zone === "all" ? "ทุกเขตบริการ" :
      ZONES.filter(function (z) { return z.id === state.zone; })[0].name;
    var currentBeYear = TODAY_DATE.getFullYear() + 543;
    els.weeklyChartSubtitle.textContent = diseaseName + " · " + zoneName + " · รายสัปดาห์ทั้งปี (52 สัปดาห์)";
    els.weeklyLegendCurrent.textContent = "ปีปัจจุบัน (" + currentBeYear + ")";
    els.weeklyLegendPrior.textContent = "ค่ามัธยฐานปีก่อน (" + (currentBeYear - 1) + ")";

    var width = Math.max(720, WEEKS_TOTAL * 14);
    var height = 240;
    var padTop = 20, padBottom = 30, padLeft = 40, padRight = 16;
    var chartW = width - padLeft - padRight;
    var chartH = height - padTop - padBottom;

    var maxVal = Math.max.apply(null, current.concat(prior));
    maxVal = maxVal <= 0 ? 1 : maxVal;
    var niceMax = Math.ceil(maxVal * 1.15 / 5) * 5 || 5;

    function xFor(i) { return padLeft + (chartW / (WEEKS_TOTAL - 1)) * i; }
    function yFor(v) { return padTop + chartH - (v / niceMax) * chartH; }

    var svgParts = [];
    svgParts.push('<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="กราฟแนวโน้มรายสัปดาห์เทียบปีก่อน">');

    var steps = 4;
    for (var s = 0; s <= steps; s++) {
      var val = Math.round((niceMax / steps) * s);
      var y = yFor(val);
      svgParts.push('<line x1="' + padLeft + '" y1="' + y + '" x2="' + (width - padRight) + '" y2="' + y + '" stroke="#DCD3C4" stroke-width="1"></line>');
      svgParts.push('<text x="' + (padLeft - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#6E6355" font-family="Inter, system-ui, sans-serif">' + val + '</text>');
    }

    // prior-year median — light secondary tone, drawn first (behind)
    var priorPoints = prior.map(function (v, i) { return xFor(i) + "," + yFor(v); }).join(" ");
    svgParts.push('<polyline points="' + priorPoints + '" fill="none" stroke="#8A9A5B" stroke-opacity="0.55" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>');

    // current year — primary tone, on top
    var currentPoints = current.map(function (v, i) { return xFor(i) + "," + yFor(v); }).join(" ");
    svgParts.push('<polyline points="' + currentPoints + '" fill="none" stroke="#7A6A53" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></polyline>');

    // x-axis: first week of every month
    var lastMonth = -1;
    for (var w = 1; w <= WEEKS_TOTAL; w++) {
      var m = Math.floor((w - 1) / WEEKS_TOTAL * 12);
      if (m !== lastMonth) {
        lastMonth = m;
        svgParts.push('<text x="' + xFor(w - 1) + '" y="' + (height - 10) + '" text-anchor="middle" font-size="11" fill="#6E6355" font-family="Inter, system-ui, sans-serif">' + THAI_MONTHS_ABBR[m] + '</text>');
      }
    }

    svgParts.push('</svg>');
    els.weeklyChartWrap.innerHTML = svgParts.join("");
  }

  /* ---------------------------------------------------------
     Render: ตารางกลุ่มอายุ + การ์ดสถิติอายุ (คำนวณจากชุดข้อมูลเดียวกัน)
     --------------------------------------------------------- */
  function computeAgeBreakdown() {
    var zoneIds = relevantZoneIds();
    var b = getCaseBreakdown();
    var total = b.cumTotal;
    var props = weightedDiseaseValue(state.disease, zoneIds, state.range, function (d) { return AGE_GROUP_PROPORTIONS[d]; });
    var counts = roundDistribute(props, total);
    var pop = totalPopulationFor(zoneIds);

    var bins = AGE_BIN_LABELS.map(function (label, i) {
      var binPop = Math.round(pop * AGE_POPULATION_FRACTIONS[i]);
      var rate = binPop ? (counts[i] / binPop * 100000) : 0;
      return {
        label: label,
        count: counts[i],
        pct: total ? (counts[i] / total * 100) : 0,
        population: binPop,
        rate: rate,
        range: AGE_BIN_RANGES[i]
      };
    });

    // Synthetic per-case ages, evenly spread within each bin's range —
    // deterministic (no rng) so oldest/median/youngest stay stable per filter.
    var ages = [];
    bins.forEach(function (bin) {
      var lo = bin.range[0], hi = bin.range[1];
      var n = bin.count;
      for (var k = 0; k < n; k++) {
        var age = lo + Math.floor(((k + 0.5) / n) * (hi - lo + 1));
        if (age > hi) age = hi;
        ages.push(age);
      }
    });
    ages.sort(function (a, b2) { return a - b2; });

    return { bins: bins, ages: ages, total: total };
  }

  function renderAgeSection() {
    var data = computeAgeBreakdown();

    els.ageTableBody.innerHTML = data.bins.map(function (bin) {
      return '<tr><td>' + bin.label + '</td><td>' + fmt(bin.count) + '</td><td>' + fmt1(bin.pct) + '%</td><td>' + fmt1(bin.rate) + '</td></tr>';
    }).join("");

    var ages = data.ages;
    if (ages.length === 0) {
      els.ageOldest.textContent = "-";
      els.ageMedian.textContent = "-";
      els.ageYoungest.textContent = "-";
      return;
    }
    var oldest = ages[ages.length - 1];
    var youngest = ages[0];
    var mid = ages.length / 2;
    var median = ages.length % 2 === 1 ? ages[Math.floor(mid)] : Math.round((ages[mid - 1] + ages[mid]) / 2);

    els.ageOldest.textContent = oldest + " ปี";
    els.ageMedian.textContent = median + " ปี";
    els.ageYoungest.textContent = youngest + " ปี";
  }

  /* ---------------------------------------------------------
     Render: Pie chart การวินิจฉัยโรค (DF/DHF) — เฉพาะไข้เลือดออก
     --------------------------------------------------------- */
  function buildDonutSvg(segments, centerLabel) {
    var total = segments.reduce(function (a, s) { return a + s.value; }, 0) || 1;
    var r = 54, cx = 66, cy = 66, strokeWidth = 24;
    var circumference = 2 * Math.PI * r;
    var offsetAccum = 0;

    var parts = ['<svg width="132" height="132" viewBox="0 0 132 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="สัดส่วนการวินิจฉัย DF/DHF">'];
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#DCD3C4" stroke-width="' + strokeWidth + '"></circle>');
    segments.forEach(function (seg) {
      var frac = seg.value / total;
      var dash = frac * circumference;
      parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + seg.color + '" stroke-width="' + strokeWidth +
        '" stroke-dasharray="' + dash + ' ' + circumference + '" stroke-dashoffset="' + (-offsetAccum) +
        '" transform="rotate(-90 ' + cx + ' ' + cy + ')"></circle>');
      offsetAccum += dash;
    });
    parts.push('<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="16" font-weight="700" fill="#33291F" font-family="Inter, system-ui, sans-serif">' + centerLabel + '</text>');
    parts.push('</svg>');
    return parts.join("");
  }

  function renderDiagnosisPie() {
    var isDengue = state.disease === "dengue";
    els.diagnosisPieWrap.hidden = !isDengue;
    els.diagnosisPieLegend.hidden = !isDengue;
    els.diagnosisPieNote.hidden = isDengue;
    if (!isDengue) return;

    var zoneIds = relevantZoneIds();
    var total = cumulativeCasesFor("dengue", zoneIds, state.range);
    var df = Math.round(total * DF_DHF_SPLIT.df);
    var dhf = total - df;

    els.diagnosisPieWrap.innerHTML = buildDonutSvg([
      { value: df, color: "#8A9A5B" },
      { value: dhf, color: "#B5453A" }
    ], fmt(total));

    var dfPct = total ? (df / total * 100) : 0;
    var dhfPct = total ? (dhf / total * 100) : 0;
    els.diagnosisPieLegend.innerHTML =
      '<div class="pie-legend-item"><span class="pie-legend-swatch" style="background:#8A9A5B"></span>DF (ไข้เดงกี) — ' + fmt(df) + ' ราย (' + fmt1(dfPct) + '%)</div>' +
      '<div class="pie-legend-item"><span class="pie-legend-swatch" style="background:#B5453A"></span>DHF (ไข้เลือดออกช็อก) — ' + fmt(dhf) + ' ราย (' + fmt1(dhfPct) + '%)</div>';
  }

  /* ---------------------------------------------------------
     Render: ตารางอาชีพ
     --------------------------------------------------------- */
  function renderOccupationTable() {
    var b = getCaseBreakdown();
    var total = b.cumTotal;
    var weights = OCCUPATION_ITEMS.map(function (o) { return o.fraction; });
    var counts = roundDistribute(weights, total);

    els.occupationTableBody.innerHTML = OCCUPATION_ITEMS.map(function (o, i) {
      var pct = total ? (counts[i] / total * 100) : 0;
      return '<tr><td>' + o.label + '</td><td>' + fmt(counts[i]) + '</td><td>' + fmt1(pct) + '%</td></tr>';
    }).join("");
  }

  /* ---------------------------------------------------------
     Render: ตารางชุมชน (Top ชุมชนตามจำนวนเคส)
     --------------------------------------------------------- */
  function renderCommunityTable() {
    var zoneIds = relevantZoneIds();
    var all = communityCaseCounts(state.disease, zoneIds, state.range);
    var total = all.reduce(function (a, c) { return a + c.cases; }, 0);
    var top = all.slice(0, 8);

    if (top.length === 0) {
      els.communityTableBody.innerHTML = '<tr><td colspan="6" class="table-empty-note">ไม่มีข้อมูลเคสตามเงื่อนไขตัวกรองที่เลือก</td></tr>';
      return;
    }

    els.communityTableBody.innerHTML = top.map(function (c, i) {
      var pct = total ? (c.cases / total * 100) : 0;
      return '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(c.name) + '</td><td>' + escapeHtml(c.zoneName) + '</td>' +
        '<td><span class="badge badge-neutral">' + escapeHtml(teamLabel(c.teamId)) + '</span></td>' +
        '<td>' + fmt(c.cases) + '</td><td>' + fmt1(pct) + '%</td></tr>';
    }).join("");
  }

  /* ---------------------------------------------------------
     Render: ตารางเขตบริการ (จำนวนเคส + อัตราป่วยต่อแสนประชากร)
     --------------------------------------------------------- */
  function renderServiceZoneTable() {
    var zoneIds = relevantZoneIds();
    var rows = ZONES.filter(function (z) { return zoneIds.indexOf(z.id) !== -1; }).map(function (z) {
      var cases = periodSum(seriesFor(state.disease, z.id), state.range);
      var rate = z.population ? (cases / z.population * 100000) : 0;
      return { name: z.name, cases: cases, population: z.population, rate: rate };
    });
    rows.sort(function (a, b) { return b.rate - a.rate; });

    els.serviceZoneTableBody.innerHTML = rows.map(function (r) {
      return '<tr><td>' + escapeHtml(r.name) + '</td><td>' + fmt(r.cases) + '</td><td>' + fmt(r.population) + '</td><td>' + fmt1(r.rate) + '</td></tr>';
    }).join("");
  }

  /* ---------------------------------------------------------
     Render: ตารางป่วยจาก (นอกพื้นที่ / รัศมี 100 เมตร)
     --------------------------------------------------------- */
  function renderOutsideAreaTable() {
    var b = getCaseBreakdown();
    var pct1 = b.cumTotal ? (b.cumOutArea / b.cumTotal * 100) : 0;
    var count2 = Math.round(b.newOutToday * 0.6);
    var pct2 = b.newTotalToday ? (count2 / b.newTotalToday * 100) : 0;

    els.outsideAreaTableBody.innerHTML =
      '<tr><td>เริ่มป่วยจากนอกพื้นที่ (สะสม)</td><td>' + fmt(b.cumOutArea) + '</td><td>' + fmt1(pct1) + '%</td></tr>' +
      '<tr><td>รายใหม่ไม่อยู่ในพื้นที่เกิน 100 เมตร</td><td>' + fmt(count2) + '</td><td>' + fmt1(pct2) + '%</td></tr>';
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
    renderDateRangeNote();
    renderStatTiles();
    renderRateCard();
    renderGenderTable();
    renderZoneGrid();
    renderChart();
    renderWeeklyChart();
    renderAgeSection();
    renderDiagnosisPie();
    renderOccupationTable();
    renderCommunityTable();
    renderServiceZoneTable();
    renderOutsideAreaTable();
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
