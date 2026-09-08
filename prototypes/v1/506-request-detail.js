// รายละเอียด รง.506 (FEAT-ANALYSIS-07) — เชื่อมต่อ Firestore จริง (collection "506Requests")
// อ่านเอกสารเดียวแบบ real-time ตาม id ใน query string (?id=...) — reuse pattern เดียวกับ
// case-analysis-506.js / new-506-request.js (Firebase SDK import, firebaseConfig, escapeHtml, error handling)
//
// สำคัญ: ปุ่มยืนยัน/ไม่ยืนยันในหน้านี้แก้เฉพาะ field "status" เท่านั้น — จงใจไม่แตะ
// approverId/approverName หรือ field อื่นใด (ต่างจาก case-analysis-506.js ที่แก้ approver ด้วย)

import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { getCurrentUserProfile, getRoleCategory } from "./current-user.js";

const STATUS_BADGE = {
  "รอพิจารณา": "badge-warning",
  "ยืนยัน": "badge-success",
  "ไม่ยืนยัน": "badge-danger"
};

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

async function init() {
  const statusEl = document.getElementById("detail-status");
  const listEl = document.getElementById("detail-list");
  if (!listEl) return; // หน้าอื่นไม่มี element นี้

  const titleEl = document.getElementById("detail-title");
  const reasonEl = document.getElementById("detail-reason");
  const diseaseEl = document.getElementById("detail-disease");
  const requesterEl = document.getElementById("detail-requester");
  const dateRangeEl = document.getElementById("detail-daterange");
  const statusBadgeEl = document.getElementById("detail-status-badge");
  const approverRowEl = document.getElementById("detail-approver-row");
  const approverEl = document.getElementById("detail-approver");
  const decisionActionsEl = document.getElementById("detail-decision-actions");
  const confirmBtn = document.getElementById("btn-confirm");
  const rejectBtn = document.getElementById("btn-reject");
  const deleteBtn = document.getElementById("btn-delete");

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    statusEl.textContent = "ไม่พบรหัสรายการ";
    return;
  }

  // FEAT-PLATFORM-02 — ยืนยัน/ไม่ยืนยัน/ลบรายการ เป็นสิทธิ์ของ Manager เท่านั้น (ดู ACL.md)
  const profile = await getCurrentUserProfile();
  const isManager = getRoleCategory(profile ? profile.role : "") === "manager";
  if (!isManager) {
    deleteBtn.style.display = "none";
  }

  function render(d) {
    titleEl.textContent = d.title || "-";
    reasonEl.textContent = d.reason || "-";
    diseaseEl.textContent = d.diseaseName || "-";
    requesterEl.textContent = d.requesterName || "-";
    dateRangeEl.innerHTML = formatDateRange(d.startDate, d.endDate);

    const badgeClass = STATUS_BADGE[d.status] || "badge-neutral";
    statusBadgeEl.innerHTML = '<span class="badge ' + badgeClass + '">' + escapeHtml(d.status) + '</span>';

    if (d.approverName) {
      approverRowEl.style.display = "";
      approverEl.textContent = d.approverName;
    } else {
      approverRowEl.style.display = "none";
    }

    const isPending = d.status === "รอพิจารณา";
    decisionActionsEl.style.display = (isPending && isManager) ? "" : "none";

    listEl.style.display = "";
  }

  async function decide(newStatus) {
    confirmBtn.disabled = true;
    rejectBtn.disabled = true;
    try {
      // แก้เฉพาะ field "status" เท่านั้น — ห้ามแตะ approverId/approverName/field อื่น
      await updateDoc(doc(db, "506Requests", id), { status: newStatus });
    } catch (err) {
      statusEl.textContent = "บันทึกไม่สำเร็จ: " + err.message + " (ตรวจสอบว่าตั้ง Firestore Security Rules ให้เขียนได้แล้วหรือยัง)";
    } finally {
      confirmBtn.disabled = false;
      rejectBtn.disabled = false;
    }
  }

  confirmBtn.addEventListener("click", function () { decide("ยืนยัน"); });
  rejectBtn.addEventListener("click", function () { decide("ไม่ยืนยัน"); });

  deleteBtn.addEventListener("click", async function () {
    if (!window.confirm("ยืนยันลบรายการนี้ใช่ไหม? การลบไม่สามารถย้อนกลับได้")) {
      return;
    }
    deleteBtn.disabled = true;
    try {
      await deleteDoc(doc(db, "506Requests", id));
      window.location.href = "case-analysis.html";
    } catch (err) {
      statusEl.textContent = "ลบไม่สำเร็จ: " + err.message + " (ตรวจสอบว่าตั้ง Firestore Security Rules ให้ลบได้แล้วหรือยัง)";
      deleteBtn.disabled = false;
    }
  });

  onSnapshot(
    doc(db, "506Requests", id),
    function (snapshot) {
      if (!snapshot.exists()) {
        statusEl.textContent = "ไม่พบรายการนี้";
        listEl.style.display = "none";
        return;
      }
      statusEl.textContent = "ข้อมูลจาก Firestore (real-time) — อัปเดตล่าสุด " + new Date().toLocaleTimeString("th-TH");
      render(snapshot.data());
    },
    function (err) {
      statusEl.textContent = "โหลดข้อมูลไม่สำเร็จ: " + err.message + " (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือ Firestore Security Rules)";
      listEl.style.display = "none";
    }
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
