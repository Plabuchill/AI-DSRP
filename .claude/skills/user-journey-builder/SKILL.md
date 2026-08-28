---
name: user-journey-builder
description: สร้าง/ปรับปรุงเอกสาร **User Journey** (`docs/02-design/01-prototypes/USER-JOURNEY-{topic}.md`) ของ AI Disease Surveillance & Response Platform — แปลง Feature ID ที่เกี่ยวข้องกันในโมดูลเดียวกัน (จาก `FEATURE-LIST.md`) ให้เป็นลำดับขั้นตอนที่ผู้ใช้จริง (persona) เดินผ่านระบบ พร้อม trigger, ขั้นตอนทีละ step, pain point ที่แก้ได้/ยังไม่แก้ และ traceability กับ Test Spec — ทำ**ทีละ 1 journey ต่อ 1 รอบ** ก่อนสร้าง/แก้ไฟล์จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนจะถามผู้ใช้พร้อมเสนอ ≥3 แนวทางพร้อมข้อดี-ข้อเสีย และถ้ามี `USER-JOURNEY-{topic}.md` เดิมอยู่แล้วจะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง user journey, customer journey, persona, ขั้นตอนที่ผู้ใช้เดินผ่านระบบ หรือขอ "ทำ journey ของโมดูลนี้ให้หน่อย" แม้จะพูดแบบไม่เป็นทางการ (เช่น "อยากเห็นว่าผู้ใช้จะใช้หน้านี้ยังไง", "ทำ flow การใช้งานจริงของ อสม. ให้หน่อย")
---

# User Journey Builder

Skill นี้เป็นสมาชิกลำดับที่ 11 ของตระกูล อยู่ในสาย requirements/planning ต่อจาก `feature-list-builder`: `requirement-builder` → `release-plan-builder` → `feature-list-builder` → **`user-journey-builder`** → `qa-doc-builder`

**ความสัมพันธ์กับสาย technical design**: `architecture-builder` ใช้ User Journey doc เป็นฐานหลักของ Data Flow diagram (ดู SKILL.md ของมัน) — journey ที่ทำจาก skill นี้จึงเป็น**ต้นทาง**ที่ `architecture-builder` และ `detailed-design-builder` (ถ้ายึด journey เป็นแกนหลักของ flow) อ้างอิงต่อ

**ทำทีละ 1 journey ต่อ 1 รอบ** — ต่างจาก skill อื่นที่มักทำทั้งเอกสารในคราวเดียว เพราะ 1 journey ผูกกับ 1 persona/module โดยเฉพาะ การทำหลาย journey พร้อมกันเสี่ยงทำให้แต่ละ journey ได้รายละเอียดตื้นกว่าที่ควร

ทุก workflow ที่ต้องคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่อง version/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแล้ว ให้มอบให้ subagent `user-journey-writer` (ดู `.claude/agents/user-journey-writer.md`)

## ภาพรวม Workflow

```
0. รับ Input (module/persona ที่จะทำ journey / FEATURE-LIST.md / prototypes/vN/BUILD-PLAN.md)
1. เช็ก FEATURE-LIST.md — ต้องมี Feature ID ของโมดูลนี้ให้อ้างอิง ไม่มีต้องหยุดถามก่อน
2. เช็กว่ามี USER-JOURNEY-{topic}.md ของโมดูลนี้เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่
3. ร่าง Build Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย เสมอ)
4. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent user-journey-writer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม traceability
```

---

## Step 0 — รับ Input

- **ระบุ module/persona ที่จะทำ journey** — เช่น "Case Intake สำหรับเจ้าหน้าที่โรงพยาบาล", "ASM Coordination สำหรับ อสม." — **บังคับต้องระบุ 1 module/persona ต่อ 1 รอบ** ถ้าผู้ใช้ขอหลาย module พร้อมกัน ให้ถามว่าจะเริ่มจากอันไหนก่อน (ดู Ambiguity Protocol)
- **อ้างอิงเอกสารที่มีอยู่แล้ว** — `docs/01-requirements/01-spec/FEATURE-LIST.md` (Feature ID ของโมดูลนี้), `prototypes/vN/BUILD-PLAN.md` และ mock data (`*.js`) ของหน้านั้น (ลำดับ interaction จริงที่ prototype ทำไว้แล้ว), `docs/03-testing/01-test-plan/vN/ACCEPTANCE-CRITERIA.md` ถ้ามี Test Spec ของโมดูลนี้อยู่แล้ว (ใช้ map FR- เข้ากับ step)
- **คำถามเปิด** — ถ้าผู้ใช้บอกแค่ "ทำ journey ให้หน่อย" โดยไม่ระบุโมดูล ให้ถามกลับว่าจะทำโมดูลไหนก่อน อย่าเดาเอง

---

## Step 1 — เช็ก Reference หลัก (FEATURE-LIST.md ต้องมาก่อนเสมอ)

1. ตรวจว่ามี Feature ID ของโมดูลที่จะทำ journey อยู่ใน `FEATURE-LIST.md` แล้วหรือไม่
2. **ถ้ามี** — ใช้เป็นฐานอ้างอิง ไปต่อ Step 2
3. **ถ้าไม่มี** — หยุดก่อน ถามผู้ใช้ว่าจะเรียก `feature-list-builder` ก่อนไหม หรือทำแบบ ad-hoc (ระบุเป็น assumption ว่ายังไม่ผ่าน traceability เต็มรูปแบบ)

---

## Step 2 — ตัดสินใจ: แก้ในที่ vs Archive แล้วเขียนใหม่

`USER-JOURNEY-{topic}.md` เป็น**ไฟล์เดี่ยวต่อ 1 module/persona ไม่มี vN folder** (living document ตาม pattern ของ `USER-JOURNEY-outbreak-dashboard.md` ที่มีอยู่แล้ว)

- **ไม่มีไฟล์นี้เลย (module ยังไม่เคยทำ journey)** — สร้างใหม่ได้เลย
- **มีอยู่แล้ว (รันซ้ำสำหรับ module เดิม)** — ถามผู้ใช้ทุกครั้งไม่มีข้อยกเว้น: แก้ในที่ (sync ให้ตรงกับ prototype/feature ล่าสุด — ตรงกับที่เคยทำกับ `USER-JOURNEY-outbreak-dashboard.md` มาแล้ว) หรือ archive ไป `docs/00-archived/USER-JOURNEY-{topic}-{YYYY-MM-DD}.md` แล้วเขียนใหม่ทั้งฉบับ (เหมาะกับ persona/trigger เปลี่ยนไปคนละแบบ)

---

## Step 3 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ก่อนผู้ใช้ยืนยันแผน**

Build Plan ควรมีอย่างน้อย:

1. **Module/Persona** — ยืนยันชัดว่าทำ journey ของใคร/โมดูลไหน (1 อันต่อรอบ)
2. **Trigger** — อะไรทำให้ persona เริ่ม journey นี้
3. **แหล่งอ้างอิง step** — จะยึด prototype/mock data ที่มีอยู่แล้วแบบ 1:1 หรือมี step ใหม่ที่ prototype ยังไม่มี (ดู Ambiguity Protocol)
4. **Version decision** — จาก Step 2

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น)

- **ผู้ใช้ขอหลาย journey พร้อมกัน**: (a) ทำทีละอันตามลำดับที่ผู้ใช้ให้ความสำคัญ ข้อดี: ได้รายละเอียดลึกทุกอัน ข้อเสีย: ใช้รอบเยอะกว่า, (b) ทำทีละอันตามลำดับ Phase ใน ROADMAP.md ข้อดี: สอดคล้องกับความสำคัญที่วางแผนไว้แล้ว ข้อเสีย: อาจไม่ตรงกับที่ผู้ใช้อยากเห็นก่อน, (c) ถามผู้ใช้ตรงๆ ว่าอยากได้อันไหนก่อน ข้อดี: ตรงความต้องการที่สุด ข้อเสีย: ต้องรอคำตอบ
- **โมดูลไม่มี prototype ให้ยึด (ยังเป็น backlog ล้วน)**: (a) เขียน step จากคำอธิบายใน ROADMAP.md/FEATURE-LIST.md ตรงๆ (เร็วกว่า หยาบกว่า), (b) รอให้ prototype เสร็จก่อนค่อยทำ journey (ตรงกับพฤติกรรมจริงกว่า ใช้เวลารอ), (c) ทำ journey แบบ "คาดหวัง" (expected) พร้อม flag ชัดว่ายังไม่ตรงกับ UI จริงจนกว่า prototype จะเสร็จ
- **Step ที่ prototype ยังไม่รองรับ (placeholder/backlog)**: (a) เขียน step ไว้แต่ระบุชัดว่า "ยังทำไม่ได้ในรุ่นนี้" พร้อมอ้าง Backlog Feature ID (ตรงกับ pattern step 7a ใน `USER-JOURNEY-outbreak-dashboard.md`) ข้อดี: เห็นภาพ journey ที่ตั้งใจไว้ครบ ข้อเสีย: อาจดูเหมือนทำได้จริงถ้าอ่านผ่านๆ, (b) ตัด step ที่ยังทำไม่ได้ออกจาก journey ไปเลย ข้อดี: journey สะท้อนสิ่งที่ทำได้จริงเท่านั้น ข้อเสีย: มองไม่เห็นภาพเป้าหมายที่ตั้งใจสุดท้าย

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

1. **ถ้าเลือก archive ใน Step 2** — ย้ายไฟล์เดิมไป `docs/00-archived/` ก่อน (ทำเองใน main loop)
2. เรียก subagent `user-journey-writer` (ผ่าน Agent tool, `subagent_type: user-journey-writer`) พร้อมส่ง context ให้ครบ: เนื้อหา `FEATURE-LIST.md` ที่เกี่ยวข้อง, `prototypes/vN/BUILD-PLAN.md`/mock data ของหน้านั้น, `ACCEPTANCE-CRITERIA.md` ถ้ามี, Build Plan ที่ยืนยันแล้ว, path ปลายทาง (`docs/02-design/01-prototypes/USER-JOURNEY-{topic}.md`)
3. รอผลแล้วตรวจสอบคร่าวๆ ก่อนสรุปให้ผู้ใช้
4. อัปเดต `docs/02-design/01-prototypes/index.md` ให้มีลิงก์ชี้ไปไฟล์ใหม่ (ถ้าเป็น journey ใหม่)

## Step 5 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่สร้าง/แก้ (และไฟล์ archive ถ้ามี)
- สรุป persona/trigger/จำนวน step ที่ทำเสร็จ
- Traceability สรุปย่อ: step ไหน map กับ Feature ID/FR- ไหน
- แจ้งว่า `architecture-builder` (Data Flow) และ `qa-doc-builder` (Test Spec) ควร sync ตามถ้า journey นี้เป็นของใหม่ — ไม่ sync ให้เองในรอบนี้
- แจ้งว่าเรียก skill นี้ซ้ำได้ทีละ module ถัดไป

---

## อ้างอิงเพิ่มเติม

- `references/user-journey-template.md` — Template โครงสร้างของ `USER-JOURNEY-{topic}.md`
