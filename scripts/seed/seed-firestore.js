// สคริปต์ seed ข้อมูลตัวอย่างเข้า Firestore project "ai-dsrp"
//
// เตรียมก่อนรัน:
//   1. npm install firebase-admin --save-dev
//   2. ดาวน์โหลด service account key จาก Firebase Console
//      (Project Settings > Service Accounts > Generate new private key)
//      แล้ววางไว้ที่ scripts/seed/serviceAccountKey.json (ไฟล์นี้อยู่ใน .gitignore แล้ว
//      ห้าม commit ขึ้น GitHub เด็ดขาด)
//
// รัน: node scripts/seed/seed-firestore.js

var admin = require("firebase-admin");
var path = require("path");
var data = require("./seed-data.js");

var serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

var serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error(
    "ไม่พบ scripts/seed/serviceAccountKey.json — ดาวน์โหลดจาก Firebase Console " +
      "(Project Settings > Service Accounts > Generate new private key) แล้ววางไฟล์ไว้ที่นี่ก่อนรันสคริปต์"
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

function seedUsers() {
  var batch = db.batch();
  data.users.forEach(function (user) {
    var ref = db.collection("users").doc(user.id);
    batch.set(ref, { name: user.name, email: user.email, role: user.role });
  });
  return batch.commit();
}

function seedDiseaseTypes() {
  var batch = db.batch();
  data.diseaseTypes.forEach(function (type) {
    var ref = db.collection("506Types").doc(type.id);
    batch.set(ref, { name: type.name });
  });
  return batch.commit();
}

function seedSurveillanceReports506() {
  var batch = db.batch();
  data.surveillanceReports506.forEach(function (report) {
    var ref = db.collection("506Requests").doc(); // auto-generate ID
    batch.set(ref, report);
  });
  return batch.commit();
}

async function main() {
  console.log("Seeding users...");
  await seedUsers();
  console.log("Seeding 506Types...");
  await seedDiseaseTypes();
  console.log("Seeding 506Requests...");
  await seedSurveillanceReports506();
  console.log("Seed เสร็จสมบูรณ์ — users: %d, 506Types: %d, 506Requests: %d", data.users.length, data.diseaseTypes.length, data.surveillanceReports506.length);
  process.exit(0);
}

main().catch(function (err) {
  console.error("Seed ล้มเหลว:", err);
  process.exit(1);
});
