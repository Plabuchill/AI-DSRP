# CLAUDE.md — AI Disease Surveillance & Response Platform (AI-DSRP)

คำสั่งนี้มีผลกับทุก session ของ Claude Code ที่ทำงานในโปรเจกต์นี้ — เขียนขึ้นเพื่อกันไม่ให้ session ในอนาคต (รวมถึง session นี้เอง) ทำผิด convention ที่ตกลงไว้แล้ว โดยเฉพาะเรื่องตำแหน่งไฟล์เอกสาร ซึ่งเคยผิดพลาดมาแล้วจริงจนไฟล์ root หายไปชั่วคราว (ดูหัวข้อ Docs Structure ด้านล่าง)

## 1. Docs Structure — `docs/` เป็น index-only เท่านั้น

`docs/` แต่ละโฟลเดอร์มีไฟล์ `index.md` ทำหน้าที่**สรุป/ชี้ทาง**ไปยังเอกสารจริงเท่านั้น **ไม่ใช่ที่เก็บเอกสาร canonical**

ไฟล์ canonical จริงอยู่ที่:

- **Root ของโปรเจกต์**: [`DESIGN.md`](./DESIGN.md) (Design System), [`ROADMAP.md`](./ROADMAP.md) (แผนงานตามเฟส)
- **`prototypes/vN/`**: prototype แต่ละเวอร์ชัน (`index.html`, feature pages, `BUILD-PLAN.md`)
- **`docs/02-design/02-technical/`**: เอกสาร technical design — `HIGH-LEVEL-ARCHITECTURE.md`, `DATA-MODEL.md`, `API-SPEC.md`, `DETAILED-DESIGN.md` (ถ้ามี), `TECH-STACK.md` (ถ้ามี — เอกสารเดียวที่ยืนยันเทคโนโลยีจริง ดูข้อ 4), ADR แยกไฟล์ (ถ้ามี)
- **`docs/03-testing/01-test-plan/vN/`**: เอกสาร QA แต่ละเวอร์ชัน (`TEST-PLAN.md`, `ACCEPTANCE-CRITERIA.md`, `TEST-CASES.xlsx`, `BUILD-PLAN.md`)
- **`docs/02-design/01-prototypes/`**: User Journey docs (`USER-JOURNEY-*.md`)
- **`docs/01-requirements/03-task/`**: `TASK-LIST.md` (ถ้ามี — task breakdown ต่อ phase, living document)

**ห้ามก็อปปี้เนื้อหาไฟล์ canonical มาซ้ำไว้ใน `docs/` โดยตรง** — ให้ `index.md` ลิงก์ไปที่ไฟล์จริงเท่านั้น (ใช้ wikilink `[[../../../ROADMAP.md|ROADMAP.md]]` ตาม convention เดิม) เพื่อไม่ให้มีเนื้อหา 2 ชุดที่อาจไม่ตรงกัน

> เหตุผล: เคยเกิดเหตุการณ์ (2026-08-23) ที่ไฟล์ root ถูกเข้าใจผิดว่าควรย้ายเข้า `docs/` ระหว่างจัดเรียงเอกสาร ทำให้ไฟล์ canonical หายไปจากที่ที่ทุกอย่างอ้างอิงถึงอยู่ชั่วคราว ก่อนแก้กลับ — ห้ามให้เกิดซ้ำ

## 2. Traceability — ทุกเอกสารต้องโยงกลับ Feature ID ได้

- Feature ID มีรูปแบบ `FEAT-<โมดูล>-NN` (เช่น `FEAT-DASH-07`) กำหนดไว้ที่ [`docs/01-requirements/01-spec/FEATURE-LIST.md`](./docs/01-requirements/01-spec/FEATURE-LIST.md) เท่านั้น
- ก่อนเขียน/แก้เอกสาร design หรือ QA ใดๆ ต้องเช็ก [`ROADMAP.md`](./ROADMAP.md) และ `FEATURE-LIST.md` ก่อนเสมอ — **ห้ามเดา Feature ID หรือ Phase ขึ้นเองใหม่** ถ้าไม่มีให้หยุดถามผู้ใช้ก่อน (จะสร้างเอกสารต้นทางก่อน หรือทำแบบ ad-hoc พร้อม flag ว่ายังไม่ผ่าน traceability เต็มรูปแบบ)
- ทุก component/entity/operation/flow ในเอกสาร design ต้องมีแถวอ้างอิง Feature ID ในตารางประกอบ — ถ้าไม่มี ID ตรง ให้ตั้งชื่ออ้างอิงที่สื่อความหมายแทนการปล่อยลอย

## 3. Living Document vs Versioned Document — อย่าสับสน 2 pattern นี้

โปรเจกต์นี้ใช้ 2 pattern คู่กัน แยกกันชัดเจนตามประเภทเอกสาร **ห้ามใช้ผิด pattern**:

| ประเภท | Pattern | ตัวอย่าง |
|---|---|---|
| **Versioned** (สร้าง version ใหม่ได้เรื่อยๆ) | โฟลเดอร์ `vN/` แยกตามรอบงาน, ของเก่าไม่ถูกแทนที่ | `prototypes/v1/`, `docs/03-testing/01-test-plan/v1/` |
| **Living document** (ไฟล์เดี่ยว ไม่มี `vN`) | แก้ไฟล์เดิมในที่ตามค่าเริ่มต้น หรือย้ายของเก่าไป `docs/00-archived/` (ตั้งชื่อ `{ชื่อไฟล์}-{YYYY-MM-DD}.md`) แล้วเขียนใหม่ทั้งฉบับเมื่อทิศทางหลักเปลี่ยน — **ต้องถามผู้ใช้ทุกครั้งที่มีไฟล์เดิมอยู่แล้วว่าจะเลือกทางไหน ไม่ตัดสินใจเอง** | `docs/02-design/02-technical/HIGH-LEVEL-ARCHITECTURE.md`, `DATA-MODEL.md`, `API-SPEC.md`, `DETAILED-DESIGN.md`, `TECH-STACK.md`, `docs/01-requirements/03-task/TASK-LIST.md` |

> **ข้อยกเว้นของ `ROADMAP.md`**: เป็น living document ที่ root เหมือนกัน แต่เป็นไฟล์ root canonical เดี่ยว (ดูข้อ 1) — **แก้ในที่เป็นค่าเริ่มต้นเสมอ ห้ามย้ายเข้า `docs/`** ถ้าต้อง archive ระหว่างปรับโครงใหญ่ ให้**คัดลอกสำเนา**ไป `docs/00-archived/ROADMAP-{YYYY-MM-DD}.md` แล้วเขียนทับไฟล์ต้นฉบับที่ root ใหม่ (ไม่ใช่ย้ายต้นฉบับออก)

ห้ามลบไฟล์เอกสารที่เลิกใช้ทิ้งตรงๆ — ย้ายไปเก็บที่ [`docs/00-archived/`](./docs/00-archived/index.md) เสมอ เพื่อรักษาประวัติการตัดสินใจ

## 4. Conceptual-first — เอกสาร design ทุกชิ้นต้องไม่ผูกกับ technical stack ก่อน

`HIGH-LEVEL-ARCHITECTURE.md`, `DATA-MODEL.md`, `API-SPEC.md`, `DETAILED-DESIGN.md` ทั้งหมดต้องอยู่ระดับ**แนวคิด (conceptual)**:

- ห้ามระบุ database engine, ภาษาโปรแกรม, framework, cloud provider, protocol (REST/GraphQL) เจาะจง **เว้นแต่ผู้ใช้ยืนยันมาชัดเจนแล้ว**
- ใช้คำอธิบายเชิงบทบาท/หน้าที่แทน (เช่น "Database" ไม่ใช่ "PostgreSQL", "บริการจัดเก็บไฟล์" ไม่ใช่ "AWS S3")
- ข้อยกเว้น: ชื่อบริการภายนอกที่ `ROADMAP.md` ระบุไว้ชัดเจนแล้วจากบริบทจริงของงาน (เช่น LINE OA, Google Sheet/Drive) ให้คงชื่อนั้นไว้ตามที่มีอยู่ ไม่ต้อง generalize ทิ้ง
- Diagram ทั้งหมดใช้ **Mermaid ฝังในไฟล์ .md เท่านั้น** (flowchart, sequenceDiagram, erDiagram, stateDiagram-v2) ห้ามใช้ diagram tool ภายนอกที่ต้อง export ภาพ เพื่อให้เปิดดูได้ในทุก editor/Obsidian/GitHub

**กลไกยืนยันเทคโนโลยีจริง**: `TECH-STACK.md` (สร้างผ่าน skill `tech-stack-builder`) คือเอกสารเดียวที่**ตั้งใจระบุเทคโนโลยีจริง**ต่อ component/service — เป็น "การยืนยัน" ที่ข้อยกเว้นด้านบนพูดถึง หลังยืนยันใน `TECH-STACK.md` แล้ว เอกสาร conceptual ทั้ง 4 ฉบับข้างต้น**อ้างอิงเทคโนโลยีจริงนั้นได้ทันที** แต่ต้องเรียก skill ของเอกสารนั้นซ้ำเพื่อ sync เอง — ไม่มีกลไกอัตโนมัติที่ sync ให้

## 5. Ambiguity Protocol — ใช้ทุกครั้งที่ทำงานเอกสาร ไม่มีข้อยกเว้น

ทุกจุดที่ requirement/backlog/feature ตีความได้มากกว่า 1 แบบ **ต้องถามผู้ใช้พร้อมเสนอ ≥3 แนวทาง พร้อมข้อดี-ข้อเสียของแต่ละแนวทาง** ก่อนตัดสินใจเอง — ห้ามถามลอยๆ ว่า "เอาแบบไหนดี" และห้ามเดาแล้วเดินหน้าต่อ

**ห้ามสร้าง/แก้ไฟล์เอกสารใดๆ ก่อนผู้ใช้ยืนยันแผน (Build Plan)** — ทุก skill ในหัวข้อ 6 ยึดกฎนี้เป็นค่าเริ่มต้น

## 6. ตระกูล Skill สำหรับสร้าง/ปรับปรุงเอกสาร — ใช้ก่อนเขียนเอกสารมือเสมอ

ก่อนเขียน/แก้เอกสารประเภทด้านล่างด้วยมือ ให้เรียก skill ที่ตรงกันก่อน เพราะแต่ละ skill มี workflow คุยกับผู้ใช้ + traceability check + Ambiguity Protocol ฝังไว้ครบแล้ว:

| Skill | ผลลัพธ์ | Subagent ที่เขียนไฟล์จริง |
|---|---|---|
| `prototype-builder` | Prototype HTML/CSS/JS ที่คลิกดูได้จริง (`prototypes/vN/`) | `prototype-builder` |
| `qa-doc-builder` | Test Plan / Test Case (Excel) / Acceptance Criteria (`docs/03-testing/01-test-plan/vN/`) | `test-doc-writer` + skill `xlsx` |
| `architecture-builder` | High-Level Architecture: system diagram, data flow ตาม user journey, ข้อจำกัดทางเทคนิค, Decision Log | `architecture-writer` |
| `data-contract-builder` | Database Schema/Spec (ER Diagram) + API Spec (conceptual operation list) | `data-contract-writer` |
| `detailed-design-builder` | Detailed Design ต่อ feature/flow: Sequence Flow diagram (บังคับ) + state diagram/business rule/error handling ตามที่เหมาะสม | `detailed-design-writer` |
| `tech-stack-builder` | Tech Stack: สัมภาษณ์ผู้ใช้แบบเข้มข้น (ทีม/งบ/hosting/compliance/scale) แล้วยืนยันเทคโนโลยีจริงต่อ component (เอกสารเดียวในตระกูลนี้ที่**ไม่** conceptual — ดูข้อ 4) | `tech-stack-writer` |
| `release-plan-builder` | Plan/Phase/Release (แก้ `ROADMAP.md` ที่ root ในที่เสมอ) + Task Breakdown (`docs/01-requirements/03-task/TASK-LIST.md`) — อยู่สาย requirements/planning ไม่ใช่ technical design จึงไม่ต้อง conceptual-first แต่ห้ามเดา assignee/deadline/estimation | `release-plan-writer` |

หลักการร่วมของทุก skill ในตระกูลนี้: งานคุยกับผู้ใช้ (เก็บ input, เสนอแผน, ถามเรื่อง version/archive) รันใน main loop เสมอ ห้าม delegate ให้ subagent ทำแทน ส่วนงานเขียนไฟล์จริงหลังแผนยืนยันแล้วเท่านั้นที่ delegate ให้ subagent ที่ระบุในตาราง
