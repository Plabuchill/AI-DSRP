// เข้าสู่ระบบ (FEAT-PLATFORM-02) — Firebase Authentication (Email/Password)
import { auth, db } from "./firebase-init.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Account lockout — เก็บตัวนับใน localStorage ของเบราว์เซอร์เท่านั้น (ไม่ใช่ Firestore)
// เพราะ Firestore Security Rules ปัจจุบันต้อง request.auth != null ถึงจะเขียนได้
// ตอน login ผิดผู้ใช้ยังไม่ auth เลยเขียน Firestore ไม่ได้ — วิธีนี้ป้องกันได้แค่ระดับ
// เบราว์เซอร์/เครื่องเดียวกัน (ล้าง localStorage หรือเปลี่ยนเบราว์เซอร์ก็ข้ามได้) ไม่ใช่
// การล็อกระดับบัญชีจริงฝั่ง server — เหมาะกับ prototype demo เท่านั้น
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;

function getLockoutKey(email) {
  return "ai-dsrp-login-lockout:" + email.toLowerCase();
}

function readLockoutState(email) {
  try {
    const raw = localStorage.getItem(getLockoutKey(email));
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };
  } catch (err) {
    return { attempts: 0, lockedUntil: null };
  }
}

function writeLockoutState(email, state) {
  try {
    localStorage.setItem(getLockoutKey(email), JSON.stringify(state));
  } catch (err) {
    // localStorage อาจใช้ไม่ได้ (private mode/ปิดไว้) — ปล่อยผ่าน ไม่ crash ระบบ login
  }
}

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

  // แจ้งผลหลังสมัครสมาชิกสำเร็จจาก signup.html (?signup=success)
  if (new URLSearchParams(window.location.search).get("signup") === "success") {
    infoEl.textContent = "สมัครสมาชิกสำเร็จ กรุณารอหัวหน้า (Manager) อนุมัติก่อนจึงจะเข้าสู่ระบบได้";
    infoEl.style.display = "block";
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

    const lockout = readLockoutState(email);
    if (lockout.lockedUntil && new Date(lockout.lockedUntil).getTime() > Date.now()) {
      const minutesLeft = Math.ceil((new Date(lockout.lockedUntil).getTime() - Date.now()) / 60000);
      errorEl.textContent = "บัญชีนี้ถูกล็อกชั่วคราวเนื่องจากกรอกรหัสผ่านผิดครบ " + LOCKOUT_THRESHOLD + " ครั้ง กรุณาลองใหม่อีกครั้งใน " + minutesLeft + " นาที";
      errorEl.style.display = "block";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "กำลังเข้าสู่ระบบ...";

    signInWithEmailAndPassword(auth, email, password)
      .then(function () {
        writeLockoutState(email, { attempts: 0, lockedUntil: null });
        return checkApprovalStatusAndProceed(email);
      })
      .catch(function () {
        const attempts = lockout.attempts + 1;
        const remaining = LOCKOUT_THRESHOLD - attempts;

        if (remaining <= 0) {
          const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
          writeLockoutState(email, { attempts: attempts, lockedUntil: lockedUntil });
          errorEl.textContent = "กรอกรหัสผ่านผิดครบ " + LOCKOUT_THRESHOLD + " ครั้ง บัญชีนี้ถูกล็อกชั่วคราว " + LOCKOUT_MINUTES + " นาที";
        } else {
          writeLockoutState(email, { attempts: attempts, lockedUntil: null });
          errorEl.textContent = "อีเมลหรือรหัสผ่านไม่ถูกต้อง (เหลือโอกาสอีก " + remaining + " ครั้ง ก่อนบัญชีจะถูกล็อกชั่วคราว)";
        }

        errorEl.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "เข้าสู่ระบบ";
      });

    // แยกออกมาจาก .catch() ด้านบนโดยตั้งใจ — error จากขั้นตอนนี้ (เช่น query Firestore ล้มเหลว)
    // ไม่ใช่ "รหัสผ่านผิด" จึงไม่ควรถูกนับเป็นความพยายาม lockout
    async function checkApprovalStatusAndProceed(email) {
      try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        const userData = snap.empty ? null : snap.docs[0].data();

        if (userData && userData.status === "pending") {
          await signOut(auth);
          errorEl.textContent = "บัญชีนี้ยังรอการอนุมัติจากหัวหน้า (Manager) กรุณารอการอนุมัติก่อนเข้าสู่ระบบ";
          errorEl.style.display = "block";
          submitBtn.disabled = false;
          submitBtn.textContent = "เข้าสู่ระบบ";
          return;
        }
        if (userData && userData.status === "rejected") {
          await signOut(auth);
          errorEl.textContent = "คำขอสมัครสมาชิกของบัญชีนี้ถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ";
          errorEl.style.display = "block";
          submitBtn.disabled = false;
          submitBtn.textContent = "เข้าสู่ระบบ";
          return;
        }

        window.location.href = "index.html";
      } catch (err) {
        errorEl.textContent = "เกิดข้อผิดพลาดขณะตรวจสอบสถานะบัญชี: " + err.message;
        errorEl.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "เข้าสู่ระบบ";
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
