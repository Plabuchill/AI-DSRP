# User Journey — เฝ้าระวังสัญญาณการระบาดผ่าน Outbreak Dashboard

อ้างอิงจาก [[../../01-requirements/01-spec/FEATURE-LIST|FEATURE-LIST.md]] หมวด `FEAT-DASH` และตรงกับ Test Spec ที่มีอยู่แล้วใน [[../../03-testing/01-test-plan/v1/ACCEPTANCE-CRITERIA|ACCEPTANCE-CRITERIA.md]] (FR-DASH-01 ถึง 06) — เลือกทำ journey นี้ก่อนเพราะเป็นโมดูลเดียวที่มี Test Spec ครบอยู่แล้ว ทำให้ตรวจสอบความสอดคล้องกันได้ทันที

## Persona

**สมศักดิ์ สุขวัฒน์** — เจ้าหน้าที่เฝ้าระวังโรค (ชื่อ/ตำแหน่งเดียวกับผู้ใช้ mock ที่แสดงใน left rail ของ prototype ทุกหน้า) ประจำเทศบาล เปิดระบบทุกเช้าเพื่อสแกนหาสัญญาณการระบาดที่ต้องรีบตอบสนอง ก่อนเริ่มงานอื่นของวัน

## Trigger

เริ่มกะงานตอนเช้า หรือได้รับแจ้งจากเพื่อนร่วมงานว่า "มีเคสในพื้นที่ ต.หนองบัว เพิ่มขึ้นสังเกตได้" — ต้องยืนยันด้วยข้อมูลจริงก่อนตัดสินใจ escalate

## ขั้นตอน

| # | สิ่งที่ทำ | สิ่งที่เห็น/ระบบตอบสนอง | Feature ที่เกี่ยวข้อง |
|---|---|---|---|
| 1 | เปิด `index.html` (Outbreak Dashboard) | Left rail แสดง wordmark "ai-dsrp", เมนู "Dashboard" active, เมนู Cases/Alerts/Reports อื่นยังเป็น placeholder (ยังเชื่อมไปมาไม่ได้ในรุ่นนี้) | FEAT-DASH-01 / FR-DASH-01 |
| 2 | มองภาพรวมที่ KPI Cards แถวบนก่อน | เห็น Total Active Cases, New Cases Today, Active Outbreak Zones, Overall Risk Level ของ**ทุกโรคทุกภูมิภาค 14 วันล่าสุด** (ค่าเริ่มต้น) | FEAT-DASH-02 / FR-DASH-02 |
| 3 | สังเกต Region Risk Grid เห็นภาคที่ระบายสี "วิกฤต" | เห็นครบ 6 ภาคเสมอ ภาคที่น่าห่วงขึ้นสีแดงตาม legend พร้อมจำนวนเคสสะสม | FEAT-DASH-03 / FR-DASH-03 |
| 4 | กรอง Filter ให้แคบลงเฉพาะโรค+ภูมิภาคที่สงสัย (เช่น ไข้เลือดออก + ภาคอีสาน) | KPI, Region Grid, Trend Chart, Recent Alerts ทั้ง 4 ส่วนอัปเดตพร้อมกันแบบ AND ทันที | FEAT-DASH-06 / FR-DASH-06 |
| 5 | ดู Trend Chart เพื่อเช็คว่าจำนวนเคสกำลังเพิ่มขึ้นต่อเนื่องหรือเป็นความผันผวนปกติ | กราฟแท่งรายวัน + เส้นค่าเฉลี่ยเคลื่อนที่ 3 วัน ตามช่วงวันที่ที่กรองไว้ | FEAT-DASH-04 / FR-DASH-04 |
| 6 | เลื่อนไปดู Recent Alerts Panel เพื่อดูว่ามีแจ้งเตือนที่ตรงกับพื้นที่/โรคนี้แล้วหรือยัง | รายการแจ้งเตือนที่กรองแล้วตรงเงื่อนไข พร้อม severity badge/พื้นที่/เวลา (หรือ empty state ถ้าไม่มี) | FEAT-DASH-05 / FR-DASH-05 |
| 7a | **กรณีเห็นสัญญาณชัดเจน** (Overall Risk Level = วิกฤต + แนวโน้มเพิ่มขึ้น) → ตัดสินใจ escalate | ในรุ่น prototype ปัจจุบันเมนู "Cases"/"Alerts" ยังเป็น placeholder — ต้อง escalate ผ่านช่องทางนอกระบบ (โทร/LINE) ไปก่อน | Backlog: FEAT-INTAKE-08, FEAT-ALERT-03 (Phase 1/6 — ยังไม่เชื่อมจริง) |
| 7b | **กรณีไม่พบสัญญาณผิดปกติ** → กด "ล้างตัวกรอง" กลับสู่ค่าเริ่มต้น แล้วปิดหน้าไปทำงานอื่นต่อ | Filter ทั้ง 3 คืนค่าเริ่มต้น ข้อมูลทั้ง 4 ส่วน re-render กลับสู่มุมมองภาพรวม | FEAT-DASH-06 / FR-DASH-06 |

## Pain point ที่ journey นี้แก้ (และที่ยังแก้ไม่ได้ในรุ่นนี้)

- ✅ แก้แล้ว: เดิมต้องรวบรวมตัวเลขจากหลายทีมด้วยมือก่อนจะเห็นภาพรวม — ตอนนี้เห็นภาพรวม+กรองได้ในหน้าเดียว
- ⚠️ ยังไม่แก้ (backlog): เมื่อเจอสัญญาณผิดปกติ ระบบยังไม่มีทางลัดกดต่อไปยัง Case Intake/Alert Management จากหน้า Dashboard ได้เลย (ขั้นตอน 7a ยังต้องออกนอกระบบ) — ตรงกับ ROADMAP.md Phase 6 ("เชื่อมข้อมูลจาก Case Intake / โมดูลทีมต่างๆ เข้ากับ Outbreak Dashboard แบบ real-time")

## Traceability กับ Test Spec

ทุกขั้นตอนหลัก (1-6) map ตรงกับ Acceptance Criteria ที่มีอยู่แล้วแบบ 1:1 (FR-DASH-01 ถึง 06 ใน [[../../03-testing/01-test-plan/v1/ACCEPTANCE-CRITERIA|ACCEPTANCE-CRITERIA.md]]) — ไม่มีขั้นตอนไหนในหกข้อนี้ที่ยังไม่มี test case รองรับ ส่วนขั้นตอน 7a เป็นจุดที่ตั้งใจระบุไว้ว่า **อยู่นอกขอบเขตการทดสอบรุ่นนี้** (ตรงกับ TEST-PLAN.md ข้อ "สิ่งที่ไม่ครอบคลุมในรอบนี้")
