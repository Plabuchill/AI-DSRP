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
| 2. งบประมาณ/การจัดซื้อ | งบจำกัด แต่**เปิดรับ managed cloud pay-as-you-go ได้แล้ว** (เปลี่ยนจากที่เคยยืนยันไว้ก่อนหน้าว่าต้อง self-host on-prem เท่านั้น — ยืนยันใหม่ 2026-09-06 เนื่องจากมี Firebase project จริง "ai-dsrp" อยู่แล้วและต้องการใช้ประโยชน์จากโครงสร้างที่มีอยู่) |
| 3. Hosting/Deployment | **Managed cloud (Firebase/Google Cloud)** — เปลี่ยนจาก self-host on-prem ที่เคยยืนยันไว้ (ยืนยันใหม่ 2026-09-06); ยอมรับว่าข้อมูลอาจไม่ได้อยู่ในประเทศไทย (Google Cloud region ที่ใกล้ที่สุดคือ `asia-southeast1` สิงคโปร์ — ไม่มี region ในไทย) **ต้องทบทวน PDPA compliance เจาะจงเพิ่มเติมก่อนใช้งานจริงกับข้อมูลสุขภาพ** (encryption at rest, ข้อตกลงประมวลผลข้อมูลกับ Google, retention policy) — ยังไม่ได้ทบทวนในรอบนี้ ถือเป็น open item |
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
| ~~ข้อมูลต้องอยู่ในประเทศไทยเท่านั้น (PDPA data residency)~~ | **เงื่อนไขนี้ถูกพลิกกลับแล้ว** ในสัมภาษณ์หมวด 2/3 รอบ 2026-09-06 (เปลี่ยนไปใช้ managed cloud/Firebase ซึ่งไม่มี region ในไทย) — ไม่ใช่ข้อจำกัดที่ยึดอยู่แล้วอีกต่อไป เดิมมาจากสัมภาษณ์ข้อ 3 รอบ 2026-08-26 (self-host on-prem/ศูนย์ข้อมูลราชการ) ดู Assumption ท้ายไฟล์สำหรับ open item เรื่อง PDPA compliance ที่ยังไม่ได้ทบทวน |
| ต้องมี human-in-the-loop บังคับสำหรับ OCR/clustering/ปิด alert | `ROADMAP.md`; ไม่กระทบการเลือก Frontend/Backend stack โดยตรง แต่กระทบ UX flow ที่ stack ต้องรองรับ (เช่น ต้องมีหน้า review/confirm ก่อน commit ข้อมูล) |

---

## 3. ตาราง Component ↔ เทคโนโลยีที่เลือก

| Component | เทคโนโลยีที่เลือก | เหตุผล (อิงสัมภาษณ์) | ตัวเลือกอื่นที่พิจารณา | Feature ID |
|---|---|---|---|---|
| Frontend framework | **Vanilla JS + Node.js/EJS (หรือ Handlebars) partials** — multi-page app (MPA) ต่อยอดจาก `prototypes/v1/` โดยแยก HTML ที่ซ้ำ 8 หน้าออกเป็น partial/include | ทีมรู้ Vanilla JS อยู่แล้ว 100% (Learning curve สูงสุด, น้ำหนัก 30%); ตอบโจทย์ที่ต้องการ "คง multi-page เหมือนเดิมแต่ลด copy-paste ด้วย component/partial" (สัมภาษณ์ข้อ 7); ไม่มี build step เพิ่ม เข้ากับ self-host on-prem ที่ทีม IT เดิมดูแล (สัมภาษณ์ข้อ 1, 2, 3); ใช้ runtime เดียวกับ backend (Node.js) ทำให้ทั้ง stack เป็นภาษา/runtime เดียว (JS/TS) ลดภาระดูแลของทีม IT เดิมตามที่ยืนยันไว้ (สัมภาษณ์ข้อ 1) | jQuery + Bootstrap (คะแนน 4.25), Alpine.js + htmx (3.95), Vue.js 3 per-page (3.90), Astro (3.60) — ดู Decision Rationale หัวข้อ 4 | FEAT-DASH, FEAT-INTAKE, FEAT-ANALYSIS, FEAT-CONTROL, FEAT-TRACK, FEAT-ASM, FEAT-REPORT, FEAT-ALERT |
| Backend/API runtime + framework | **Node.js + Express (หรือ Fastify)** | ทีมถนัด JS/TS อยู่แล้ว (Learning curve สูงสุด, น้ำหนัก 30%, สอดคล้องสัมภาษณ์ข้อ 1); self-host ง่ายที่สุดในกลุ่มที่พิจารณา เข้ากับเงื่อนไข self-host on-prem/ศูนย์ข้อมูลราชการที่ยืนยันแล้ว (สัมภาษณ์ข้อ 2, 3); scale ที่ต้องรองรับเล็ก (<100 concurrent users, polling 5-30 วินาทีพอ ไม่ต้อง WebSocket/SSE จริง — สัมภาษณ์ข้อ 5) ไม่จำเป็นต้องใช้ framework ที่หนักกว่านี้; ใช้ภาษาเดียวกับ frontend (JS/TS) ตลอด stack ลดความซับซ้อนการดูแลระยะยาวโดยทีม IT เดิม | Node.js + NestJS (คะแนน 4.05), PHP + Laravel (3.90), .NET Core (C#) (3.90), Python + Django (3.65), Java + Spring Boot (3.40) — ดู Decision Rationale หัวข้อ 4 | FEAT-PLATFORM-01 |
| Database engine | **Firebase Firestore** (มี Firebase project จริงชื่อ "ai-dsrp" อยู่แล้ว) | มี infrastructure พร้อมใช้งานจริงอยู่แล้ว (ลด setup cost); NoSQL เข้ากับความต้องการ real-time sync ของ Dashboard/Alert (FEAT-DASH, FEAT-ALERT-03, FEAT-REPORT-03 — เดิมสัมภาษณ์ไว้ว่า polling 5-30 วิพอ แต่ Firestore ให้ real-time listener มาฟรีโดยไม่ต้องเขียน WebSocket/SSE เอง) โดยไม่ต้องเพิ่มต้นทุน infra | PostgreSQL (self-hosted) (คะแนน — ดู Decision Rationale หัวข้อ 4.3), MongoDB Atlas (ดู Decision Rationale หัวข้อ 4.3) — ดู Decision Rationale หัวข้อ 4.3 | FEAT-PLATFORM-03 |
| Auth/Identity provider | **Firebase Authentication (Email/Password)** | อยู่ใน Firebase ecosystem เดียวกับ Firestore/Hosting ที่ยืนยันไปแล้ว ไม่ต้องเพิ่ม vendor ใหม่; มี Web SDK พร้อมใช้งานร่วมกับ Firestore ได้ทันที; Firestore Security Rules อ้าง `request.auth` ได้ตรงๆ โดยไม่ต้องเชื่อมระบบ auth แยกต่างหาก; ทีมถนัด JS/TS อยู่แล้ว (สัมภาษณ์ข้อ 1) ใช้ SDK ได้ทันที | Custom auth (Node/Express + JWT/session เอง) (คะแนน 3.10), Auth0 (คะแนน 2.65) — ดู Decision Rationale หัวข้อ 4.4 | FEAT-PLATFORM-02 |
| Hosting/Infrastructure platform (เจาะจง) | **Firebase Hosting (หรือ Cloud Run สำหรับ backend ที่ซับซ้อนกว่า) + Cloud Functions** | จับคู่ Firebase ecosystem เดียวกับ Firestore ที่เพิ่งยืนยัน ลดความซับซ้อนการดูแล/จัดการ credential แยกส่วน; ยังคงใช้ Node.js (Cloud Functions รองรับ Node.js runtime) สอดคล้องกับ Backend/API runtime ที่ยืนยันไว้ก่อนหน้า (Node.js + Express/Fastify) — หมายเหตุ: Cloud Functions มีข้อจำกัดเรื่อง cold start/execution time เทียบกับ self-host VM แบบเดิมที่เคยวางแผนไว้ ต้องพิจารณาถ้ามี long-running job (เช่น batch report generation) | — | FEAT-PLATFORM-01 |
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

### 4.3 Database engine

Weighted Scoring Model (น้ำหนัก: Setup cost/ทีมมี infra พร้อมแล้ว 30%, Fit กับ real-time sync requirement 25%, Data residency/PDPA 20%, Fit กับ DATA-MODEL.md ที่ออกแบบเป็น relational เรียบง่าย มี soft-delete/audit snapshot 15%, Learning curve ทีม JS/TS 10%):

| ตัวเลือก | Setup cost/infra พร้อม | Real-time sync fit | Data residency/PDPA | Fit กับ DATA-MODEL (relational/soft-delete/audit) | Learning curve ทีม JS/TS | คะแนนรวม |
|---|---|---|---|---|---|---|
| **Firebase Firestore** | 5 | 5 | 1 | 2 | 5 | **3.75 (เลือก)** |
| PostgreSQL (self-hosted) | 2 | 2 | 5 | 5 | 3 | 3.15 |
| MongoDB Atlas | 2 | 3 | 2 | 2 | 4 | 2.45 |

**ทางที่เลือก**: Firebase Firestore

**เหตุผล**: มี Firebase project จริงชื่อ "ai-dsrp" อยู่แล้ว (คะแนนสูงสุดด้าน setup cost ซึ่งมีน้ำหนักมากที่สุด) — ลด setup cost ได้ทันทีโดยไม่ต้องตั้ง infra ใหม่; ให้ real-time listener มาในตัวโดยไม่ต้องเขียน WebSocket/SSE เอง ตอบโจทย์ real-time sync ของ Dashboard/Alert ได้ดีกว่าตัวเลือกอื่น; ทีมใช้ JS/TS อยู่แล้วและ Firestore มี JS SDK ที่เข้ากับ stack ปัจจุบันโดยตรง

**Trade-off ที่ต้องบันทึกไว้ (open question)** — ระบุตรงไปตรงมา ไม่ปัดตกจุดอ่อน:
- **Data residency/PDPA (คะแนนต่ำสุด = 1)**: Firestore/Google Cloud ไม่มี region ในประเทศไทย (region ที่ใกล้ที่สุดคือ `asia-southeast1` สิงคโปร์) ขณะที่ PostgreSQL (self-hosted) ทำ data residency ในไทยได้เต็มรูปแบบ (คะแนน 5) — นี่คือการพลิกกลับเงื่อนไข PDPA data residency ที่เคยยืนยันไว้ก่อนหน้า (ดู Assumption ท้ายไฟล์) **ต้องทบทวน PDPA compliance เจาะจงเพิ่มเติมก่อนใช้งานจริงกับข้อมูลสุขภาพ** เป็น open item ที่ยังไม่ได้ทบทวนในรอบนี้
- **Fit กับ DATA-MODEL.md (คะแนนต่ำ = 2)**: `DATA-MODEL.md` ออกแบบเป็น relational เรียบง่าย มี soft-delete/audit snapshot ซึ่งเข้ากับ PostgreSQL โดยตรง (คะแนน 5) แต่ Firestore เป็น NoSQL/document-based ต้อง denormalize schema เพิ่มเติม (เช่น การจัดการ relation ระหว่าง entity, soft-delete flag, audit snapshot ต้องออกแบบใหม่ในรูปแบบ document) — ยังไม่ sync การเปลี่ยนแปลงนี้เข้า `DATA-MODEL.md` ในรอบนี้ (ดูหัวข้อ 5)

### 4.4 Auth/Identity provider

Weighted Scoring Model (น้ำหนัก: Ecosystem fit กับ Firestore/Hosting ที่ยืนยันแล้ว 35%, Learning curve ทีม JS/TS 25%, ต้นทุน/ไม่ต้องเพิ่ม vendor ใหม่ 20%, Maturity/community 20%):

| ตัวเลือก | Ecosystem fit | Learning curve | ต้นทุน/ไม่เพิ่ม vendor | Maturity/community | คะแนนรวม |
|---|---|---|---|---|---|
| **Firebase Authentication** | 5 | 5 | 5 | 4 | **4.80 (เลือก)** |
| Custom auth (Node/Express + JWT/session เอง) | 2 | 4 | 3 | 4 | 3.10 |
| Auth0 | 2 | 3 | 1 | 5 | 2.65 |

**ทางที่เลือก**: Firebase Authentication (Email/Password)

**เหตุผล**: คะแนนสูงสุดชัดเจนในทุกเกณฑ์ที่มีน้ำหนักมาก — อยู่ใน Firebase ecosystem เดียวกับ Firestore/Hosting ที่ยืนยันไปแล้ว (ไม่ต้องเพิ่ม vendor ใหม่, ไม่ต้องเชื่อมระบบ auth แยกต่างหาก), Firestore Security Rules อ้าง `request.auth` ได้ตรงๆ, ทีมถนัด JS/TS อยู่แล้วใช้ Web SDK ได้ทันที (สัมภาษณ์ข้อ 1), ไม่มีต้นทุน vendor เพิ่มเติมเพราะใช้ project "ai-dsrp" ที่มีอยู่แล้ว

**Trade-off ที่ต้องบันทึกไว้ (open question)**: Firebase Authentication ผูกกับ Google Cloud ecosystem เดียวกับ Firestore ที่เลือกไปแล้ว — ถ้าในอนาคตต้องการย้ายออกจาก Firebase ทั้งระบบ (เช่น กลับไป self-host เพื่อแก้ปัญหา data residency/PDPA ที่เป็น open item อยู่แล้วในหัวข้อ 4.3) จะต้องย้าย auth ออกไปพร้อมกันด้วย ไม่สามารถแยกย้ายทีละส่วนได้ง่าย (vendor lock-in ซ้อนกันทั้ง database และ auth); Custom auth ได้คะแนนต้นทุนต่ำกว่าเพราะแม้ไม่มีค่า vendor แต่มีภาระวิศวกรรม/ความเสี่ยงด้านความปลอดภัยที่ต้องดูแลเอง (session/JWT management, password hashing, token revocation); Auth0 ได้คะแนน maturity สูงสุดแต่ตกด้านต้นทุนเพราะเป็นการเพิ่ม vendor ใหม่นอก ecosystem ที่ยืนยันไว้แล้ว

---

## 5. เอกสาร Conceptual ที่ควร Sync ตาม

> **ยังไม่ sync ให้เองในรอบนี้** — ต้องเรียก skill/subagent ของเอกสารนั้นแยกเพื่อทำการ sync จริง

| เอกสาร | หัวข้อที่ควรอัปเดต |
|---|---|
| `HIGH-LEVEL-ARCHITECTURE.md` | หัวข้อ 6 (Component Breakdown) — แถว "Web App (Frontend)" ควรเพิ่มระบุ "Vanilla JS + Node.js/EJS partials"; แถว "API Server" ควรเพิ่มระบุ "Node.js + Express/Fastify"; แถว Hosting/Infrastructure ควรเพิ่มระบุ "Firebase Hosting (หรือ Cloud Run) + Cloud Functions" ตามที่ยืนยันใหม่ 2026-09-06; แถว **"Auth / Role-based Access" ควรเพิ่มระบุ "Firebase Authentication (Email/Password)"** ตามที่ยืนยันใหม่ 2026-09-07 |
| `DATA-MODEL.md` | Database engine ยืนยันเป็น Firestore แล้ว — ควรเพิ่มคอลัมน์ Native Type ใน Entity Dictionary ตาม convention ของเอกสาร (เช่น string→Firestore string field, reference→Firestore document reference หรือ denormalized field) โดยเฉพาะ entity ใหม่ `SURVEILLANCE_REPORT_506`/`REPORT_506_APPROVAL_LOG` และ entity อื่นทั้งหมด — ยังไม่ sync ให้เองในรอบนี้; **entity `USER`** (ที่มี Gap note เดิมเรื่อง "ยังไม่มี USER/role entity ที่เป็นทางการ") ควรทบทวนใหม่เพราะตอนนี้มี Auth จริงแล้ว (Firebase Authentication ยืนยัน 2026-09-07) — ควรพิจารณาว่าจะผูก Firebase Auth UID เข้ากับ document ID ของ `users` collection หรือเก็บเป็น field ใหม่แยกต่างหาก (ยังไม่ตัดสินใจในรอบนี้ ต้องเรียก `data-contract-builder` แยก) |
| `API-SPEC.md` | ยังไม่ต้อง sync รอบนี้ — protocol จริง (REST/GraphQL) ยังไม่อยู่ใน scope การสัมภาษณ์รอบนี้ (อยู่ในความรับผิดชอบของ Backend/API runtime ที่เพิ่งยืนยัน แต่ยังไม่มีการยืนยันเจาะจงเรื่อง protocol) |

---

## Assumption ที่ผู้เขียนตัดสินใจเอง (ให้ผู้ใช้ตรวจทาน)

- ระบุ "Express (หรือ Fastify)" และ "EJS (หรือ Handlebars)" เป็นคู่ตัวเลือกย่อยตามที่ Build Plan เขียนไว้ (ไม่ได้ฟันธงเจาะจงตัวเดียวในตัวเลือกย่อยนี้) เพราะ Build Plan ที่ได้รับมาระบุไว้เป็นคู่ทั้งสองจุดโดยไม่ได้ชี้ขาดตัวเดียว — ถ้าต้องการฟันธงเจาะจง (เช่น Express อย่างเดียว) ควรยืนยันเพิ่มในสัมภาษณ์รอบหน้าหรือแจ้งกลับให้แก้ไฟล์นี้
- การเปลี่ยนจาก self-host/data-residency-ไทย เป็น managed cloud (Firebase) เป็นการพลิกกลับเงื่อนไขที่เคยยืนยันไว้ในสัมภาษณ์รอบก่อน (2026-08-26) — ยังไม่มีการทบทวน PDPA compliance เจาะจงสำหรับข้อมูลอยู่นอกประเทศ (encryption at rest, DPA กับ Google, retention) เป็น **open item ที่ต้องสัมภาษณ์เพิ่มเติมก่อนใช้งานจริงกับข้อมูลสุขภาพ** — ไม่ใช่การอนุมัติ compliance ให้เองในรอบนี้
