// อัปโหลดเอกสารรายงานผู้ป่วยจริง (FEAT-INTAKE-05) — เชื่อมต่อ Cloud Function "extractCaseReport"
// (Claude Vision ผ่าน Anthropic API) แทน mock data เดิมทั้งหมด
// ต่างจาก case-intake.js (classic script, mock CASES array) — ไฟล์นี้เป็น type="module" จุดเดียวในหน้านี้
// ที่คุยกับ Firebase/Cloud Function แล้วส่งผลลัพธ์กลับไปให้ case-intake.js ผ่าน CustomEvent
// "case-intake:ocr-result" (ตาม pattern เดียวกับ case-analysis.js + case-analysis-506.js)

import { functions } from "./firebase-init.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-functions.js";

const MAX_FILE_BYTES = 7 * 1024 * 1024; // ต้องตรงกับ MAX_FILE_BYTES ใน functions/index.js
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function readFileAsBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const result = String(reader.result || "");
      resolve(result.substring(result.indexOf(",") + 1));
    };
    reader.onerror = function () { reject(new Error("อ่านไฟล์ไม่สำเร็จ")); };
    reader.readAsDataURL(file);
  });
}

function init() {
  const selectBtn = document.getElementById("btn-select-file");
  const fileInput = document.getElementById("file-input");
  const dropzone = document.getElementById("dropzone");
  const statusEl = document.getElementById("upload-ocr-status");
  if (!selectBtn || !fileInput) return; // หน้าอื่นไม่มี element นี้

  const extractCaseReport = httpsCallable(functions, "extractCaseReport");

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.style.display = message ? "block" : "none";
    statusEl.className = "body-secondary" + (isError ? " upload-ocr-status-error" : "");
  }

  async function handleFile(file) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setStatus("รองรับเฉพาะไฟล์ PDF, JPEG, PNG เท่านั้น", true);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus("ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 7MB)", true);
      return;
    }

    selectBtn.disabled = true;
    setStatus("กำลังแปลงเอกสารด้วย OCR (Claude Vision)...", false);

    try {
      const base64 = await readFileAsBase64(file);
      const result = await extractCaseReport({
        fileBase64: base64,
        mimeType: file.type,
        fileName: file.name
      });

      setStatus("", false);
      document.dispatchEvent(new CustomEvent("case-intake:ocr-result", {
        detail: {
          fields: result.data.fields,
          fileName: file.name,
          fileType: file.type === "application/pdf" ? "PDF" : (file.type === "image/png" ? "PNG" : "JPEG"),
          fileSize: Math.max(1, Math.round(file.size / 1024)) + " KB"
        }
      }));
    } catch (err) {
      setStatus("แปลงเอกสารไม่สำเร็จ: " + (err && err.message ? err.message : "เกิดข้อผิดพลาด"), true);
    } finally {
      selectBtn.disabled = false;
    }
  }

  selectBtn.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) {
      handleFile(fileInput.files[0]);
      fileInput.value = "";
    }
  });

  // dropzone มี visual-only drag/drop handler อยู่แล้วใน case-intake.js (dragover/dragleave/drop
  // แค่ toggle class "dragover") — เพิ่ม listener แยกสำหรับ "drop" จริงที่นี่โดยไม่ชนกัน
  if (dropzone) {
    dropzone.addEventListener("drop", function (e) {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
