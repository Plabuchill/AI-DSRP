---
name: qa-doc-builder
description: สร้างเอกสาร QA ชุด Test Plan, Test Case (matrix แบบ Excel), และ Acceptance Criteria จาก Requirement, Backlog, Feature List, และ/หรือ User Journey ของ AI Disease Surveillance & Response Platform (ระบุมาแค่บางส่วนก็ได้ หรือจะให้อ้างอิงจาก prototype ที่มีอยู่แล้วใน `prototypes/vN/` ก็ได้) ก่อนสร้างไฟล์ใดๆ จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ และทุกครั้งที่เรียกซ้ำ (Requirement ใหม่, feature เพิ่ม, ขอปรับเอกสารเดิม) จะถามผู้ใช้เสมอว่าจะสร้างโฟลเดอร์เวอร์ชันใหม่หรือแก้ของเดิม พร้อมคำแนะนำ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง test plan, test case, acceptance criteria, เกณฑ์การยอมรับ, แผนทดสอบ, QA sign-off, หรือขอเอกสารสำหรับให้ทีมทดสอบ/QA ใช้ตรวจสอบฟีเจอร์หรือ prototype ที่มีอยู่ แม้ผู้ใช้จะพูดแบบไม่เป็นทางการ (เช่น "ช่วยทำเช็คลิสต์ test ให้หน่อย", "อยากได้เกณฑ์ว่าฟีเจอร์นี้ผ่านหรือไม่ผ่าน")
---

# QA Doc Builder

Skill นี้เป็นคู่ขนานของ [`prototype-builder`](../prototype-builder/SKILL.md) — ใช้ input ชุดเดียวกัน (Requirement / Backlog / Feature List / User Journey) แต่ผลลัพธ์เป็น**เอกสาร QA** แทนที่จะเป็น prototype ที่คลิกได้ ตั้งใจแยกเป็น skill คนละตัวเพราะ deliverable และรูปแบบไฟล์ต่างกันมาก (เอกสาร/สเปรดชีต vs HTML/CSS/JS) การผูกรวมกันจะทำให้ SKILL.md ทั้งสองยาวและสับสน

เหมือนกับ `prototype-builder` ทุก workflow ที่ต้องคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่อง version) รันอยู่ใน main loop ห้ามข้าม ส่วนงานสร้างไฟล์จริงหลังยืนยันแผนแล้ว ให้ทำดังนี้:
- เอกสาร Markdown (`TEST-PLAN.md`, `ACCEPTANCE-CRITERIA.md`) → ส่งให้ subagent `test-doc-writer` (ดู `.claude/agents/test-doc-writer.md`)
- ไฟล์ Excel (`TEST-CASES.xlsx`) → เรียก skill `xlsx` (ของ Anthropic) ตรงในเบื้องหลัก main loop เพื่อสร้างสเปรดชีตให้ถูกต้อง ไม่ต้องมอบให้ subagent ทำเอง เพราะการสร้าง .xlsx ต้องพึ่งพา library เฉพาะที่ skill นั้นจัดการให้อยู่แล้ว

## ภาพรวม Workflow

```
0. รับ Input (Requirement / Backlog / Feature List / User Journey / หรืออ้างอิง prototypes/vN/BUILD-PLAN.md)
1. เช็กว่ามี test-docs/ เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะสร้าง version ใหม่ หรือแก้ของเดิม
2. ร่าง Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไหนไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย)
3. เมื่อยืนยันแล้ว → สร้าง TEST-PLAN.md + ACCEPTANCE-CRITERIA.md ผ่าน subagent, สร้าง TEST-CASES.xlsx ผ่าน skill xlsx
4. สรุปผลให้ผู้ใช้ พร้อม traceability (feature/backlog ไหน ตรงกับ test case ไหน)
```

---

## Step 0 — รับ Input

รับได้ 2 ทาง ไม่จำเป็นต้องมีครบ:

1. **ระบุตรงๆ**: Requirement / Backlog / Feature List / User Journey (ข้อความในแชท, ไฟล์แนบ, หรือบอกแค่บางส่วน)
2. **อ้างอิงจาก prototype ที่มีอยู่แล้ว**: ถ้ามีโฟลเดอร์ `prototypes/vN/` อยู่แล้ว ให้เสนอผู้ใช้ว่าจะอ้างอิง `BUILD-PLAN.md` ของ version ล่าสุด (หรือ version ที่ระบุ) เป็นฐานได้ไหม เพราะจะทำให้ test case ตรงกับสิ่งที่สร้างจริง ไม่ใช่ตรงกับ requirement ที่อาจเปลี่ยนไปแล้วระหว่างพัฒนา — ถ้าผู้ใช้มี Requirement/Backlog ฉบับใหม่กว่าที่ยังไม่ได้ทำ prototype ก็ใช้ทางเลือกที่ 1 แทนได้ปกติ

ถ้าไม่มีข้อมูลอะไรเลยและไม่มี prototype ให้อ้างอิง ให้ถามตรงๆ ว่าจะให้ทำ test doc ของฟีเจอร์/flow ไหน

---

## Step 1 — ตัดสินใจเรื่อง Folder Version (ถามทุกครั้งที่เรียกซ้ำ)

เอกสาร QA เก็บอยู่ใต้ `test-docs/` แยก version เหมือนกับ `prototypes/`:

```
test-docs/
├── v1/
│   ├── TEST-PLAN.md
│   ├── TEST-CASES.xlsx
│   ├── ACCEPTANCE-CRITERIA.md
│   └── BUILD-PLAN.md   (แผนที่ยืนยันแล้ว + scope + reference ที่ใช้)
```

- **ไม่มีเลย (รันครั้งแรก)** — สร้าง `test-docs/v1/` ได้เลย
- **มีอยู่แล้ว (รันซ้ำ)** — ถามผู้ใช้ทุกครั้งโดยไม่มีข้อยกเว้น ว่าจะ:
  1. **สร้าง version ใหม่** (`v{N+1}`)
  2. **แก้ version ล่าสุดโดยตรง**

ให้คำแนะนำประกอบเสมอ:

| แนะนำ | เหมาะกับ |
|---|---|
| **สร้าง version ใหม่** | มี Requirement/Feature ใหม่ที่เพิ่ม scope การทดสอบอย่างมีนัยสำคัญ, ต้องการเก็บเอกสารเดิมไว้อ้างอิงเทียบ (เช่น audit trail ว่า QA sign-off รอบไหนตรวจอะไรบ้าง), prototype ที่อ้างอิงเปลี่ยนเป็น version ใหม่ (เช่น `prototypes/v2`) ทำให้ scope การทดสอบเปลี่ยนไปพอสมควร |
| **แก้ของเดิม** | แก้ test case ที่ผิด/ไม่ครบ, เพิ่ม edge case ย่อยๆ ในฟีเจอร์เดิม, ปรับตาม feedback รอบ review ก่อนหน้า (ไม่ใช่ scope ใหม่) |

**หมายเหตุสำคัญ**: ถ้า test-docs อ้างอิง prototype version ใดไว้ (เช่น `prototypes/v1`) แล้ว prototype นั้นถูกอัปเดตเป็น version ใหม่ (เช่น `prototypes/v2` ผ่าน `prototype-builder`) ควรแจ้งผู้ใช้ตรงนี้ด้วยว่า test-docs เดิมอาจไม่ตรงกับ prototype ล่าสุดแล้ว และถามว่าต้องการ sync test-docs ตาม prototype version ใหม่หรือไม่ — ไม่ต้องเดาเองว่าต้อง sync หรือไม่

---

## Step 2 — ร่าง Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้างเอกสารใดๆ ก่อนผู้ใช้ยืนยันแผน** ด้วยเหตุผลเดียวกับ `prototype-builder` — ผิด scope ตั้งแต่ต้นจะเสียเวลารื้อทำใหม่ และเอกสาร QA ที่ scope ผิดอาจทำให้ทีมทดสอบพลาดจุดสำคัญจริงๆ

Plan ควรมี:

1. **Scope** — Feature/Backlog/User Journey ไหนที่จะครอบคลุมใน test docs รอบนี้ (map จาก input ที่ได้)
2. **โครงสร้าง Test Plan** — หัวข้อหลักที่จะมี (ดู `references/qa-doc-templates.md`)
3. **ปริมาณ/ความลึกของ Test Case** — จำนวนโดยประมาณ, ครอบคลุมแค่ happy path หรือรวม negative/edge case ด้วย (นี่มักเป็นจุดที่ต้องใช้ Ambiguity Protocol เพราะกระทบเวลา/ความละเอียดมาก)
4. **Acceptance Criteria** — จะเขียนต่อ 1 feature/user story หรือต่อ 1 backlog item
5. **Reference ที่ใช้** — อ้างอิง Requirement ที่ระบุตรงๆ, หรืออ้างอิง `prototypes/vN/BUILD-PLAN.md`
6. **Version decision** — สร้างใหม่เป็น `vN` หรือแก้ `vN` เดิม (จาก Step 1)

### Ambiguity Protocol

จุดที่มักไม่ชัดเจนในงานนี้และต้องถามพร้อมเสนอ ≥3 แนวทาง+ข้อดีข้อเสียเสมอ (ไม่ใช่แค่ถามลอยๆ):
- **ความลึกของการทดสอบ**: เฉพาะ happy path / รวม negative case / รวม edge case+security+performance ด้วย
- **ระดับความละเอียดของ test case**: high-level (1 step ต่อ 1 บรรทัด) vs step-by-step ละเอียด (precondition, ทีละคลิก, expected result ทุก step)
- **ขอบเขต Acceptance Criteria**: ครอบคลุมทุก backlog item ย่อย หรือเฉพาะ feature ระดับบน (epic)

ใช้รูปแบบคำถามเดียวกับ `prototype-builder` (ดูตัวอย่างใน SKILL.md ของ prototype-builder หัวข้อ Ambiguity Protocol)

---

## Step 3 — สร้างเอกสารจริง

เมื่อผู้ใช้ยืนยันแผนแล้ว:

1. สร้างโฟลเดอร์ `test-docs/vN/` ตามที่ตัดสินใจไว้
2. เขียน `test-docs/vN/BUILD-PLAN.md` เก็บแผนที่ยืนยันแล้ว (รูปแบบเดียวกับที่ `prototype-builder` ใช้ — scope, assumption, version, reference)
3. เรียก subagent `test-doc-writer` (ผ่าน Agent tool, `subagent_type: test-doc-writer` ถ้ามีในระบบ ไม่งั้นใช้ `general-purpose` พร้อมแนบเนื้อหาไฟล์ agent เข้าไปในพรอมป์) ให้สร้าง:
   - `test-docs/vN/TEST-PLAN.md`
   - `test-docs/vN/ACCEPTANCE-CRITERIA.md`
   - เนื้อหา Test Case แบบ structured (list ของ object: id, feature, precondition, steps, expected result, priority) ส่งกลับมาเป็นผลลัพธ์ ไม่ใช่เขียนเป็น .xlsx เอง
4. นำ Test Case ที่ subagent สร้างมา เรียก skill `anthropic-skills:xlsx` (ผ่าน Skill tool) เพื่อสร้าง `test-docs/vN/TEST-CASES.xlsx` จริง — ให้มีคอลัมน์อย่างน้อย: Test Case ID, Feature/Requirement Ref, Precondition, Steps, Expected Result, Priority, Actual Result (เว้นว่างไว้ให้ QA กรอก), Status (เว้นว่างไว้), Tester (เว้นว่างไว้)
5. ตรวจสอบว่าไฟล์ทั้งสามถูกสร้างครบก่อนสรุปให้ผู้ใช้

## Step 4 — สรุปผลให้ผู้ใช้

สรุป path ของเอกสารที่สร้าง, จำนวน test case ต่อ feature, traceability (feature/backlog ไหน map กับ test case ข้อไหนบ้าง), assumption ที่ตัดสินใจไปเอง และแจ้งว่าเรียก skill นี้ซ้ำได้เมื่อมี requirement ใหม่หรือ prototype เปลี่ยน version

---

## อ้างอิงเพิ่มเติม

- `references/qa-doc-templates.md` — โครงสร้าง/template ของ Test Plan, Test Case, Acceptance Criteria
