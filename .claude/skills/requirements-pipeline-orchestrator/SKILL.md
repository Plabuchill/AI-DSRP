---
name: requirements-pipeline-orchestrator
description: Orchestrator ที่รันต่อเนื่อง 5 ขั้นตอนของสาย requirements/planning ให้ครบในคำสั่งเดียว **โดยไม่ต้องให้ผู้ใช้เรียกทีละ skill เอง**: (1) `requirement-builder` → `REQUIREMENTS.md`, (2) `release-plan-builder` → `ROADMAP.md`/`TASK-LIST.md` (backlog), (3) `feature-list-builder` → `FEATURE-LIST.md`, (4) `user-journey-builder` → `USER-JOURNEY-*.md` (ทำทีละ module ต่อรอบ อาจเรียกซ้ำหลายครั้งถ้า scope ครอบหลาย module), (5) `qa-doc-builder` → `TEST-PLAN.md`/`ACCEPTANCE-CRITERIA.md`/`TEST-CASES.xlsx` ของ AI Disease Surveillance & Response Platform เช็กเอกสารที่มีอยู่แล้วก่อนเริ่ม ข้ามขั้นตอนที่มีเอกสารสมบูรณ์อยู่แล้วได้ (ถามผู้ใช้ก่อนว่าจะข้ามจริงไหม) แต่**ยังคงหยุดยืนยัน Build Plan ที่ทุกขั้นตอนตามกฎ Ambiguity Protocol เดิมของแต่ละ skill** ใช้ skill นี้เมื่อผู้ใช้ต้องการรัน pipeline requirements/planning ทั้ง 5 ขั้นตอนต่อเนื่องกันในคำสั่งเดียว (เช่น "ทำตั้งแต่ requirement ถึง test plan ให้ครบเลย", "รัน pipeline requirements ให้หน่อย") แทนที่จะเรียก 5 skill แยกกันเอง
---

# Requirements Pipeline Orchestrator

Skill นี้**ไม่ได้สร้างเอกสารเอง** และ**ไม่มี subagent เขียนไฟล์ของตัวเอง** — หน้าที่เดียวคือ**เรียง/ต่อ** 5 skill ที่มีอยู่แล้วให้รันในคำสั่งเดียว: `requirement-builder` → `release-plan-builder` → `feature-list-builder` → `user-journey-builder` → `qa-doc-builder` โดยแต่ละขั้นตอนยังทำงานตาม workflow เต็มรูปแบบของตัวเอง (สัมภาษณ์/ถาม Ambiguity Protocol/เสนอ Build Plan/รอยืนยัน/delegate ให้ subagent เขียนไฟล์) **ไม่มีข้อยกเว้นถูกข้ามไป** — ทำงานตามหลักการเดียวกับ `design-pipeline-orchestrator` (ดู `.claude/skills/design-pipeline-orchestrator/SKILL.md` เป็นตัวอย่างคู่ขนานฝั่ง technical design)

**ความหมายของ "ต่อเนื่องกันโดยไม่ต้องเรียกทีละขั้นตอน"**: ผู้ใช้**ไม่ต้อง**พิมพ์ 5 คำสั่งแยกกันเอง — เรียก orchestrator นี้ครั้งเดียว แล้วมันจะไล่เรียกแต่ละ skill ต่อกันเองในเซสชันเดียวให้ — **แต่ผู้ใช้ยังคงต้องตอบคำถาม/ยืนยัน Build Plan ที่แต่ละขั้นตอนเหมือนเดิม**

## ภาพรวม Workflow

```
0. เช็กเอกสารที่มีอยู่แล้วทั้ง 5 ปลายทาง (REQUIREMENTS.md, ROADMAP.md/TASK-LIST.md, FEATURE-LIST.md, USER-JOURNEY-{module}.md ต่อ module ใน scope, ACCEPTANCE-CRITERIA.md/TEST-PLAN.md/TEST-CASES.xlsx)
1. ถ้ามีไฟล์ปลายทางของขั้นตอนไหนอยู่แล้ว — ถามผู้ใช้ว่าจะข้าม (ใช้ของเดิม) หรือรันขั้นตอนนั้นซ้ำ
2. รันตามลำดับ: Skill(requirement-builder) → Skill(release-plan-builder) → Skill(feature-list-builder) → Skill(user-journey-builder) [ต่อ module ใน scope] → Skill(qa-doc-builder)
   — แต่ละขั้นตอน ทำตาม workflow เต็มของ skill นั้นทุกประการ (ไม่ข้าม Build Plan/Ambiguity Protocol)
3. สรุปผลรวมทั้ง pipeline ให้ผู้ใช้ท้ายสุด
```

---

## Step 0 — เช็กเอกสารที่มีอยู่แล้วก่อนเริ่ม + กำหนด Scope

| ขั้นตอน | Skill ที่จะเรียก | ไฟล์ปลายทาง |
|---|---|---|
| 1 | `requirement-builder` | `docs/01-requirements/01-spec/REQUIREMENTS.md` |
| 2 | `release-plan-builder` | `ROADMAP.md` (root), `docs/01-requirements/03-task/TASK-LIST.md` |
| 3 | `feature-list-builder` | `docs/01-requirements/01-spec/FEATURE-LIST.md` |
| 4 | `user-journey-builder` | `docs/02-design/01-prototypes/USER-JOURNEY-{module}.md` **ต่อ 1 module** — ถ้า scope ครอบหลาย module ต้องเรียกซ้ำหลายครั้งในขั้นตอนนี้ |
| 5 | `qa-doc-builder` | `docs/03-testing/01-test-plan/vN/TEST-PLAN.md`, `ACCEPTANCE-CRITERIA.md`, `TEST-CASES.xlsx` |

ถามผู้ใช้ก่อนเริ่มว่า scope รอบนี้คือ pain point/module ไหน (อย่าเดา) — **โดยเฉพาะขั้นตอน 4 ต้องรู้ชัดว่าจะทำ journey ของ module ไหนบ้าง เพราะ `user-journey-builder` รับได้ทีละ 1 module ต่อรอบ** ถ้า scope ครอบหลาย module ให้แจ้งผู้ใช้ตั้งแต่ต้นว่าขั้นตอน 4 จะถูกเรียกซ้ำกี่ครั้ง

---

## Step 1 — ถามเรื่องข้ามขั้นตอนที่มีไฟล์อยู่แล้ว (ถ้ามี)

เหมือนกับ `design-pipeline-orchestrator` Step 1 ทุกประการ — ต่อขั้นตอนที่ไฟล์ปลายทางมีอยู่แล้ว ถามผู้ใช้ก่อนเสมอว่าจะ **ข้าม** (ใช้เอกสารเดิมเป็นฐานของขั้นตอนถัดไป) หรือ **รันซ้ำ** (เรียก skill นั้นตามปกติ — skill นั้นจะถามเองว่าจะแก้ในที่หรือ archive ตาม convention ของมัน)

สำหรับขั้นตอน 4 (`user-journey-builder`) — เช็คเป็นรายmodule: module ไหนมี `USER-JOURNEY-{module}.md` อยู่แล้วให้ถามแยกว่าจะข้ามหรือรันซ้ำเฉพาะ module นั้น module ที่ยังไม่มีให้รันใหม่ไปเลยไม่ต้องถาม

---

## Step 2 — รันแต่ละขั้นตอนตามลำดับ (ไม่ข้าม Build Plan ของขั้นตอนไหนเลย)

ต่อขั้นตอนที่ไม่ถูกข้าม ให้เรียกผ่าน **`Skill` tool** ตามลำดับ:

1. `Skill({skill: "requirement-builder", args: "<pain point/scope ที่ยืนยันไว้ Step 0>"})` — จนได้ `REQUIREMENTS.md` เสร็จ
2. `Skill({skill: "release-plan-builder", args: "<scope + อ้างอิง REQUIREMENTS.md จากขั้นตอน 1>"})` — จนได้ `ROADMAP.md`/`TASK-LIST.md` อัปเดตเสร็จ
3. `Skill({skill: "feature-list-builder", args: "<scope + อ้างอิงเอกสารจากขั้นตอน 1-2>"})` — จนได้ `FEATURE-LIST.md` เสร็จ (Feature ID ใหม่ถูกกำหนดแล้ว)
4. ต่อ**แต่ละ module** ใน scope: `Skill({skill: "user-journey-builder", args: "<module นี้ + Feature ID จากขั้นตอน 3>"})` — ทำซ้ำจนครบทุก module ใน scope ก่อนไปขั้นตอน 5
5. `Skill({skill: "qa-doc-builder", args: "<scope + อ้างอิง FEATURE-LIST.md/USER-JOURNEY-*.md จากขั้นตอน 3-4>"})` — จนได้ `TEST-PLAN.md`/`ACCEPTANCE-CRITERIA.md`/`TEST-CASES.xlsx` เสร็จ

**กติกาสำคัญ**: ทุกขั้นตอนต้อง**รอผลยืนยัน/เขียนไฟล์เสร็จจริงก่อน**ถึงจะไปขั้นตอนถัดไป — ห้ามยิง `Skill` หลายตัวพร้อมกันแบบขนาน (มี dependency เรียงลำดับกันจริง: backlog ต้องรู้ pain point จาก requirement, feature list ต้องรู้ทั้ง requirement และ backlog, journey ต้องรู้ Feature ID จาก feature list, QA doc ต้องรู้ทั้ง feature list และ journey) — รันแบบ**sequential เท่านั้น**

ถ้าขั้นตอนไหนถูกผู้ใช้ยกเลิก/ปฏิเสธ Build Plan กลางคัน — **หยุด pipeline ที่ขั้นตอนนั้น** แจ้งผู้ใช้ว่าจะกลับมาทำต่อเมื่อไหร่ก็ได้ด้วยการเรียก orchestrator นี้ซ้ำ (จะเช็ค Step 0 ใหม่แล้วเห็นว่าขั้นตอนไหนเสร็จแล้วบ้าง)

---

## Step 3 — สรุปผลรวมทั้ง Pipeline

หลังทุกขั้นตอน (ที่ไม่ถูกข้าม) เสร็จ สรุปให้ผู้ใช้:

- ตารางสรุปว่าขั้นตอนไหนถูกข้าม/รันใหม่ (รวมรายชื่อ module ที่ทำ journey ให้ในขั้นตอน 4) และไฟล์ที่แก้ทั้งหมดของทุกขั้นตอนรวมกัน
- Traceability รวม: Pain Point ↔ Feature ID ↔ Journey ↔ Test Spec ของแต่ละ module ที่ทำในรอบนี้
- แจ้งว่าเรียก orchestrator นี้ซ้ำได้ทุกเมื่อ จะเช็คว่าเอกสารไหนมีอยู่แล้วให้อัตโนมัติ
- ถ้ามี module ที่ยังไม่ได้ทำ journey ใน scope เดิม (เช่น ผู้ใช้ยกเลิกกลางคัน) ให้แจ้งว่าเหลือ module ไหนบ้าง

---

## ข้อจำกัดที่ต้องรู้

- Orchestrator นี้**ไม่ลด**จำนวนคำถาม/การยืนยันที่ผู้ใช้ต้องตอบ — แค่ลดจำนวน**คำสั่งที่ต้องพิมพ์เอง**
- ขั้นตอน 4 อาจถูกเรียกหลายครั้งในหนึ่ง pipeline run ถ้า scope ครอบหลาย module — แจ้งผู้ใช้ล่วงหน้าเสมอว่าจะเกิดกี่ครั้ง
- ถ้าโปรเจกต์ยังไม่มี `ROADMAP.md`/`FEATURE-LIST.md` ที่จำเป็นสำหรับขั้นตอนถัดไป — แต่ละ skill จะหยุดถามเองตาม Step 1 ของมัน ไม่ใช่ปัญหาของ orchestrator เอง
