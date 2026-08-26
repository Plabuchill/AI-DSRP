# Template — TECH-STACK.md

ใช้เป็นโครงเริ่มต้นเวลาเขียน/แก้ `docs/02-design/02-technical/TECH-STACK.md` — ต่างจาก template ของ `architecture-builder`/`data-contract-builder`/`detailed-design-builder` ที่เลี่ยง tech stack เจาะจง เอกสารนี้**ต้องระบุเทคโนโลยีจริง** ตัดหัวข้อที่ Build Plan ไม่รวมได้ตามจริง

---

## 1. สรุปผลสัมภาษณ์ (Interview Summary)

สรุปคำตอบจากผู้ใช้ทั้ง 9 หมวดแบบย่อ (ทีม/ความสามารถ, งบประมาณ, Hosting, Compliance, Scale, AI/ML service, Frontend/Mobile, Timeline, วิสัยทัศน์ระยะยาว) — ใช้เป็นบริบทอธิบายว่าทำไมเลือก stack แบบนี้ ไม่ใช่แค่ list เทคโนโลยีลอยๆ

| หมวด | สรุปคำตอบ |
|---|---|
| ทีม/ความสามารถ | ... |
| งบประมาณ/การจัดซื้อ | ... |
| Hosting/Deployment | ... |
| Compliance/ความปลอดภัย | ... |
| Scale/Performance | ... |
| AI/ML Service | ... |
| Frontend/Mobile | ... |
| Timeline | ... |
| วิสัยทัศน์ระยะยาว | ... |

## 2. ข้อจำกัดที่รับมาแล้ว (ไม่ได้เกิดจากสัมภาษณ์รอบนี้)

รวบรวมจาก `ROADMAP.md` ที่ยืนยันไว้แล้วก่อนหน้า — ระบุให้ชัดว่าเป็นข้อจำกัดที่ต้องยึด ไม่ใช่ตัวเลือกที่เปิดให้เลือกใหม่

| ข้อจำกัด | ที่มา |
|---|---|
| ต้องใช้ LINE OA / Messaging API เป็นช่องแจ้งเตือนหลัก | ROADMAP.md Phase 1/4 |
| ใช้ Google Sheet/Drive เก็บข้อมูลชั่วคราวก่อนมี Database จริง | ROADMAP.md Phase 1, Decision Log ใน HIGH-LEVEL-ARCHITECTURE.md |
| ... | ... |

## 3. ตาราง Component ↔ เทคโนโลยีที่เลือก

ทุกแถวต้องมี**เหตุผลที่อิงคำตอบสัมภาษณ์จริง** (ไม่ใช่ pros/cons ทั่วไปที่ไม่เกี่ยวกับบริบทผู้ใช้) และ Feature ID ที่เกี่ยวข้อง

| Component | เทคโนโลยีที่เลือก | เหตุผล (อิงสัมภาษณ์) | ตัวเลือกอื่นที่พิจารณา | Feature ID |
|---|---|---|---|---|
| Frontend framework | ... | ... | ... | FEAT-DASH, ... |
| Backend/API runtime + framework | ... | ... | ... | FEAT-PLATFORM-01 |
| Database engine | ... | ... | ... | FEAT-PLATFORM-03 |
| Auth/Identity provider | ... | ... | ... | FEAT-PLATFORM-02 |
| Hosting/Infrastructure | ... | ... | ... | FEAT-PLATFORM-01 |
| OCR/Document AI vendor | ... | ... | ... | FEAT-INTAKE-05 |
| Geocoding vendor | ... | ... | ... | FEAT-INTAKE-07 |
| Case Clustering (library/service) | ... | ... | ... | FEAT-ANALYSIS-04 |
| AI Vision QC vendor | ... | ... | ... | FEAT-CONTROL-05 |
| Location tracking (LIFF app) | ... | ... | ... | FEAT-CONTROL-04 |
| Reporting/BI tool | ... | ... | ... | FEAT-REPORT-03 |

## 4. Decision Rationale — จุดที่เคยมีทางเลือก ≥3 ทาง

สำหรับ component ที่ระหว่างสัมภาษณ์/เสนอแนะมีตัวเลือกมากกว่า 1 ทางอย่างมีนัยสำคัญ (ไม่ใช่ทุก component) บันทึกไว้เหมือน Decision Log เพื่อให้ทีมใหม่เข้าใจว่าทำไมเลือกทางนี้:

| Component | ตัวเลือกที่พิจารณา (≥3) | ทางที่เลือก | เหตุผล |
|---|---|---|---|
| ... | (1) ... (2) ... (3) ... | ... | ... |

## 5. เอกสาร Conceptual ที่ควร Sync ตาม

ระบุว่าเอกสารไหน (และหัวข้อไหน) ควรอัปเดตให้ระบุเทคโนโลยีจริงแทน capability-level เดิม หลังยืนยัน TECH-STACK.md — **ไม่ sync ให้เองในรอบนี้** เป็นงานแยกที่ต้องเรียก skill ที่เกี่ยวข้องซ้ำ

| เอกสาร | หัวข้อที่ควรอัปเดต |
|---|---|
| `HIGH-LEVEL-ARCHITECTURE.md` | หัวข้อ Component Breakdown |
| `DATA-MODEL.md` | Entity Dictionary (conceptual type → type จริงของ database ที่เลือก ถ้าต้องการ) |
| `API-SPEC.md` | ระบุ protocol จริง (REST/GraphQL) ถ้ายืนยันแล้ว |

---

## หลักการเขียนที่ต้องยึดเสมอ

- **ทุกการเลือกต้องมีเหตุผลที่อิงคำตอบสัมภาษณ์จริง** — ห้ามเขียน pros/cons ทั่วไปที่ตัดแปะได้กับทุกโครงการ
- **Traceability** — ทุก component ต้องโยง Feature ID ได้ ถ้าไม่มี ID ตรงให้ตั้งชื่ออ้างอิงที่สื่อความหมาย
- **ห้ามขัดแย้งกับข้อจำกัดที่ ROADMAP.md ยืนยันไว้แล้ว** (หัวข้อ 2) — ถ้าคำแนะนำจะขัดแย้ง ต้อง flag ให้ผู้ใช้เห็นก่อนเขียนไฟล์ ไม่ใช่เงียบแล้วเขียนขัดกันเอง
- **Mermaid เท่านั้นถ้ามี diagram** (เช่น deployment diagram แบบ `flowchart`) ไม่พึ่ง asset ภาพนอกไฟล์
