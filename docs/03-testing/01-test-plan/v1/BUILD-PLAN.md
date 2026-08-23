# Build Plan — test-docs/v1

## Scope
เอกสาร QA ชุดแรก อ้างอิงจาก `prototypes/v1/BUILD-PLAN.md` (Outbreak Dashboard — Full Analytics Dashboard, รีสกินโทน Earth Tone/Muji แล้ว) ครอบคลุมทั้ง 6 ส่วนของหน้า:
1. Navigation (wordmark, active page, เมนู placeholder Cases/Alerts/Reports)
2. KPI Cards (Total Active Cases, New Cases Today, Active Outbreak Zones, Overall Risk Level)
3. Region Risk Grid (6 ภาค, สีตามระดับความเสี่ยง)
4. Trend Chart (แนวโน้มเคส 14 วัน)
5. Recent Alerts Panel
6. Filter (โรค/ภูมิภาค/ช่วงวันที่)

## ความลึกของการทดสอบ (Assumption — ผู้ใช้ไม่ได้ระบุ เลือกค่ากลางที่สมดุล)
Happy path + negative/edge case สำคัญ (ไม่ทดสอบ performance/security เพราะเป็น static prototype ไม่มี backend จริง) — ระดับความละเอียด test case แบบ step-by-step (precondition + ขั้นตอนเป็นลำดับ + expected result ชัดเจนต่อ step)

## Acceptance Criteria
เขียนต่อ 1 feature (6 feature ตาม scope ด้านบน) แบบ Given-When-Then

## เอกสารที่สร้าง
- `TEST-PLAN.md`
- `ACCEPTANCE-CRITERIA.md`
- `TEST-CASES.xlsx`

## Version
`test-docs/v1` — รันครั้งแรก ไม่มี version เดิมให้เลือก

## Reference
`prototypes/v1/BUILD-PLAN.md` และ `DESIGN.md` (สำหรับบริบท ไม่ใช่ทดสอบเรื่องสไตล์)

---

## เพิ่มเติม 2026-08-23 (รอบ 2) — เพิ่ม FR-DASH-07 ถึง 15 + แก้ FR-DASH-02/04

### Requirement ต้นทาง
`docs/01-requirements/01-spec/FEATURE-LIST.md` เพิ่ง เพิ่ม `FEAT-DASH-07` ถึง `15` (attack rate card, ตารางเพศ, ตารางกลุ่มอายุ, สถิติอายุ, DF/DHF pie, ตารางอาชีพ, ตารางชุมชน, ตารางเขตบริการเรียงตามอัตราป่วย, ตารางป่วยจาก) และแก้คำอธิบาย `FEAT-DASH-02`/`04` ให้ตรงกับ Stat Tiles/กราฟรายสัปดาห์ปัจจุบัน — Test Spec เดิมมีแค่ `FR-DASH-01` ถึง `06` ยังไม่ครอบคลุม

### Scope
แก้ `TEST-PLAN.md`, `ACCEPTANCE-CRITERIA.md`, `TEST-CASES.xlsx` ในที่ (ไม่สร้าง v2)
- เพิ่ม `FR-DASH-07` ถึง `15` (Given-When-Then + checklist รูปแบบเดียวกับที่มีอยู่)
- แก้ `FR-DASH-02` (Stat Tiles 5 การ์ด แทน KPI Cards 4 การ์ด) และ `FR-DASH-04` (เพิ่มกราฟรายสัปดาห์เทียบปีก่อน คู่กับกราฟรายวันเดิม)
- อัปเดต scope section ใน `TEST-PLAN.md` จาก 6 ส่วนเป็น 15 ส่วน

### ความลึกของการทดสอบ (ยืนยันจากผู้ใช้)
เหมือนของเดิม: Happy path + negative/edge case สำคัญเท่านั้น ไม่มี performance/security test

### Edge case สำคัญที่ต้องรวม (ยืนยันจากผู้ใช้)
- `FEAT-DASH-11` (DF/DHF pie): ต้องซ่อน panel + แสดง note เมื่อ filter โรค ≠ ไข้เลือดออก
- `FEAT-DASH-02/07/08/09`: ผลรวมร้อยละ ≈100% แม้เปลี่ยน filter
- `FEAT-DASH-13`: ผลรวมเคสของชุมชน Top 8 ไม่เกินยอดรวมระดับเขตบริการ
- `FEAT-DASH-04`: กราฟรายสัปดาห์ (ทั้งปี ไม่ผูกกับ filter ช่วงวันที่) ต้องแสดงคู่กับกราฟรายวัน (ตาม filter ช่วงวันที่) โดยไม่สับสนกัน

### Version
แก้ไข `docs/03-testing/01-test-plan/v1` เดิมในที่ (ไม่สร้าง v2) — ยืนยันจากผู้ใช้แล้ว

### Reference
`docs/01-requirements/01-spec/FEATURE-LIST.md` (`FEAT-DASH-07` ถึง `15`), `prototypes/v1/index.html`/`script.js` ปัจจุบัน (implementation จริงที่ตรวจสอบแล้วในเซสชันที่สร้าง panel เหล่านี้)
