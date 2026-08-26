---
name: release-plan-builder
description: สร้าง/ปรับปรุงเอกสาร**แบ่ง Plan/Phase/Release** (แก้/จัดสรัง `ROADMAP.md` ที่ root เป็นเอกสารหลัก) และ**แตกงานย่อยต่อ Phase เป็น Task List** (`docs/01-requirements/03-task/TASK-LIST.md`) ของ AI Disease Surveillance & Response Platform จาก Requirement, Backlog, `FEATURE-LIST.md`, และ/หรือข้อมูลอื่นที่ผู้ใช้ระบุเพิ่ม (ระบุมาแค่บางส่วนก็ได้) ก่อนสร้าง/แก้ไขไฟล์ใดๆ จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนหรือต้องการข้อมูลเพิ่ม (เช่น granularity ของ phase/release, วิธี prioritize, จะรวม estimation/resource assignment ไหม) จะถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง/คำแนะนำพร้อมข้อดี-ข้อเสียเสมอ (ไม่มีข้อยกเว้น ห้ามเดา) และถ้ามี `TASK-LIST.md` เดิมอยู่แล้วจะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive ของเก่าไป `docs/00-archived/` แล้วเขียนใหม่ทั้งฉบับ (ส่วน `ROADMAP.md` ที่ root แก้ในที่เป็นค่าเริ่มต้นเสมอเพราะเป็นไฟล์ canonical เดี่ยว — ดูข้อควรระวังใน Step 2) ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง release plan, phase planning, milestone, sprint, task breakdown, to-do list ต่อ phase, backlog grooming, หรือขอแบ่งงาน/จัดลำดับความสำคัญของฟีเจอร์ แม้จะพูดแบบไม่เป็นทางการ (เช่น "ช่วยแบ่ง phase ให้หน่อย", "อยากได้ task list ของแต่ละเฟส", "ฟีเจอร์ไหนควรทำก่อน-หลัง")
---

# Release Plan Builder

Skill นี้เป็นสมาชิกลำดับที่ 7 ของตระกูล `prototype-builder`/`qa-doc-builder`/`architecture-builder`/`data-contract-builder`/`detailed-design-builder`/`tech-stack-builder` แต่ทำงานกับเอกสารคนละหมวด — 6 skill ก่อนหน้าอยู่ในสาย **design/technical** (`docs/02-design/`) ส่วนสกิลนี้อยู่ในสาย **requirements/planning** (`docs/01-requirements/02-plan/` และ `03-task/`) ผลลัพธ์คือเอกสาร 2 ชนิด (เหมือน `data-contract-builder` ที่ออก 2 เอกสารจาก skill เดียว):

1. **Plan/Phase/Release** — แก้/จัดสรัง `ROADMAP.md` ที่ **root ของโปรเจกต์** (ไม่ใช่สร้างไฟล์ใหม่ — `ROADMAP.md` เป็นเอกสาร canonical เดี่ยวอยู่แล้วตาม [[../../../CLAUDE.md|CLAUDE.md]] ข้อ 1)
2. **Task Breakdown** — สร้าง/แก้ `docs/01-requirements/03-task/TASK-LIST.md` (ไฟล์ใหม่ที่ยังไม่มี — living document รวมทุก phase)

**ไม่ผูกกับ Conceptual-first (CLAUDE.md ข้อ 4)** — เอกสารจากสกิลนี้ไม่ใช่ technical design จึงไม่ต้องเลี่ยง tech stack แต่ยังต้องยึด **Traceability (ข้อ 2)**, **Living Document pattern (ข้อ 3)**, และ **Ambiguity Protocol (ข้อ 5)** เหมือนสกิลอื่นทุกตัว

> **ข้อควรระวังพิเศษ**: `ROADMAP.md` เป็นไฟล์ root — **ห้ามย้ายเข้าไปใน `docs/` โดยเด็ดขาด** (คือเหตุการณ์ที่ CLAUDE.md ข้อ 1 เตือนไว้ว่าเคยเกิดขึ้นจริงเมื่อ 2026-08-23) การ archive (ถ้าเลือก) หมายถึง**คัดลอกสำเนาก่อนแก้**ไปไว้ที่ `docs/00-archived/ROADMAP-{YYYY-MM-DD}.md` แล้ว**เขียนทับ `ROADMAP.md` ที่ root ตัวเดิมนั้นเองใหม่** — ไฟล์ที่ root ต้องยังอยู่ที่ root เสมอ ไม่ใช่ย้ายออกไปไหน

ทุก workflow ที่ต้องคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่อง version/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแผนแล้ว ให้มอบให้ subagent `release-plan-writer` (ดู `.claude/agents/release-plan-writer.md`)

## ภาพรวม Workflow

```
0. รับ Input (Requirement/Backlog/FEATURE-LIST.md/ROADMAP.md ปัจจุบัน/ข้อมูลอื่นที่ผู้ใช้ระบุ)
1. เช็ก ROADMAP.md + FEATURE-LIST.md — ต้องมีให้อ้างอิง ไม่มีต้องหยุดถามก่อน
2. เช็กว่ามี TASK-LIST.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่ (ROADMAP.md แก้ในที่เป็นค่าเริ่มต้นเสมอ ดูข้อควรระวังด้านบน)
3. ร่าง Build Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย เสมอ ไม่มีข้อยกเว้น ห้ามเดา)
4. ยืนยันแล้ว → (ถ้า archive TASK-LIST.md/สำเนา ROADMAP.md) ย้าย/สำเนาไป 00-archived/ ก่อน → เรียก subagent release-plan-writer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม traceability
```

---

## Step 0 — รับ Input

รับได้หลายทาง ไม่จำเป็นต้องมีครบ:

- **Requirement/Backlog ตรงๆ** — pain point ใหม่, ข้อจำกัดด้านเวลา/ทีม/งบที่กระทบลำดับความสำคัญ, deadline ที่ต้องยึด
- **อ้างอิงเอกสารที่มีอยู่แล้ว** — `ROADMAP.md` (โครง Phase 0-8 ปัจจุบัน), `docs/01-requirements/01-spec/FEATURE-LIST.md` (Feature ID ที่ต้องจัด phase/แตก task), `docs/02-design/02-technical/HIGH-LEVEL-ARCHITECTURE.md`/`TECH-STACK.md` (ถ้ามี — dependency ทางเทคนิคที่กระทบลำดับงาน เช่น Phase 7 ต้องทำคู่ขนาน/ก่อน Phase 1-4), `docs/03-testing/01-test-plan/vN/TEST-PLAN.md` (ถ้ามี — ขอบเขตที่ต้องทดสอบ อาจกระทบการแตก task ของ phase นั้น)
- **คำถามเปิด** — เช่น "ช่วยแบ่ง phase ให้หน่อย" โดยไม่มี input อื่น ให้ถามกลับว่าจะโฟกัสทั้ง ROADMAP ใหม่ทั้งฉบับ หรือเฉพาะ phase ที่กำลังจะทำต่อไป อย่าเดา scope เอง (เหมือน 6 skill ก่อนหน้า)

ถ้าจุดใดตีความได้หลายแบบ ให้เก็บไว้ถามรวมกันใน Step 3 (Ambiguity Protocol) ไม่ต้องถามทันทีทีละจุด

---

## Step 1 — เช็ก Reference หลัก (ROADMAP.md + FEATURE-LIST.md ต้องมาก่อนเสมอ)

Plan/Phase/Release และ Task Breakdown ต้อง**ตรวจสอบย้อนกลับได้ (traceable)** ไปยัง Feature ID (`FEAT-<โมดูล>-NN`) เสมอ — ทุก phase/release ต้องรู้ว่าครอบ Feature ID ไหน ทุก task ต้องรู้ว่าตอบสนอง Feature ID ไหน

1. ตรวจว่ามี `ROADMAP.md` (root) และ `docs/01-requirements/01-spec/FEATURE-LIST.md` หรือไม่
2. **ถ้ามีทั้งสอง** — อ่านและใช้เป็นฐานอ้างอิง ไปต่อ Step 2 ได้เลย
3. **ถ้าไม่มี หรือมีแค่บางส่วน** — หยุดก่อน ถามผู้ใช้ว่าจะสร้างเอกสารต้นทางก่อน หรือมี Requirement/Backlog ที่ระบุตรงๆ พอทำแบบ ad-hoc ไปก่อนได้ (ต้องระบุเป็น assumption ชัดเจนว่ายังไม่ผ่าน traceability เต็มรูปแบบ) — เหตุผลเดียวกับ 6 skill ก่อนหน้า

---

## Step 2 — ตัดสินใจ: แก้ในที่ vs Archive (แยกกฎระหว่าง ROADMAP.md กับ TASK-LIST.md)

### `ROADMAP.md` (root) — แก้ในที่เป็นค่าเริ่มต้นเสมอ ไม่ต้องถาม

เนื่องจากเป็นไฟล์ root canonical เดี่ยวที่ทุกเอกสารอ้างอิงถึงอยู่แล้ว (ADR, Component Breakdown, Data Model ฯลฯ ทุกไฟล์ผูก wikilink ไปที่ `ROADMAP.md` โดยตรง) การ archive แล้วเขียนใหม่ทั้งฉบับมีความเสี่ยงสูงกว่าไฟล์อื่นในตระกูลนี้มาก — **ค่าเริ่มต้นคือแก้ในที่เสมอ**

ถ้า Build Plan (Step 3) เผยว่าต้อง**ปรับโครง phase อย่างมีนัยสำคัญ** (เช่น รวม/แยก phase ใหม่ทั้งหมด, เปลี่ยนลำดับความสำคัญที่กระทบทุก phase) — ให้เสนอเป็นหนึ่งในตัวเลือกของ Ambiguity Protocol ว่าจะ **(ก) แก้ในที่แบบ major** หรือ **(ข) คัดลอกสำเนาปัจจุบันไป `docs/00-archived/ROADMAP-{YYYY-MM-DD}.md` ก่อนแล้วค่อยเขียนทับ `ROADMAP.md` ที่ root ใหม่ทั้งฉบับ** (ไม่ใช่ย้ายไฟล์ root ออก — ต้องคงอยู่ที่ root เสมอ) — **ห้ามเลือกให้เองโดยไม่ถาม** ไม่ว่ากรณีใด

### `docs/01-requirements/03-task/TASK-LIST.md` — ถามทุกครั้งที่มีไฟล์เดิมอยู่แล้ว

- **ไม่มีไฟล์นี้เลย (รันครั้งแรก)** — สร้างใหม่ได้เลย ไม่ต้องถามเรื่อง version
- **มีอยู่แล้ว (รันซ้ำ)** — **ต้องถามผู้ใช้ทุกครั้งโดยไม่มีข้อยกเว้น** ว่าต้องการ:
  1. **แก้ไฟล์เดิมในที่** — เพิ่ม task ใหม่ตาม feature ที่เพิ่ม, อัปเดตสถานะ/ผู้รับผิดชอบ/deadline ของ task ที่มีอยู่แล้ว
  2. **Archive ของเก่าไป `docs/00-archived/TASK-LIST-{YYYY-MM-DD}.md`** แล้วเขียนไฟล์ใหม่ทั้งฉบับ

| แนะนำ | เหมาะกับ |
|---|---|
| **แก้ในที่** | อัปเดตสถานะงานประจำ (ยังไม่เริ่ม/กำลังทำ/เสร็จแล้ว), เพิ่ม task ใหม่ตาม feature ที่เพิ่มเข้ามา, ปรับผู้รับผิดชอบ/deadline |
| **Archive แล้วเขียนใหม่** | เปลี่ยนวิธี prioritize/แตก task ทั้งชุด (เช่น จาก epic-level เป็น granular subtask), reorganize ทั้งฉบับตาม phase ที่ปรับโครงใหม่ |

---

## Step 3 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ใดๆ ก่อนผู้ใช้ยืนยันแผน** — การจัด phase/priority ผิดกระทบการวางแผนทรัพยากรทั้งโครงการ และ `ROADMAP.md` ถูกอ้างอิงจากทุกเอกสาร technical design ที่มีอยู่แล้ว แก้ผิดจะกระทบเป็นลูกโซ่

Build Plan ควรมีอย่างน้อย:

1. **Scope** — ทั้ง ROADMAP ใหม่ทั้งฉบับ หรือเฉพาะ phase ไหน (map จาก Feature ID) / จะทำ Task Breakdown ของ phase ไหนบ้าง
2. **โครง Phase/Release** — คง grouping ตาม pain point เดิมของ ROADMAP.md หรือปรับใหม่ (ดู Ambiguity Protocol)
3. **Granularity ของ Task** — epic-level (1 task ~ 1 feature) หรือละเอียดกว่า (แตกเป็น backend/frontend/testing ต่อ feature) (ดู Ambiguity Protocol)
4. **วิธี Prioritize** — วิธีที่จะใช้จัดลำดับ (ดู Ambiguity Protocol)
5. **ขอบเขตที่จะรวมใน Task List** — status/assignee/deadline/estimation รวมไหม (ดู Ambiguity Protocol — ข้อมูล assignee/deadline ถ้าไม่มีมาให้ห้ามเดา ต้องถาม)
6. **Reference ที่ใช้** — Feature ID ไหนจาก FEATURE-LIST.md, component/tech จาก HIGH-LEVEL-ARCHITECTURE.md/TECH-STACK.md ถ้ามี (dependency ทางเทคนิคที่กระทบลำดับ)
7. **Version decision** — จาก Step 2 (ต่อ ROADMAP.md และ TASK-LIST.md แยกกัน)

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น — ห้ามเดา)

ทุกจุดที่ตีความได้มากกว่า 1 แบบ **ต้องถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง/คำแนะนำ พร้อมข้อดี-ข้อเสียของแต่ละแนวทาง** — จุดที่มักไม่ชัดเจนในงานนี้:

- **Phase vs Release granularity**: (a) คง grouping ตาม pain point เดิมของ ROADMAP.md (Phase = ทีมงาน/pain point) ข้อดี: ตรงกับโครงเดิมที่ทุกเอกสารอ้างอิงอยู่แล้ว ไม่กระทบเอกสารอื่น ข้อเสีย: ไม่มีความหมายเชิง "ปล่อยใช้งานจริงเมื่อไหร่" ชัดเจน, (b) เพิ่มชั้น Release (เช่น Release 1.0 = Phase 1+7 บางส่วน) ทับ Phase เดิม ข้อดี: เห็นภาพว่าอะไรจะถูก deploy จริงพร้อมกันเมื่อไหร่ ข้อเสีย: ต้องดูแล mapping 2 ชั้น (Phase ↔ Release) ให้ตรงกันเสมอ, (c) แปลง Phase เดิมเป็น Release ตรงๆ (1 Phase = 1 Release) ข้อดี: ง่ายสุด ไม่มีชั้นซ้อน ข้อเสีย: ขนาด release แต่ละอันไม่เท่ากัน (Phase 1 ใหญ่กว่า Phase 6 มาก)
- **Task Granularity**: (a) epic-level — 1 task ต่อ 1 Feature ID ข้อดี: ทำเร็ว ดูแลง่าย ตรงกับจำนวน feature ที่มีอยู่แล้ว ข้อเสีย: ไม่เห็นขั้นตอนย่อยที่ทีมต้องทำจริง (backend/frontend/test แยกกัน), (b) granular — แตกแต่ละ Feature เป็น subtask ตาม layer (เช่น "เชื่อม API จริง", "ปรับ UI", "เขียน test") ข้อดี: ทีมเอาไปลงมือทำได้ทันที ข้อเสีย: ใช้เวลาแตกมากขึ้น ต้องอัปเดตสถานะละเอียดขึ้นตามไปด้วย, (c) แบบผสม — epic-level สำหรับ feature ที่ยังไม่เริ่ม, แตก granular เฉพาะ feature ที่กำลังจะทำใน phase ถัดไปจริง ข้อดี: ใช้แรงตรงจุดที่ต้องใช้งานจริงก่อน ข้อเสีย: มาตรฐานความละเอียดไม่เท่ากันในเอกสารเดียว
- **วิธี Prioritize**: (a) ตามลำดับ Phase เดิมของ ROADMAP.md ตรงๆ (คนที่กำหนดไว้แล้วว่าอันไหนควรทำก่อน) ข้อดี: ตรงกับสิ่งที่ยืนยันไว้แล้ว ไม่ต้องคำนวณใหม่ ข้อเสีย: ไม่ได้ตอบว่า "ทำไม" อันไหนสำคัญกว่ากันเชิงตัวเลข, (b) MoSCoW (Must/Should/Could/Won't) ต่อ feature ข้อดี: เข้าใจง่าย สื่อสารกับผู้บริหารได้ไว ข้อเสีย: หยาบกว่าวิธีให้คะแนน, (c) Weighted scoring (เช่น WSJF: risk/value เทียบกับ effort) ข้อดี: ละเอียด/มีเหตุผลเชิงตัวเลขรองรับ เหมือนที่ใช้กับ `tech-stack-builder` ข้อเสีย: ต้องมีข้อมูล effort/value ประมาณการก่อน ถ้ายังไม่มีต้องสัมภาษณ์เพิ่ม (ห้ามเดา)
- **ขอบเขต Task List (status/assignee/deadline/estimation)**: (a) เฉพาะ task + สถานะ (ยังไม่เริ่ม/กำลังทำ/เสร็จแล้ว) ข้อดี: ทำได้ทันทีไม่ต้องมีข้อมูลทีมเพิ่ม ข้อเสีย: ยังไม่ใช่ตารางแจกงานจริง, (b) เพิ่ม assignee/deadline ข้อดี: ใช้แจกงานได้จริง ข้อเสีย: **ต้องมีข้อมูลทีม/กำหนดเวลาจริงมาก่อน ถ้าผู้ใช้ไม่มีข้อมูลนี้ห้ามเดาชื่อคน/วันที่เอง ต้องถามหรือเว้นเป็นช่องให้กรอกทีหลัง**, (c) เพิ่ม estimation (story point/man-day) ด้วย ข้อดี: ใช้วางแผน capacity ได้ ข้อเสีย: ต้องมีข้อมูล effort ต่อ task ซึ่งมักไม่มีจนกว่าทีมจะประเมินเอง (ห้ามเดาให้)

ใช้รูปแบบคำถามเดียวกับ 6 skill ก่อนหน้า — ใช้ `AskUserQuestion` เมื่อเหมาะสม (ตัวเลือกชัดเจน ≤4 ทาง) หรือถามเป็นข้อความธรรมดาถ้าต้องอธิบายบริบทเยอะ **ถ้าข้อมูลที่ต้องใช้ให้คะแนน/กำหนดวันที่/มอบหมายงานไม่มีมา ห้ามเดาโดยเด็ดขาด ต้องถามก่อนเสมอ**

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

1. **ถ้าเลือก archive ROADMAP.md แบบ major ใน Step 2** — คัดลอกสำเนาปัจจุบันไป `docs/00-archived/ROADMAP-{YYYY-MM-DD}.md` ก่อน (ทำเองใน main loop ด้วย Bash/cp — **ห้ามย้าย (mv) ต้นฉบับออกจาก root**) — ถ้าเลือก archive TASK-LIST.md ให้ย้าย (mv) ของเก่าไป `docs/00-archived/TASK-LIST-{YYYY-MM-DD}.md`
2. เรียก subagent `release-plan-writer` (ผ่าน Agent tool, `subagent_type: release-plan-writer`) พร้อมส่ง context ให้ครบ:
   - เนื้อหา `ROADMAP.md` ปัจจุบันทั้งหมด และ `FEATURE-LIST.md` ที่เกี่ยวข้อง
   - เนื้อหา `HIGH-LEVEL-ARCHITECTURE.md`/`TECH-STACK.md` ที่เกี่ยวข้อง (ถ้ามี — dependency ทางเทคนิค)
   - เนื้อหา `TASK-LIST.md` ปัจจุบัน (ถ้าเป็นการแก้ไฟล์เดิม)
   - Build Plan ที่ยืนยันแล้วทั้งหมด (รวมคำตอบ Ambiguity Protocol ทุกข้อ)
   - Path ปลายทาง: `ROADMAP.md` (root, แก้ในที่เสมอ) และ/หรือ `docs/01-requirements/03-task/TASK-LIST.md`
3. รอผลจาก subagent แล้วตรวจสอบคร่าวๆ ว่าไฟล์ถูกสร้าง/แก้ครบตามแผน — **สำคัญ: ตรวจว่า `ROADMAP.md` ยังอยู่ที่ root ไม่ถูกย้ายไปไหน** ก่อนสรุปให้ผู้ใช้
4. อัปเดต `docs/01-requirements/03-task/index.md` ให้มีลิงก์ชี้ไปไฟล์ `TASK-LIST.md` (ถ้าเป็นการสร้างครั้งแรก) ตาม pattern wikilink เดิมของโปรเจกต์

## Step 5 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่แก้/สร้าง (และไฟล์ archive/สำเนาถ้ามี) — ยืนยันว่า `ROADMAP.md` ยังอยู่ที่ root
- สรุป Phase/Release ที่ปรับ และ Task ที่แตกใหม่ตาม Feature ID
- Traceability สรุปย่อ: Feature ID ไหน map กับ Phase/Task ไหน
- Assumption ที่ subagent ตัดสินใจเอง (ถ้ามี) — โดยเฉพาะจุดที่ไม่มีข้อมูล assignee/deadline/estimation ต้องระบุว่า "เว้นว่างไว้ ไม่ได้เดา" ให้ผู้ใช้กรอกเพิ่ม
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อ feature ใหม่เข้ามาหรือสถานะงานเปลี่ยน

---

## อ้างอิงเพิ่มเติม

- `references/release-plan-template.md` — Template โครงสร้างของ `TASK-LIST.md` และแนวทางปรับ `ROADMAP.md`
