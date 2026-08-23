---
name: data-contract-builder
description: สร้าง/ปรับปรุงเอกสาร API Spec และ Database Schema/Spec ของ AI Disease Surveillance & Response Platform ในระดับ **conceptual** (ยังไม่ผูกมัดกับ technical stack — ไม่ระบุ database engine, ภาษา, framework, หรือรูปแบบ protocol เจาะจง เว้นแต่ผู้ใช้ยืนยันมา) ผลลัพธ์อย่างน้อยประกอบด้วย ER Diagram, รายละเอียดแต่ละตาราง/entity, และ conceptual API operation list จาก ROADMAP.md, FEATURE-LIST.md, prototypes/vN/BUILD-PLAN.md, HIGH-LEVEL-ARCHITECTURE.md และ/หรือ requirement ที่ผู้ใช้ระบุเพิ่ม ก่อนสร้าง/แก้ไขไฟล์ใดๆ จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนจะถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง/คำแนะนำพร้อมข้อดี-ข้อเสียเสมอ และถ้ามีเอกสารเดิมอยู่แล้วจะถามว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง API spec, data contract, database schema, ER diagram, data model, entity, table design, หรือขอออกแบบโครงข้อมูล/ตารางของระบบ แม้จะพูดแบบไม่เป็นทางการ (เช่น "ช่วยออกแบบตารางข้อมูลให้หน่อย", "ระบบนี้ควรเก็บข้อมูลยังไง", "อยากเห็นว่า API ควรมีอะไรบ้าง")
---

# Data Contract Builder

Skill นี้เป็นสมาชิกลำดับที่ 4 ของตระกูล `prototype-builder`/`qa-doc-builder`/`architecture-builder` — ใช้ input ชุดคล้ายกัน (Requirement/Feature List/ROADMAP/Architecture ที่มีอยู่) แต่ผลลัพธ์เป็น**เอกสาร Data Contract** 2 ชนิด: **Database Schema/Spec** (conceptual data model) และ **API Spec** (conceptual operation/data contract) — ทั้งคู่จงใจให้อยู่ในระดับ**แนวคิด (conceptual/logical)** ไม่ผูกกับ technical stack เพื่อให้ตัดสินใจเทคโนโลยีจริงได้อย่างอิสระในขั้นตอนถัดไป (เช่นเดียวกับที่ `architecture-builder` เน้น capability มากกว่ายี่ห้อเทคโนโลยี)

**ความสัมพันธ์กับ `architecture-builder`**: `HIGH-LEVEL-ARCHITECTURE.md` พูดถึง Database/API เป็นแค่ "กล่อง" หนึ่งใน diagram ระดับ Container เท่านั้น — ส่วนเอกสารจาก skill นี้ (`DATA-MODEL.md`, `API-SPEC.md`) คือรายละเอียดชั้นถัดไปของกล่องนั้น ถ้ามี `HIGH-LEVEL-ARCHITECTURE.md` อยู่แล้วให้ใช้เป็น reference บริบท (component ไหนต้องใช้ data อะไร) แต่ไม่ต้องรอให้มีก่อนเสมอไป — ถ้ายังไม่มีให้ทำงานจาก ROADMAP.md/FEATURE-LIST.md ตรงๆ ได้

เหมือนกับ 3 skill ก่อนหน้า ทุก workflow ที่ต้องคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่องแก้/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแผนแล้ว ให้มอบให้ subagent `data-contract-writer` (ดู `.claude/agents/data-contract-writer.md`)

## ภาพรวม Workflow

```
0. รับ Input (Requirement ด้านข้อมูล/API / ROADMAP.md / FEATURE-LIST.md / HIGH-LEVEL-ARCHITECTURE.md / prototypes/vN/BUILD-PLAN.md)
1. เช็ก ROADMAP.md + FEATURE-LIST.md — ต้องมีให้อ้างอิง ไม่มีต้องหยุดถามก่อน
2. เช็กว่ามี DATA-MODEL.md/API-SPEC.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่ หรือ archive แล้วเขียนใหม่
3. ร่าง Build Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย เสมอ ไม่มีข้อยกเว้น)
4. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent data-contract-writer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม traceability
```

---

## Step 0 — รับ Input

รับได้หลายทาง ไม่จำเป็นต้องมีครบ:

- **Requirement ด้านข้อมูล/API ตรงๆ** — เช่น "ต้องเก็บประวัติเคสย้อนหลัง", "ต้องมี API ให้ mobile app เรียกดู spot map", ข้อจำกัดด้านข้อมูล (PDPA, ต้องเก็บ audit trail, ต้อง versioning ประวัติแก้ไข)
- **อ้างอิงเอกสารที่มีอยู่แล้ว** — `ROADMAP.md`, `FEATURE-LIST.md` (Feature ID ที่ต้องมี data/API รองรับ), `HIGH-LEVEL-ARCHITECTURE.md` (ถ้ามี, ดูว่า component ไหนต้องพึ่ง data อะไร), `prototypes/vN/BUILD-PLAN.md` และ mock data structure ใน `prototypes/vN/script.js`/`*.js` แต่ละหน้า (มัก reveal โครงข้อมูลจริงที่ UI ต้องการ เช่น field ที่ตารางในหน้านั้นแสดง)
- **คำถามเปิด** — เช่น "ระบบนี้ควรเก็บข้อมูลยังไง" โดยไม่มี input อื่น ให้ถามกลับว่าจะโฟกัส module/feature ไหนก่อน อย่าเดา scope เอง (เหมือน 3 skill ก่อนหน้า)

ถ้าจุดใดตีความได้หลายแบบ ให้เก็บไว้ถามรวมกันใน Step 3 (Ambiguity Protocol) ไม่ต้องถามทันทีทีละจุด

---

## Step 1 — เช็ก Reference หลัก (ROADMAP.md + FEATURE-LIST.md ต้องมาก่อนเสมอ)

Data Model และ API Spec ต้อง**ตรวจสอบย้อนกลับได้ (traceable)** ไปยัง Feature ID (`FEAT-<โมดูล>-NN`) เสมอ — ทุก entity/table ต้องรู้ว่ารองรับ feature ไหน ทุก API operation ต้องรู้ว่าหน้าจอ/flow ไหนเรียกใช้

1. ตรวจว่ามี `ROADMAP.md` (root) และ `docs/01-requirements/01-spec/FEATURE-LIST.md` หรือไม่
2. **ถ้ามีทั้งสอง** — อ่านและใช้เป็นฐานอ้างอิง ไปต่อ Step 2 ได้เลย
3. **ถ้าไม่มี หรือมีแค่บางส่วน** — หยุดก่อน ถามผู้ใช้ว่าจะสร้างเอกสารต้นทางก่อน หรือมี Requirement ที่ระบุตรงๆ พอทำแบบ ad-hoc ไปก่อนได้ (ต้องระบุเป็น assumption ชัดเจนว่ายังไม่ผ่าน traceability เต็มรูปแบบ) — เหตุผลเดียวกับ `architecture-builder` Step 1

---

## Step 2 — ตัดสินใจ: แก้ไฟล์เดิมในที่ vs Archive แล้วเขียนใหม่

เอกสารจาก skill นี้อยู่ที่ `docs/02-design/02-technical/DATA-MODEL.md` และ `docs/02-design/02-technical/API-SPEC.md` — เป็น**ไฟล์เดี่ยว ไม่มี vN folder** เหมือนกับ `HIGH-LEVEL-ARCHITECTURE.md` (ดูเหตุผลใน SKILL.md ของ `architecture-builder`)

- **ไม่มีไฟล์เลย (รันครั้งแรก)** — สร้างใหม่ได้เลย
- **มีไฟล์ใดไฟล์หนึ่งหรือทั้งคู่อยู่แล้ว (รันซ้ำ)** — ถามผู้ใช้ทุกครั้งแยกเป็นรายไฟล์ (อาจจะแก้ DATA-MODEL.md ในที่ แต่ archive API-SPEC.md ก็ได้ ถ้าสถานการณ์ต่างกัน):
  1. **แก้ไฟล์เดิมในที่** — เพิ่ม entity/API operation ใหม่, ปรับความสัมพันธ์ที่ผิด, ไม่กระทบโครงหลัก
  2. **Archive ของเก่าไป `docs/00-archived/`** (ตั้งชื่อ `DATA-MODEL-{YYYY-MM-DD}.md` / `API-SPEC-{YYYY-MM-DD}.md`) **แล้วเขียนใหม่ทั้งฉบับ**

| แนะนำ | เหมาะกับ |
|---|---|
| **แก้ในที่** | เพิ่ม entity/attribute/API operation ใหม่ตาม feature ที่เพิ่ม, แก้ cardinality ที่ผิด, เพิ่มรายละเอียดตารางที่ยังไม่ครบ |
| **Archive แล้วเขียนใหม่** | เปลี่ยนแนวคิดโครงข้อมูลหลัก (เช่น เปลี่ยนจาก 1 เคสต่อ 1 แถว เป็น event-sourcing, เปลี่ยนขอบเขต bounded context), เปลี่ยนแนวทาง API หลัก (เช่น จาก request-response ล้วน เป็นต้องมี webhook/event ประกอบ), ต้องการเก็บเหตุผลของโครงเดิมไว้อ้างอิง |

---

## Step 3 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ใดๆ ก่อนผู้ใช้ยืนยันแผน** — โครงข้อมูลที่ผิด scope ตั้งแต่ต้นจะกระทบทุก layer ที่สร้างทับไว้ทีหลัง แก้ยากกว่าการรื้อ UI มาก

Build Plan ควรมีอย่างน้อย:

1. **Scope** — ทั้งระบบ / เฉพาะ module ไหน (map จาก Feature ID)
2. **Database Schema/Spec ที่จะทำ** — รายชื่อ entity/table หลักที่คาดว่าจะมี, ระดับความละเอียด (แค่ entity+attribute หลัก หรือรวม constraint/business rule ด้วย)
3. **API Spec ที่จะทำ** — รายชื่อ resource/operation หลักที่คาดว่าจะมี, ระดับความละเอียด (แค่ operation list หรือรวม request/response payload ตัวอย่างด้วย)
4. **สิ่งที่ conceptual จงใจไม่ระบุรอบนี้** — เช่น ยังไม่ระบุ database engine, ยังไม่ระบุ REST vs GraphQL, ยังไม่ระบุ auth mechanism เจาะจง (เว้นแต่ผู้ใช้ยืนยันมา)
5. **Reference ที่ใช้** — Feature ID ไหนจาก FEATURE-LIST.md, component ไหนจาก HIGH-LEVEL-ARCHITECTURE.md (ถ้ามี), mock data structure จากไฟล์ prototype ไหน
6. **Version decision** — แก้ในที่ หรือ archive แล้วเขียนใหม่ (จาก Step 2) ต่อไฟล์

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น)

ผู้ใช้ระบุไว้ชัดว่าทุกจุดที่ไม่ชัดเจนต้องถามพร้อมเสนอ **อย่างน้อย 3 แนวทาง/คำแนะนำ พร้อมข้อดี-ข้อเสียของแต่ละแนวทาง** เพื่อให้ผู้ใช้พิจารณาก่อนตัดสินใจ — ไม่ใช่ถามลอยๆ ว่า "เอาแบบไหนดี" จุดที่มักไม่ชัดเจนในงานนี้:

- **Cardinality/ความสัมพันธ์ที่ตีความได้หลายแบบ** — เช่น "เคส 1 เคสมีทีมสอบสวนโรครับผิดชอบกี่ทีม" (1:1 vs 1:N) ต้องเสนอทางเลือกพร้อมผลกระทบต่อ query/ความซับซ้อน
- **ระดับความละเอียดของ ER Diagram** — เฉพาะ entity หลัก vs รวม lookup/reference table ย่อยด้วย vs รวม junction table ของ many-to-many ทุกจุด
- **ขอบเขต API Spec** — เฉพาะ operation list (ชื่อ+วัตถุประสงค์) vs รวม field-level request/response ตัวอย่างด้วย vs รวม error case/validation rule ด้วย
- **Versioning/audit trail ของข้อมูล** — เก็บ history ทุกครั้งที่แก้ไข (เช่นเคสที่แก้ไขข้อมูลก่อนยืนยันใน Case Intake) หรือเก็บแค่สถานะล่าสุด
- **Soft delete vs hard delete** — ข้อมูลสุขภาพที่อ่อนไหวมักต้องมี audit trail ไม่ลบถาวร แต่ต้องถามยืนยันนโยบายจริงของหน่วยงาน ไม่เดาเอง
- **Multi-tenancy/scope ข้อมูล** — ถ้าในอนาคตมีหลายเทศบาลใช้ระบบร่วมกัน ต้องออกแบบ entity ให้แยก tenant ได้ไหม หรือยังจำกัดแค่เทศบาลเดียวตามที่ prototype ปัจจุบันสมมติไว้

ใช้รูปแบบคำถามเดียวกับ 3 skill ก่อนหน้า (ดูตัวอย่างใน SKILL.md ของ `prototype-builder` หัวข้อ Ambiguity Protocol) — ใช้ `AskUserQuestion` เมื่อเหมาะสม (ตัวเลือกชัดเจน ≤4 ทาง) หรือถามเป็นข้อความธรรมดาถ้าต้องอธิบายบริบทเยอะ

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

เมื่อผู้ใช้ยืนยันแผนแล้ว:

1. **ถ้าเลือก archive ใน Step 2** — ย้ายไฟล์เดิมที่เกี่ยวข้องไป `docs/00-archived/` ก่อน (ทำเองใน main loop)
2. เรียก subagent `data-contract-writer` (ผ่าน Agent tool, `subagent_type: data-contract-writer`) พร้อมส่ง context ให้ครบ:
   - เนื้อหา `ROADMAP.md`/`FEATURE-LIST.md` ที่เกี่ยวข้อง
   - เนื้อหา `HIGH-LEVEL-ARCHITECTURE.md` ที่เกี่ยวข้อง (ถ้ามี)
   - เนื้อหา `prototypes/vN/BUILD-PLAN.md` และไฟล์ mock data (`*.js`) ที่เกี่ยวข้อง (ถ้าอ้างอิง)
   - Build Plan ที่ยืนยันแล้วทั้งหมด (รวมคำตอบจาก Ambiguity Protocol ทุกข้อ)
   - Path ปลายทาง (`docs/02-design/02-technical/DATA-MODEL.md`, `docs/02-design/02-technical/API-SPEC.md`)
   - ถ้าเป็นการแก้ไฟล์เดิม: เนื้อหาปัจจุบันทั้งหมด และส่วนที่ต้องแก้/เพิ่มเท่านั้น
3. รอผลจาก subagent แล้วตรวจสอบคร่าวๆ ว่าไฟล์ถูกสร้าง/แก้ครบตามแผน (มี ER Diagram จริงไหม, มีรายละเอียดต่อตารางจริงไหม) ก่อนสรุปให้ผู้ใช้
4. อัปเดต `docs/02-design/02-technical/index.md` ให้มีลิงก์ชี้ไปไฟล์ใหม่ (ถ้าเป็นการสร้างครั้งแรก)

## Step 5 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่สร้าง/แก้ (และไฟล์ archive ถ้ามี)
- รายชื่อ entity/table และ API operation ที่ทำเสร็จ
- Traceability สรุปย่อ: Feature ID ไหน map กับ entity/operation ไหนบ้าง
- Assumption ที่ subagent ตัดสินใจเอง (นอกเหนือจาก Build Plan) ให้ผู้ใช้ตรวจทาน
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อมี feature ใหม่หรือโครงข้อมูลต้องเปลี่ยน ระบบจะถามเรื่องแก้/archive ให้อัตโนมัติ

---

## อ้างอิงเพิ่มเติม

- `references/data-contract-templates.md` — Template โครงสร้างของ `DATA-MODEL.md` (ER Diagram + Entity Dictionary) และ `API-SPEC.md` (Conceptual Operation List)
