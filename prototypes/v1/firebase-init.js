// Firebase init (FEAT-PLATFORM-02) — shared instance ใช้ร่วมกันทุกหน้า/ทุกสคริปต์ที่ต้องคุย
// กับ Firebase project "ai-dsrp" (Firestore + Authentication)
// ไฟล์นี้เป็นจุดเดียวที่ประกาศ firebaseConfig — ห้ามคัดลอก config ไปประกาศซ้ำที่ไฟล์อื่น
// ไฟล์ที่ต้องใช้ Firestore/Auth ให้ import { db } / { auth } จากที่นี่แทน

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCURDU09t4XimMJJS3-2tMJ03R_UG3eHHA",
  authDomain: "ai-dsrp.firebaseapp.com",
  projectId: "ai-dsrp",
  storageBucket: "ai-dsrp.firebasestorage.app",
  messagingSenderId: "1009928200028",
  appId: "1:1009928200028:web:35c910cdf1b574d5056b99",
  measurementId: "G-E94M9B9195"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
