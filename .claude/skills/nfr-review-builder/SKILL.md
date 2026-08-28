---
name: nfr-review-builder
description: สร้าง/ปรับปรุงเอกสาร**ทวนสอบ Non-Functional Requirement (NFR)** (`docs/02-design/02-technical/NFR-REVIEW.md`) ของ AI Disease Surveillance & Response Platform โดยเทียบ `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md`/`DETAILED-DESIGN.md` (เท่าที่มี) กับ NFR ที่**มีอยู่แล้วในโปรเจกต์** (Scale/Compliance/Hosting ใน `TECH-STACK.md`, Performance/Security/Accessibility ใน `ROADMAP.md` Phase 8, accessibility guideline ใน `DESIGN.md`) — ไม่สัมภาษณ์ NFR ใหม่ ใช้ของที่ยืนยันไว้แล้วเท่านั้น จุดไหนไม่มี NFR ต้นทางให้ flag เป็น "gap — ยังไม่มีเป้าหมายกำหนดไว้" แทนการเดา ก่อนสร้าง/แก้ไฟล์จะเสนอขอบเขตการ review ให้ผู้ใช้ยืนยันก่อนเสมอ ทุกจุดที่ไม่ชัดเจนจะถามผู้ใช้พร้อมเสนอ ≥3 แนวทางพร้อมข้อดี-ข้อเสีย และถ้ามี `NFR-REVIEW.md` เดิมอยู่แล้วจะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง non-functional requirement, NFR, ทวนสอบ performance/security/scalability/availability/maintainability/compliance ของ design ที่มีอยู่ หรือขอ "review ว่า design รองรับ NFR ไหม" แม้จะพูดแบบไม่เป็นทางการ (เช่น "เช็คหน่อยว่า design รองรับโหลด/PDPA ไหม", "อยากรู้ว่า architecture นี้พร้อมใช้งานจริงหรือยัง")
---

# NFR Review Builder

Skill นี้เป็นสมาชิกลำดับที่ 8 ของตระกูล `prototype-builder`/`qa-doc-builder`/`architecture-builder`/`data-contract-builder`/`detailed-design-builder`/`tech-stack-builder`/`release-plan-builder` — ทำหน้าที่ **ทวนสอบ (review)** ไม่ใช่ "สร้างใหม่" เหมือนสกิลอื่น: อ่านเอกสาร technical design ที่มีอยู่แล้วเทียบกับ NFR ที่โปรเจกต์เคยยืนยันไว้ (กระจายอยู่ใน `TECH-STACK.md`, `ROADMAP.md` Phase 8, `DESIGN.md`) แล้วสรุปว่าจุดไหน**สอดคล้อง**, จุดไหน**ไม่สอดคล้อง/มีความเสี่ยง**, และจุดไหน**ยังไม่มีเป้าหมาย NFR กำหนดไว้เลย** (gap)

**ไม่สัมภาษณ์ NFR ใหม่** — ต่างจาก `tech-stack-builder` ที่สัมภาษณ์ผู้ใช้เพื่อหาข้อมูลใหม่ สกิลนี้ใช้เฉพาะ NFR ที่**มีอยู่แล้ว**ในเอกสารโปรเจกต์เท่านั้น ถ้าพบว่า NFR หมวดไหนไม่เคยถูกกำหนดไว้เลย (เช่น เป้าหมาย uptime/SLA ไม่มีที่ไหนระบุ) ให้บันทึกเป็น **gap** ในผลลัพธ์ ไม่ใช่เดาเป้าหมายขึ้นมาเอง

เป็น **ขั้นตอนที่ 4** ของ pipeline `design-pipeline-orchestrator` (ดู `.claude/skills/design-pipeline-orchestrator/SKILL.md`) แต่เรียกใช้แยกเดี่ยวได้เช่นกัน

ทุก workflow ที่ต้องคุยกับผู้ใช้ (กำหนดขอบเขต review, ถามเรื่อง version/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันขอบเขตแล้ว ให้มอบให้ subagent `nfr-reviewer` (ดู `.claude/agents/nfr-reviewer.md`)

## ภาพรวม Workflow

```
0. รับ Input (ระบุ Phase/component ที่จะ review, หรือ review ทั้งระบบ)
1. เช็ก NFR ต้นทางที่มีอยู่ (TECH-STACK.md, ROADMAP.md Phase 8, DESIGN.md) + เอกสาร design ที่จะเทียบ (HIGH-LEVEL-ARCHITECTURE.md, DATA-MODEL.md, API-SPEC.md, DETAILED-DESIGN.md เท่าที่มี)
2. เช็กว่ามี NFR-REVIEW.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่
3. ร่าง Build Plan (ขอบเขต NFR category ที่จะ review) แล้วเสนอให้ผู้ใช้รีวิว/ยืนยัน
4. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent nfr-reviewer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม gap ที่พบและ traceability
```

---

## Step 0 — รับ Input

- **ระบุ scope** — review ทั้งระบบ หรือเฉพาะ Phase/module ที่เพิ่งทำ design เสร็จ (เช่น ถ้าเพิ่งทำ Case Intake ผ่าน pipeline มา ให้ review เฉพาะ FEAT-INTAKE-* ก่อนได้)
- **คำถามเปิด** — ถ้าผู้ใช้ไม่ระบุ scope เลย ให้ถามกลับว่าจะ review ทั้งระบบหรือเฉพาะส่วนที่เพิ่งออกแบบ อย่าเดา scope เอง

---

## Step 1 — รวบรวม NFR ต้นทางที่มีอยู่แล้ว (ห้ามสัมภาษณ์ใหม่)

อ่านและดึง NFR ที่ยืนยันไว้แล้วจาก:

| แหล่ง | NFR ที่มักพบ |
|---|---|
| `docs/02-design/02-technical/TECH-STACK.md` | Scale/Performance (concurrent users, polling interval), Compliance (PDPA data residency), Hosting (self-host on-prem) |
| `ROADMAP.md` Phase 8 | Performance testing, Security testing (PDPA ผ่าน 3rd-party API), Accessibility audit |
| `DESIGN.md` | Accessibility guideline (ถ้าระบุไว้) |
| `docs/02-design/02-technical/HIGH-LEVEL-ARCHITECTURE.md` หัวข้อ 4 | ข้อจำกัดทางเทคนิคที่ต้องพิจารณา (LINE quota, EXIF, human-in-the-loop) — ถือเป็น NFR เชิง reliability/data-integrity |

ถ้าหมวด NFR มาตรฐาน (Performance, Security, Scalability, Availability/Reliability, Maintainability, Compliance, Accessibility, Usability) หมวดไหน**ไม่พบต้นทางเลยในเอกสารทั้งหมด** — ให้บันทึกเป็น **gap** ในผลลัพธ์ Step 5 ไม่ใช่ตั้งเป้าหมายขึ้นเอง (เช่น "ไม่มีที่ไหนระบุเป้าหมาย uptime/SLA — gap ต้องสัมภาษณ์ผู้ใช้เพิ่มถ้าต้องการกำหนด")

อ่านเอกสาร design ที่มีอยู่เพื่อเทียบ: `HIGH-LEVEL-ARCHITECTURE.md`, `DATA-MODEL.md`, `API-SPEC.md`, `DETAILED-DESIGN.md` (เท่าที่มี — ถ้ายังไม่มีบางไฟล์ ให้ระบุว่า "ยังไม่มีเอกสารนี้ ยัง review ส่วนนี้ไม่ได้" แทนการข้ามเงียบๆ)

---

## Step 2 — ตัดสินใจ: แก้ในที่ vs Archive แล้วเขียนใหม่

`NFR-REVIEW.md` เป็น**ไฟล์เดี่ยว ไม่มี vN folder** (living document เหมือนไฟล์อื่นใน `docs/02-design/02-technical/`)

- **ไม่มีไฟล์นี้เลย (รันครั้งแรก)** — สร้างใหม่ได้เลย
- **มีอยู่แล้ว (รันซ้ำ)** — ถามผู้ใช้ทุกครั้งไม่มีข้อยกเว้น:
  1. **แก้ไฟล์เดิมในที่** — เพิ่ม/อัปเดตผลการ review ของ component/flow ที่เพิ่งออกแบบเพิ่ม
  2. **Archive ของเก่าไป `docs/00-archived/NFR-REVIEW-{YYYY-MM-DD}.md`** แล้วเขียนใหม่ทั้งฉบับ

| แนะนำ | เหมาะกับ |
|---|---|
| **แก้ในที่** | เพิ่มผล review ของ component ใหม่ที่เพิ่งออกแบบ, อัปเดตสถานะ gap ที่แก้ไขแล้ว |
| **Archive แล้วเขียนใหม่** | NFR ต้นทางเปลี่ยนไปมาก (เช่น scale เปลี่ยนจากเล็กเป็นใหญ่ใน `TECH-STACK.md`) ทำให้ผลการ review เดิมล้าสมัยเกือบทั้งหมด |

---

## Step 3 — ร่าง Build Plan แล้วเสนอให้รีวิว/ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ NFR-REVIEW.md ก่อนผู้ใช้ยืนยันขอบเขต** — Build Plan ควรมีอย่างน้อย:

1. **Scope** — ทั้งระบบ หรือเฉพาะ Phase/component ไหน
2. **หมวด NFR ที่จะ review** — ระบุว่าจะครอบทุกหมวด (Performance/Security/Scalability/Availability/Maintainability/Compliance/Accessibility/Usability) หรือเฉพาะบางหมวด (ดู Ambiguity Protocol)
3. **Version decision** — จาก Step 2

### Ambiguity Protocol (บังคับ ไม่มีข้อยกเว้น)

- **ขอบเขตหมวด NFR**: (a) ครอบทุกหมวดมาตรฐานแม้บางหมวดจะออกมาเป็น "gap" ทั้งหมวด ข้อดี: ได้ภาพครบ เห็น gap ชัด ข้อเสีย: ใช้เวลา/พื้นที่เอกสารมากกว่า, (b) เฉพาะหมวดที่มี NFR ต้นทางจริงอยู่แล้ว (ข้ามหมวดที่ไม่มีข้อมูลไปเลย) ข้อดี: กระชับ ตรงประเด็นที่มีข้อมูลจริง ข้อเสีย: อาจพลาดเห็น gap สำคัญที่ไม่เคยถูกพูดถึง, (c) ครอบเฉพาะหมวดที่ ROADMAP.md Phase 8 ระบุไว้ตรงๆ (Performance/Security/Accessibility) เท่านั้น ข้อดี: ตรงกับแผน Hardening ที่ยืนยันไว้แล้ว ข้อเสีย: ไม่ครอบ Compliance/Scalability/Maintainability ที่กระจายอยู่ใน TECH-STACK.md
- **ความละเอียดของ gap ที่พบ**: (a) ระบุแค่ว่า "gap พบ" พร้อมคำอธิบายสั้น ข้อดี: เร็ว ข้อเสีย: ผู้อ่านต้องตีความเองว่าจะแก้อย่างไร, (b) เสนอ ≥1 ข้อเสนอแนะแก้ไขต่อ gap ที่พบด้วย ข้อดี: ใช้งานต่อได้ทันที ข้อเสีย: อาจกลายเป็นการเดาทางแก้โดยไม่มีข้อมูลพอ ต้อง flag ว่าเป็นข้อเสนอแนะ ไม่ใช่ข้อสรุป

ใช้รูปแบบคำถามเดียวกับ 7 skill ก่อนหน้า

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

1. **ถ้าเลือก archive ใน Step 2** — ย้ายไฟล์เดิมไป `docs/00-archived/` ก่อน (ทำเองใน main loop)
2. เรียก subagent `nfr-reviewer` (ผ่าน Agent tool, `subagent_type: nfr-reviewer`) พร้อมส่ง context ให้ครบ:
   - เนื้อหา `TECH-STACK.md`, `ROADMAP.md` Phase 8, `DESIGN.md` (NFR ต้นทาง)
   - เนื้อหา `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md`/`DETAILED-DESIGN.md` เท่าที่มี (สิ่งที่จะ review)
   - Build Plan ที่ยืนยันแล้ว (scope, หมวด NFR ที่ครอบ, ระดับความละเอียดของ gap)
   - Path ปลายทาง (`docs/02-design/02-technical/NFR-REVIEW.md`)
   - ถ้าเป็นการแก้ไฟล์เดิม: เนื้อหาปัจจุบันทั้งหมด
3. รอผลจาก subagent แล้วตรวจสอบคร่าวๆ ก่อนสรุปให้ผู้ใช้
4. อัปเดต `docs/02-design/02-technical/index.md` ให้มีลิงก์ชี้ไปไฟล์ใหม่ (ถ้าเป็นการสร้างครั้งแรก)

## Step 5 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่สร้าง/แก้
- สรุปจำนวนจุดที่สอดคล้อง/ไม่สอดคล้อง/เป็น gap ต่อหมวด NFR
- **รายชื่อ gap ที่ต้องสัมภาษณ์ผู้ใช้เพิ่มถ้าต้องการปิด** (เช่น "ยังไม่มีเป้าหมาย uptime/SLA — ควรเรียก tech-stack-builder หรือสัมภาษณ์เพิ่มถ้าต้องการกำหนด")
- Traceability สรุปย่อ: NFR หมวดไหน กระทบ Feature ID/component ไหนบ้าง
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อ design เอกสารอื่นเปลี่ยนหรือ NFR ต้นทางอัปเดต

---

## อ้างอิงเพิ่มเติม

- `references/nfr-review-template.md` — Template โครงสร้างของ `NFR-REVIEW.md`
