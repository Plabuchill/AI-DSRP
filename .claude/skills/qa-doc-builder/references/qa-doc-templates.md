# QA Document Templates

ใช้เป็นโครงอ้างอิงตอน Step 3 ของ `qa-doc-builder` — ปรับเนื้อหาให้เข้ากับ scope จริงที่ยืนยันไว้ในแผน ไม่ต้องยัดทุกหัวข้อถ้าไม่เกี่ยวข้อง

## TEST-PLAN.md

```markdown
# Test Plan — [ชื่อ feature/scope] — test-docs/vN

## 1. Scope & Objective
- อ้างอิงจาก: [Requirement/Backlog/Feature List/User Journey หรือ prototypes/vN]
- สิ่งที่ครอบคลุม / ไม่ครอบคลุมในรอบนี้

## 2. Test Strategy
- ประเภทการทดสอบ: Functional / UI / Data validation / (Performance, Security ถ้ามีใน scope)
- ความลึก: happy path / negative case / edge case (ตามที่ยืนยันในแผน)

## 3. Test Environment
- Prototype ที่ใช้ทดสอบ: [path, เช่น prototypes/v1]
- อุปกรณ์/ความละเอียดหน้าจอที่ทดสอบ (ถ้าเกี่ยวข้อง): Desktop / Tablet / Mobile

## 4. Entry & Exit Criteria
- Entry: [เช่น prototype/feature พร้อมทดสอบ, มี test case ที่ approve แล้ว]
- Exit: [เช่น ผ่าน test case ที่เป็น critical/high priority ทั้งหมด]

## 5. Roles & Responsibilities
- [ผู้ออกแบบ test case / ผู้ทดสอบ / ผู้ sign-off]

## 6. Risks & Assumptions
- [ความเสี่ยง/สมมติฐานที่ตั้งไว้ระหว่างสร้างเอกสารนี้]

## 7. Schedule (ถ้าผู้ใช้ให้ข้อมูลมา)
- [ช่วงเวลาทดสอบ ถ้ามี]
```

## TEST-CASES (โครงสร้างสำหรับส่งให้ skill `xlsx` แปลงเป็นไฟล์)

คอลัมน์มาตรฐาน (เรียงลำดับนี้ในสเปรดชีต):

| คอลัมน์ | คำอธิบาย |
|---|---|
| Test Case ID | เช่น `TC-001` เรียงตามลำดับ ต่อเนื่องกันทั้งไฟล์ |
| Feature / Requirement Ref | อ้างอิงกลับไปยัง Feature List/Backlog ID หรือชื่อหน้าจอใน prototype (ต้องมีเสมอ เพื่อ traceability) |
| Title | ชื่อสั้นๆ ของ test case |
| Precondition | เงื่อนไขก่อนเริ่มทดสอบ |
| Steps | ขั้นตอนการทดสอบ ระบุเป็นลำดับ 1. 2. 3. ในเซลล์เดียว (ใช้ line break ภายในเซลล์) |
| Expected Result | ผลลัพธ์ที่ควรเกิดขึ้น |
| Priority | High / Medium / Low |
| Actual Result | เว้นว่างไว้ให้ QA กรอกตอนทดสอบจริง |
| Status | เว้นว่างไว้ (Pass/Fail/Blocked) |
| Tester | เว้นว่างไว้ |

ตัวอย่าง 1 แถว:

| Test Case ID | Feature / Requirement Ref | Title | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-001 | Outbreak Dashboard – Filter | กรองข้อมูลตามชนิดโรค | เปิดหน้า Outbreak Dashboard, มี mock data ครบ | 1. เลือก dropdown "โรค"\n2. เลือก "ไข้เลือดออก (Dengue Fever)" | KPI cards, region grid, กราฟ, alert list อัปเดตให้แสดงเฉพาะข้อมูลไข้เลือดออกทั้งหมด | High |

## ACCEPTANCE-CRITERIA.md

ใช้รูปแบบ Given-When-Then ต่อ 1 feature/user story เพื่อให้ตรวจสอบง่ายว่า "ผ่าน" หรือ "ไม่ผ่าน":

```markdown
# Acceptance Criteria — [ชื่อ feature] — test-docs/vN

## [Feature/Backlog ID] — [ชื่อ feature]

**Given** [บริบท/เงื่อนไขเริ่มต้น]
**When** [การกระทำของผู้ใช้]
**Then** [ผลลัพธ์ที่ต้องเกิดขึ้นถึงจะถือว่าผ่าน]

- [ ] เกณฑ์ย่อยที่ 1
- [ ] เกณฑ์ย่อยที่ 2
```

ตัวอย่าง:

```markdown
## FR-DASH-01 — Outbreak Dashboard Filter

**Given** ผู้ใช้อยู่ที่หน้า Outbreak Dashboard ที่มี mock data ครบทุกภูมิภาค/โรค
**When** ผู้ใช้เลือก filter โรคเป็น "ไข้เลือดออก"
**Then** KPI cards, region grid, trend chart, และ alert list ต้องแสดงเฉพาะข้อมูลที่เกี่ยวกับไข้เลือดออกเท่านั้น ไม่มีข้อมูลโรคอื่นปนอยู่

- [ ] ตัวเลข Total Active Cases เปลี่ยนตาม filter
- [ ] Region grid ไม่แสดงภูมิภาคที่ไม่มีเคสไข้เลือดออกเป็นสีเข้ม (ต้องจางลงหรือแสดง 0)
- [ ] Alert list กรองเฉพาะแจ้งเตือนที่เกี่ยวกับไข้เลือดออก
```
