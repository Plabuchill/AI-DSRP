// เข้าสู่ระบบ (FEAT-PLATFORM-02) — Firebase Authentication (Email/Password)
import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

function init() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const submitBtn = document.getElementById("btn-login");
  const errorEl = document.getElementById("login-error");
  const infoEl = document.getElementById("login-info");
  const forgotBtn = document.getElementById("btn-forgot-password");
  if (!form) return;

  function hideMessages() {
    errorEl.style.display = "none";
    errorEl.textContent = "";
    infoEl.style.display = "none";
    infoEl.textContent = "";
  }

  if (forgotBtn) {
    forgotBtn.addEventListener("click", function () {
      hideMessages();

      const email = emailInput.value.trim();
      if (!email) {
        errorEl.textContent = "กรุณากรอกอีเมลในช่องด้านบนก่อน แล้วกด \"ลืมรหัสผ่าน?\" อีกครั้ง";
        errorEl.style.display = "block";
        emailInput.focus();
        return;
      }

      forgotBtn.disabled = true;
      sendPasswordResetEmail(auth, email)
        .then(function () {
          infoEl.textContent = "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ " + email + " แล้ว กรุณาตรวจสอบกล่องจดหมาย";
          infoEl.style.display = "block";
        })
        .catch(function () {
          // ไม่เปิดเผยว่าอีเมลนี้มีอยู่ในระบบหรือไม่ (ป้องกัน user enumeration) — แสดงข้อความเดียวกันทุกกรณี
          infoEl.textContent = "หากอีเมล " + email + " มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่านทางอีเมลในไม่ช้า";
          infoEl.style.display = "block";
        })
        .finally(function () {
          forgotBtn.disabled = false;
        });
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideMessages();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      errorEl.textContent = "กรุณากรอกอีเมลและรหัสผ่านให้ครบ";
      errorEl.style.display = "block";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "กำลังเข้าสู่ระบบ...";

    signInWithEmailAndPassword(auth, email, password)
      .then(function () {
        window.location.href = "index.html";
      })
      .catch(function () {
        errorEl.textContent = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        errorEl.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "เข้าสู่ระบบ";
      });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
