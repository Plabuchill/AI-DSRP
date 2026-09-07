// สร้าง รง.506 ใหม่ (FEAT-ANALYSIS-07) — เชื่อมต่อ Firestore จริง
// เขียนเอกสารใหม่ลง collection "506Requests" — reuse pattern เดียวกับ case-analysis-506.js
// (Firebase SDK import, firebaseConfig, escapeHtml, error handling)
// field ตรงกับ DATA-MODEL.md (SURVEILLANCE_REPORT_506): camelCase ทั้งหมด, วันที่เป็น string ธรรมดา (ไม่ใช้ Timestamp)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCURDU09t4XimMJJS3-2tMJ03R_UG3eHHA",
  authDomain: "ai-dsrp.firebaseapp.com",
  projectId: "ai-dsrp",
  storageBucket: "ai-dsrp.firebasestorage.app",
  messagingSenderId: "1009928200028",
  appId: "1:1009928200028:web:35c910cdf1b574d5056b99",
  measurementId: "G-E94M9B9195"
};

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function init() {
  const statusEl = document.getElementById("form-status");
  const diseaseSelect = document.getElementById("disease-select");
  const requesterSelect = document.getElementById("requester-select");
  const titleInput = document.getElementById("title-input");
  const reasonInput = document.getElementById("reason-input");
  const startDateInput = document.getElementById("start-date-input");
  const endDateInput = document.getElementById("end-date-input");
  const saveBtn = document.getElementById("btn-save-request");
  if (!saveBtn) return; // หน้าอื่นไม่มี element นี้

  let app;
  let db;
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (err) {
    statusEl.textContent = "เชื่อมต่อ Firebase ไม่สำเร็จ: " + err.message;
    return;
  }

  let diseasesLoaded = false;
  let requestersLoaded = false;

  function updateStatusReady() {
    if (diseasesLoaded && requestersLoaded) {
      statusEl.textContent = "โหลดรายการโรคติดต่อและผู้แจ้งสำเร็จ — กรอกข้อมูลแล้วกดบันทึก";
    }
  }

  function renderOptions(selectEl, docs, placeholderText) {
    if (docs.length === 0) {
      selectEl.innerHTML = '<option value="">' + escapeHtml(placeholderText) + '</option>';
      selectEl.disabled = true;
      return;
    }
    selectEl.disabled = false;
    selectEl.innerHTML = docs.map(function (item) {
      return '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.data.name) + '</option>';
    }).join("");
  }

  // 506Types → disease-select
  onSnapshot(
    collection(db, "506Types"),
    function (snapshot) {
      const docs = snapshot.docs.map(function (d) { return { id: d.id, data: d.data() }; });
      renderOptions(diseaseSelect, docs, "ไม่มีข้อมูลโรคติดต่อ");
      diseasesLoaded = true;
      updateStatusReady();
    },
    function (err) {
      statusEl.textContent = "โหลดรายการโรคติดต่อไม่สำเร็จ: " + err.message + " (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือ Firestore Security Rules)";
      diseaseSelect.innerHTML = '<option value="">โหลดไม่สำเร็จ</option>';
    }
  );

  // users → requester-select
  onSnapshot(
    collection(db, "users"),
    function (snapshot) {
      const docs = snapshot.docs.map(function (d) { return { id: d.id, data: d.data() }; });
      renderOptions(requesterSelect, docs, "ไม่มีข้อมูลผู้แจ้ง");
      requestersLoaded = true;
      updateStatusReady();
    },
    function (err) {
      statusEl.textContent = "โหลดรายการผู้แจ้งไม่สำเร็จ: " + err.message + " (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือ Firestore Security Rules)";
      requesterSelect.innerHTML = '<option value="">โหลดไม่สำเร็จ</option>';
    }
  );

  async function handleSave() {
    const title = titleInput.value.trim();
    const reason = reasonInput.value.trim();
    const diseaseId = diseaseSelect.value;
    const requesterId = requesterSelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!title || !reason || !diseaseId || !requesterId || !startDate) {
      statusEl.textContent = "กรุณากรอกข้อมูลให้ครบ: หัวเรื่อง, เหตุผล, โรคติดต่อ, ผู้แจ้ง และวันที่เริ่มต้น";
      return;
    }

    const diseaseOption = diseaseSelect.options[diseaseSelect.selectedIndex];
    const requesterOption = requesterSelect.options[requesterSelect.selectedIndex];
    const diseaseName = diseaseOption ? diseaseOption.textContent : "";
    const requesterName = requesterOption ? requesterOption.textContent : "";

    saveBtn.disabled = true;
    statusEl.textContent = "กำลังบันทึก...";

    try {
      await addDoc(collection(db, "506Requests"), {
        title: title,
        reason: reason,
        startDate: startDate,
        endDate: endDate || null,
        status: "รอพิจารณา",
        requesterId: requesterId,
        requesterName: requesterName,
        approverId: null,
        approverName: null,
        diseaseId: diseaseId,
        diseaseName: diseaseName,
        createdAt: new Date().toISOString()
      });
      window.location.href = "case-analysis.html";
    } catch (err) {
      saveBtn.disabled = false;
      statusEl.textContent = "บันทึกไม่สำเร็จ: " + err.message + " (ตรวจสอบว่าตั้ง Firestore Security Rules ให้เขียนได้แล้วหรือยัง)";
    }
  }

  saveBtn.addEventListener("click", handleSave);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
