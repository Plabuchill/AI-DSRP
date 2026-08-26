---
name: detailed-design-builder
description: สร้าง/ปรับปรุงเอกสาร Detailed Design (การออกแบบเชิงละเอียดของแต่ละ feature/flow) ของ AI Disease Surveillance & Response Platform ในระดับ **conceptual** (ยังไม่ผูกมัดกับ technical stack — ไม่ระบุภาษา, framework, message queue, หรือ protocol เจาะจง เว้นแต่ผู้ใช้ยืนยันมา) ผลลัพธ์อย่างน้อยต้องมี **Sequence Flow diagram** ต่อ feature/flow ที่อยู่ใน scope นอกจากนี้อาจรวม state/status diagram, business rule/validation logic, error & exception handling ตามที่เหมาะสมกับ flow นั้น จาก ROADMAP.md, FEATURE-LIST.md, HIGH-LEVEL-ARCHITECTURE.md, DATA-MODEL.md/API-SPEC.md, User Journey doc (`docs/02-design/01-prototypes/USER-JOURNEY-*.md`), prototypes/vN/BUILD-PLAN.md และ/หรือ requirement ที่ผู้ใช้ระบุเพิ่ม (ระบุมาแค่บางส่วนก็ได้) ก่อนสร้าง/แก้ไขไฟล์ใดๆ จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนจะถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง/คำแนะนำพร้อมข้อดี-ข้อเสียเสมอ (ไม่มีข้อยกเว้น) และถ้ามี DETAILED-DESIGN.md เดิมอยู่แล้ว จะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive ของเก่าไป docs/00-archived/ แล้วเขียนใหม่ทั้งฉบับ พร้อมคำแนะนำ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง detailed design, sequence flow, process flow ภายในระบบ, business logic/business rule ของ flow ใดๆ, state/status diagram, error/exception handling flow, หรือขอออกแบบรายละเอียดขั้นตอนการทำงานภายในของฟีเจอร์ แม้ผู้ใช้จะพูดแบบไม่เป็นทางการ (เช่น "ช่วยแตกรายละเอียดขั้นตอนการทำงานของฟีเจอร์นี้ให้หน่อย", "อยากเห็น flow ว่าระบบประมวลผลทีละ step ยังไง", "logic การตรวจสอบเคสก่อนยืนยันควรเป็นยังไง")
---

# Detailed Design Builder

Skill นี้เป็นสมาชิกลำดับที่ 5 ของตระกูล `prototype-builder`/`qa-doc-builder`/`architecture-builder`/`data-contract-builder` — ใช้ input ชุดคล้ายกัน (Requirement/Feature List/ROADMAP/เอกสาร design ที่มีอยู่) แต่ผลลัพธ์เป็น**เอกสาร Detailed Design** — รายละเอียด**เชิงกระบวนการ/ตรรกะ (process/behavioral logic)** ของแต่ละ feature/flow โดยเฉพาะ ยังคงอยู่ในระดับ**แนวคิด (conceptual)** ไม่ผูกกับ technical stack เหมือน 2 skill ก่อนหน้า

**ความสัมพันธ์กับ 2 skill ก่อนหน้าในสาย technical design**:

- `architecture-builder` → `HIGH-LEVEL-ARCHITECTURE.md`: มองภาพรวมทั้งระบบ ระดับ Context/Container, Data Flow หัวข้อ 3 เป็นแค่ diagram **หยาบ** ที่ map 1 message ต่อ 1 journey step เท่านั้น (เช่น "Intake->>OCR: ส่งไฟล์ให้ดึงข้อมูล" บรรทัดเดียว)
- `data-contract-builder` → `DATA-MODEL.md`/`API-SPEC.md`: โครงสร้าง**นิ่ง** (static) ของข้อมูล/operation — entity มีอะไร, operation มีอะไร แต่ไม่บอกว่า "ทำงานยังไง" ภายใน
- `detailed-design-builder` (skill นี้) → `DETAILED-DESIGN.md`: ขยาย 1 journey step หรือ 1 API operation จาก 2 เอกสารข้างบนให้เห็น**ตรรกะ/ขั้นตอนภายในแบบละเอียด** (decision point, validation, error handling, retry, state transition) — ตอบคำถามว่า "ข้างในกล่องนั้นทำงานตามลำดับยังไง" ซึ่ง 2 เอกสารข้างบนไม่ได้ลงรายละเอียดระดับนี้

ถ้ามี `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md` อยู่แล้วให้ใช้เป็น reference บริบทเสมอ (component ไหน, entity/operation ไหนที่ flow นี้ต้องอ้างถึง) แต่ไม่ต้องรอให้มีครบก่อนเสมอไป — ถ้ายังไม่มีให้ทำงานจาก ROADMAP.md/FEATURE-LIST.md/User Journey ตรงๆ ได้ (ระบุเป็น assumption ว่ายังไม่ผ่าน traceability เต็มรูปแบบ)

เหมือนกับ 4 skill ก่อนหน้า ทุก workflow ที่ต้องคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่องแก้/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแผนแล้ว ให้มอบให้ subagent `detailed-design-writer` (ดู `.claude/agents/detailed-design-writer.md`)

## ภาพรวม Workflow

```
0. รับ Input (Requirement เชิง logic/flow / ROADMAP.md / FEATURE-LIST.md / User Journey / HIGH-LEVEL-ARCHITECTURE.md / DATA-MODEL.md / API-SPEC.md / prototypes/vN/BUILD-PLAN.md)
1. เช็ก ROADMAP.md + FEATURE-LIST.md — ต้องมีให้อ้างอิง ไม่มีต้องหยุดถามก่อน
2. เช็กว่ามี DETAILED-DESIGN.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่ หรือ archive แล้วเขียนใหม่
3. ร่าง Build Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย เสมอ ไม่มีข้อยกเว้น)
4. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent detailed-design-writer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม traceability
```

---

## Step 0 — รับ Input

รับได้หลายทาง ไม่จำเป็นต้องมีครบ:

- **Requirement เชิง process/logic ตรงๆ** — เช่น "อยากรู้ว่า OCR review ควร retry กี่ครั้งก่อน fallback ให้คนกรอกมือ", "logic การตัดสินใจว่า cluster ไหนน่าเชื่อถือควรเป็นยังไง", ข้อจำกัดเชิง flow (ต้องมี human-in-the-loop ก่อน auto-route เสมอ)
- **อ้างอิงเอกสารที่มีอยู่แล้ว** — `ROADMAP.md`/`FEATURE-LIST.md` (Feature ID ที่ต้องออกแบบ flow รองรับ), `docs/02-design/01-prototypes/USER-JOURNEY-*.md` (ขั้นตอนระดับผู้ใช้ที่ detailed design ต้องขยายรายละเอียดภายใน), `HIGH-LEVEL-ARCHITECTURE.md` (component ไหนต้องมี logic นี้), `DATA-MODEL.md`/`API-SPEC.md` (entity/operation ที่ flow นี้อ่าน/เขียน), `prototypes/vN/BUILD-PLAN.md` และไฟล์ mock data (มัก reveal ลำดับขั้นตอน/validation ที่ prototype ทำไว้จริงแล้ว), `docs/02-design/02-technical/TECH-STACK.md` (ถ้ามี — vendor/service จริงที่ยืนยันแล้วต่อ flow เช่น OCR vendor ดู "Tech Stack Integration" ท้าย Step 3)
- **คำถามเปิด** — เช่น "ช่วยออกแบบ flow การทำงานให้หน่อย" โดยไม่มี input อื่น ให้ถามกลับว่าจะโฟกัส feature/flow ไหนก่อน อย่าเดา scope เอง (เหมือน 4 skill ก่อนหน้า)

ถ้าจุดใดตีความได้หลายแบบ ให้เก็บไว้ถามรวมกันใน Step 3 (Ambiguity Protocol) ไม่ต้องถามทันทีทีละจุด

---

## Step 1 — เช็ก Reference หลัก (ROADMAP.md + FEATURE-LIST.md ต้องมาก่อนเสมอ)

Detailed Design ต้อง**ตรวจสอบย้อนกลับได้ (traceable)** ไปยัง Feature ID (`FEAT-<โมดูล>-NN`) เสมอ เช่นเดียวกับ 3 skill ก่อนหน้า — ทุก flow ต้องรู้ว่าตอบสนอง feature ไหน และควรอ้างกลับไปยัง entity/operation ใน `DATA-MODEL.md`/`API-SPEC.md` (ถ้ามี) และ component ใน `HIGH-LEVEL-ARCHITECTURE.md` (ถ้ามี) ด้วย

1. ตรวจว่ามี `ROADMAP.md` (root) และ `docs/01-requirements/01-spec/FEATURE-LIST.md` หรือไม่
2. **ถ้ามีทั้งสอง** — อ่านและใช้เป็นฐานอ้างอิง ไปต่อ Step 2 ได้เลย
3. **ถ้าไม่มี หรือมีแค่บางส่วน** — หยุดก่อน ถามผู้ใช้ว่าจะสร้างเอกสารต้นทางก่อน หรือมี Requirement ที่ระบุตรงๆ พอทำแบบ ad-hoc ไปก่อนได้ (ต้องระบุเป็น assumption ชัดเจนว่ายังไม่ผ่าน traceability เต็มรูปแบบ) — เหตุผลเดียวกับ `architecture-builder`/`data-contract-builder` Step 1

---

## Step 2 — ตัดสินใจ: แก้ไฟล์เดิมในที่ vs Archive แล้วเขียนใหม่

เอกสารจาก skill นี้อยู่ที่ `docs/02-design/02-technical/DETAILED-DESIGN.md` เป็น**ไฟล์เดี่ยว ไม่มี vN folder** เหมือนกับ `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md` (living document ตาม convention เดิมของโฟลเดอร์นี้ — ดูเหตุผลใน memory `project_docs_structure` หรือ SKILL.md ของ `architecture-builder`)

> ถ้า scope ที่จะทำมี flow จำนวนมากจนไฟล์เดียวจะยาวเกินไป ให้เสนอทางเลือกแยกไฟล์ต่อโมดูลเป็นหนึ่งในตัวเลือกของ Ambiguity Protocol ข้อ "โครงสร้างไฟล์" ใน Step 3 แทนการตัดสินใจเอง

- **ไม่มีไฟล์นี้เลย (รันครั้งแรก)** — สร้างใหม่ได้เลย ไม่ต้องถามเรื่อง version
- **มีอยู่แล้ว (รันซ้ำ)** — **ต้องถามผู้ใช้ทุกครั้งโดยไม่มีข้อยกเว้น** ว่าต้องการ:
  1. **แก้ไฟล์เดิมในที่** — เพิ่ม flow ใหม่ตาม feature ที่เพิ่ม, ปรับ diagram ให้ตรงกับ prototype ล่าสุด, เพิ่ม state/error path ที่ยังไม่ครบ ส่วนที่เหลือคงไว้
  2. **Archive ของเก่าไป `docs/00-archived/`** (ตั้งชื่อ `DETAILED-DESIGN-{YYYY-MM-DD}.md`) **แล้วเขียนไฟล์ใหม่ทั้งฉบับ**

| แนะนำ | เหมาะกับ |
|---|---|
| **แก้ในที่** | เพิ่ม flow/feature ใหม่ที่ยังไม่เคยออกแบบ, ปรับ sequence diagram ให้ตรงกับ prototype/implementation ล่าสุด, เพิ่ม error path/state ที่ยังไม่ครบ, แก้ business rule ที่ผิด |
| **Archive แล้วเขียนใหม่** | เปลี่ยนแนวทาง process หลักอย่างมีนัยสำคัญ (เช่น เปลี่ยนจาก synchronous request-response ทั้ง flow เป็น async/event-driven, สลับลำดับขั้นตอนหลักของ flow ทั้งหมด, เปลี่ยนจุดที่ human-in-the-loop เข้ามาแทรก), ต้องการเก็บเหตุผลของ logic เดิมไว้อ้างอิง (audit trail) |

**ห้ามเลือกให้เองโดยไม่ถาม** แม้จะดูชัดเจนก็ตาม — เหตุผลเดียวกับ 3 skill ก่อนหน้า

---

## Step 3 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ใดๆ ก่อนผู้ใช้ยืนยันแผน** — logic ที่ผิด scope หรือขาดรายละเอียดสำคัญตั้งแต่ต้นจะทำให้ทีมพัฒนา implement ผิดพลาด โดยเฉพาะ error handling และ decision point ที่กระทบความปลอดภัย/ความถูกต้องของข้อมูลสุขภาพ

Build Plan ควรมีอย่างน้อย:

1. **Scope** — feature/flow ไหนบ้างที่จะทำ detailed design รอบนี้ (map จาก Feature ID) — ทำทั้งโมดูลหรือเฉพาะ flow ที่ซับซ้อน/มีความเสี่ยงสูงก่อน
2. **โครงสร้างไฟล์** — `DETAILED-DESIGN.md` ไฟล์เดียว หรือแยกต่อโมดูล (ดู Ambiguity Protocol)
3. **เนื้อหาที่จะมีต่อ flow** — Sequence Flow diagram (บังคับมีเสมอ) และเนื้อหาเสริมที่จะรวม/ไม่รวมรอบนี้: state/status diagram, business rule/validation table, error & exception handling table (ดู `references/detailed-design-template.md`)
4. **ระดับความละเอียดของ Sequence Flow** — coarse (เฉพาะ decision point หลัก) หรือ step-by-step ละเอียดทุก validation/error branch (ดู Ambiguity Protocol)
5. **Reference ที่ใช้** — Feature ID ไหนจาก FEATURE-LIST.md, User Journey step ไหนที่จะขยายรายละเอียด, component ไหนจาก HIGH-LEVEL-ARCHITECTURE.md, entity/operation ไหนจาก DATA-MODEL.md/API-SPEC.md
6. **Version decision** — แก้ในที่ หรือ archive แล้วเขียนใหม่ (จาก Step 2)
7. **ยืนยัน**: เอกสารรอบนี้เป็น **conceptual** — ไม่ผูกมัดกับ technical stack เจาะจง เว้นแต่ผู้ใช้ระบุมาชัดเจน หรือมี `TECH-STACK.md` ยืนยันไว้แล้ว (ดูข้อ 8)
8. **Tech Stack Integration** (ถ้ามี `TECH-STACK.md`) — ระบุว่า flow ไหนจะอ้าง vendor/service จริงตามที่ยืนยันไว้ (เป็นรายflow mixed state ได้)

### Tech Stack Integration — วิธีใช้ TECH-STACK.md เมื่อมี

ถ้าพบ `docs/02-design/02-technical/TECH-STACK.md` และ flow ที่กำลังออกแบบเกี่ยวข้องกับ component ที่มีแถวยืนยันแล้ว (เช่น flow ที่เรียก OCR/Document AI, Case Clustering, AI Vision QC):

- ใน Sequence Flow diagram ให้**อ้างชื่อ service/vendor จริง**เป็นชื่อ participant (เช่น `participant OCR as [ชื่อ vendor จริง]` แทน `participant OCR as บริการ OCR`)
- ใน Error & Exception Handling table ให้ระบุ**พฤติกรรม error/retry ที่ vendor นั้นมีจริง** (เช่น rate limit, error code, retry policy ที่แนะนำ) ตามที่ระบุมาใน `TECH-STACK.md`/Build Plan เท่านั้น — **ห้ามเดา/สมมติพฤติกรรมของ vendor เอง** ถ้า Build Plan ไม่ได้ระบุรายละเอียดนี้มา ให้คงเป็น error/retry เชิงแนวคิด (generic) แทน และ flag ว่ายังขาดรายละเอียด vendor จริง
- flow ที่เกี่ยวกับ component ที่**ยังไม่มีแถวยืนยัน** — คง participant/error handling แบบ conceptual เดิมไว้ (mixed state ปกติ)
- **ไม่ต้องแก้ `TECH-STACK.md`** — skill นี้แค่**อ่าน**เพื่ออ้างอิงเท่านั้น

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น)

ทุกจุดที่ตีความได้มากกว่า 1 แบบ **ต้องถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง/คำแนะนำ พร้อมข้อดี-ข้อเสียของแต่ละแนวทาง** เพื่อให้ผู้ใช้พิจารณาก่อนตัดสินใจเสมอ — จุดที่มักไม่ชัดเจนในงานนี้:

- **ระดับความละเอียดของ Sequence Flow**: (a) coarse — เฉพาะ decision point หลักและผลลัพธ์ 2 ทาง (สำเร็จ/ไม่สำเร็จ) ข้อดี: ทำเร็ว อ่านง่าย ข้อเสีย: ทีมพัฒนาอาจตีความ edge case เองผิดกัน, (b) step-by-step ละเอียดทุก validation/retry/error branch ข้อดี: ทีมพัฒนา implement ตรงกันแน่นอน ข้อเสีย: ใช้เวลาทำ/ดูแลรักษานานขึ้น diagram อาจยาวมาก, (c) coarse ก่อนสำหรับทุก flow ในสโคป แล้วเจาะละเอียดเฉพาะ flow ที่เสี่ยงสูง/ซับซ้อนที่สุดเท่านั้น ข้อดี: บาลานซ์เวลา/ความละเอียด ข้อเสีย: ต้องตัดสินใจว่า flow ไหน "เสี่ยงสูง" ซึ่งอาจเถียงกันได้
- **โครงสร้างไฟล์**: (a) `DETAILED-DESIGN.md` ไฟล์เดียวรวมทุก flow ข้อดี: ตรงกับ convention เดิมของโฟลเดอร์นี้ ค้นหา/ลิงก์ข้ามส่วนง่าย ข้อเสีย: ไฟล์จะยาวมากถ้ามีหลายสิบ flow, (b) แยกไฟล์ต่อโมดูล (`docs/02-design/02-technical/detailed-design/DETAILED-DESIGN-{module}.md`) ข้อดี: แต่ละไฟล์กระชับ แก้ทีละโมดูลไม่กระทบกัน ข้อเสีย: ต้องดูแล index.md ให้ลิงก์ครบ เสี่ยงเอกสารกระจัดกระจาย, (c) ไฟล์เดียวตอนนี้ (scope ยังเล็ก) แล้วค่อยย้ายไปแยกไฟล์ต่อโมดูลตอนเนื้อหาเยอะขึ้นในอนาคต ข้อดี: ไม่ over-engineer ตั้งแต่ต้น ข้อเสีย: ต้อง migrate โครงสร้างทีหลังซึ่งมีต้นทุน
- **รวม State/Status Diagram หรือไม่**: ถ้า feature มี lifecycle/สถานะหลายขั้น (เช่นสถานะเคส, สถานะงานพ่น) — (a) ทำ Mermaid `stateDiagram-v2` แยกเพิ่มจาก sequence diagram ข้อดี: เห็นภาพสถานะที่เป็นไปได้ทั้งหมดและการเปลี่ยนสถานะชัดเจน ข้อเสีย: ต้องดูแล 2 diagram ให้ตรงกันเสมอ, (b) รวม state ไว้เป็น note/label ในตัว sequence diagram พอ ข้อดี: ไฟล์เดียว ดูแลง่ายกว่า ข้อเสีย: มองเห็นภาพรวมของทุกสถานะได้ยากกว่า, (c) ทำ state diagram เฉพาะ flow ที่มีสถานะซับซ้อนจริงๆ (≥4 สถานะ) เท่านั้น ที่เหลือใช้ note พอ ข้อดี: ใช้แรงตรงจุดที่คุ้มค่า ข้อเสีย: เกณฑ์ "ซับซ้อนจริง" ต้องตกลงร่วมกัน
- **ขอบเขต Error & Exception Handling**: (a) ครอบคลุมทุก error path ที่เป็นไปได้ (network fail, validation fail, timeout, conflict ฯลฯ) ข้อดี: ครบถ้วนที่สุด ข้อเสีย: ใช้เวลามาก บาง error อาจไม่เคยเกิดจริง, (b) เฉพาะ error ที่กระทบ business-critical หรือข้อมูลสุขภาพ (เช่น เคสซ้ำ, cluster ผิดพื้นที่, ส่งแจ้งเตือนผิดทีม) ข้อดี: ตรงประเด็นเสี่ยงสูงสุดก่อน ข้อเสีย: error อื่นอาจถูกมองข้ามจนเกิดปัญหาจริงทีหลัง, (c) ระดับเดียวกับที่ `qa-doc-builder` ใช้อยู่แล้ว (Happy path + negative/edge case สำคัญเท่านั้น) เพื่อให้ตรงกับความลึกที่ทดสอบจริงในเอกสาร QA ข้อดี: สอดคล้องกับเอกสาร QA ที่มีอยู่แล้ว ไม่ over-design เกิน scope ที่จะถูกทดสอบจริง ข้อเสีย: ถ้า scope QA เปลี่ยนทีหลัง ต้อง sync กลับมาที่เอกสารนี้ด้วย
- **แหล่งอ้างอิงหลักของแต่ละ flow**: ถ้ามีทั้ง User Journey (มุมผู้ใช้) และ API-SPEC.md (มุม operation) ให้ flow เดียวกัน — (a) ยึด User Journey เป็นแกนหลักแล้วโยง operation ที่เกี่ยวข้องเข้ามาประกอบ ข้อดี: อ่านแล้วเห็นภาพจากมุมผู้ใช้จริงต่อเนื่อง ข้อเสีย: operation ที่ไม่มีผู้ใช้เห็นตรงๆ (เช่น scheduled job) จะไม่มีที่ยึด, (b) ยึด API/Operation เป็นแกนหลักแล้วโยง journey step ที่เรียกใช้เข้ามาประกอบ ข้อดี: ครอบคลุม system-to-system flow ที่ไม่มีผู้ใช้เห็นด้วย ข้อเสีย: อ่านยากกว่าถ้าอยากตามมุมผู้ใช้, (c) เลือกแกนหลักต่อ flow เป็นรายกรณี (flow ที่ผู้ใช้เห็นตรงๆ ยึด journey, flow ที่เป็น automation ล้วนยึด operation) ข้อดี: ตรงกับธรรมชาติของแต่ละ flow ข้อเสีย: ต้องระบุให้ชัดว่า flow ไหนยึดแบบไหนเพื่อไม่ให้สับสน

ใช้รูปแบบคำถามเดียวกับ `prototype-builder`/`qa-doc-builder`/`architecture-builder`/`data-contract-builder` (ดูตัวอย่างใน SKILL.md ของ `prototype-builder` หัวข้อ Ambiguity Protocol) — ใช้ `AskUserQuestion` เมื่อเหมาะสม (ตัวเลือกชัดเจน ≤4 ทาง) หรือถามเป็นข้อความธรรมดาถ้าต้องอธิบายบริบทเยอะ

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

เมื่อผู้ใช้ยืนยันแผนแล้ว:

1. **ถ้าเลือก archive ใน Step 2** — ย้าย `docs/02-design/02-technical/DETAILED-DESIGN.md` เดิมไปที่ `docs/00-archived/DETAILED-DESIGN-{YYYY-MM-DD}.md` ก่อน (ทำเองใน main loop ด้วย Bash/mv ไม่ต้องมอบให้ subagent)
2. เรียก subagent `detailed-design-writer` (ผ่าน Agent tool, `subagent_type: detailed-design-writer`) พร้อมส่ง context ให้ครบ:
   - เนื้อหา `ROADMAP.md`/`FEATURE-LIST.md` ที่เกี่ยวข้อง (Feature ID ที่ต้องอ้างอิง)
   - เนื้อหา `docs/02-design/01-prototypes/USER-JOURNEY-*.md` ที่เกี่ยวข้อง (ถ้ายึดเป็นแกนหลักของ flow ตามที่ตกลง)
   - เนื้อหา `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md` ที่เกี่ยวข้อง (ถ้ามี — ใช้อ้าง component/entity/operation)
   - เนื้อหา `prototypes/vN/BUILD-PLAN.md` และไฟล์ mock data ที่เกี่ยวข้อง (ถ้ามีการอ้างอิง)
   - Build Plan ที่ยืนยันแล้วทั้งหมด (โครงสร้างไฟล์, เนื้อหาต่อ flow, ระดับความละเอียด, ขอบเขต error handling, แกนอ้างอิงหลักของแต่ละ flow — รวมคำตอบ Ambiguity Protocol ทุกข้อ)
   - Path ปลายทาง (ปกติคือ `docs/02-design/02-technical/DETAILED-DESIGN.md` หรือ path แยกต่อโมดูลถ้าตกลงแบบนั้น)
   - ถ้าเป็นการแก้ไฟล์เดิม: เนื้อหาปัจจุบันทั้งหมด และส่วนที่ต้องแก้/เพิ่มเท่านั้น
3. รอผลจาก subagent แล้วตรวจสอบคร่าวๆ ว่าไฟล์ถูกสร้าง/แก้ครบตามแผน (มี Sequence Flow diagram จริงทุก flow ในสโคปไหม) ก่อนสรุปให้ผู้ใช้
4. อัปเดต `docs/02-design/02-technical/index.md` ให้มีลิงก์ชี้ไปไฟล์ใหม่ด้วย (ถ้าเป็นการสร้างครั้งแรก หรือมีไฟล์ใหม่เกิดขึ้นจากการแยกต่อโมดูล)

## Step 5 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่สร้าง/แก้ (และไฟล์ archive ถ้ามี)
- รายชื่อ flow/feature ที่ทำ detailed design เสร็จ พร้อมเนื้อหาที่รวมไว้ต่อ flow (sequence เท่านั้น หรือรวม state/error handling ด้วย)
- Traceability สรุปย่อ: Feature ID ไหน map กับ flow ไหน, อ้างถึง entity/operation/component ไหนบ้าง
- Assumption ที่ subagent ตัดสินใจเอง (นอกเหนือจากที่ยืนยันใน Build Plan) ให้ผู้ใช้ตรวจทาน
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อมี feature ใหม่หรือ flow ต้องปรับปรุง ระบบจะถามเรื่องแก้/archive ให้อัตโนมัติ (ตาม Step 2)

---

## อ้างอิงเพิ่มเติม

- `references/detailed-design-template.md` — Template โครงสร้างเอกสาร Detailed Design (Flow Overview + Sequence Flow + State Diagram + Business Rule + Error Handling + Traceability)
