---
name: architecture-builder
description: สร้าง/อัปเดตเอกสาร High-Level Architecture (System Architecture ระดับสูง แบบ **conceptual** ที่ยังไม่ผูกมัดกับ technical stack, Data Flow ที่ map ตาม User Journey, ข้อจำกัดทางเทคนิค, Decision Log) ของ AI Disease Surveillance & Response Platform จาก ROADMAP.md, FEATURE-LIST.md, User Journey doc (`docs/02-design/01-prototypes/USER-JOURNEY-*.md`), prototypes/vN/BUILD-PLAN.md และ/หรือ requirement ทางเทคนิคที่ผู้ใช้ระบุเพิ่ม (ระบุมาแค่บางส่วนก็ได้) ก่อนสร้าง/แก้ไขไฟล์ใดๆ จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนจะถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง/คำแนะนำพร้อมข้อดี-ข้อเสียเสมอ (ไม่มีข้อยกเว้น) และถ้ามี HIGH-LEVEL-ARCHITECTURE.md เดิมอยู่แล้ว จะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive ของเก่าไป docs/00-archived/ แล้วเขียนใหม่ทั้งฉบับ พร้อมคำแนะนำ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง architecture, system design, tech stack, data flow, user journey ↔ system, component diagram, C4 model, ADR (Architecture Decision Record), หรือขอเอกสารสถาปัตยกรรมระบบ แม้ผู้ใช้จะพูดแบบไม่เป็นทางการ (เช่น "ช่วยวาดโครงระบบให้หน่อย", "อยากเห็นภาพรวมว่าระบบเชื่อมกันยังไง", "ระบบนี้ควรออกแบบยังไงดี")
---

# Architecture Builder

Skill นี้เป็นสมาชิกลำดับที่ 3 ของตระกูล `prototype-builder`/`qa-doc-builder` — ใช้ input ชุดคล้ายกัน (Requirement/Backlog/Feature List/ROADMAP) แต่ผลลัพธ์เป็น**เอกสาร Architecture** (system diagram, data flow, tech decision) แทน prototype ที่คลิกได้หรือเอกสาร QA

**ข้อแตกต่างสำคัญจาก 2 skill ก่อนหน้า**: `prototypes/vN/` และ `docs/03-testing/01-test-plan/vN/` เป็นเอกสารที่ versioned ต่อรอบงาน (สร้าง v2 ใหม่ได้เรื่อยๆ) แต่เอกสาร Architecture ใน `docs/02-design/02-technical/` เป็น**เอกสาร canonical เดี่ยวที่มีชีวิต** (living document) ตาม pattern ที่มีอยู่แล้วของโฟลเดอร์นี้ — เมื่อต้องปรับปรุงรอบใหม่ จะ**แก้ไฟล์เดิมในที่** หรือ**ย้ายของเก่าไป `docs/00-archived/`** แล้วเขียนใหม่ทั้งฉบับ (ไม่สร้าง `v2` คู่ขนานแบบ prototypes/test-docs) ดู [[../../../memory/project_docs_structure|memory ของ docs structure]] ถ้าจำเป็นต้องทวนเหตุผลของ convention นี้

เหมือนกับ 2 skill ก่อนหน้า ทุก workflow ที่ต้องคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่องแก้/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแผนแล้ว ให้มอบให้ subagent `architecture-writer` (ดู `.claude/agents/architecture-writer.md`)

## ภาพรวม Workflow

```
0. รับ Input (Requirement ทางเทคนิค / ROADMAP.md / FEATURE-LIST.md / User Journey doc / prototypes/vN/BUILD-PLAN.md)
1. เช็ก ROADMAP.md + FEATURE-LIST.md — ต้องมีให้อ้างอิง ไม่มีต้องหยุดถามก่อน
2. เช็กว่ามี HIGH-LEVEL-ARCHITECTURE.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่ หรือ archive แล้วเขียนใหม่
3. ร่าง Build Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย เสมอ ไม่มีข้อยกเว้น)
4. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent architecture-writer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม traceability
```

---

## Step 0 — รับ Input

รับได้หลายทาง ไม่จำเป็นต้องมีครบ:

- **Requirement ทางเทคนิค** — เช่น non-functional requirement (scale, security, compliance/PDPA), ข้อจำกัดที่ต้องยึด (ต้องใช้ LINE OA, ต้องเก็บข้อมูลในประเทศ), เทคโนโลยีที่อยากใช้/ห้ามใช้, งบ/ทีมที่มี
- **อ้างอิงเอกสารที่มีอยู่แล้ว** — `ROADMAP.md` (phase ที่จะโฟกัส), `FEATURE-LIST.md` (Feature ID ที่ต้องออกแบบรองรับ), `docs/02-design/01-prototypes/USER-JOURNEY-*.md` (ลำดับขั้นตอนที่ผู้ใช้แต่ละบทบาทเดินผ่านระบบ — **ใช้เป็นฐานหลักของ Data Flow diagram** ดู Step 3), `prototypes/vN/BUILD-PLAN.md` (สิ่งที่ prototype ทำไปแล้ว ต้องมี architecture รองรับ), `docs/02-design/02-technical/TECH-STACK.md` (ถ้ามี — เทคโนโลยีจริงที่ยืนยันแล้วต่อ component ดู "Tech Stack Integration" ท้าย Step 3)
- **คำถามเปิด** — เช่น "ควรออกแบบระบบยังไงดี" โดยไม่มี input อื่น ให้ตอบด้วยการถามกลับว่าจะโฟกัสที่ทั้งระบบ หรือเฉพาะ module/phase ไหนก่อน อย่าเดา scope เอง

ถ้า module ที่จะทำ Data Flow ยังไม่มี User Journey doc ให้บันทึกเป็นจุดที่ต้องถามใน Step 3 (Ambiguity Protocol) ว่าจะเขียน Data Flow จาก Feature List แทน (เร็วกว่าแต่หยาบกว่า) หรือสร้าง User Journey ก่อน (ตรงกับ flow ผู้ใช้จริงกว่าแต่ต้องใช้เวลาเพิ่ม) — ไม่ต้องเดาเอง

ถ้าจุดใดตีความได้หลายแบบ ให้เก็บไว้ถามรวมกันใน Step 3 (Ambiguity Protocol) เหมือน 2 skill ก่อนหน้า ไม่ต้องถามทันทีทีละจุด

---

## Step 1 — เช็ก Reference หลัก (ROADMAP.md + FEATURE-LIST.md ต้องมาก่อนเสมอ)

เอกสาร Architecture ของโปรเจกต์นี้ต้อง**ตรวจสอบย้อนกลับได้ (traceable)** ไปยัง Feature ID (`FEAT-<โมดูล>-NN`) และ Phase ใน ROADMAP.md เสมอ — ดูตัวอย่างใน `HIGH-LEVEL-ARCHITECTURE.md` ปัจจุบันที่ทำแบบนี้อยู่แล้ว (ตาราง Layer ↔ Feature/Phase)

1. ตรวจว่ามี `ROADMAP.md` (root) และ `docs/01-requirements/01-spec/FEATURE-LIST.md` หรือไม่
2. **ถ้ามีทั้งสอง** — อ่านและใช้เป็นฐานอ้างอิง ไปต่อ Step 2 ได้เลย
3. **ถ้าไม่มี หรือมีแค่บางส่วน** — ต้องหยุดก่อน (ห้ามเดา Feature ID หรือ Phase เอง เพราะจะทำให้ traceability ผิดตั้งแต่ต้น) แล้วถามผู้ใช้ว่า:
   - จะสร้าง `ROADMAP.md`/`FEATURE-LIST.md` ก่อนไหม (ต้องทำนอก skill นี้ เพราะไม่ใช่หน้าที่ของ architecture-builder)
   - หรือมี Requirement/Backlog ที่ระบุตรงๆ พอให้ทำ architecture แบบ ad-hoc ไปก่อนได้ (ไม่มี Feature ID อ้างอิง — ต้องระบุเป็น assumption ชัดเจนว่ายังไม่ผ่าน traceability เต็มรูปแบบ)

> เหตุผลที่ต้องเข้มงวด: เอกสาร Architecture ที่ไม่ผูกกับ Feature/Phone จะ drift ออกจาก spec จริงเร็ว และทำให้ทีมพัฒนาอ้างอิงผิด เหมือนเหตุผลที่ `prototype-builder` เข้มงวดกับ `DESIGN.md` ก่อนเริ่มสร้าง

---

## Step 2 — ตัดสินใจ: แก้ไฟล์เดิมในที่ vs Archive แล้วเขียนใหม่ (ถามทุกครั้งที่มีไฟล์เดิมอยู่)

เอกสาร Architecture อยู่ที่ `docs/02-design/02-technical/HIGH-LEVEL-ARCHITECTURE.md` (และไฟล์ประกอบอื่นถ้ามี เช่น ADR แยกไฟล์) เป็น**ไฟล์เดี่ยว ไม่มี vN folder**

- **ไม่มีไฟล์นี้เลย (รันครั้งแรก)** — สร้างใหม่ได้เลย ไม่ต้องถามเรื่อง version
- **มีอยู่แล้ว (รันซ้ำ)** — **ต้องถามผู้ใช้ทุกครั้งโดยไม่มีข้อยกเว้น** ว่าต้องการ:
  1. **แก้ไฟล์เดิมในที่** — เพิ่ม/ปรับหัวข้อที่เกี่ยวข้องเท่านั้น ส่วนที่เหลือคงไว้
  2. **Archive ของเก่าไป `docs/00-archived/`** (ตั้งชื่อ `HIGH-LEVEL-ARCHITECTURE-{YYYY-MM-DD}.md` กันชนกับของเก่าที่อาจมีอยู่) **แล้วเขียนไฟล์ใหม่ทั้งฉบับ**

ให้คำแนะนำประกอบเสมอ:

| แนะนำ | เหมาะกับ |
|---|---|
| **แก้ในที่** | เพิ่ม component/service ใหม่ตาม phase ที่คืบหน้า, ปรับ diagram ให้ตรงกับ prototype ล่าสุด, แก้ข้อผิดพลาด/รายละเอียดย่อยที่ไม่กระทบทิศทางหลัก, เพิ่ม Decision Log entry ใหม่ |
| **Archive แล้วเขียนใหม่** | เปลี่ยนแนวทางสถาปัตยกรรมอย่างมีนัยสำคัญ (เช่น monolith → microservices, เปลี่ยนผู้ให้บริการ cloud/AI หลัก, เปลี่ยนจากอ้างอิง 6 ภาคเป็น 4 เขตบริการแบบที่เคยเกิดกับ Dashboard), ต้องการเก็บเหตุผลของการตัดสินใจเดิมไว้อ้างอิงว่าทำไมเคยเลือกทางนั้น (audit trail) |

**ห้ามเลือกให้เองโดยไม่ถาม** แม้จะดูชัดเจนก็ตาม — การ archive ทำให้ประวัติการตัดสินใจไม่หายไป แต่การแก้ในที่ก็มีข้อดีเรื่องไม่ต้องไล่ตามอ่านหลายไฟล์ ผู้ใช้ควรเลือกเอง

---

## Step 3 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ Architecture ใดๆ ก่อนผู้ใช้ยืนยันแผน** — ผิด scope หรือระดับความละเอียดตั้งแต่ต้นจะเสียเวลารื้อทำใหม่ และทีมพัฒนาอาจอ้างอิงเอกสารที่ยังไม่ตรงกับความตั้งใจจริง

Build Plan ควรมีอย่างน้อย:

1. **Scope** — ทั้งระบบ / เฉพาะ module ไหน / เฉพาะ Phase ไหนใน ROADMAP.md
2. **โครงสร้างเอกสาร** — หัวข้อที่จะมี (ดู `references/architecture-doc-template.md`) เช่น Current State, Target State, Data Flow (map ตาม User Journey), Component Breakdown, ข้อจำกัดทางเทคนิค, Decision Log, ลำดับการสร้างจริง — ระบุว่าหัวข้อไหนรวม/ไม่รวมรอบนี้
3. **ระดับความละเอียดของ diagram** — Context เท่านั้น (ภาพรวมระบบ↔ผู้ใช้↔บริการภายนอก) หรือรวม Container/Component ลงรายละเอียดกว่านั้น (ดู Ambiguity Protocol)
4. **User Journey ที่จะใช้ทำ Data Flow** — ระบุชื่อไฟล์ User Journey ที่จะ map (หนึ่ง diagram ต่อ 1 journey หลัก หรือรวมหลาย journey ที่เกี่ยวเนื่องกันเป็น diagram เดียว)
5. **ขอบเขต Decision Log/ADR** — จะบันทึกในไฟล์เดียวกัน หรือแยกไฟล์ต่อ decision
6. **Reference ที่ใช้** — ROADMAP.md phase ไหน, Feature ID ไหนจาก FEATURE-LIST.md, User Journey ไหน, BUILD-PLAN.md ของ prototype ไหน (ถ้ามี)
7. **Version decision** — แก้ในที่ หรือ archive แล้วเขียนใหม่ (จาก Step 2)
8. **ยืนยัน**: เอกสารรอบนี้เป็น **conceptual** — ไม่ผูกมัดกับ technical stack เจาะจง เว้นแต่ผู้ใช้ระบุมาชัดเจนใน Requirement/Ambiguity Protocol หรือมี `TECH-STACK.md` ยืนยันไว้แล้ว (ดูข้อ 9)
9. **Tech Stack Integration** (ถ้ามี `TECH-STACK.md`) — ระบุว่า component ไหนใน Component Breakdown จะสลับจาก capability-level เป็นเทคโนโลยีจริงตามที่ยืนยันไว้ **เป็นรายcomponent** (mixed state ได้ — component ที่ยังไม่ยืนยันคง conceptual ตามปกติ ไม่ต้องรอให้ครบทุกอันก่อนอัปเดต)

### Tech Stack Integration — วิธีใช้ TECH-STACK.md เมื่อมี

ถ้าพบ `docs/02-design/02-technical/TECH-STACK.md` ในโปรเจกต์:

- อ่านตาราง "Component ↔ เทคโนโลยีที่เลือก" เทียบกับรายชื่อ component ใน Component Breakdown ของ `HIGH-LEVEL-ARCHITECTURE.md`
- component ที่**มีแถวยืนยันแล้ว** ใน `TECH-STACK.md` — เพิ่มเทคโนโลยีจริงในคอลัมน์ "หน้าที่" หรือชื่อ component เอง (เช่น "Database" → "Database (เทคโนโลยีที่ยืนยัน: ...)"), และ node label ใน diagram Target State อาจเพิ่ม suffix เทคโนโลยีจริงในวงเล็บได้
- component ที่**ยังไม่มีแถวยืนยัน** — คง capability-level เดิมไว้ตามปกติ ไม่เดาเทคโนโลยีเอง
- **ไม่ต้องแก้ `TECH-STACK.md`** — เอกสารนั้นเป็นต้นทางที่ skill `tech-stack-builder` ดูแลเอง skill นี้แค่**อ่าน**เพื่ออ้างอิง

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น)

ทุกจุดที่ตีความได้มากกว่า 1 แบบ **ต้องถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง/คำแนะนำ พร้อมข้อดี-ข้อเสียของแต่ละแนวทาง** เพื่อให้ผู้ใช้พิจารณาก่อนตัดสินใจเสมอ — ไม่ใช่แค่ถามลอยๆ ว่า "เอาแบบไหนดี" จุดที่มักไม่ชัดเจนในงานนี้:

- **ระดับความละเอียด (C4-style)**: Context only / + Container / + Component — ยิ่งลึกยิ่งละเอียดแต่ใช้เวลาทำและดูแลรักษานานขึ้น
- **User Journey ที่ยังไม่มี**: ถ้า module ที่จะทำ Data Flow ไม่มี User Journey doc ให้เลือก — (a) เขียน Data Flow จาก Feature List ตรงๆ (เร็วกว่า, หยาบกว่า), (b) สร้าง User Journey ก่อนแล้วค่อยทำ Data Flow (ตรงกับพฤติกรรมผู้ใช้จริงกว่า, ใช้เวลาเพิ่ม), (c) ทำ Data Flow แบบ system-to-system เท่านั้นโดยไม่ยึด user journey (เหมาะกับ flow ที่เป็น automation ล้วนไม่มี user step)
- **Tech stack เจาะจง**: ถ้า requirement ไม่ได้ระบุมา (เช่น จะใช้ database อะไร, self-host vs managed cloud, ใครเป็นคน host AI model) — เสนอตัวเลือกที่สมเหตุสมผลกับบริบท (งบ/ทีม/ข้อจำกัด PDPA) พร้อมข้อดี-ข้อเสีย ไม่ใช่เดาเลือกให้เอง (และย้ำเสมอว่า default ของเอกสารนี้คือ conceptual — ถ้าผู้ใช้ไม่เลือกอะไรเลย ให้คงเป็น capability-level ไปก่อน ไม่ใส่ยี่ห้อเทคโนโลยีเอง)
- **ขอบเขต Decision Log**: บันทึกทุกการตัดสินใจสำคัญ หรือเฉพาะที่กระทบหลาย module

ใช้รูปแบบคำถามเดียวกับ `prototype-builder`/`qa-doc-builder`/`data-contract-builder` (ดูตัวอย่างใน SKILL.md ของ `prototype-builder` หัวข้อ Ambiguity Protocol) — ใช้ `AskUserQuestion` เมื่อเหมาะสม (ตัวเลือกชัดเจน ≤4 ทาง) หรือถามเป็นข้อความธรรมดาถ้าต้องอธิบายบริบทเยอะ

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

เมื่อผู้ใช้ยืนยันแผนแล้ว:

1. **ถ้าเลือก archive ใน Step 2** — ย้าย `docs/02-design/02-technical/HIGH-LEVEL-ARCHITECTURE.md` เดิมไปที่ `docs/00-archived/HIGH-LEVEL-ARCHITECTURE-{YYYY-MM-DD}.md` ก่อน (ทำเองใน main loop ด้วย Bash/mv ไม่ต้องมอบให้ subagent)
2. เรียก subagent `architecture-writer` (ผ่าน Agent tool, `subagent_type: architecture-writer`) พร้อมส่ง context ให้ครบ:
   - เนื้อหา `ROADMAP.md` และ `FEATURE-LIST.md` ที่เกี่ยวข้อง (Feature ID/Phase ที่ต้องอ้างอิง)
   - เนื้อหา `docs/02-design/01-prototypes/USER-JOURNEY-*.md` ที่ยืนยันแล้วว่าจะใช้ทำ Data Flow
   - เนื้อหา `prototypes/vN/BUILD-PLAN.md` ถ้ามีการอ้างอิง
   - Build Plan ที่ยืนยันแล้วทั้งหมด (โครงสร้างเอกสาร, ระดับความละเอียด, User Journey ที่ใช้ map Data Flow, ขอบเขต Decision Log)
   - Path ปลายทาง (ปกติคือ `docs/02-design/02-technical/HIGH-LEVEL-ARCHITECTURE.md`)
   - ถ้าเป็นการแก้ไฟล์เดิม: เนื้อหาปัจจุบันทั้งหมด และส่วนที่ต้องแก้/เพิ่มเท่านั้น
3. รอผลจาก subagent แล้วตรวจสอบคร่าวๆ ว่าไฟล์ถูกสร้าง/แก้ครบตามแผนก่อนสรุปให้ผู้ใช้
4. ถ้ามีการเพิ่มไฟล์ใหม่ (เช่น ADR แยกไฟล์) ให้อัปเดต `docs/02-design/02-technical/index.md` ให้มีลิงก์ชี้ไปไฟล์ใหม่ด้วย (ตาม pattern เดิมของไฟล์ index นี้)

## Step 5 — สรุปผลให้ผู้ใช้

หลัง subagent เขียนไฟล์เสร็จ สรุปให้ผู้ใช้ทราบ:

- Path ของไฟล์ที่สร้าง/แก้ (และไฟล์ archive ถ้ามี)
- หัวข้อ/diagram ที่ทำเสร็จตามแผน
- Traceability สรุปย่อ: Feature ID/Phase ไหน map กับ component/diagram ไหนในเอกสาร
- Assumption ที่ subagent ตัดสินใจเอง (นอกเหนือจากที่ยืนยันใน Build Plan) ให้ผู้ใช้ตรวจทาน
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อมี requirement ใหม่หรือ phase คืบหน้า ระบบจะถามเรื่องแก้/archive ให้อัตโนมัติ (ตาม Step 2)

---

## อ้างอิงเพิ่มเติม

- `references/architecture-doc-template.md` — Template โครงสร้างเอกสาร Architecture (Current/Target State, Data Flow, Component Breakdown, Decision Log/ADR)
