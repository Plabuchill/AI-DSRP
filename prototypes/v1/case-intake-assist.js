// ให้ AI ช่วยตรวจสอบความสมเหตุสมผลของข้อมูลเคส (FEAT-INTAKE-10) — เชื่อมต่อ Cloud Function
// "assistCaseReview" (Claude, text-only) ต่างจาก case-intake-upload.js ที่ส่งไฟล์ไปให้ OCR
// ไฟล์นี้ส่งเฉพาะข้อมูล field ที่มีอยู่แล้วในแถว (ไม่ใช่ไฟล์) — เป็น advisory เท่านั้น
// ไม่แก้ข้อมูลอัตโนมัติ ผลลัพธ์ส่งกลับให้ case-intake.js ผ่าน CustomEvent
// "case-intake:assist-result" (ตาม pattern เดียวกับ case-intake-upload.js)

import { functions } from "./firebase-init.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-functions.js";

function init() {
  const tableBody = document.getElementById("ocr-table-body");
  if (!tableBody) return; // หน้าอื่นไม่มี element นี้

  const assistCaseReview = httpsCallable(functions, "assistCaseReview");

  tableBody.addEventListener("click", async function (e) {
    const btn = e.target.closest(".btn-assist-review");
    if (!btn) return;

    const id = parseInt(btn.getAttribute("data-id"), 10);
    const fieldsJson = btn.getAttribute("data-fields");
    let fields;
    try {
      fields = JSON.parse(fieldsJson);
    } catch (err) {
      return;
    }

    btn.disabled = true;
    btn.textContent = "กำลังตรวจสอบ...";

    document.dispatchEvent(new CustomEvent("case-intake:assist-result", {
      detail: { id: id, loading: true }
    }));

    try {
      const result = await assistCaseReview({ fields: fields });
      document.dispatchEvent(new CustomEvent("case-intake:assist-result", {
        detail: { id: id, loading: false, status: result.data.status, notes: result.data.notes || [] }
      }));
    } catch (err) {
      document.dispatchEvent(new CustomEvent("case-intake:assist-result", {
        detail: { id: id, loading: false, error: (err && err.message) || "เกิดข้อผิดพลาด" }
      }));
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
