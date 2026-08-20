# Roadmap — AI-DSRP

รวบรวมจากขอบเขตที่ยังไม่ได้ทำ ซึ่งถูกระบุไว้แล้วใน [`prototypes/v1/BUILD-PLAN.md`](./prototypes/v1/BUILD-PLAN.md) และ [`test-docs/v1/TEST-PLAN.md`](./test-docs/v1/TEST-PLAN.md) ระหว่างที่สร้าง prototype — จัดกลุ่มเป็นเฟสตามลำดับที่ควรทำก่อน-หลัง ยังไม่ใช่ commitment ด้านเวลา เป็นแนวทางลำดับความสำคัญเท่านั้น

## Phase 0 — Prototype (เสร็จแล้ว)

- [x] Design system (`DESIGN.md`) — Earth Tone + Minimalist + Muji
- [x] Outbreak Dashboard — KPI, แผนที่ความเสี่ยงตามภูมิภาค, กราฟแนวโน้ม, การแจ้งเตือนล่าสุด, ตัวกรอง
- [x] Case Intake — mock OCR review table, human-in-the-loop confirm + แก้ไขข้อมูลก่อนยืนยัน, notification log, spot map + วงรัศมี 100 เมตร
- [x] เอกสาร QA รอบแรก (Test Plan, Acceptance Criteria, Test Cases) สำหรับ Outbreak Dashboard

ทั้งหมดเป็น static HTML/CSS/JS ใช้ mock data ไม่มี backend จริง

## Phase 1 — เชื่อมต่อจริงสำหรับ Case Intake

เปลี่ยนส่วนที่ยัง mock อยู่ในหน้า Case Intake ให้ทำงานกับระบบจริง:

- **OCR/AI extraction จริง** — เชื่อม Google Document AI หรือโมเดล vision (Claude/GPT) แทนตาราง mock
- **Google Sheet + Google Drive จริง** — เขียนข้อมูลที่ยืนยันแล้วเข้าชีทอัตโนมัติ พร้อมลิงก์ไฟล์ต้นฉบับใน Drive คู่กับแถวข้อมูล
- **Geocoding API จริง** — แปลงที่อยู่เป็นพิกัดจริง แทน mock coordinate พร้อม fallback ปักหมุดด้วยมือเมื่อความแม่นยำต่ำ (UI ส่วนนี้ทำไว้ใน prototype แล้ว รอเชื่อม API)
- **LINE OA API จริง** — ส่งแจ้งเตือนไปยังทีมสอบสวนโรคจริงตาม field ตำบล/หมู่บ้าน แทน mock notification log
- **แก้ไขแถวที่ยืนยันแล้ว** — เพิ่ม flow unlock/ขอสิทธิ์แก้ไขข้อมูลที่ยืนยันไปแล้ว (ปัจจุบันแก้ได้เฉพาะแถว "รอตรวจสอบ")

## Phase 2 — Alert & Response Management แบบเต็ม

- หน้า Alert & Response Management (ปัจจุบันเป็น placeholder disabled ใน left rail)
- Workflow ติดตามการตอบสนองต่อการระบาด (มอบหมายงาน, อัปเดตสถานะ, ปิดเคส)
- เชื่อมข้อมูลจาก Case Intake เข้ากับ Outbreak Dashboard แบบ real-time แทน mock data คนละชุด

## Phase 3 — Platform Foundations

- **Backend/API จริง** แทนที่ mock data ที่ฝังอยู่ใน JS ของแต่ละหน้า
- **ระบบ login และสิทธิ์ผู้ใช้** (role-based access) — แยกสิทธิ์ระหว่างเจ้าหน้าที่โรงพยาบาล/เทศบาล/ทีมสอบสวนโรคแต่ละเขต
- **Data persistence/database** เก็บประวัติเคสและไฟล์ต้นฉบับระยะยาว

## Phase 4 — Hardening ก่อนใช้งานจริง

- **Performance testing** — ยังไม่ทำในรอบ prototype เพราะไม่มี backend/โหลดจริงให้ทดสอบ
- **Security testing** — รวมถึงทบทวนการส่งข้อมูลสุขภาพผ่าน 3rd-party API (Google/LINE) ให้สอดคล้อง PDPA
- **Accessibility audit** เต็มรูปแบบ (ปัจจุบันอ้างอิงตาม guideline ใน `DESIGN.md` แต่ยังไม่ได้ตรวจสอบจริงด้วยเครื่องมือ)

---

หมายเหตุ: ถ้ามี requirement/pain point ใหม่เพิ่มเติม (เช่น ข้อ 2, 3 ต่อจากเรื่องการรวบรวมข้อมูลที่คุยกันไปแล้ว) ให้เพิ่มเข้ามาต่อท้ายไฟล์นี้ตามลำดับความสำคัญที่ตกลงกัน
