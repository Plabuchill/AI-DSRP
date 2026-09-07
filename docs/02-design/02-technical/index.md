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
- [`DATA-MODEL.md`](./DATA-MODEL.md) — conceptual data model ครอบคลุมทั้ง 8 โมดูลของระบบ (Case Intake, Dashboard, Case Analysis, Control Plan, Field Tracking, ASM Coordination, Reports, Alerts): ER Diagram + Entity Dictionary + cross-cutting concerns (audit trail, soft delete) ยังไม่ผูกกับ database engine ใดๆ
- [`API-SPEC.md`](./API-SPEC.md) — conceptual API spec ครอบคลุมทั้ง 8 โมดูลของระบบ: Case Intake มี operation list + payload ตัวอย่างระดับ field, อีก 7 โมดูลมีเฉพาะ operation list (ยังไม่รวม payload ตัวอย่าง) — ยังไม่ผูกกับ REST/GraphQL หรือ transport protocol ใดๆ
- [`TECH-STACK.md`](./TECH-STACK.md) — เทคโนโลยีจริงที่ยืนยันแล้วต่อ component (ต่างจาก 3 ไฟล์ข้างต้นที่เป็น conceptual) ปัจจุบันครอบคลุม Frontend, Backend/API runtime, Database (Firebase Firestore), Hosting (Firebase Hosting/Cloud Functions), Auth/Identity (Firebase Authentication) — AI/ML vendor และ component อื่นที่เหลือยังเป็น backlog รอสัมภาษณ์รอบหน้า
- [`ACL.md`](./ACL.md) — สิทธิ์การเข้าถึง (Access Control List) ต่อบทบาทสำหรับ feature รง.506 (`FEAT-ANALYSIS-07`) — เป็น**เป้าหมายการออกแบบ** ยังไม่ enforce จริงในโค้ด/Security Rules
- [`DETAILED-DESIGN.md`](./DETAILED-DESIGN.md) — conceptual detailed design ครอบคลุมทั้ง 8 โมดูลของระบบ: Sequence Flow (Mermaid) ต่อ flow หลักของแต่ละโมดูล พร้อม Business Rule/Validation Logic และ Error & Exception Handling เฉพาะ business-critical (เคสซ้ำ, cluster ผิดพื้นที่, แจ้งเตือนผิดทีม, อนุมัติซ้ำซ้อน, ปิด alert โดยไม่มี note) — ยังไม่มี State/Status Diagram แยกในรอบนี้ (ไม่มี entity ที่มีสถานะ ≥4 ขั้น)
- [`NFR-REVIEW.md`](./NFR-REVIEW.md) — ทวนสอบ `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md`/`DETAILED-DESIGN.md` ทั้งระบบเทียบกับ NFR ต้นทาง (`TECH-STACK.md`, `ROADMAP.md` Phase 8, `DESIGN.md`) ครอบทุกหมวด Performance/Security/Scalability/Availability-Reliability/Maintainability/Compliance/Accessibility/Usability พร้อมรายชื่อ Gap และข้อเสนอแนะ — เป็นการ review เท่านั้น ไม่ใช่การออกแบบใหม่
