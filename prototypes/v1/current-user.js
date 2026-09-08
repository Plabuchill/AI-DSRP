// ผู้ใช้ที่ login อยู่ + หมวดสิทธิ์ (FEAT-PLATFORM-02) — module กลางที่ทุกไฟล์ต้องใช้แทนการ
// query collection "users" ด้วย auth.currentUser.email ซ้ำๆ กันเอง (เดิมกระจายอยู่ใน
// auth-guard.js / case-analysis-506.js) ดู ACL.md สำหรับตารางสิทธิ์ที่ role category อ้างอิงถึง

import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

function waitForAuthUser() {
  return new Promise(function (resolve) {
    const unsubscribe = onAuthStateChanged(auth, function (user) {
      unsubscribe();
      resolve(user);
    });
  });
}

function fetchProfile(user) {
  if (!user) return null;
  return getDocs(query(collection(db, "users"), where("email", "==", user.email))).then(function (snap) {
    if (snap.empty) return { id: "", name: user.email || "", email: user.email || "", role: "" };
    const userDoc = snap.docs[0];
    const data = userDoc.data();
    return { id: userDoc.id, name: data.name, email: data.email, role: data.role };
  });
}

let profilePromise = null;

// คืนโปรไฟล์ผู้ใช้ที่ login อยู่ {id, name, email, role} หรือ null ถ้ายังไม่ login
// cache ไว้ต่อการโหลดหน้า (ไม่ query Firestore ซ้ำถ้าเรียกหลายครั้งในหน้าเดียวกัน)
export function getCurrentUserProfile() {
  if (!profilePromise) {
    profilePromise = waitForAuthUser().then(fetchProfile);
  }
  return profilePromise;
}

// แปลง role จริงใน Firestore ("manager"/"team1"/"team3"/...) เป็นหมวดสิทธิ์ตาม ACL.md
// - srrt: role ใดก็ได้ที่ขึ้นต้นด้วย "team" (ครอบ team1/team3 และทีมใหม่ในอนาคตโดยไม่ต้องแก้ที่นี่)
// - director: role === "director" (ค่าใหม่ ยังไม่มีบัญชี seed จริงตาม DATA-MODEL.md ปัจจุบัน)
export function getRoleCategory(role) {
  if (role === "manager") return "manager";
  if (typeof role === "string" && role.startsWith("team")) return "srrt";
  if (role === "director") return "director";
  return "unknown";
}
