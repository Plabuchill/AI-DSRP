---
name: feature-list-builder
description: สร้าง/ปรับปรุงเอกสาร **Feature List** (`docs/01-requirements/01-spec/FEATURE-LIST.md`) ของ AI Disease Surveillance & Response Platform โดยแปลง `REQUIREMENTS.md` (pain point) และ `ROADMAP.md` (backlog/phase) เป็นรายการ Feature ที่มี Feature ID (`FEAT-<โมดูล>-NN`) แบบเป็นทางการ — เป็นกลไก**เดียว**ที่กำหนด Feature ID ใหม่ในโปรเจกต์ (เอกสารอื่นทั้งหมดอ้างอิง ID จากที่นี่ ห้ามเดา ID ขึ้นเองที่อื่น) ก่อนสร้าง/แก้ไฟล์จะเสนอแผนให้ผู้ใช้รีวิว/ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนจะถามผู้ใช้พร้อมเสนอ ≥3 แนวทางพร้อมข้อดี-ข้อเสีย และถ้ามี `FEATURE-LIST.md` เดิมอยู่แล้วจะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึงการเพิ่ม/แก้ feature, Feature ID ใหม่, หรือขอ "อัปเดต feature list ให้ตรงกับ requirement/backlog ล่าสุด" แม้จะพูดแบบไม่เป็นทางการ (เช่น "เพิ่ม feature ใหม่ให้หน่อย", "feature list ตรงกับที่คุยกันไว้รึยัง")
---

# Feature List Builder

Skill นี้เป็นสมาชิกลำดับที่ 10 ของตระกูล อยู่ตรงกลางของ pipeline requirements/planning: `requirement-builder` (REQUIREMENTS.md) → `release-plan-builder` (ROADMAP.md/TASK-LIST.md) → **`feature-list-builder` (FEATURE-LIST.md)** → `user-journey-builder` (USER-JOURNEY-*.md) → `qa-doc-builder` (TEST-PLAN.md/ACCEPTANCE-CRITERIA.md/TEST-CASES.xlsx)

**บทบาทพิเศษ**: `FEATURE-LIST.md` เป็นเอกสารเดียวที่**กำหนด Feature ID ใหม่** — ทุก skill อื่นในโปรเจกต์ (architecture-builder, data-contract-builder, detailed-design-builder, tech-stack-builder, release-plan-builder, nfr-review-builder, qa-doc-builder, user-journey-builder) ต้องอ้าง ID จากที่นี่เท่านั้น ห้ามตั้ง ID ใหม่ที่อื่น — ทำให้ skill นี้ต้อง**เข้มงวดกับความซ้ำซ้อนของ ID เป็นพิเศษ**

ทุก workflow ที่ต้องคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่อง version/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแล้ว ให้มอบให้ subagent `feature-list-writer` (ดู `.claude/agents/feature-list-writer.md`)

## ภาพรวม Workflow

```
0. รับ Input (REQUIREMENTS.md ถ้ามี / ROADMAP.md / feature ใหม่ที่ผู้ใช้ระบุตรงๆ)
1. เช็ก ROADMAP.md — ต้องมีให้อ้างอิง Phase ไม่มีต้องหยุดถามก่อน (เหมือน skill สาย design ทุกตัว)
2. เช็กว่ามี FEATURE-LIST.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่
3. ร่าง Build Plan แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน (จุดไม่ชัดเจน ถาม ≥3 ทางเลือก+ข้อดีข้อเสีย เสมอ)
4. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent feature-list-writer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม traceability + แจ้ง Feature ID ใหม่ที่เพิ่งกำหนดให้ผู้ใช้ตรวจทาน
```

---

## Step 0 — รับ Input

- **`docs/01-requirements/01-spec/REQUIREMENTS.md`** (ถ้ามี) — pain point ที่ต้องแปลงเป็น feature
- **`ROADMAP.md`** — Phase ที่ feature นี้จะอยู่ (ต้องมีก่อนกำหนด Feature ID เสมอ เพราะ Feature ID ต้อง map กลับ Phase ได้)
- **Feature ใหม่ที่ผู้ใช้ระบุตรงๆ** — ไม่ผ่าน REQUIREMENTS.md ก็ทำได้ ถ้าผู้ใช้บอกฟีเจอร์ตรงๆ
- **คำถามเปิด** — ถ้าผู้ใช้ไม่ระบุว่าจะเพิ่ม feature ให้โมดูลไหน ให้ถามกลับ อย่าเดา module/Phase เอง

---

## Step 1 — เช็ก Reference หลัก (ROADMAP.md ต้องมาก่อนเสมอ)

1. ตรวจว่ามี `ROADMAP.md` (root) หรือไม่ — ถ้าไม่มี หยุดถามผู้ใช้ก่อน (เหตุผลเดียวกับ skill สาย design)
2. ถ้ามี `REQUIREMENTS.md` ให้ใช้ประกอบด้วย (ไม่บังคับต้องมี — feature อาจมาจาก ROADMAP.md ตรงๆ ก็ได้ถ้ายังไม่มี REQUIREMENTS.md)

---

## Step 2 — ตัดสินใจ: แก้ในที่ vs Archive แล้วเขียนใหม่

`FEATURE-LIST.md` เป็น**ไฟล์เดี่ยว ไม่มี vN folder** (living document)

- **ไม่มีไฟล์นี้เลย** — สร้างใหม่ได้เลย (ปัจจุบันมีอยู่แล้วในโปรเจกต์นี้ กรณีนี้ใช้กับโปรเจกต์อื่น/รีเซ็ตใหม่)
- **มีอยู่แล้ว (รันซ้ำ — สถานการณ์ปกติของโปรเจกต์นี้)** — ถามผู้ใช้ทุกครั้งไม่มีข้อยกเว้น: แก้ในที่ (เพิ่ม Feature ID ใหม่ต่อท้ายโมดูลเดิม หรือเพิ่มโมดูลใหม่) หรือ archive ไป `docs/00-archived/FEATURE-LIST-{YYYY-MM-DD}.md` แล้วเขียนใหม่ทั้งฉบับ (เหมาะกับการปรับโครงหมวดหมู่ feature ทั้งชุด)

---

## Step 3 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ก่อนผู้ใช้ยืนยันแผน** — Feature ID ที่กำหนดผิด/ซ้ำจะกระทบ traceability ของทุกเอกสารที่อ้างอิงมันอยู่

Build Plan ควรมีอย่างน้อย:

1. **Scope** — โมดูลไหนที่จะเพิ่ม/แก้ feature
2. **Feature ID ที่จะกำหนดใหม่** — ระบุ ID เต็มของทุก feature ใหม่ พร้อมชื่อ/คำอธิบายสั้น (ต้อง**เช็คว่าไม่ซ้ำกับ ID ที่มีอยู่แล้ว**ใน FEATURE-LIST.md ปัจจุบันก่อนเสนอ)
3. **สถานะเริ่มต้น** — ✅ Prototype แล้ว หรือ 🔲 Backlog (ตาม convention เดิมของไฟล์)
4. **Version decision** — จาก Step 2

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น)

- **รูปแบบ Feature ID ย่อยเมื่อโมดูลมี feature ระดับหน้า (`FEAT-<โมดูล>`) กับระดับ UI section (`FEAT-<โมดูล>-NN`) ปนกัน**: (a) ให้ feature ใหม่ต่อเลขจากตัวสุดท้ายที่มีอยู่ในโมดูลนั้นเสมอ (เช่น มีถึง 15 แล้ว feature ใหม่ = 16) ข้อดี: ไม่ชนกับของเดิมแน่นอน ข้อเสีย: ถ้ามีของเดิมถูกลบไปก่อน เลขจะไม่ต่อเนื่อง, (b) จัดกลุ่มเลขใหม่ตามหมวดย่อย (เช่น 20-29 สำหรับ sub-feature กลุ่มใหม่) ข้อดี: จัดหมวดง่ายขึ้นเมื่อโมดูลใหญ่มาก ข้อเสีย: ซับซ้อนเกินความจำเป็นถ้าโมดูลเล็ก
- **โมดูลใหม่ที่ไม่เคยมีมาก่อน**: ตั้งคำย่อโมดูลใหม่ (a) อิงชื่อหน้า/ฟีเจอร์ตรงๆ (เช่น `FEAT-NOTIFY` สำหรับระบบแจ้งเตือนใหม่) ข้อดี: สื่อความหมายชัด ข้อเสีย: ต้องระวังชนกับคำย่อเดิม, (b) ถามผู้ใช้ตรงๆ ว่าจะใช้คำย่อไหน ข้อดี: แม่นยำสุด ข้อเสีย: ต้องรอคำตอบก่อนเขียนไฟล์
- **เชื่อมกับ Test Spec เดิม (`FR-<โมดูล>-NN`)**: ถ้าโมดูลมี Test Spec อยู่แล้ว (เช่น FEAT-DASH มี FR-DASH คู่กันบางส่วน) feature ใหม่ควร (a) ตั้งเลขให้ตรงกับ FR- ที่จะสร้างในอนาคตแบบ 1:1 ทันที ข้อดี: traceability ชัดเจนตั้งแต่ต้น ข้อเสีย: ต้องมั่นใจว่า QA จะตามทันจริง, (b) ปล่อยให้ FR- ตามทีหลังผ่าน `qa-doc-builder` แยกงาน ข้อดี: ไม่ผูกมัด QA workload ไว้ล่วงหน้า ข้อเสีย: อาจมี feature ที่ไม่มี test case คู่กันชั่วคราว (เหมือนที่เกิดกับ FEAT-DASH-07..15 ในโปรเจกต์นี้มาก่อน)

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

1. **ถ้าเลือก archive ใน Step 2** — ย้ายไฟล์เดิมไป `docs/00-archived/` ก่อน (ทำเองใน main loop)
2. เรียก subagent `feature-list-writer` (ผ่าน Agent tool, `subagent_type: feature-list-writer`) พร้อมส่ง context ให้ครบ: เนื้อหา `ROADMAP.md`, `REQUIREMENTS.md` (ถ้ามี), เนื้อหาปัจจุบันของ `FEATURE-LIST.md` (เพื่อเช็ค ID ซ้ำ), Build Plan ที่ยืนยันแล้ว, path ปลายทาง
3. รอผลแล้วตรวจสอบว่า Feature ID ใหม่ไม่ชนกับของเดิมจริง ก่อนสรุปให้ผู้ใช้
4. `docs/01-requirements/01-spec/index.md` มีลิงก์ชี้ไปแล้ว ไม่ต้องแก้ (เว้นแต่เปลี่ยนชื่อไฟล์)

## Step 5 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่แก้ (และไฟล์ archive ถ้ามี)
- **รายชื่อ Feature ID ใหม่ทั้งหมดที่เพิ่งกำหนด** ให้ผู้ใช้ตรวจทานว่าไม่ซ้ำ/สื่อความหมายถูกต้อง
- Traceability สรุปย่อ: Feature ID ไหน map กับ Pain Point/Phase ไหน
- แจ้งว่า `USER-JOURNEY-*.md` (ผ่าน `user-journey-builder`) และ Test Spec (ผ่าน `qa-doc-builder`) ควร sync ตามถ้ามี Feature ID ใหม่ — ไม่ sync ให้เองในรอบนี้
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อมี feature ใหม่หรือ requirement เปลี่ยน

---

## อ้างอิงเพิ่มเติม

- `references/feature-list-template.md` — Template โครงสร้างของ `FEATURE-LIST.md`
