---
name: requirement-builder
description: สร้าง/ปรับปรุงเอกสาร**ต้นทางความต้องการ** (`docs/01-requirements/01-spec/REQUIREMENTS.md`) ของ AI Disease Surveillance & Response Platform — รวบรวม pain point, user story/use case, business rule, และขอบเขต (scope) จากผู้ใช้งานจริง/สัมภาษณ์/ข้อมูลที่ผู้ใช้ระบุ ก่อนที่จะถูกแตกไปเป็น backlog (`ROADMAP.md` ผ่าน `release-plan-builder`) และ Feature List (`FEATURE-LIST.md` ผ่าน `feature-list-builder`) — เป็น**ต้นน้ำที่สุด**ของสาย requirements/planning ทั้งหมด ก่อนสร้าง/แก้ไฟล์จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนจะถามผู้ใช้พร้อมเสนอ ≥3 แนวทางพร้อมข้อดี-ข้อเสีย (ห้ามเดา pain point/ผู้มีส่วนได้ส่วนเสียที่ไม่ได้ระบุมา) และถ้ามี `REQUIREMENTS.md` เดิมอยู่แล้วจะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง requirement, pain point ใหม่, user story, business rule, ขอบเขตโปรเจกต์ (in/out of scope), หรือขอ "เก็บ requirement ให้เป็นเอกสาร" แม้จะพูดแบบไม่เป็นทางการ (เช่น "มี pain point ใหม่มาเพิ่ม", "ช่วยเขียน requirement ให้หน่อย", "ทีมนี้อยากได้อะไรบ้าง")
---

# Requirement Builder

Skill นี้เป็นสมาชิกลำดับที่ 9 ของตระกูล และเป็น**จุดเริ่มต้นของ pipeline requirements/planning ทั้งสาย**: `requirement-builder` (REQUIREMENTS.md) → `release-plan-builder` (ROADMAP.md/TASK-LIST.md) → `feature-list-builder` (FEATURE-LIST.md) → `user-journey-builder` (USER-JOURNEY-*.md) → `qa-doc-builder` (TEST-PLAN.md/ACCEPTANCE-CRITERIA.md/TEST-CASES.xlsx) — ดู `.claude/skills/requirements-pipeline-orchestrator/SKILL.md` ถ้าต้องการรันต่อเนื่องทั้ง 5 ขั้นตอน

**สถานะปัจจุบันของโปรเจกต์**: ยังไม่มี `REQUIREMENTS.md` แยก — pain point 5 ข้อ (โรงพยาบาล/เทศบาล, ทีมสอบสวนโรค, ทีมควบคุมโรค/ทีมพ่น, ทีม อสม., ผู้บริหาร) กระจายอยู่ในคำนำของ `ROADMAP.md` และบรรทัด "Requirement ต้นทาง" ต่อโมดูลใน `FEATURE-LIST.md` — งานแรกที่เรียก skill นี้ควร**รวบรวมของเดิมที่กระจายอยู่ให้เป็นฉบับทางการฉบับแรก** ก่อนรับ pain point ใหม่เพิ่ม

ทุก workflow ที่ต้องคุยกับผู้ใช้ (สัมภาษณ์ pain point, เสนอแผน, ถามเรื่อง version/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแล้ว ให้มอบให้ subagent `requirement-writer` (ดู `.claude/agents/requirement-writer.md`)

## ภาพรวม Workflow

```
0. รับ Input (pain point ใหม่ที่ผู้ใช้ระบุ / ROADMAP.md เดิม / FEATURE-LIST.md เดิม)
1. เช็กว่ามี REQUIREMENTS.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่
2. ร่าง Build Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย เสมอ ไม่มีข้อยกเว้น ห้ามเดา)
3. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent requirement-writer เขียนไฟล์จริง
4. สรุปผลให้ผู้ใช้ พร้อม traceability + แจ้งว่า backlog/feature-list ควร sync ตาม (ถ้ามีการเปลี่ยนแปลง)
```

---

## Step 0 — รับ Input

- **Pain point ใหม่ตรงๆ** — จากผู้ใช้งานจริง/สัมภาษณ์/ข้อสังเกต ระบุ: ใครเจอปัญหา (stakeholder), ปัญหาคืออะไร, กระทบอย่างไร
- **รวบรวมของเดิมที่กระจายอยู่แล้ว** (ถ้าเป็นการสร้างครั้งแรก) — อ่าน `ROADMAP.md` คำนำ + บรรทัด "Requirement ต้นทาง" ต่อโมดูลใน `FEATURE-LIST.md`
- **คำถามเปิด** — ถ้าผู้ใช้บอกแค่ "เขียน requirement ให้หน่อย" โดยไม่มี pain point ใหม่ ให้ถามกลับว่าต้องการรวบรวมของเดิมเป็นฉบับแรกก่อน หรือมี pain point ใหม่ที่จะเพิ่ม อย่าเดาว่าเป็นแบบไหน

---

## Step 1 — ตัดสินใจ: แก้ในที่ vs Archive แล้วเขียนใหม่

`REQUIREMENTS.md` เป็น**ไฟล์เดี่ยว ไม่มี vN folder** (living document ตาม convention เดียวกับเอกสารสาย requirements/planning อื่น)

- **ไม่มีไฟล์นี้เลย (รันครั้งแรก)** — สร้างใหม่ได้เลย
- **มีอยู่แล้ว (รันซ้ำ)** — ถามผู้ใช้ทุกครั้งไม่มีข้อยกเว้น: แก้ในที่ (เพิ่ม pain point ใหม่) หรือ archive ไป `docs/00-archived/REQUIREMENTS-{YYYY-MM-DD}.md` แล้วเขียนใหม่ทั้งฉบับ (เหมาะกับกรณีเปลี่ยนกลุ่มผู้ใช้งานหลักทั้งชุด)

---

## Step 2 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ก่อนผู้ใช้ยืนยันแผน** — REQUIREMENTS.md เป็นต้นน้ำที่สุด ผิดพลาดตรงนี้จะไหลลงไปกระทบ backlog/feature-list/user-journey ทั้งหมด

Build Plan ควรมีอย่างน้อย:

1. **Scope** — รวบรวมของเดิมทั้งหมด หรือเพิ่มเฉพาะ pain point ใหม่ที่ระบุมา
2. **โครงสร้างเอกสาร** — Pain Point ID scheme (เช่น `PAIN-<กลุ่มผู้ใช้>`), รายชื่อ pain point ที่จะมี, user story/business rule ที่จะรวม (ถ้ามี)
3. **Version decision** — จาก Step 1

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น — ห้ามเดา)

- **การตั้ง Pain Point ID**: (a) อิงกลุ่มผู้ใช้ตรงๆ เช่น `PAIN-HOSPITAL-01`, `PAIN-INVESTIGATION-01` ข้อดี: สื่อความหมายชัด ตรงกับที่ ROADMAP.md เกริ่นไว้แล้ว (5 กลุ่ม) ข้อเสีย: ถ้ามีกลุ่มผู้ใช้ใหม่ต้องคิดคำย่อใหม่ทุกครั้ง, (b) เลขเรียงลำดับล้วน `PAIN-01` ถึง `PAIN-N` ข้อดี: ง่ายสุด ไม่ต้องคิดคำย่อ ข้อเสีย: ไม่บอกกลุ่มผู้ใช้ในตัว ID เอง ต้องเปิดดูรายละเอียดเสมอ, (c) ผสม `PAIN-01-HOSPITAL` (เลข+กลุ่ม) ข้อดี: เรียงลำดับได้และรู้กลุ่มในตัว ข้อเสีย: ยาวกว่า 2 แบบแรก
- **ขอบเขตที่จะรวม**: (a) เฉพาะ pain point เท่านั้น ข้อดี: ตรงกับที่ ROADMAP.md มีอยู่แล้ว ทำเร็ว ข้อเสีย: ยังไม่มี user story/business rule แบบเป็นทางการ, (b) รวม user story/use case ด้วย ข้อดี: ครบตามที่ index.md ของโฟลเดอร์นี้ตั้งใจไว้ ข้อเสีย: ต้องมีข้อมูลเพิ่มจากผู้ใช้ (ห้ามเดา use case ที่ไม่มีคนยืนยัน), (c) รวมขอบเขต (scope/out-of-scope) ด้วย ข้อดี: ชัดเจนว่าอะไรไม่ทำตั้งแต่ต้น ข้อเสีย: ต้องยืนยันกับผู้ใช้ว่าอะไรอยู่นอกขอบเขตจริง ไม่ใช่การเดา

---

## Step 3 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

1. **ถ้าเลือก archive ใน Step 1** — ย้ายไฟล์เดิมไป `docs/00-archived/` ก่อน (ทำเองใน main loop)
2. เรียก subagent `requirement-writer` (ผ่าน Agent tool, `subagent_type: requirement-writer`) พร้อมส่ง context ให้ครบ: เนื้อหา `ROADMAP.md` คำนำ, `FEATURE-LIST.md` (บรรทัด Requirement ต้นทาง), Build Plan ที่ยืนยันแล้ว, path ปลายทาง (`docs/01-requirements/01-spec/REQUIREMENTS.md`), เนื้อหาปัจจุบัน (ถ้าแก้ไฟล์เดิม)
3. รอผลแล้วตรวจสอบคร่าวๆ ก่อนสรุปให้ผู้ใช้
4. อัปเดต `docs/01-requirements/01-spec/index.md` ให้มีลิงก์ชี้ไปไฟล์ใหม่ (ถ้าสร้างครั้งแรก)

## Step 4 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่สร้าง/แก้ (และไฟล์ archive ถ้ามี)
- รายชื่อ Pain Point/User Story ที่ทำเสร็จ
- **แจ้งว่า `ROADMAP.md` (ผ่าน `release-plan-builder`) และ `FEATURE-LIST.md` (ผ่าน `feature-list-builder`) ควร sync ตามถ้ามี pain point ใหม่** — ไม่ sync ให้เองในรอบนี้
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อมี pain point ใหม่เข้ามา

---

## อ้างอิงเพิ่มเติม

- `references/requirement-template.md` — Template โครงสร้างของ `REQUIREMENTS.md`
