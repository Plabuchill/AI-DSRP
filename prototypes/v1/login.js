// เข้าสู่ระบบ (FEAT-PLATFORM-02) — Firebase Authentication (Email/Password)
import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

function init() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const submitBtn = document.getElementById("btn-login");
  const errorEl = document.getElementById("login-error");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorEl.textContent = "";
    errorEl.style.display = "none";

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
