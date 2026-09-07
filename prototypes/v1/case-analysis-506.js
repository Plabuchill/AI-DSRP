// รง.506 (FEAT-ANALYSIS-07) — เชื่อมต่อ Firestore จริง (collection "506Requests")
// ต่างจากส่วนอื่นของหน้านี้ (mock data ใน case-analysis.js) — ส่วนนี้ต้องมีอินเทอร์เน็ตถึงจะทำงานได้
// field ตรงกับ DATA-MODEL.md (SURVEILLANCE_REPORT_506) และ scripts/seed/seed-data.js: camelCase ทั้งหมด

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

// FEAT-PLATFORM-02 — ผู้กดยืนยัน/ไม่ยืนยัน คือผู้ใช้ที่ login อยู่จริง (ไม่ใช่ค่า hardcode อีกต่อไป)
// query collection "users" ด้วยอีเมลของผู้ใช้ที่ login (auth.currentUser.email) ทุกครั้งที่ต้องใช้
async function getCurrentUser() {
  const current = auth.currentUser;
  if (!current) return { id: "", name: "" };
  const q = query(collection(db, "users"), where("email", "==", current.email));
  const snap = await getDocs(q);
  if (snap.empty) return { id: "", name: current.email || "" };
  const userDoc = snap.docs[0];
  return { id: userDoc.id, name: userDoc.data().name };
}

const STATUS_BADGE = {
  "รอพิจารณา": "badge-warning",
  "ยืนยัน": "badge-success",
  "ไม่ยืนยัน": "badge-danger"
};

const STATUS_ORDER = { "รอพิจารณา": 0, "ยืนยัน": 1, "ไม่ยืนยัน": 2 };

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateRange(startDate, endDate) {
  if (!startDate) return "-";
  return endDate ? escapeHtml(startDate) + " – " + escapeHtml(endDate) : escapeHtml(startDate) + " (ต่อเนื่อง)";
}

function init() {
  const statusEl = document.getElementById("report506-status");
  const tbodyEl = document.getElementById("report506-tbody");
  if (!tbodyEl) return; // หน้าอื่นไม่มี element นี้

  function renderRows(docs) {
    if (docs.length === 0) {
      tbodyEl.innerHTML = '<tr><td colspan="6" class="body-secondary">ยังไม่มีรายการ รง.506</td></tr>';
      return;
    }

    const sorted = docs.slice().sort(function (a, b) {
      const orderDiff = (STATUS_ORDER[a.data.status] ?? 9) - (STATUS_ORDER[b.data.status] ?? 9);
      if (orderDiff !== 0) return orderDiff;
      return String(a.data.createdAt || "").localeCompare(String(b.data.createdAt || ""));
    });

    tbodyEl.innerHTML = sorted.map(function (item) {
      const d = item.data;
      const badgeClass = STATUS_BADGE[d.status] || "badge-neutral";
      const isPending = d.status === "รอพิจารณา";
      const actionsHtml = isPending
        ? '<div class="row-actions">' +
            '<button type="button" class="btn btn-primary btn-sm" data-action="confirm" data-id="' + escapeHtml(item.id) + '">ยืนยัน</button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-action="reject" data-id="' + escapeHtml(item.id) + '">ไม่ยืนยัน</button>' +
          '</div>'
        : '<span class="body-secondary">' + escapeHtml(d.approverName || "-") + '</span>';

      return (
        '<tr>' +
          '<td><a href="506-request-detail.html?id=' + encodeURIComponent(item.id) + '">' + escapeHtml(d.title) + '</a></td>' +
          '<td>' + escapeHtml(d.requesterName) + '</td>' +
          '<td>' + escapeHtml(d.diseaseName) + '</td>' +
          '<td>' + formatDateRange(d.startDate, d.endDate) + '</td>' +
          '<td><span class="badge ' + badgeClass + '">' + escapeHtml(d.status) + '</span></td>' +
          '<td>' + actionsHtml + '</td>' +
        '</tr>'
      );
    }).join("");
  }

  async function decide(reportId, newStatus) {
    try {
      const currentUser = await getCurrentUser();
      await updateDoc(doc(db, "506Requests", reportId), {
        status: newStatus,
        approverId: currentUser.id,
        approverName: currentUser.name
      });
    } catch (err) {
      statusEl.textContent = "บันทึกไม่สำเร็จ: " + err.message + " (ตรวจสอบว่าตั้ง Firestore Security Rules ให้เขียนได้แล้วหรือยัง)";
    }
  }

  tbodyEl.addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const reportId = btn.getAttribute("data-id");
    const newStatus = btn.getAttribute("data-action") === "confirm" ? "ยืนยัน" : "ไม่ยืนยัน";
    decide(reportId, newStatus);
  });

  const reportsRef = collection(db, "506Requests");
  onSnapshot(
    reportsRef,
    function (snapshot) {
      const docs = snapshot.docs.map(function (d) { return { id: d.id, data: d.data() }; });
      statusEl.textContent = "ข้อมูลจาก Firestore (real-time) — อัปเดตล่าสุด " + new Date().toLocaleTimeString("th-TH");
      renderRows(docs);
    },
    function (err) {
      statusEl.textContent = "โหลดข้อมูลไม่สำเร็จ: " + err.message + " (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือ Firestore Security Rules)";
      tbodyEl.innerHTML = '<tr><td colspan="6" class="body-secondary">โหลดข้อมูลไม่สำเร็จ</td></tr>';
    }
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
