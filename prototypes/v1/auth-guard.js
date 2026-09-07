// Auth guard (FEAT-PLATFORM-02) — import ในทุกหน้ายกเว้น login.html
// หน้าที่: (1) เด้งกลับ login.html ถ้ายังไม่ login, (2) เติมชื่อ/สิทธิ์/อักษรย่อผู้ใช้ที่ login
// ลงบล็อก .rail-user ของ left rail, (3) ผูกปุ่ม "ออกจากระบบ" (#btn-logout) ให้ signOut แล้วเด้งกลับ login.html
//
// ต้องมี element เหล่านี้ในหน้า (ตามโครง left rail มาตรฐานของ prototype v1):
//   .rail-user-name, .rail-user-role, .rail-user .avatar, #btn-logout

import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const nameEl = document.querySelector(".rail-user-name");
  const roleEl = document.querySelector(".rail-user-role");
  const avatarEl = document.querySelector(".rail-user .avatar");

  try {
    const q = query(collection(db, "users"), where("email", "==", user.email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userData = snap.docs[0].data();
      if (nameEl) nameEl.textContent = userData.name;
      // ยังไม่มี role label ภาษาไทยที่เป็นทางการ — แสดง role ตรงๆ ไปก่อน (manager/team1/team3)
      if (roleEl) roleEl.textContent = userData.role;
      if (avatarEl) avatarEl.textContent = userData.name.slice(0, 2);
    } else {
      if (nameEl) nameEl.textContent = user.email;
      if (roleEl) roleEl.textContent = "-";
    }
  } catch (err) {
    if (nameEl) nameEl.textContent = user.email;
    if (roleEl) roleEl.textContent = "โหลดข้อมูลผู้ใช้ไม่สำเร็จ";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      signOut(auth).then(function () {
        window.location.href = "login.html";
      });
    });
  }
});
