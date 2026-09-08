// อนุมัติสมาชิกใหม่ (FEAT-PLATFORM-02) — เชื่อมต่อ Firestore จริง (collection "users")
// แสดงเฉพาะ document ที่ status = "pending" — manager เลือก role แล้วกดอนุมัติ/ปฏิเสธ
// การจำกัดสิทธิ์ว่าต้องเป็น manager เท่านั้นถึงเข้าหน้านี้ได้ อยู่ใน auth-guard.js (route guard)
import { db } from "./firebase-init.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const ASSIGNABLE_ROLES = [
  { value: "team1", label: "ทีมสอบสวนโรค เขต 1 (team1)" },
  { value: "team3", label: "ทีมสอบสวนโรค เขต 3 (team3)" }
];

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function init() {
  const statusEl = document.getElementById("approval-status");
  const tbodyEl = document.getElementById("approval-tbody");
  if (!tbodyEl) return;

  function renderRows(items) {
    if (items.length === 0) {
      tbodyEl.innerHTML = '<tr><td colspan="4" class="body-secondary">ไม่มีรายการรออนุมัติ</td></tr>';
      return;
    }

    const roleOptionsHtml = ASSIGNABLE_ROLES.map(function (r) {
      return '<option value="' + r.value + '">' + escapeHtml(r.label) + '</option>';
    }).join("");

    tbodyEl.innerHTML = items.map(function (item) {
      const d = item.data;
      return (
        '<tr>' +
          '<td>' + escapeHtml(d.name) + '</td>' +
          '<td>' + escapeHtml(d.email) + '</td>' +
          '<td><select class="input-inline" id="role-select-' + item.id + '">' + roleOptionsHtml + '</select></td>' +
          '<td>' +
            '<div class="row-actions">' +
              '<button type="button" class="btn btn-primary btn-sm" data-action="approve" data-id="' + item.id + '">อนุมัติ</button>' +
              '<button type="button" class="btn btn-outline btn-sm" data-action="reject" data-id="' + item.id + '">ปฏิเสธ</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join("");
  }

  async function approve(id) {
    const roleSelect = document.getElementById("role-select-" + id);
    const role = roleSelect ? roleSelect.value : ASSIGNABLE_ROLES[0].value;
    try {
      await updateDoc(doc(db, "users", id), { status: "approved", role: role });
    } catch (err) {
      statusEl.textContent = "อนุมัติไม่สำเร็จ: " + err.message;
    }
  }

  async function reject(id) {
    try {
      // ไม่ลบบัญชี Firebase Auth จริง (ทำจาก client-side ไม่ได้ — ต้องมี Cloud Function)
      // แค่เปลี่ยนสถานะเป็น rejected แล้วให้ login.js บล็อกไม่ให้เข้าใช้งานถาวร
      await updateDoc(doc(db, "users", id), { status: "rejected" });
    } catch (err) {
      statusEl.textContent = "ปฏิเสธไม่สำเร็จ: " + err.message;
    }
  }

  tbodyEl.addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (btn.getAttribute("data-action") === "approve") {
      approve(id);
    } else {
      reject(id);
    }
  });

  const pendingQuery = query(collection(db, "users"), where("status", "==", "pending"));
  onSnapshot(
    pendingQuery,
    function (snapshot) {
      const items = snapshot.docs.map(function (d) { return { id: d.id, data: d.data() }; });
      statusEl.textContent = "ข้อมูลจาก Firestore (real-time) — อัปเดตล่าสุด " + new Date().toLocaleTimeString("th-TH") + " · รออนุมัติ " + items.length + " รายการ";
      renderRows(items);
    },
    function (err) {
      statusEl.textContent = "โหลดข้อมูลไม่สำเร็จ: " + err.message + " (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือ Firestore Security Rules)";
      tbodyEl.innerHTML = '<tr><td colspan="4" class="body-secondary">โหลดข้อมูลไม่สำเร็จ</td></tr>';
    }
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
