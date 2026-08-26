# Task List — AI-DSRP

อ้างอิงโครงจาก [[../../../ROADMAP.md|ROADMAP.md]] — เอกสารนี้แตก task จาก 9 รายการงานใหม่ที่พบระหว่างวิเคราะห์เอกสารทั้งหมด (FEATURE-LIST.md, HIGH-LEVEL-ARCHITECTURE.md, DATA-MODEL.md/API-SPEC.md, TECH-STACK.md, TEST-PLAN.md/ACCEPTANCE-CRITERIA.md) เทียบกับ `ROADMAP.md` ปัจจุบัน

## 1. ภาพรวม

- **Scope**: เฉพาะ 9 task ใหม่รอบนี้ (ไม่ใช่การแตก task ของ `ROADMAP.md` ทั้งฉบับ) กระจายอยู่ใน Phase 1, 2, 3, 5, 7 ของโครง Phase 0-8 เดิม — ไม่มีการสร้าง Phase ใหม่
- **Granularity**: 1 รายการงานใหม่ต่อ 1 task (ไม่แตกย่อยกว่านี้ในรอบนี้)
- **วิธี prioritize**: ตามลำดับ Phase เดิมของ `ROADMAP.md` (ไม่ใช้ MoSCoW/weighted scoring)
- **ขอบเขตคอลัมน์**: task + Feature ID + สถานะ เท่านั้นที่มีข้อมูลจริง — คอลัมน์ผู้รับผิดชอบ/Deadline เว้นเป็น `—` ทุกแถวเพราะไม่มีข้อมูลมา (ห้ามเดา)
- สถานะทุก task ในรอบนี้ = "ยังไม่เริ่ม" เพราะเป็น task ใหม่ทั้งหมด

> หมายเหตุ: รายการ "แก้ bullet Phase 0 ให้ระบุ FEAT-DASH-07..15" ไม่รวมอยู่ในตารางนี้ เพราะเป็นการแก้ไขคำบรรยายเดิมของ `ROADMAP.md` (doc correction) ไม่ใช่ task งานใหม่ — ดูรายละเอียดที่ `ROADMAP.md` Phase 0 โดยตรง

## 2. Task Table ต่อ Phase

### Phase 1 — Case Intake: เชื่อมต่อจริง (โรงพยาบาล → เทศบาล)

| Task | Feature ID | สถานะ | ผู้รับผิดชอบ | Deadline | หมายเหตุ |
|---|---|---|---|---|---|
| ยืนยัน OCR/Document AI vendor และ Geocoding vendor ผ่านการสัมภาษณ์ `tech-stack-builder` รอบ 2 | FEAT-INTAKE-05, FEAT-INTAKE-07 | ยังไม่เริ่ม | — | — | อ้างจาก `TECH-STACK.md` ตารางหัวข้อ 3 (สถานะ "ยังไม่สัมภาษณ์") |
| สร้าง `DETAILED-DESIGN.md` สำหรับ flow OCR Review (human-in-the-loop) ก่อนเริ่ม implement จริง | FEAT-INTAKE-02, FEAT-INTAKE-05 | ยังไม่เริ่ม | — | — | ยังไม่มีไฟล์ `DETAILED-DESIGN.md` เลย ใช้ skill `detailed-design-builder` |

### Phase 2 — ทีมสอบสวนโรค: วิเคราะห์เคสและร่างรายงาน

| Task | Feature ID | สถานะ | ผู้รับผิดชอบ | Deadline | หมายเหตุ |
|---|---|---|---|---|---|
| ยืนยัน Case Clustering library/service ผ่าน `tech-stack-builder` รอบ 2 | FEAT-ANALYSIS-04 | ยังไม่เริ่ม | — | — | อ้างจาก `TECH-STACK.md` |
| สร้าง `DETAILED-DESIGN.md` สำหรับ flow Case Clustering decision (human-in-the-loop) | FEAT-ANALYSIS-01, FEAT-ANALYSIS-04 | ยังไม่เริ่ม | — | — | ยังไม่มีไฟล์ `DETAILED-DESIGN.md` ส่วนนี้ |

### Phase 3 — ทีมควบคุมโรค (ทีมพ่น)

| Task | Feature ID | สถานะ | ผู้รับผิดชอบ | Deadline | หมายเหตุ |
|---|---|---|---|---|---|
| ยืนยัน AI Vision QC vendor และ Location tracking (LIFF app) tech ผ่าน `tech-stack-builder` รอบ 2 | FEAT-CONTROL-04, FEAT-CONTROL-05 | ยังไม่เริ่ม | — | — | อ้างจาก `TECH-STACK.md` |

### Phase 5 — รายงานสรุปผู้บริหารอัตโนมัติ

| Task | Feature ID | สถานะ | ผู้รับผิดชอบ | Deadline | หมายเหตุ |
|---|---|---|---|---|---|
| ยืนยัน Reporting/BI tool ผ่าน `tech-stack-builder` รอบ 2 | FEAT-REPORT-03 | ยังไม่เริ่ม | — | — | อ้างจาก `TECH-STACK.md` |

### Phase 7 — Platform Foundations

| Task | Feature ID | สถานะ | ผู้รับผิดชอบ | Deadline | หมายเหตุ |
|---|---|---|---|---|---|
| Sync `HIGH-LEVEL-ARCHITECTURE.md` หัวข้อ 6 (Component Breakdown) ให้ระบุเทคโนโลยีจริงตาม `TECH-STACK.md` (แถว Web App/Frontend และ API Server/Backend) | FEAT-PLATFORM-01 | ยังไม่เริ่ม | — | — | อ้างจาก `TECH-STACK.md` หัวข้อ 5 ("เอกสาร Conceptual ที่ควร Sync ตาม") |
| ยืนยัน Database engine, Auth/Identity provider, Hosting/Infrastructure เจาะจง, Monitoring/Logging ผ่าน `tech-stack-builder` รอบ 2 | FEAT-PLATFORM-02, FEAT-PLATFORM-03 | ยังไม่เริ่ม | — | — | อ้างจาก `TECH-STACK.md` |
| ปิด open question เรื่องแผนส่งต่อให้ผู้รับเหมาภายนอกดูแลระบบในอนาคต (กระทบว่า Node.js+Express ที่ยืนยันไว้ยังเหมาะสมหรือควรเปลี่ยนไปทาง Laravel/.NET Core ที่ตลาดผู้รับเหมาไทยคุ้นเคยกว่า) | FEAT-PLATFORM-01 | ยังไม่เริ่ม | — | — | อ้างจาก `TECH-STACK.md` หัวข้อ 4.1 Decision Rationale (trade-off ที่บันทึกไว้) |

## 3. Estimation

ไม่รวมหัวข้อนี้ในรอบนี้ — Build Plan ไม่ได้ยืนยันขอบเขต estimation มา (ห้ามเดา)

## 4. Dependency ระหว่าง Task/Phase

| Task/Phase | ขึ้นกับ | เหตุผล |
|---|---|---|
| สร้าง `DETAILED-DESIGN.md` สำหรับ flow OCR Review (Phase 1) | ยืนยัน OCR/Document AI vendor และ Geocoding vendor (Phase 1) | `detailed-design-builder` อาจต้องอ้าง vendor จริงถ้ายืนยันแล้ว (Tech Stack Integration) |
| สร้าง `DETAILED-DESIGN.md` สำหรับ flow Case Clustering decision (Phase 2) | ยืนยัน Case Clustering library/service (Phase 2) | เหตุผลเดียวกัน — detailed design อ้าง vendor/library จริงได้แม่นยำกว่าถ้ายืนยันก่อน |
| Sync `HIGH-LEVEL-ARCHITECTURE.md` หัวข้อ 6 Component Breakdown (Phase 7) | ยืนยัน Database engine, Auth/Identity provider, Hosting/Infrastructure, Monitoring/Logging (Phase 7) | เพื่อให้ sync Component Breakdown ได้ครบทุกแถวในครั้งเดียว แทนที่จะต้อง sync ซ้ำหลายรอบ |

## 5. Traceability

| Phase | Feature ID ที่ครอบ | จำนวน Task |
|---|---|---|
| Phase 1 | FEAT-INTAKE-02, FEAT-INTAKE-05, FEAT-INTAKE-07 | 2 |
| Phase 2 | FEAT-ANALYSIS-01, FEAT-ANALYSIS-04 | 2 |
| Phase 3 | FEAT-CONTROL-04, FEAT-CONTROL-05 | 1 |
| Phase 5 | FEAT-REPORT-03 | 1 |
| Phase 7 | FEAT-PLATFORM-01, FEAT-PLATFORM-02, FEAT-PLATFORM-03 | 3 |

**รวม**: 9 task ใหม่ ครอบ 5 Phase (1, 2, 3, 5, 7)
