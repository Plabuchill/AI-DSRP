# TECH-STACK.md — AI Disease Surveillance & Response Platform (AI-DSRP)

> เอกสารนี้ระบุ**เทคโนโลยีจริง**ต่อ component ที่ `HIGH-LEVEL-ARCHITECTURE.md` หัวข้อ 6 (Component Breakdown) เคยพูดถึงแบบ capability-level ไว้ — ต่างจาก `HIGH-LEVEL-ARCHITECTURE.md`/`DATA-MODEL.md`/`API-SPEC.md`/`DETAILED-DESIGN.md` ที่จงใจเลี่ยง tech stack เจาะจง
>
> **Scope ของรอบนี้ (2026-08-26): เฉพาะ Frontend และ Backend/API runtime เท่านั้น** — component อื่นทั้งหมด (Database, Hosting/Infrastructure เจาะจง, Auth/Identity, OCR/Geocoding/Case Clustering/AI Vision vendor, Location tracking, Reporting/BI, Monitoring/Logging) **ยังไม่ผ่านสัมภาษณ์** ระบุไว้ในตารางหัวข้อ 3 เป็นสถานะ backlog เท่านั้น ยังไม่ตัดสินใจ

---

## 1. สรุปผลสัมภาษณ์ (Interview Summary)

สถานะ ณ 2026-08-26 — บางหมวดยังไม่ถามละเอียด (ระบุไว้ตามจริง ไม่เดา):

| หมวด | สรุปคำตอบ |
|---|---|
| 1. ทีม/ความสามารถ | ทีมถนัด JavaScript/TypeScript (Node.js ecosystem) มากที่สุด; มีทีม IT/DevOps ของโรงพยาบาล/เทศบาลดูแล infra เองอยู่แล้ว (ดูแล server/patch/backup ได้) |
| 2. งบประมาณ/การจัดซื้อ | งบจำกัด ต้องการ self-host on-prem/ศูนย์ข้อมูลราชการ (ไม่ใช่ managed cloud pay-as-you-go) |
| 3. Hosting/Deployment | Self-host on-prem/ศูนย์ข้อมูลราชการ; ข้อมูลต้องอยู่ในประเทศไทยเท่านั้น (PDPA data residency) |
| 4. Compliance/ความปลอดภัย | ยังไม่สัมภาษณ์รายละเอียดเจาะจง (encryption at rest, retention period ฯลฯ) — รับ PDPA data residency ทั่วไปมาจากข้อ 3 |
| 5. Scale/Performance | เล็ก (<100 concurrent users, เทศบาลเดียวตามขอบเขต ROADMAP ปัจจุบัน — 4 เขตบริการ, 63 ชุมชน, ทีมสอบสวนโรค 5 ทีม); Real-time sync ของ Dashboard/Alerts (FEAT-ALERT-03, FEAT-REPORT-03) ใช้ polling/refresh ทุก 5-30 วินาทีพอ ไม่ต้อง push จริง (WebSocket/SSE) |
| 6. AI/ML Service | ยังไม่สัมภาษณ์ (นอก scope รอบนี้ตามที่ผู้ใช้ระบุชัด) |
| 7. Frontend/Mobile | ต้องการคง multi-page เหมือน prototype เดิม (ไม่ใช่ SPA) แต่ต้องการ framework/component ช่วยให้เรียบง่าย/reuse ได้ดีกว่าปัจจุบัน (ปัจจุบัน copy-paste HTML/JS ซ้ำ 8 หน้า) |
| 8. Timeline | ยังไม่สัมภาษณ์ |
| 9. วิสัยทัศน์ระยะยาว | ยังไม่สัมภาษณ์รายละเอียด multi-tenancy — แต่ได้คำตอบเรื่อง maturity preference: ต้องการเทคโนโลยีเก่า/เสถียร หา developer ทดแทนง่าย มีเอกสาร/community ไทยเยอะ (มีผลต่อการเลือก stack มากที่สุดรองจาก learning curve ของทีม) |

---

## 2. ข้อจำกัดที่รับมาแล้ว (ไม่ได้เกิดจากสัมภาษณ์รอบนี้)

| ข้อจำกัด | ที่มา |
|---|---|
| ต้องใช้ LINE OA / Messaging API เป็นช่องแจ้งเตือนหลัก (แจ้งทีมสอบสวนโรค, แจ้งเตือน อสม. ล่วงหน้า, รับรูปภาคสนาม) | `ROADMAP.md` Phase 1/4; `HIGH-LEVEL-ARCHITECTURE.md` หัวข้อ 6 (FEAT-INTAKE-08, FEAT-ASM-04) |
| ใช้ Google Sheet/Drive เก็บข้อมูลที่ยืนยันแล้ว + ไฟล์ต้นฉบับ (PDF/JPEG) ชั่วคราวก่อนมี Database จริงใน Phase 7 | `ROADMAP.md` Phase 1; Decision Log ข้อ 1 ใน `HIGH-LEVEL-ARCHITECTURE.md` (FEAT-INTAKE-06) |
| ข้อมูลต้องอยู่ในประเทศไทยเท่านั้น (PDPA data residency) | สัมภาษณ์ข้อ 3 รอบนี้ (self-host on-prem/ศูนย์ข้อมูลราชการ) — ไม่ใช่ข้อจำกัดจาก ROADMAP.md ตรงๆ แต่เป็นเงื่อนไขที่ยืนยันแล้วก่อนเข้าสู่การเลือก stack |
| ต้องมี human-in-the-loop บังคับสำหรับ OCR/clustering/ปิด alert | `ROADMAP.md`; ไม่กระทบการเลือก Frontend/Backend stack โดยตรง แต่กระทบ UX flow ที่ stack ต้องรองรับ (เช่น ต้องมีหน้า review/confirm ก่อน commit ข้อมูล) |

---

## 3. ตาราง Component ↔ เทคโนโลยีที่เลือก

| Component | เทคโนโลยีที่เลือก | เหตุผล (อิงสัมภาษณ์) | ตัวเลือกอื่นที่พิจารณา | Feature ID |
|---|---|---|---|---|
| Frontend framework | **Vanilla JS + Node.js/EJS (หรือ Handlebars) partials** — multi-page app (MPA) ต่อยอดจาก `prototypes/v1/` โดยแยก HTML ที่ซ้ำ 8 หน้าออกเป็น partial/include | ทีมรู้ Vanilla JS อยู่แล้ว 100% (Learning curve สูงสุด, น้ำหนัก 30%); ตอบโจทย์ที่ต้องการ "คง multi-page เหมือนเดิมแต่ลด copy-paste ด้วย component/partial" (สัมภาษณ์ข้อ 7); ไม่มี build step เพิ่ม เข้ากับ self-host on-prem ที่ทีม IT เดิมดูแล (สัมภาษณ์ข้อ 1, 2, 3); ใช้ runtime เดียวกับ backend (Node.js) ทำให้ทั้ง stack เป็นภาษา/runtime เดียว (JS/TS) ลดภาระดูแลของทีม IT เดิมตามที่ยืนยันไว้ (สัมภาษณ์ข้อ 1) | jQuery + Bootstrap (คะแนน 4.25), Alpine.js + htmx (3.95), Vue.js 3 per-page (3.90), Astro (3.60) — ดู Decision Rationale หัวข้อ 4 | FEAT-DASH, FEAT-INTAKE, FEAT-ANALYSIS, FEAT-CONTROL, FEAT-TRACK, FEAT-ASM, FEAT-REPORT, FEAT-ALERT |
| Backend/API runtime + framework | **Node.js + Express (หรือ Fastify)** | ทีมถนัด JS/TS อยู่แล้ว (Learning curve สูงสุด, น้ำหนัก 30%, สอดคล้องสัมภาษณ์ข้อ 1); self-host ง่ายที่สุดในกลุ่มที่พิจารณา เข้ากับเงื่อนไข self-host on-prem/ศูนย์ข้อมูลราชการที่ยืนยันแล้ว (สัมภาษณ์ข้อ 2, 3); scale ที่ต้องรองรับเล็ก (<100 concurrent users, polling 5-30 วินาทีพอ ไม่ต้อง WebSocket/SSE จริง — สัมภาษณ์ข้อ 5) ไม่จำเป็นต้องใช้ framework ที่หนักกว่านี้; ใช้ภาษาเดียวกับ frontend (JS/TS) ตลอด stack ลดความซับซ้อนการดูแลระยะยาวโดยทีม IT เดิม | Node.js + NestJS (คะแนน 4.05), PHP + Laravel (3.90), .NET Core (C#) (3.90), Python + Django (3.65), Java + Spring Boot (3.40) — ดู Decision Rationale หัวข้อ 4 | FEAT-PLATFORM-01 |
| Database engine | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — (DATA-MODEL.md ระบุลักษณะข้อมูลเป็น relational เรียบง่าย มี soft-delete/audit snapshot ซึ่งจะใช้ประกอบการเลือกในรอบสัมภาษณ์ถัดไป แต่ยังไม่ตัดสินใจ) | — | FEAT-PLATFORM-03 |
| Auth/Identity provider | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-PLATFORM-02 |
| Hosting/Infrastructure platform (เจาะจง) | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* (ทราบเพียงแนวทางกว้าง: self-host on-prem/ศูนย์ข้อมูลราชการ ในประเทศไทย — ดูหัวข้อ 2) | — | — | FEAT-PLATFORM-01 |
| OCR/Document AI vendor | *ยังไม่สัมภาษณ์ (นอก scope รอบนี้) — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-INTAKE-05 |
| Geocoding vendor | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-INTAKE-07 |
| Case Clustering (library/service) | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-ANALYSIS-04 |
| AI Vision QC vendor | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-CONTROL-05 |
| Location tracking (LIFF app) tech | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-CONTROL-04 |
| Reporting/BI tool | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-REPORT-03 |
| Monitoring/Logging | *ยังไม่สัมภาษณ์ — backlog รอสัมภาษณ์รอบหน้า* | — | — | FEAT-PLATFORM-01 |

---

## 4. Decision Rationale — จุดที่เคยมีทางเลือก ≥3 ทาง

### 4.1 Backend/API runtime + framework

Weighted Scoring Model (น้ำหนัก: Learning curve ทีม 30%, Maturity/Thai talent 25%, Self-host simplicity 20%, Security/PDPA ecosystem 15%, Scale adequacy 10%):

| ตัวเลือก | Learning curve | Maturity/Thai talent | Self-host simplicity | Security/PDPA ecosystem | Scale | คะแนนรวม |
|---|---|---|---|---|---|---|
| **Node.js + Express/Fastify** | 5 | 4 | 5 | 3 | 5 | **4.45 (เลือก)** |
| Node.js + NestJS | 4 | 3 | 5 | 4 | 5 | 4.05 |
| PHP + Laravel | 2 | 5 | 4 | 5 | 5 | 3.90 |
| .NET Core (C#) | 2 | 5 | 4 | 5 | 5 | 3.90 |
| Python + Django | 2 | 4 | 4 | 5 | 5 | 3.65 |
| Java + Spring Boot | 1 | 5 | 3 | 5 | 5 | 3.40 |

**ทางที่เลือก**: Node.js + Express (หรือ Fastify)

**เหตุผล**: ทีมถนัด JS/TS อยู่แล้ว (คะแนนสูงสุดด้าน learning curve ซึ่งมีน้ำหนักมากที่สุด), self-host ง่ายที่สุด (เข้ากับ self-host on-prem ที่ยืนยันไว้), ใช้ภาษาเดียวกับ frontend ทั้ง stack ลดความซับซ้อนการดูแลระยะยาวโดยทีม IT เดิม

**Trade-off ที่ต้องบันทึกไว้ (open question)**: Laravel/.NET Core/Spring Boot มีคะแนนใกล้เคียงกันเพราะเป็น stack ที่หน่วยงานราชการไทยคุ้นเคย/มีผู้รับเหมาพร้อมทำต่อมากกว่า Node.js — **ถ้ามีแผนส่งต่อให้ผู้รับเหมาภายนอกดูแลในอนาคต (ไม่ใช่ทีม IT เดิม) อาจพลิกน้ำหนักได้** ต้องยืนยันเพิ่มถ้ายังไม่แน่ใจ (สัมภาษณ์ข้อ 1 ถามเรื่อง "แผนดูแลต่อหลังส่งมอบ" ไว้เพียงว่า "ทีม IT เดิมดูแลได้" แต่ไม่ได้ยืนยันชัดว่าจะไม่ส่งต่อให้ผู้รับเหมาภายนอกในอนาคต)

### 4.2 Frontend framework

Weighted Scoring Model (น้ำหนัก: Learning curve ทีม 30%, MPA+Component fit 25%, Maturity/Thai talent 25%, Self-host simplicity 15%, Scale adequacy 5%):

| ตัวเลือก | Learning curve | MPA+Component fit | Maturity/Thai talent | Self-host simplicity | Scale | คะแนนรวม |
|---|---|---|---|---|---|---|
| **Vanilla JS + Node/EJS partials** | 5 | 3 | 5 | 5 | 5 | **4.50 (เลือก)** |
| jQuery + Bootstrap | 5 | 2 | 5 | 5 | 5 | 4.25 |
| Alpine.js + htmx | 4 | 4 | 3 | 5 | 5 | 3.95 |
| Vue.js 3 (per-page, ไม่ใช้ SPA router) | 4 | 4 | 4 | 3 | 5 | 3.90 |
| Astro | 3 | 5 | 3 | 3 | 5 | 3.60 |

**ทางที่เลือก**: Vanilla JS + Node.js/EJS (หรือ Handlebars) partials

**เหตุผล**: คะแนนสูงสุด, ทีมรู้อยู่แล้ว 100%, ใช้ partial/include (EJS) แทนการ copy-paste HTML ซ้ำ 8 หน้าแบบปัจจุบัน (ตอบโจทย์ "component/reuse" ที่ขอมา), ไม่มี build step เพิ่ม self-host ง่ายสุด, ใช้ runtime เดียวกับ backend (Node.js) ทำให้ทั้ง stack เป็นภาษาเดียว (JS/TS) ตลอด

**Trade-off ที่ต้องบันทึกไว้ (open question)**: component reuse ยังหยาบกว่า framework จริงอย่าง Vue/Astro (ไม่มี reactivity/state management ในตัว) — ถ้าในอนาคต UI ซับซ้อนขึ้นมากอาจต้องพิจารณา Vue.js ใหม่

---

## 5. เอกสาร Conceptual ที่ควร Sync ตาม

> **ยังไม่ sync ให้เองในรอบนี้** — ต้องเรียก skill/subagent ของเอกสารนั้นแยกเพื่อทำการ sync จริง

| เอกสาร | หัวข้อที่ควรอัปเดต |
|---|---|
| `HIGH-LEVEL-ARCHITECTURE.md` | หัวข้อ 6 (Component Breakdown) — แถว "Web App (Frontend)" ควรเพิ่มระบุ "Vanilla JS + Node.js/EJS partials"; แถว "API Server" ควรเพิ่มระบุ "Node.js + Express/Fastify" |
| `DATA-MODEL.md` | ยังไม่ต้อง sync รอบนี้ — Database engine ยังไม่ยืนยัน (backlog ในตารางหัวข้อ 3) |
| `API-SPEC.md` | ยังไม่ต้อง sync รอบนี้ — protocol จริง (REST/GraphQL) ยังไม่อยู่ใน scope การสัมภาษณ์รอบนี้ (อยู่ในความรับผิดชอบของ Backend/API runtime ที่เพิ่งยืนยัน แต่ยังไม่มีการยืนยันเจาะจงเรื่อง protocol) |

---

## Assumption ที่ผู้เขียนตัดสินใจเอง (ให้ผู้ใช้ตรวจทาน)

- ระบุ "Express (หรือ Fastify)" และ "EJS (หรือ Handlebars)" เป็นคู่ตัวเลือกย่อยตามที่ Build Plan เขียนไว้ (ไม่ได้ฟันธงเจาะจงตัวเดียวในตัวเลือกย่อยนี้) เพราะ Build Plan ที่ได้รับมาระบุไว้เป็นคู่ทั้งสองจุดโดยไม่ได้ชี้ขาดตัวเดียว — ถ้าต้องการฟันธงเจาะจง (เช่น Express อย่างเดียว) ควรยืนยันเพิ่มในสัมภาษณ์รอบหน้าหรือแจ้งกลับให้แก้ไฟล์นี้
