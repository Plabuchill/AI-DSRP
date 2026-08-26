---
name: tech-stack-builder
description: สร้าง/ปรับปรุงเอกสาร Tech Stack (`docs/02-design/02-technical/TECH-STACK.md`) ของ AI Disease Surveillance & Response Platform โดย**สัมภาษณ์ผู้ใช้แบบเข้มข้น** (intensive interview ครอบคลุมทีม/งบ/hosting/compliance/scale/ข้อจำกัดที่มีอยู่แล้ว) เพื่อแนะนำ tech stack ที่เหมาะสมจริง — **ต่างจาก `architecture-builder`/`data-contract-builder`/`detailed-design-builder` ที่จงใจเลี่ยง tech stack เจาะจง** เอกสารจากสกิลนี้คือที่**ยืนยัน**เทคโนโลยีจริงต่อ component/service ที่ระบุไว้แบบ conceptual ในเอกสารสามฉบับนั้น ก่อนสร้าง/แก้ไฟล์ใดๆ จะเสนอ**คำแนะนำเป็นรายชั้น/component พร้อม ≥3 ตัวเลือกและข้อดี-ข้อเสียของแต่ละตัวเลือกเสมอ** ไม่มีข้อยกเว้น ให้ผู้ใช้พิจารณาและยืนยันก่อนเขียนไฟล์จริง และถ้ามี `TECH-STACK.md` เดิมอยู่แล้วจะถามผู้ใช้เสมอว่าจะแก้ในที่หรือ archive แล้วเขียนใหม่ ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง tech stack, เลือกเทคโนโลยี, จะใช้ database/ภาษา/framework/cloud provider อะไรดี, hosting, deployment stack, หรือขอคำแนะนำเรื่องเลือกเทคโนโลยีให้ระบบนี้ แม้จะพูดแบบไม่เป็นทางการ (เช่น "ควรใช้ database อะไรดี", "ช่วยแนะนำ stack ให้หน่อย", "จะ host ระบบนี้ยังไงดี")
---

# Tech Stack Builder

Skill นี้เป็นสมาชิกลำดับที่ 6 ของตระกูล `prototype-builder`/`qa-doc-builder`/`architecture-builder`/`data-contract-builder`/`detailed-design-builder` แต่มี**บทบาทกลับข้าง**กับ 3 skill หลังในสาย technical design: 3 skill นั้น (`architecture-builder`, `data-contract-builder`, `detailed-design-builder`) จงใจเขียนเอกสารแบบ**conceptual** โดยเลี่ยงการผูกกับ tech stack เว้นแต่ผู้ใช้ยืนยันมา — **skill นี้คือกลไกที่สร้าง "การยืนยัน" นั้น** ผลลัพธ์คือเอกสาร `TECH-STACK.md` ที่ระบุเทคโนโลยีจริงต่อ component ที่ 3 เอกสารข้างต้นเคยพูดถึงแบบ capability-level ไว้ (เช่น "Database" → เทคโนโลยีจริงที่เลือก, "บริการดึงข้อมูลจากภาพเอกสาร" → vendor จริงที่เลือก)

**ความสัมพันธ์กับ 4 skill ก่อนหน้า**: ใช้ `HIGH-LEVEL-ARCHITECTURE.md` (รายชื่อ component ที่ต้องเลือก stack), `DATA-MODEL.md`/`API-SPEC.md` (ลักษณะข้อมูล/operation ที่กระทบการเลือก database/API style), `DETAILED-DESIGN.md` (ตรรกะที่กระทบ เช่น ต้อง retry/queue ไหม) เป็น**ตัวตั้งคำถามในการสัมภาษณ์** — ถ้ายังไม่มีเอกสารเหล่านี้ ทำงานจาก `ROADMAP.md`/`FEATURE-LIST.md` ตรงๆ ได้ แต่ต้อง flag ว่าการแนะนำ stack อาจหยาบกว่าถ้าไม่มี component list ที่ชัดเจน

**หลังยืนยัน `TECH-STACK.md` แล้ว**: เอกสาร conceptual ทั้ง 3 ฉบับ**อ้างอิงเทคโนโลยีจริงที่ยืนยันแล้วได้ทันที** (ตาม exception clause ที่มีอยู่แล้วใน `CLAUDE.md` ข้อ 4) — แจ้งผู้ใช้เสมอในสรุปผล (Step 5) ว่าเอกสารไหนควรถูก sync ตามเพื่อไม่ให้ข้อมูลไม่ตรงกัน แต่**ไม่ sync ให้เองอัตโนมัติ**ในรอบนี้ ถือเป็นงานแยกที่ต้องเรียก skill นั้นซ้ำ

ทุก workflow ที่ต้องคุยกับผู้ใช้ (สัมภาษณ์, เสนอคำแนะนำ, ถามเรื่องแก้/archive) รันอยู่ใน main loop ห้ามข้าม ส่วนงานเขียนไฟล์จริงหลังยืนยันแล้ว ให้มอบให้ subagent `tech-stack-writer` (ดู `.claude/agents/tech-stack-writer.md`)

## ภาพรวม Workflow

```
0. เช็ก Reference ที่มีอยู่ (ROADMAP.md, FEATURE-LIST.md, HIGH-LEVEL-ARCHITECTURE.md, DATA-MODEL.md/API-SPEC.md ถ้ามี)
1. สัมภาษณ์ผู้ใช้แบบเข้มข้นตาม Interview Checklist (บังคับครบทุกหมวด ไม่ข้าม)
2. เช็กว่ามี TECH-STACK.md เดิมอยู่ไหม — ถ้ามี ถามผู้ใช้ว่าจะแก้ในที่ หรือ archive แล้วเขียนใหม่
3. ตั้งคำแนะนำเป็นรายชั้น/component พร้อม ≥3 ตัวเลือก+ข้อดีข้อเสียต่อจุดที่ยังไม่ฟันธง แล้วให้ผู้ใช้เลือก/ยืนยันทีละจุดหรือรวมเป็น Build Plan เดียว
4. ยืนยันแล้ว → (ถ้า archive) ย้ายไฟล์เดิมไป 00-archived/ ก่อน → เรียก subagent tech-stack-writer เขียนไฟล์จริง
5. สรุปผลให้ผู้ใช้ พร้อม traceability + แจ้งเอกสาร conceptual ที่ควร sync ตาม (ถ้ามี)
```

---

## Step 0 — เช็ก Reference ที่มีอยู่ก่อนสัมภาษณ์

1. ตรวจว่ามี `ROADMAP.md` และ `docs/01-requirements/01-spec/FEATURE-LIST.md` หรือไม่ — ถ้าไม่มีหรือมีแค่บางส่วน ให้ทำตามแนวทางเดียวกับ Step 1 ของ `architecture-builder` (หยุดถามผู้ใช้ว่าจะสร้างก่อนหรือทำแบบ ad-hoc)
2. อ่าน `HIGH-LEVEL-ARCHITECTURE.md`, `DATA-MODEL.md`, `API-SPEC.md`, `DETAILED-DESIGN.md` (ถ้ามี) เพื่อดึงรายชื่อ component/entity/operation ที่ต้องมีการเลือก stack รองรับ — ใช้เป็นหัวข้อคำถามในการสัมภาษณ์ ไม่ต้องถามลอยๆ ว่า "ต้องการ stack แบบไหน" โดยไม่มีบริบท
3. อ่าน `ROADMAP.md` เพื่อดึง**ข้อจำกัดที่ยืนยันไว้แล้ว** (fixed constraints) — เช่น ต้องใช้ LINE OA, ต้องใช้ Google Sheet/Drive ชั่วคราวใน Phase 1, ข้อจำกัด PDPA — สิ่งเหล่านี้**ไม่ต้องถามซ้ำในสัมภาษณ์** เพราะตัดสินใจไปแล้ว ให้ระบุไว้ใน Build Plan เป็น "ข้อจำกัดที่รับมาแล้ว" เท่านั้น

---

## Step 1 — สัมภาษณ์ผู้ใช้แบบเข้มข้น (Interview Checklist — บังคับครบทุกหมวด)

**นี่คือหัวใจของ skill นี้ ต่างจาก 4 skill ก่อนหน้าที่ Step 0 แค่ "รับ input เท่าที่มี"** — ที่นี่ต้อง**ถามให้ครบทุกหมวดด้านล่างเชิงรุก** ไม่ใช่รอให้ผู้ใช้บอกเอง (ถ้าผู้ใช้ตอบสั้น/ไม่แน่ใจในหมวดไหน ให้เสนอ ≥3 ตัวเลือกที่เป็นไปได้พร้อมข้อดี-ข้อเสียทันทีในหมวดนั้น แทนการข้ามไป) ใช้ `AskUserQuestion` เป็นชุดๆ ตามหมวด (ไม่ต้องยิงทุกคำถามพร้อมกันจนท่วม — แบ่งเป็นรอบตามหมวดที่สัมพันธ์กัน) หรือถามเป็นข้อความธรรมดาถ้าต้องอธิบายบริบทเยอะ

| หมวด | สิ่งที่ต้องถาม |
|---|---|
| **1. ทีม/ความสามารถ** | ขนาดทีมพัฒนา, ภาษา/framework ที่ทีมถนัดอยู่แล้ว, ความสามารถดูแล infra เอง (DevOps maturity) หรือต้องพึ่ง managed service, แผนดูแลต่อหลังส่งมอบ (ทีมเดิมดูแลต่อ หรือส่งต่อให้หน่วยงานอื่น) |
| **2. งบประมาณ/การจัดซื้อ** | เพดานงบ (ถ้ามี), ชอบ pay-as-you-go หรือ fixed cost, มี license/vendor contract ที่จ่ายแล้วอยู่ก่อน (เช่น Google Workspace, Microsoft 365) ที่ควรใช้ประโยชน์ต่อ |
| **3. Hosting/Deployment** | cloud หรือ on-prem/ศูนย์ข้อมูลราชการ, ข้อกำหนด data residency (ข้อมูลต้องอยู่ในประเทศไทยหรือไม่ตาม PDPA), infra ที่มีอยู่แล้วที่ต้องใช้ต่อ |
| **4. Compliance/ความปลอดภัย** | ข้อกำหนด PDPA เจาะจงของหน่วยงาน (encryption at rest, audit log, retention period), มาตรฐานความปลอดภัยที่หน่วยงานกำหนดไว้แล้ว (ถ้ามี) |
| **5. Scale/Performance** | จำนวนผู้ใช้พร้อมกันที่คาดไว้, ปริมาณข้อมูลที่โต (เคส/รูปภาพสะสมต่อปี), ต้องรองรับ peak load ช่วงระบาดหนักไหม, ข้อกำหนด uptime/SLA |
| **6. AI/ML Service ที่ต้องเลือก** | OCR/Document AI (FEAT-INTAKE-05) เลือก vendor ไหน, Case Clustering (FEAT-ANALYSIS-04) ใช้ library/service สำเร็จรูปหรือสร้างเอง, AI Vision QC (FEAT-CONTROL-05) เลือก vendor ไหน — เทียบกับตัวเลือกที่ ROADMAP.md เคยยกตัวอย่างไว้ (เช่น Google Document AI, Claude/GPT vision) ว่ายืนยันตามนั้นหรือต้องการเทียบตัวเลือกอื่น |
| **7. Frontend/Mobile** | ต่อยอดจาก static HTML/CSS/JS ปัจจุบันด้วย framework ไหน (หรือคงเดิม), ต้องมี native app/PWA/LIFF mini-app ไหม (จำเป็นสำหรับ FEAT-CONTROL-04 tracking ทีมพ่น), browser support ที่ต้องรองรับ |
| **8. Timeline/ความเร่งด่วน** | Phase ไหนต้องเริ่มก่อน, มี deadline ตายตัวไหม |
| **9. วิสัยทัศน์ระยะยาว** | มีแผนขยายให้เทศบาล/หน่วยงานอื่นใช้ร่วม (multi-tenancy) ไหมในอนาคต, ความพร้อมของนักพัฒนาไทยในเทคโนโลยีที่จะเลือก (หา maintainer ทดแทนง่ายไหม) |

> **ข้อจำกัดที่รับมาแล้วจาก ROADMAP.md ไม่ต้องถามซ้ำ**: LINE OA (ช่องทางแจ้งเตือน/รับรูป), Google Sheet/Drive (เก็บข้อมูลชั่วคราว Phase 1), ต้องมี human-in-the-loop สำหรับ OCR/clustering/ปิด alert (ไม่กระทบการเลือก stack แต่กระทบ UX flow ที่ stack ต้องรองรับ)

ถ้าผู้ใช้ตอบว่า "ไม่รู้"/"แนะนำมาเลย" ในหมวดไหน **ห้ามเดาแทนให้เงียบๆ** — ให้เสนอ ≥3 ตัวเลือกพร้อมข้อดี-ข้อเสียในหมวดนั้นทันที (เช่นเดียวกับ Ambiguity Protocol ของ 4 skill ก่อนหน้า) เพื่อให้ผู้ใช้เลือกจากตัวเลือกที่เป็นรูปธรรม แทนการปล่อยคำถามลอยไว้

---

## Step 2 — ตัดสินใจ: แก้ไฟล์เดิมในที่ vs Archive แล้วเขียนใหม่

เอกสารอยู่ที่ `docs/02-design/02-technical/TECH-STACK.md` เป็น**ไฟล์เดี่ยว ไม่มี vN folder** (living document เหมือน `HIGH-LEVEL-ARCHITECTURE.md`)

- **ไม่มีไฟล์นี้เลย (รันครั้งแรก)** — สร้างใหม่ได้เลย
- **มีอยู่แล้ว (รันซ้ำ)** — ถามผู้ใช้ทุกครั้งไม่มีข้อยกเว้น:
  1. **แก้ไฟล์เดิมในที่** — เพิ่ม/ปรับ component ที่ยังไม่เคยตัดสินใจ, อัปเดตเหตุผลของ component ที่เปลี่ยนใจ
  2. **Archive ของเก่าไป `docs/00-archived/TECH-STACK-{YYYY-MM-DD}.md`** แล้วเขียนใหม่ทั้งฉบับ

| แนะนำ | เหมาะกับ |
|---|---|
| **แก้ในที่** | เพิ่ม component ใหม่ที่ยังไม่เคยเลือก stack, เปลี่ยน vendor เฉพาะจุด (เช่น เปลี่ยน OCR vendor) โดยโครงสร้างทีม/budget/hosting เดิมไม่เปลี่ยน |
| **Archive แล้วเขียนใหม่** | เปลี่ยนทิศทางหลัก (เช่น เปลี่ยนจาก cloud เป็น on-prem ทั้งระบบ, เปลี่ยนงบประมาณ/ทีมพัฒนาทั้งชุด) ที่กระทบการตัดสินใจส่วนใหญ่ในไฟล์เดิม |

---

## Step 3 — ตั้งคำแนะนำรายชั้น/component แล้วเสนอให้ยืนยันก่อนเสมอ

**ห้ามสร้าง/แก้ไฟล์ TECH-STACK.md ก่อนผู้ใช้ยืนยันคำแนะนำ** — การเลือก stack ผิดกระทบทุก phase ถัดไปที่สร้างทับไว้ แก้ยากที่สุดในทุกเอกสารของตระกูลนี้

จัดคำแนะนำเป็นตารางต่อ component (อ้างจาก `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md` ถ้ามี หรือจาก `FEATURE-LIST.md` ตรงๆ ถ้าไม่มี) ตัวอย่าง component ที่มักต้องตัดสินใจ:

- Frontend framework/library
- Backend/API runtime + framework
- Database engine
- Auth/Identity provider approach
- Hosting/Infrastructure platform
- OCR/Document AI vendor
- Geocoding vendor
- Case Clustering: library/service หรือสร้างเอง
- AI Vision QC vendor
- Location tracking (LIFF app) tech
- Reporting/BI tool (ROADMAP.md เคยยกตัวอย่าง Looker Studio/Power BI ไว้แล้ว — ยืนยันหรือเทียบใหม่)
- Monitoring/Logging (ถ้าผู้ใช้ต้องการรวมไว้)

ทุก component ที่**ยังไม่ฟันธงจากคำตอบสัมภาษณ์** ต้องเสนอ**≥3 ตัวเลือกพร้อมข้อดี-ข้อเสีย**ของแต่ละตัวเลือกให้ผู้ใช้พิจารณา (ข้อดี-ข้อเสียต้องอิงคำตอบจากสัมภาษณ์จริง เช่น ถ้าทีมถนัด Node.js อยู่แล้ว ตัวเลือกที่ไม่ใช้ Node.js ต้องระบุ trade-off เรื่อง learning curve ไว้ชัด ไม่ใช่แค่ pros/cons ทั่วไปที่ไม่เกี่ยวกับบริบทผู้ใช้)

Build Plan สุดท้ายควรมี:

1. **Scope** — ทั้งระบบครอบทุก Phase (ตามที่ยืนยันเป็นค่าเริ่มต้นของ skill นี้)
2. **สรุปคำตอบสัมภาษณ์ทั้ง 9 หมวด** (ย่อ)
3. **ตารางคำแนะนำต่อ component** — ตัวเลือกที่เลือก + เหตุผลที่อิงคำตอบสัมภาษณ์ + Feature ID ที่เกี่ยวข้อง
4. **ข้อจำกัดที่รับมาแล้ว** (LINE OA, Google Sheet/Drive, PDPA ฯลฯ) — ระบุว่าไม่ได้เกิดจากสัมภาษณ์รอบนี้
5. **Version decision** (จาก Step 2)
6. **เอกสาร conceptual ที่ควร sync ตามหลังยืนยัน** (เช่น "HIGH-LEVEL-ARCHITECTURE.md หัวข้อ Component Breakdown ควรอัปเดตให้ระบุเทคโนโลยีจริงแทน capability-level เดิม")

---

## Step 4 — สร้าง/แก้ไฟล์จริง (delegate ให้ subagent)

1. **ถ้าเลือก archive ใน Step 2** — ย้ายไฟล์เดิมไป `docs/00-archived/` ก่อน (ทำเองใน main loop)
2. เรียก subagent `tech-stack-writer` (ผ่าน Agent tool, `subagent_type: tech-stack-writer`) พร้อมส่ง context ให้ครบ:
   - เนื้อหา `ROADMAP.md`/`FEATURE-LIST.md`/`HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md` ที่เกี่ยวข้อง
   - สรุปคำตอบสัมภาษณ์ทั้ง 9 หมวด
   - Build Plan/ตารางคำแนะนำที่ยืนยันแล้วทั้งหมด
   - Path ปลายทาง (`docs/02-design/02-technical/TECH-STACK.md`)
   - ถ้าเป็นการแก้ไฟล์เดิม: เนื้อหาปัจจุบันทั้งหมด และส่วนที่ต้องแก้/เพิ่มเท่านั้น
3. รอผลจาก subagent แล้วตรวจสอบคร่าวๆ ว่าไฟล์ถูกสร้าง/แก้ครบตามแผนก่อนสรุปให้ผู้ใช้
4. อัปเดต `docs/02-design/02-technical/index.md` ให้มีลิงก์ชี้ไปไฟล์ใหม่ (ถ้าเป็นการสร้างครั้งแรก)

## Step 5 — สรุปผลให้ผู้ใช้

- Path ของไฟล์ที่สร้าง/แก้ (และไฟล์ archive ถ้ามี)
- ตารางคำแนะนำต่อ component ที่ยืนยันแล้ว
- Traceability สรุปย่อ: Feature ID/component ไหน map กับเทคโนโลยีที่เลือก
- **รายชื่อเอกสาร conceptual ที่ควร sync ตาม** (จาก Build Plan ข้อ 6) — ระบุชัดว่ายังไม่ได้ sync ให้เอง ต้องเรียก skill ที่เกี่ยวข้องซ้ำถ้าต้องการ
- Assumption ที่ subagent ตัดสินใจเอง (ถ้ามี) ให้ผู้ใช้ตรวจทาน
- แจ้งว่าเรียก skill นี้ซ้ำได้เมื่อมี component ใหม่หรือต้องเปลี่ยน vendor

---

## อ้างอิงเพิ่มเติม

- `references/tech-stack-template.md` — Template โครงสร้างของ `TECH-STACK.md` (Interview Summary, Component ↔ Technology Table, Decision Rationale, Constraints ที่รับมาแล้ว)
