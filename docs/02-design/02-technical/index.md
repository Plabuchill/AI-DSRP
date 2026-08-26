# 02 - Technical

เก็บเอกสาร **การออกแบบเชิงเทคนิค (Technical Design)** เช่น

- System architecture / โครงสร้างระบบโดยรวม
- Database schema
- API design / data contract
- เทคโนโลยีและไลบรารีที่เลือกใช้ พร้อมเหตุผล

เอกสารในโฟลเดอร์นี้คือพิมพ์เขียวที่ทีมพัฒนาใช้อ้างอิงตอนลงมือเขียนโค้ด และเป็นฐานในการวางแผนทดสอบใน [[../../03-testing/01-test-plan/index|01-test-plan]]

> **Design System จริง** อยู่ที่ [`/DESIGN.md`](../../../DESIGN.md) ที่ root ของโปรเจกต์ (ไม่ได้ก็อปปี้มาไว้ในนี้ เพื่อไม่ให้มี 2 ชุดที่อาจไม่ตรงกัน) — ทุก prototype ต้องอ้างอิงไฟล์นี้เป็นหลัก

## เอกสารที่มีอยู่

- [`HIGH-LEVEL-ARCHITECTURE.md`](./HIGH-LEVEL-ARCHITECTURE.md) — สถาปัตยกรรมระดับสูง (สถานะปัจจุบัน + เป้าหมายตาม [[../../../ROADMAP.md|ROADMAP.md]]), data flow หลัก, และข้อจำกัดทางเทคนิคที่ต้องพิจารณาก่อนสร้างจริง
- [`DATA-MODEL.md`](./DATA-MODEL.md) — conceptual data model ของโมดูล Case Intake (`FEAT-INTAKE-*`): ER Diagram + Entity Dictionary + cross-cutting concerns (audit trail, soft delete) ยังไม่ผูกกับ database engine ใดๆ
- [`API-SPEC.md`](./API-SPEC.md) — conceptual API spec ของโมดูล Case Intake (`FEAT-INTAKE-*`): operation list + payload ตัวอย่างระดับ field ยังไม่ผูกกับ REST/GraphQL หรือ transport protocol ใดๆ
- [`TECH-STACK.md`](./TECH-STACK.md) — เทคโนโลยีจริงที่ยืนยันแล้วต่อ component (ต่างจาก 3 ไฟล์ข้างต้นที่เป็น conceptual) ปัจจุบันครอบคลุมเฉพาะ Frontend และ Backend/API runtime (`FEAT-PLATFORM-01`) — component อื่น (Database, Hosting, Auth, AI/ML vendor ฯลฯ) ยังเป็น backlog รอสัมภาษณ์รอบหน้า
