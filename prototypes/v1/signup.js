// สมัครสมาชิก (FEAT-PLATFORM-02) — สร้างบัญชี Firebase Auth + Firestore user doc
// สถานะเริ่มต้น "pending" — ต้องรอ manager อนุมัติที่ user-approval.html ก่อนถึงจะ login เข้าใช้งานได้จริง
// (login.js เช็ก status นี้แล้ว sign out ทันทีถ้ายังไม่ approved)
import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

function init() {
  const form = document.getElementById("signup-form");
  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const submitBtn = document.getElementById("btn-signup");
  const errorEl = document.getElementById("signup-error");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorEl.style.display = "none";
    errorEl.textContent = "";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) {
      errorEl.textContent = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
      errorEl.style.display = "block";
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      errorEl.style.display = "block";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "กำลังสมัครสมาชิก...";

    createUserWithEmailAndPassword(auth, email, password)
      .then(function (credential) {
        // createUserWithEmailAndPassword สร้างบัญชีแล้ว sign-in ให้อัตโนมัติ —
        // ต้องสร้าง Firestore doc ก่อน แล้วค่อย sign out ทันที เพราะยังไม่ได้รับอนุมัติ
        return setDoc(doc(db, "users", credential.user.uid), {
          name: name,
          email: email,
          role: null,
          status: "pending"
        }).then(function () {
          return signOut(auth);
        });
      })
      .then(function () {
        window.location.href = "login.html?signup=success";
      })
      .catch(function (err) {
        if (err.code === "auth/email-already-in-use") {
          errorEl.textContent = "อีเมลนี้มีบัญชีอยู่แล้วในระบบ";
        } else if (err.code === "auth/invalid-email") {
          errorEl.textContent = "รูปแบบอีเมลไม่ถูกต้อง";
        } else if (err.code === "auth/weak-password") {
          errorEl.textContent = "รหัสผ่านง่ายเกินไป กรุณาตั้งรหัสผ่านที่ปลอดภัยกว่านี้";
        } else {
          errorEl.textContent = "สมัครสมาชิกไม่สำเร็จ: " + err.message;
        }
        errorEl.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "สมัครสมาชิก";
      });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
