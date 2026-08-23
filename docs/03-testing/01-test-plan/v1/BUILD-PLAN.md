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
