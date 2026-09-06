// ข้อมูลตัวอย่างสำหรับ seed เข้า Firestore — แก้ไฟล์นี้ได้อิสระ ไม่ต้องแตะ seed-firestore.js
//
// จุดที่ยังไม่ยืนยันจริง (ใส่ค่าชั่วคราวไว้ — แก้ตรงนี้ก่อนรันถ้าต้องการค่าจริง):
//   - users.CUCU1.email  ยังไม่ได้ระบุ ใช้ "cucu1@ai-dsrp.local" ชั่วคราว
//   - 506Types รหัส "68" (โควิด-19) ยังไม่ได้ยืนยันรหัสจริง ใช้ "68" ชั่วคราว

var users = [
  { id: "CUCU1", name: "สุชาวดี ชัยวรรณะ", email: "cucu1@ai-dsrp.local", role: "manager" },
  { id: "SRRT1", name: "สุพรรษา ธะนาคำ", email: "srrt1@ai-dsrp.local", role: "team1" },
  { id: "SRRT3", name: "สุรัลักษณ์ พุทธินำชัย", email: "srrt3@ai-dsrp.local", role: "team3" }
];

var diseaseTypes = [
  { id: "66", name: "โรคไข้เลือดออก" },
  { id: "67", name: "โรคไข้เลือดออกรุนแรง" },
  { id: "68", name: "โควิด-19" }
];

// status ตรงกับ enum ที่ยืนยันไว้ใน DATA-MODEL.md (SURVEILLANCE_REPORT_506): รอพิจารณา / ยืนยัน / ไม่ยืนยัน
var surveillanceReports506 = [
  {
    title: "รายงานเฝ้าระวังไข้เลือดออก ต.บ้านเป็ด",
    reason: "พบผู้ป่วยยืนยันผลตรวจไข้เลือดออก 1 ราย ในพื้นที่ ต.บ้านเป็ด อ.เมือง จ.ขอนแก่น",
    startDate: "2026-08-19",
    endDate: "2026-08-19",
    status: "รอพิจารณา",
    requesterId: "SRRT1",
    requesterName: "สุพรรษา ธะนาคำ",
    approverId: null,
    approverName: null,
    diseaseId: "66",
    diseaseName: "โรคไข้เลือดออก",
    createdAt: "2026-08-19T14:02:00+07:00"
  },
  {
    title: "รายงานเฝ้าระวังไข้เลือดออกรุนแรง ต.หนองบัว",
    reason: "พบผู้ป่วยผลตรวจ Dengue NS1 Positive มีอาการรุนแรง ต้องเฝ้าระวังใกล้ชิด",
    startDate: "2026-08-20",
    endDate: null,
    status: "รอพิจารณา",
    requesterId: "SRRT1",
    requesterName: "สุพรรษา ธะนาคำ",
    approverId: null,
    approverName: null,
    diseaseId: "67",
    diseaseName: "โรคไข้เลือดออกรุนแรง",
    createdAt: "2026-08-20T09:15:00+07:00"
  },
  {
    title: "รายงานเฝ้าระวังโควิด-19 ต.ท่าช้าง",
    reason: "พบผู้ป่วยยืนยันผล RT-PCR โควิด-19 ในพื้นที่ ต.ท่าช้าง อ.เมือง จ.นครราชสีมา",
    startDate: "2026-08-21",
    endDate: null,
    status: "รอพิจารณา",
    requesterId: "SRRT3",
    requesterName: "สุรัลักษณ์ พุทธินำชัย",
    approverId: null,
    approverName: null,
    diseaseId: "68",
    diseaseName: "โควิด-19",
    createdAt: "2026-08-21T10:40:00+07:00"
  },
  {
    title: "รายงานเฝ้าระวังไข้เลือดออก ต.สันติสุข",
    reason: "พบผู้ป่วยยืนยันผลตรวจไข้เลือดออกในพื้นที่ ต.สันติสุข อ.แม่ริม จ.เชียงใหม่ — ตรวจสอบแล้วครบถ้วน ยืนยันดำเนินการต่อ",
    startDate: "2026-08-17",
    endDate: "2026-08-17",
    status: "ยืนยัน",
    requesterId: "SRRT3",
    requesterName: "สุรัลักษณ์ พุทธินำชัย",
    approverId: "CUCU1",
    approverName: "สุชาวดี ชัยวรรณะ",
    diseaseId: "66",
    diseaseName: "โรคไข้เลือดออก",
    createdAt: "2026-08-17T11:20:00+07:00"
  },
  {
    title: "รายงานเฝ้าระวังไข้เลือดออกรุนแรง ต.เกาะแก้ว",
    reason: "รายงานซ้ำซ้อนกับเคสที่มีอยู่แล้วในระบบ ตรวจสอบแล้วไม่เข้าเกณฑ์เฝ้าระวังเพิ่มเติม",
    startDate: "2026-08-19",
    endDate: "2026-08-19",
    status: "ไม่ยืนยัน",
    requesterId: "SRRT1",
    requesterName: "สุพรรษา ธะนาคำ",
    approverId: "CUCU1",
    approverName: "สุชาวดี ชัยวรรณะ",
    diseaseId: "67",
    diseaseName: "โรคไข้เลือดออกรุนแรง",
    createdAt: "2026-08-19T16:05:00+07:00"
  }
];

module.exports = { users: users, diseaseTypes: diseaseTypes, surveillanceReports506: surveillanceReports506 };
