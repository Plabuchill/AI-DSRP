---
name: design-pipeline-orchestrator
description: Orchestrator ที่รันต่อเนื่อง 4 ขั้นตอนของสาย technical design ให้ครบในคำสั่งเดียว **โดยไม่ต้องให้ผู้ใช้เรียกทีละ skill เอง**: (1) `architecture-builder` → `HIGH-LEVEL-ARCHITECTURE.md`, (2) `data-contract-builder` → `DATA-MODEL.md` + `API-SPEC.md`, (3) `detailed-design-builder` → `DETAILED-DESIGN.md`, (4) `nfr-review-builder` → `NFR-REVIEW.md` ของ AI Disease Surveillance & Response Platform เช็กเอกสารที่มีอยู่แล้วก่อนเริ่ม ข้ามขั้นตอนที่มีเอกสารสมบูรณ์อยู่แล้วได้ (ถามผู้ใช้ก่อนว่าจะข้ามจริงไหม) แต่**ยังคงหยุดยืนยัน Build Plan ที่ทุกขั้นตอนตามกฎ Ambiguity Protocol เดิมของแต่ละ skill** ไม่ข้ามการยืนยันเพื่อความเร็ว ใช้ skill นี้เมื่อผู้ใช้ต้องการรัน pipeline ทั้ง 4 ขั้นตอนต่อเนื่องกันในคำสั่งเดียว (เช่น "ทำ architecture ถึง detailed design กับ review NFR ให้ครบเลย", "รันทั้ง pipeline design ให้หน่อย", "ทำต่อเนื่องจนถึง NFR review") แทนที่จะเรียก 4 skill แยกกันเอง
---

# Design Pipeline Orchestrator

Skill นี้**ไม่ได้สร้างเอกสารเอง** และ**ไม่มี subagent เขียนไฟล์ของตัวเอง** — หน้าที่เดียวคือ**เรียง/ต่อ** 4 skill ที่มีอยู่แล้วให้รันในคำสั่งเดียว: `architecture-builder` → `data-contract-builder` → `detailed-design-builder` → `nfr-review-builder` โดยแต่ละขั้นตอนยังทำงานตาม workflow เต็มรูปแบบของตัวเอง (สัมภาษณ์/ถาม Ambiguity Protocol/เสนอ Build Plan/รอยืนยัน/delegate ให้ subagent เขียนไฟล์) **ไม่มีข้อยกเว้นถูกข้ามไป**

**ความหมายของ "ต่อเนื่องกันโดยไม่ต้องเรียกทีละขั้นตอน"**: ผู้ใช้**ไม่ต้อง**พิมพ์ `/architecture-builder` แล้ว `/data-contract-builder` แล้ว `/detailed-design-builder` แล้ว `/nfr-review-builder` เองทีละคำสั่ง — เรียก orchestrator นี้ครั้งเดียว แล้วมันจะไล่เรียกแต่ละ skill ต่อกันเองในเซสชันเดียวให้ — **แต่ผู้ใช้ยังคงต้องตอบคำถาม/ยืนยัน Build Plan ที่แต่ละขั้นตอนเหมือนเดิม** (ตามที่ยืนยันไว้ตอนออกแบบ skill นี้ — ไม่ข้าม Ambiguity Protocol เพื่อความเร็ว)

## ภาพรวม Workflow

```
0. เช็กเอกสารที่มีอยู่แล้วทั้ง 4 ปลายทาง (HIGH-LEVEL-ARCHITECTURE.md, DATA-MODEL.md+API-SPEC.md, DETAILED-DESIGN.md, NFR-REVIEW.md)
1. ถ้ามีไฟล์ปลายทางของขั้นตอนไหนอยู่แล้ว — ถามผู้ใช้ว่าจะข้าม (ใช้ของเดิม) หรือรันขั้นตอนนั้นซ้ำ (อัปเดต/ต่อยอด)
2. รันตามลำดับ: Skill(architecture-builder) → Skill(data-contract-builder) → Skill(detailed-design-builder) → Skill(nfr-review-builder)
   — แต่ละขั้นตอน ทำตาม workflow เต็มของ skill นั้นทุกประการ (ไม่ข้าม Build Plan/Ambiguity Protocol)
3. สรุปผลรวมทั้ง pipeline ให้ผู้ใช้ท้ายสุด
```

---

## Step 0 — เช็กเอกสารที่มีอยู่แล้วก่อนเริ่ม

ตรวจว่ามีไฟล์เหล่านี้อยู่แล้วหรือไม่ (ทั้งหมดอยู่ที่ `docs/02-design/02-technical/`):

| ขั้นตอน | Skill ที่จะเรียก | ไฟล์ปลายทาง |
|---|---|---|
| 1 | `architecture-builder` | `HIGH-LEVEL-ARCHITECTURE.md` |
| 2 | `data-contract-builder` | `DATA-MODEL.md`, `API-SPEC.md` |
| 3 | `detailed-design-builder` | `DETAILED-DESIGN.md` |
| 4 | `nfr-review-builder` | `NFR-REVIEW.md` |

ระบุ scope ที่ผู้ใช้ต้องการรอบนี้ก่อน (เช่น "ทำทั้ง 4 ขั้นตอนสำหรับ Case Intake" หรือ "ทำทั้งระบบ") — ถ้าผู้ใช้ไม่ระบุ scope เลย ให้ถามกลับก่อนเริ่ม อย่าเดา scope เอง (เหมือน 4 skill ที่จะเรียก)

---

## Step 1 — ถามเรื่องข้ามขั้นตอนที่มีไฟล์อยู่แล้ว (ถ้ามี)

ต่อขั้นตอนที่ไฟล์ปลายทางมีอยู่แล้ว — **ถามผู้ใช้ก่อนเสมอ** ว่า:

1. **ข้าม** — ใช้เอกสารเดิมเป็นฐานของขั้นตอนถัดไป ไม่ต้องรัน skill นั้นซ้ำ (เร็วที่สุด เหมาะถ้าเอกสารเดิมยังตรงกับ scope ปัจจุบัน)
2. **รันซ้ำ** — เรียก skill นั้นตามปกติ (skill นั้นจะถามเองว่าจะแก้ในที่หรือ archive ตาม convention ของมันอยู่แล้ว) เหมาะถ้า scope เปลี่ยนหรือเอกสารเดิมอาจไม่ตรง requirement ปัจจุบันแล้ว

ถ้าผู้ใช้เลือกข้ามขั้นตอนไหน ให้ใช้เนื้อหาไฟล์เดิมของขั้นตอนนั้นเป็น context ส่งต่อให้ขั้นตอนถัดไป (แทนที่จะสร้างใหม่)

---

## Step 2 — รันแต่ละขั้นตอนตามลำดับ (ไม่ข้าม Build Plan ของขั้นตอนไหนเลย)

ต่อขั้นตอนที่ไม่ถูกข้าม ให้เรียกผ่าน **`Skill` tool** ตามลำดับ:

1. `Skill({skill: "architecture-builder", args: "<scope ที่ยืนยันไว้ Step 0>"})` — ทำตาม workflow เต็มของ `architecture-builder` (Step 0-5 ของมันเอง) จนได้ `HIGH-LEVEL-ARCHITECTURE.md` ที่ยืนยัน/เขียนเสร็จแล้วจริง ก่อนไปขั้นตอนถัดไป
2. `Skill({skill: "data-contract-builder", args: "<scope + อ้างอิง HIGH-LEVEL-ARCHITECTURE.md จากขั้นตอน 1>"})` — จนได้ `DATA-MODEL.md`/`API-SPEC.md` เสร็จ
3. `Skill({skill: "detailed-design-builder", args: "<scope + อ้างอิงเอกสารจากขั้นตอน 1-2>"})` — จนได้ `DETAILED-DESIGN.md` เสร็จ
4. `Skill({skill: "nfr-review-builder", args: "<scope + อ้างอิงเอกสารจากขั้นตอน 1-3>"})` — จนได้ `NFR-REVIEW.md` เสร็จ

**กติกาสำคัญ**: ทุกขั้นตอนต้อง**รอผลยืนยัน/เขียนไฟล์เสร็จจริงก่อน**ถึงจะไปขั้นตอนถัดไป — ห้ามยิง `Skill` ทั้ง 4 ตัวพร้อมกันแบบขนาน (สาย technical design นี้มี dependency เรียงลำดับกันจริง: data contract ต้องรู้ component จาก architecture, detailed design ต้องรู้ entity/operation จาก data contract, NFR review ต้องมีทุกเอกสารก่อนหน้าครบที่สุดเท่าที่จะทำได้) — รันแบบ**sequential เท่านั้น**

ถ้าขั้นตอนไหนถูกผู้ใช้ยกเลิก/ปฏิเสธ Build Plan กลางคัน (เช่น ไม่ยืนยันแผนของ `detailed-design-builder`) — **หยุด pipeline ที่ขั้นตอนนั้น** ไม่ต้องพยายามรันขั้นตอนถัดไปต่อ (เพราะข้อมูล input จะไม่ครบ) แจ้งผู้ใช้ว่าจะกลับมาทำต่อเมื่อไหร่ก็ได้ด้วยการเรียก orchestrator นี้ซ้ำ (จะเช็ค Step 0 ใหม่แล้วเห็นว่าขั้นตอนไหนเสร็จแล้วบ้าง)

---

## Step 3 — สรุปผลรวมทั้ง Pipeline

หลังทุกขั้นตอน (ที่ไม่ถูกข้าม) เสร็จ สรุปให้ผู้ใช้:

- ตารางสรุปว่าขั้นตอนไหนถูกข้าม (ใช้ของเดิม) / ขั้นตอนไหนถูกรันใหม่ / ไฟล์ที่แก้ทั้งหมดของทุกขั้นตอนรวมกัน
- Traceability รวม: Feature ID ไหนถูกครอบโดยเอกสารไหนบ้างในรอบนี้
- **Gap ที่ `nfr-review-builder` พบ** (ถ้ารัน) — เด่นเป็นพิเศษเพราะเป็นสิ่งที่ผู้ใช้ต้องตัดสินใจต่อ
- แจ้งว่าเรียก orchestrator นี้ซ้ำได้ทุกเมื่อ จะเช็คว่าเอกสารไหนมีอยู่แล้วให้อัตโนมัติ

---

## ข้อจำกัดที่ต้องรู้

- Orchestrator นี้**ไม่ลด**จำนวนคำถาม/การยืนยันที่ผู้ใช้ต้องตอบ — แค่ลดจำนวน**คำสั่งที่ต้องพิมพ์เอง** (จาก 4 คำสั่งเหลือ 1) ถ้าต้องการ pipeline ที่หยุดถามน้อยลงจริง ต้องแจ้งเป็น requirement ใหม่แยกต่างหาก (เป็นการเปลี่ยน design ที่กระทบ Ambiguity Protocol ของทุก skill ในตระกูล ไม่ใช่แค่ orchestrator นี้)
- ถ้าโปรเจกต์ยังไม่มี `ROADMAP.md`/`FEATURE-LIST.md` (Step 1 ของ 4 skill ทุกตัวต้องใช้) — orchestrator นี้จะเจอปัญหาเดียวกับที่แต่ละ skill เจอเอง คือหยุดถามตั้งแต่ขั้นตอนที่ 1 ก่อน ไม่ใช่ปัญหาของ orchestrator เอง
