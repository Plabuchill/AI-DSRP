# Build Plan — prototypes/v1

## Scope
Prototype แรกของ AI Disease Surveillance & Response Platform โฟกัสที่ **Outbreak Dashboard** เพียงหน้าเดียว ระดับ "Full Analytics Dashboard" (ยังไม่มี Requirement/Backlog/Feature List/User Journey อย่างเป็นทางการ — ผู้ใช้เลือก scope นี้จาก 3 ทางเลือกที่เสนอ)

## หน้าที่สร้าง
- **`index.html` — Outbreak Dashboard (หน้าเดียว, เป็นหน้าหลักของ v1)**
  - Top navigation bar: wordmark "AI-DSRP", ชื่อหน้า "Outbreak Dashboard", เมนูอื่น (Cases, Alerts, Reports) แสดงเป็น placeholder/disabled เพราะยังไม่อยู่ใน scope รอบนี้
  - KPI cards แถวบน: Total Active Cases, New Cases Today, Active Outbreak Zones, Overall Risk Level
  - Panel แผนที่ความเสี่ยงตามภูมิภาค: ใช้ region grid แบบง่าย (ภาคเหนือ/กลาง/อีสาน/ใต้/ตะวันออก/ตะวันตก — 6 ภาค) ระบายสีตามระดับความเสี่ยง แทนแผนที่จริงจาก map tile (เพื่อให้เปิดออฟไลน์ได้ ไม่พึ่ง CDN)
  - กราฟแนวโน้มเคสตามช่วงเวลา (14 วันล่าสุด) วาดด้วย inline SVG
  - รายการแจ้งเตือนล่าสุด (Recent Alerts) พร้อม severity badge (warning/danger) และ timestamp/พื้นที่
  - Filter (โรค, ภูมิภาค, ช่วงวันที่) — UI ใช้งานได้จริงกับ mock data ในหน้า (กรอง client-side ด้วย JS)

## Backlog/Feature ที่ไม่รวมในรอบนี้
- หน้า Case Reporting Flow, Alert & Response Management แบบเต็ม, ระบบ login/สิทธิ์ผู้ใช้, การเชื่อมต่อ backend จริง — เมนูใน nav bar เตรียมไว้เป็น placeholder สำหรับต่อยอดในเวอร์ชันถัดไป

## Assumption ที่ตั้งไว้
- ข้อมูลทั้งหมดเป็น mock data สมมติบริบทประเทศไทย (ภาค/จังหวัดตัวอย่าง)
- แผนที่แสดงผลแบบ region grid อย่างง่าย ไม่ใช่แผนที่ภูมิศาสตร์จริง

## Version
`prototypes/v1` — รันครั้งแรก ไม่มี version เดิมให้เลือก

## Design Reference
~~อ้างอิง DESIGN.md เดิม (โทน Clinical / Trustworthy, primary #1565C0, secondary #0D9488)~~ — **อัปเดต 2026-08-16**: DESIGN.md เปลี่ยนทิศทางเป็น **Earth Tone + Minimalist + Muji** (primary #7A6A53, secondary #8A9A5B, background #F5F1EA) ผู้ใช้เลือกให้ **แก้ v1 เดิมในที่** (ไม่สร้าง v2 ใหม่) เพื่อรีสกินให้ตรงกับ DESIGN.md ฉบับล่าสุด — scope/ฟีเจอร์เดิมทั้งหมดคงไว้ไม่เปลี่ยน มีการปรับ navigation จาก top bar สีทึบ เป็น left rail แบบเรียบ และ badge จาก pill สีสด เป็น status dot + label ตามแนวทางใหม่ใน DESIGN.md ข้อ 3

---

## เพิ่มเติม 2026-08-20 — หน้า Case Intake (การรวบรวมข้อมูล โรงพยาบาล → เทศบาล)

### Requirement ต้นทาง
ปัญหา: ข้อมูลรายงานโรคจากโรงพยาบาลอยู่ในรูป PDF/JPEG จำนวนมาก ต้องแปลงเป็น Google Sheet + เก็บไฟล์ต้นฉบับไว้ลงรับหนังสือ แนวทางที่ผู้ใช้เสนอ: OCR/AI extraction ดึงข้อมูล (ชื่อ, HN, ที่อยู่, วันป่วย, ผลตรวจ) เข้า Google Sheet อัตโนมัติ, เก็บไฟล์ต้นฉบับคู่กับแถวข้อมูลใน Google Drive, แจ้งเตือนทีมสอบสวนโรค 5 หน่วยผ่าน LINE OA ตามพื้นที่ตำบล/หมู่บ้าน, และ generate spot map + รัศมี 100 เมตรจากพิกัด/Geocoding

### Scope
เพิ่มหน้าใหม่ `case-intake.html` เข้าไปใน `prototypes/v1` เดิม (แก้ของเดิมในที่ ไม่สร้าง v2) โดยเปิดใช้เมนู "Cases" ใน left rail (จาก placeholder disabled เดิม) ให้ชี้มาหน้านี้ — ไม่แตะ `index.html` (Outbreak Dashboard)

### โครงสร้างหน้า (single-page dashboard รวมทุก step ของ pipeline)
1. **Upload panel** — mock drag-drop สำหรับ PDF/JPEG พร้อมรายการไฟล์ที่อัปโหลดล่าสุด (sample data)
2. **ตารางตรวจสอบผล OCR** — แถวข้อมูลที่ AI ดึงมา (ชื่อ, HN, ที่อยู่, ตำบล/หมู่บ้าน, วันป่วย, ผลตรวจ) พร้อมสถานะ "รอตรวจสอบ" / "ยืนยันแล้ว" มีปุ่ม **ยืนยัน** ต่อแถว (human-in-the-loop ก่อน auto-route) แต่ละแถวมีลิงก์ "ไฟล์ต้นฉบับ" (mock, เสมือนลิงก์ Google Drive)
3. **Notification log** — เมื่อยืนยันแถวแล้ว แสดง log การแจ้งเตือนไปยัง 5 ทีมสอบสวนโรค (เขต 1-5) พร้อม timestamp และสถานะ "ส่งแล้ว"
4. **Spot map panel** — ต่อยอด region-grid SVG แบบเดียวกับ `index.html` แต่ zoom ระดับตำบล/หมู่บ้าน แสดงหมุดเคสที่ยืนยันแล้ว + วงรัศมี 100 เมตร พร้อม badge "ปรับพิกัดด้วยมือ" สำหรับเคสที่ geocode แม่นยำต่ำ (toggle สถานะได้ด้วย JS ไม่ใช่ drag จริง)

### Backlog/Feature ที่ไม่รวมในรอบนี้
การเชื่อมต่อ Google Sheet/Drive/LINE OA จริง, OCR/Geocoding API จริง, drag-and-drop map จริง — ทั้งหมด mock ด้วย client-side JS/sample data

### Assumption ที่ตั้งไว้
- ชื่อทีมสอบสวนโรคใช้ mock: "ทีมสอบสวนโรค เขต 1" ถึง "เขต 5"
- ข้อมูลตัวอย่างเป็นบริบทไทย
- แผนที่แบบ abstract grid/SVG (สอดคล้องกับ assumption เดิมของ index.html ที่ไม่พึ่ง map tile/CDN)
- Human-in-the-loop: แถวข้อมูลต้องกด "ยืนยัน" ก่อนจึงจะขึ้น notification log และปักหมุดบนแผนที่ (ไม่ auto-route ทันทีที่ OCR เสร็จ)

### Version
แก้ไข `prototypes/v1` เดิมในที่ (เพิ่มไฟล์ `case-intake.html` ใหม่ ไม่แตะ `index.html`)

### Design Reference
อ้างอิง `DESIGN.md` ฉบับ Earth Tone + Minimalist + Muji เดิม ให้เข้าชุดกับ `index.html`

---

## เพิ่มเติม 2026-08-20 (รอบ 2) — แก้ไขข้อมูลในตาราง OCR ก่อนยืนยัน/แจ้งเตือน

### Requirement ต้นทาง
ผู้ใช้ต้องการให้แก้ไขข้อมูลที่ OCR ดึงมาผิดพลาดได้ ก่อนกด "ยืนยัน" (ก่อนระบบส่งแจ้งเตือนไปยังทีมสอบสวนโรค) — เพราะถ้ายืนยันไปทั้งที่ข้อมูลผิด (เช่น ตำบลผิด) จะ auto-route เคสไปผิดทีม

### Scope
แก้ไข `prototypes/v1/case-intake.html`, `case-intake.js`, `styles.css` ในที่ (ไม่สร้าง v2) — เพิ่มปุ่ม **"แก้ไข"** ต่อแถวในตาราง OCR Review (เฉพาะแถวที่ยังไม่ยืนยัน) กดแล้วเซลล์ในแถวนั้น (ชื่อ-สกุล, HN, ที่อยู่, ตำบล-หมู่บ้าน, วันป่วย, ผลตรวจ) กลายเป็น input แก้ไขได้แบบ inline ในตาราง พร้อมปุ่ม **"บันทึก"** / **"ยกเลิก"** — บันทึกแล้วข้อมูลแถวนั้นอัปเดต (รวมถึงทีมที่จะ auto-route ถ้าตำบล/หมู่บ้านเปลี่ยน) ก่อนที่จะกด "ยืนยัน" ส่งแจ้งเตือนต่อ

### Backlog/Feature ที่ไม่รวมในรอบนี้
แก้ไขแถวที่ยืนยันแล้ว (ต้อง unlock ก่อนถึงจะแก้ได้ — ยังไม่อยู่ใน scope นี้), การ sync กลับไปยัง Google Sheet จริง

### Assumption ที่ตั้งไว้
- แก้ไขได้เฉพาะแถวสถานะ "รอตรวจสอบ" เท่านั้น
- ถ้าแก้ "ตำบล/หมู่บ้าน" แล้วระบบจะ map ทีมสอบสวนโรคที่รับผิดชอบใหม่ตามค่าที่แก้ (ถ้าตรงกับ pattern ที่ระบบรู้จัก) เพื่อให้ auto-route ถูกต้องตามข้อมูลที่แก้ไขแล้ว

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิม — input แก้ไขใน table ใช้ style เดียวกับ Input/Form guideline ข้อ 3 (label บนไม่จำเป็นในบริบท inline table แต่ border/focus state ต้องตรงตาม pattern เดิม)

---

## เพิ่มเติม 2026-08-20 (รอบ 3) — หน้า Case Analysis (ทีมสอบสวนโรค)

### Requirement ต้นทาง
Pain point ข้อ 2 จาก [ROADMAP.md](./../../ROADMAP.md) Phase 2 — ทีมสอบสวนโรคต้องการ: (1) AI ช่วยวิเคราะห์การเชื่อมโยงเคส (clustering ตามเวลา/พื้นที่/ผู้สัมผัส), (2) AI ร่างรายงานสอบสวนโรคจากข้อมูลดิบให้นักวิชาการแก้ต่อ, (3) Chatbot ช่วยประสานงาน อสม. เบื้องต้น (นัดหมาย/แจ้งพื้นที่) ก่อนโทรจริง

### Scope
เพิ่มหน้าใหม่ `case-analysis.html` เข้าไปใน `prototypes/v1` เดิม (แก้ของเดิมในที่ ไม่สร้าง v2) พร้อมเพิ่มเมนูใหม่ **"Case Analysis"** ใน left rail — ไม่แตะเมนู "Alerts"/"Reports" ที่เป็น placeholder เดิม (จองไว้สำหรับ ROADMAP.md Phase 6/5)

### โครงสร้างหน้า (single-page รวม 3 ส่วน)
1. **Case Cluster Map** — ต่อยอด spot map SVG แบบเดียวกับ `case-intake.html` แสดงเคสที่ยืนยันแล้ว พร้อมกลุ่ม cluster ที่ AI เสนอ (สีวงล้อมต่างกันต่อ cluster) และรายการข้าง ๆ ระบุจำนวนเคส/ระดับความมั่นใจต่อ cluster พร้อมปุ่ม **"ยืนยัน cluster นี้"** ต่อกลุ่ม (human-in-the-loop)
2. **ร่างรายงานสอบสวนโรค** — ปุ่ม "สร้างร่างรายงาน" (ใช้ได้เมื่อมี cluster ที่ยืนยันแล้ว) → mock ร่างรายงานจากข้อมูล cluster (จำนวนผู้สัมผัส, ไทม์ไลน์, พื้นที่) ขึ้นในกล่องข้อความที่แก้ไขได้ พร้อมปุ่ม "ส่งให้ผู้บริหาร"
3. **ประสานงาน อสม. (Chatbot)** — chat thread ตัวอย่างบทสนทนาสำเร็จรูประหว่างระบบกับ อสม. (นัดหมาย/แจ้งพื้นที่) พร้อมปุ่มโชว์ข้อความถัดไปแบบ demo (ไม่ใช่ chat engine จริง)

### Backlog/Feature ที่ไม่รวมในรอบนี้
AI clustering/OCR/chatbot จริง, การเชื่อมต่อ LINE OA จริง — ทั้งหมด mock data/scripted ตาม Phase 2 ใน ROADMAP.md

### Assumption ที่ตั้งไว้
- Cluster ถูก pre-group ไว้ใน mock data (ไม่ใช่ clustering algorithm จริง)
- รายงานร่างเป็น template คงที่เติมค่าจากข้อมูล cluster ไม่ใช่ AI generation จริง
- Chatbot conversation เป็น script คงที่ ไม่มี free-text input จริง

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิมให้เข้าชุดกับหน้าอื่น

---

## เพิ่มเติม 2026-08-20 (รอบ 4) — หน้า Control Plan และ Field Tracking (ทีมควบคุมโรค/ทีมพ่น)

### Requirement ต้นทาง
Pain point ข้อ 3 จาก [ROADMAP.md](./../../ROADMAP.md) Phase 3 — ทีมควบคุมโรค (ทีมพ่น) ต้องการ: (1) auto-generate ใบขออนุมัติเบิกน้ำมัน/น้ำยาเคมี, (2) AI ร่างแผนปฏิบัติงานควบคุมโรค, (3) real-time tracking ทีมพ่นเทียบกับ spot map ที่วางแผนไว้, (4) AI vision ตรวจสอบรูปถ่ายภาคสนามว่าตรงพื้นที่/เวลาจริงไหม

### Scope
เพิ่ม 2 หน้าใหม่เข้าไปใน `prototypes/v1` เดิม (แก้ของเดิมในที่ ไม่สร้าง v2) พร้อมเพิ่มเมนู **"Control Plan"** และ **"Field Tracking"** ใน left rail ต่อจาก "Case Analysis" — ไม่แตะ "Alerts"/"Reports" ที่จองไว้สำหรับ phase อื่น

### โครงสร้างหน้าที่ 1 — `control-plan.html`
1. **ร่างใบขออนุมัติเบิกน้ำมัน/น้ำยาเคมี** — เลือกพื้นที่/cluster (reuse cluster ที่ยืนยันแล้วจาก case-analysis.js ถ้าเป็นไปได้ หรือ mock ชุดใหม่ที่สอดคล้องกัน) → generate เอกสารร่างจากข้อมูล (พื้นที่, จำนวนหลังคาเรือน, รัศมี) ในกล่องแก้ไขได้ พร้อมปุ่ม "ส่งขออนุมัติ" (mock เปลี่ยนสถานะรออนุมัติ → อนุมัติแล้ว)
2. **ร่างแผนปฏิบัติงานควบคุมโรค** — generate แผนปฏิบัติงาน (ทีมที่มอบหมาย, วันที่ปฏิบัติงาน, ขั้นตอน) ในกล่องแก้ไขได้ พร้อมปุ่มยืนยันใช้งานแผน

### โครงสร้างหน้าที่ 2 — `field-tracking.html`
1. **Real-time tracking ทีมพ่น** — ต่อยอด spot map SVG แบบเดียวกับ case-intake.js/case-analysis.js แสดงตำแหน่ง/โซนของทีมพ่นแต่ละทีม พร้อมสีสถานะ (ยังไม่ถึง/กำลังพ่น/พ่นแล้ว) เทียบกับโซนที่วางแผนไว้ — mock เพราะ LINE ไม่มี continuous location API จริง (ตาม ROADMAP.md Phase 3)
2. **AI vision QC รูปถ่ายภาคสนาม** — กริดการ์ดตัวแทนรูปภาพ (ใช้ icon/placeholder เพราะไม่มีไฟล์รูปจริง ไม่ใช้ภาพประกอบตกแต่งตาม DESIGN.md ข้อ 7) พร้อม badge ผลตรวจ (พิกัดตรง/ไม่ตรง, เวลาตรง/ไม่ตรง) — mock เพราะรูปจาก LINE มักถูกล้าง EXIF ออก (ตาม ROADMAP.md Phase 3)

### Backlog/Feature ที่ไม่รวมในรอบนี้
AI drafting/tracking/vision จริง, การเชื่อมต่อ backend/LINE จริง — ทั้งหมด mock ตาม Phase 3 ใน ROADMAP.md

### Assumption ที่ตั้งไว้
- ข้อมูลพื้นที่/cluster/ทีมพ่นเป็น mock data บริบทไทย
- เอกสาร/แผนที่ generate เป็น template คงที่เติมค่าจากข้อมูล ไม่ใช่ AI generation จริง
- ตำแหน่งทีมพ่นใน tracking เป็นพิกัด mock คงที่ ไม่ใช่ GPS log จริง
- รูปถ่ายใน QC grid เป็น placeholder icon ไม่ใช่ไฟล์รูปจริง

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิมให้เข้าชุดกับหน้าอื่น

---

## เพิ่มเติม 2026-08-20 (รอบ 5) — หน้า ASM Coordination (ทีม อสม.)

### Requirement ต้นทาง
Pain point ข้อ 4 จาก [ROADMAP.md](./../../ROADMAP.md) Phase 4 — ทีม อสม. ต้องการ: (1) รับรูปผ่าน LINE OA ให้ AI vision จัดหมวดหมู่ตามพื้นที่/วันที่ พร้อมสรุปสถานะ (พ่นแล้ว/ยังไม่พ่น) อัตโนมัติ, (2) แจ้งเตือน spot map ล่วงหน้า 1 วันแบบอัตโนมัติผ่าน LINE (scheduled message) ตามวันที่ 0 และวันที่ 7

### Scope
เพิ่มหน้าใหม่ `asm-coordination.html` เข้าไปใน `prototypes/v1` เดิม (แก้ของเดิมในที่ ไม่สร้าง v2) พร้อมเพิ่มเมนู **"ASM Coordination"** ต่อจาก "Field Tracking" — ไม่แตะ "Alerts"/"Reports"

### โครงสร้างหน้า (single-page รวม 2 ส่วน)
1. **รับรูปจาก อสม. (Photo Intake)** — กริดรูปภาพ (icon placeholder แบบเดียวกับ Field Tracking) พร้อม AI จัดหมวดหมู่อัตโนมัติตามพื้นที่/วันที่ และสรุปสถานะ (พ่นแล้ว/ยังไม่พ่น) มีตัวกรองพื้นที่/วันที่
2. **ตารางคิวแจ้งเตือนล่วงหน้า** — ตาราง: พื้นที่/cluster, วันที่ 0, กำหนดส่งแจ้งเตือนล่วงหน้า 1 วัน (ก่อนวันที่ 0 และก่อนวันที่ 7), สถานะ (รอส่ง/ส่งแล้ว), ปุ่ม "ดูตัวอย่างข้อความ" preview ข้อความ LINE ที่จะส่งจริง

### Backlog/Feature ที่ไม่รวมในรอบนี้
การเชื่อมต่อ LINE OA/AI vision จริง — ทั้งหมด mock ตาม Phase 4 ใน ROADMAP.md

### Assumption ที่ตั้งไว้
- ข้อมูลรูปภาพ/พื้นที่/วันที่เป็น mock data บริบทไทย สอดคล้องกับ cluster ที่ตั้งชื่อไว้ในหน้าอื่น
- รูปเป็น placeholder icon ไม่ใช่ไฟล์รูปจริง (เหตุผลเดียวกับ Field Tracking)
- ข้อความ LINE preview เป็น template คงที่ ไม่ใช่การส่งจริง

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิมให้เข้าชุดกับหน้าอื่น

---

## เพิ่มเติม 2026-08-20 (รอบ 6) — เปิดใช้หน้า "Reports" (รายงานสรุปผู้บริหาร)

### Requirement ต้นทาง
Pain point ข้อ 5 จาก [ROADMAP.md](./../../ROADMAP.md) Phase 5 — รวมข้อมูลจากทุกทีม (จำนวนเคส, สถานะควบคุมโรค, รูปถ่ายยืนยัน, HI/CI, รายงานสอบสวน) มาสรุปอัตโนมัติเป็นรายงานประจำวัน/สัปดาห์ ส่งผู้บริหารผ่าน LINE หรือ PDF

### Scope
สร้าง `reports.html` แล้วเปลี่ยนเมนู **"Reports"** จาก placeholder disabled เป็น link ใช้งานได้จริงในทุกหน้า HTML ที่มีอยู่ (index.html, case-intake.html, case-analysis.html, control-plan.html, field-tracking.html, asm-coordination.html) — เมนูอื่นคงเดิมทั้งหมด ไม่แตะ "Alerts" ที่ยังจองไว้สำหรับ Phase 6

### โครงสร้างหน้า
1. **ตัวเลือกช่วงเวลา** — toggle รายวัน/รายสัปดาห์
2. **KPI summary cards** — จำนวนเคสรวม, % พื้นที่ควบคุมโรคแล้ว (พ่นแล้ว), % รูปถ่ายยืนยันผ่าน QC, HI/CI (ดัชนีลูกน้ำยุงลาย mock), จำนวนรายงานสอบสวนที่ส่งผู้บริหารแล้ว — ตัวเลขอ้างอิง/สอดคล้องกับ mock data ในหน้าอื่นเท่าที่ทำได้
3. **สร้างรายงานสรุป** — ปุ่ม "สร้างรายงานสรุป" generate ข้อความสรุปจาก KPI ด้านบนลงกล่องแก้ไขได้ พร้อมปุ่ม "ส่งผ่าน LINE" และ "ดาวน์โหลด PDF" (mock)
4. **ประวัติรายงานที่ส่งแล้ว** — ตาราง log รายงานย้อนหลัง (mock)

### Backlog/Feature ที่ไม่รวมในรอบนี้
การรวมข้อมูล real-time จริงจากทุกหน้า, การส่ง LINE/generate PDF จริง — ทั้งหมด mock ตาม Phase 5 ใน ROADMAP.md

### Assumption ที่ตั้งไว้
- ตัวเลข KPI เป็น mock ที่อ้างอิง/สอดคล้องกับข้อมูลในหน้าอื่นเท่าที่ทำได้ ไม่ใช่การ query จริง
- ข้อความสรุปเป็น template คงที่เติมค่าจาก KPI ไม่ใช่ AI generation จริง
- ปุ่มส่ง LINE/ดาวน์โหลด PDF เป็น mock action

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิมให้เข้าชุดกับหน้าอื่น

---

## เพิ่มเติม 2026-08-20 (รอบ 7) — เปิดใช้หน้า "Alerts" (Alert & Response Management)

### Requirement ต้นทาง
[ROADMAP.md](./../../ROADMAP.md) Phase 6 — หน้า Alert & Response Management แบบเต็ม: workflow ติดตามการตอบสนองต่อการระบาด (มอบหมายงาน, อัปเดตสถานะ, ปิดเคส) ต่อยอดจาก mock alert 8 รายการที่มีอยู่แล้วใน `script.js` (แสดงผลใน Recent Alerts panel ของ Outbreak Dashboard)

### Scope
สร้าง `alerts.html` แล้วเปลี่ยนเมนู **"Alerts"** จาก placeholder disabled เป็น link ใช้งานได้จริงในทุกหน้า HTML ที่มีอยู่ (index.html, case-intake.html, case-analysis.html, control-plan.html, field-tracking.html, asm-coordination.html, reports.html) — เมนู "Reports" คงเดิม (เปิดใช้แล้วในรอบ 6)

### โครงสร้างหน้า
1. **ตารางแจ้งเตือน** — ต่อยอด 8 รายการ ALERTS จาก `script.js` (โรค, พื้นที่, ความรุนแรง, เวลา, ข้อความ) เพิ่ม field ใหม่: สถานะ (ใหม่ / กำลังดำเนินการ / ปิดเคสแล้ว) และทีมที่มอบหมาย
2. **มอบหมายงาน** — dropdown เลือกทีม (ทีมสอบสวนโรค เขต 1-5 / ทีมพ่น 1-4 ชื่อสอดคล้องกับ case-analysis.js/control-plan.js/field-tracking.js) ต่อรายการที่ยังเป็น "ใหม่"
3. **อัปเดตสถานะ** — เปลี่ยนสถานะไปข้างหน้า (ใหม่ → กำลังดำเนินการ → ปิดเคสแล้ว) พร้อม timestamp
4. **ปิดเคส** — ต้องกรอกบันทึกสรุปสั้นๆ ก่อนปิดเคสได้ (human-in-the-loop)
5. **ตัวกรอง** — สถานะ/ความรุนแรง ทำงาน client-side

### Backlog/Feature ที่ไม่รวมในรอบนี้
การเชื่อมข้อมูล real-time จริงกับ Dashboard/หน้าอื่น — mock ตาม Phase 6 ใน ROADMAP.md

### Assumption ที่ตั้งไว้
- ALERTS ต่อยอดจาก mock array เดิมใน script.js แต่เป็น state แยกในหน้านี้ ไม่ sync กลับไป Dashboard จริง
- ทีมที่มอบหมายเป็นชื่อ mock สอดคล้องกับหน้าอื่น ไม่ใช่ query จริง
- บันทึกปิดเคสเป็น free text เก็บใน state ของหน้านี้เท่านั้น

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิมให้เข้าชุดกับหน้าอื่น

---

## เพิ่มเติม 2026-08-20 (รอบ 8) — แก้ไขส่วน "ร่างแผนปฏิบัติงานควบคุมโรค" ใน Control Plan

### Requirement ต้นทาง
ผู้ใช้ต้องการให้แผนปฏิบัติงานมีวันที่และเวลาให้เลือกเอง และให้เรียงลำดับจากเวลาน้อยไปมาก

### Scope
แก้ไข `prototypes/v1/control-plan.html`, `control-plan.js`, `styles.css` ในที่ (ไม่สร้าง v2) — เปลี่ยนส่วน "ร่างแผนปฏิบัติงานควบคุมโรค" จาก textarea ข้อความล้วนที่ auto-assign วันคงที่ (day1/day2 ไม่มีเวลา) เป็นตารางกำหนดการที่แก้ไขได้

### รายละเอียด
1. แต่ละทีมพ่น (1-4) มี input **วันที่** (`type="date"`) และ input **เวลา** (`type="time"`) ต่อแถว พร้อมค่าเริ่มต้น auto-fill มาให้ (ทีม 1-2 = วันพรุ่งนี้ 08:00/09:00, ทีม 3-4 = วันถัดไป 08:00/09:00 ตามที่เคย hardcode ไว้เดิม) แก้ไขได้ทุกช่อง
2. ตาราง**เรียงลำดับใหม่อัตโนมัติจากวันที่+เวลาน้อยไปมาก**ทุกครั้งที่มีการเปลี่ยนค่าวันที่/เวลาแถวใดแถวหนึ่ง (re-render ตามลำดับใหม่)
3. ปุ่ม "สร้างร่างแผนปฏิบัติงาน" ยังคงไว้ generate ข้อความสรุปแผนลง textarea เดิม แต่ดึงวันที่/เวลาจริงจากตารางที่เรียงแล้วมาใส่ในข้อความ (แทนค่าคงที่ formatThaiDate(day1)/day2 เดิม)

### Backlog/Feature ที่ไม่รวมในรอบนี้
การเชื่อมต่อ calendar/scheduling API จริง — ยังเป็น mock/client-side state

### Assumption ที่ตั้งไว้
- ค่าเริ่มต้นวันที่/เวลาอ้างอิงจาก logic เดิม (พรุ่งนี้/วันถัดไป) เพื่อไม่เปลี่ยนพฤติกรรม default มากเกินไป
- การเรียงลำดับใช้ค่า date+time รวมกันเป็น timestamp เทียบกัน

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิม — input วันที่/เวลาใช้ style เดียวกับ `.input-inline` ที่มีอยู่แล้วใน case-intake.js

---

## เพิ่มเติม 2026-08-20 (รอบ 9) — เลือกที่อยู่/ที่ทำงาน, รัศมีปรับได้, mini-map, เวลา 24 ชม. ใน Control Plan

### Requirement ต้นทาง
ผู้ใช้ต้องการให้ทั้งส่วน "ใบขออนุมัติเบิกน้ำมัน/น้ำยาเคมี" และ "แผนปฏิบัติงาน" ใน Control Plan:
1. เลือกได้ทั้งตำแหน่ง "ที่อยู่ (บ้าน)" และ "สถานที่ทำงาน/เรียน" ต่อพื้นที่/เคส
2. เลือกรัศมีได้ 100/150/200 เมตร โดยใช้แผนที่จำลอง (ไม่ใช่ Google Maps จริง — สอบถามแล้วผู้ใช้ยืนยันให้จำลองใน prototype ก่อน เพราะ Google Maps จริงต้องมี API key ของผู้ใช้เอง และไม่มี API สำหรับนับจำนวนหลังคาเรือนในรัศมีอยู่แล้ว)
3. จำนวนหลังคาเรือนคำนวณตามรัศมีที่เลือก (ไม่ใช่เลขคงที่) — ใช้ mock density ต่อพื้นที่ที่มีอยู่แล้ว สเกลตามพื้นที่วงกลม (r² )
4. เวลาเริ่มงานเป็น 24 ชั่วโมงเสมอ (ไม่ใช่ native time input ที่โชว์ AM/PM ตาม browser locale)

### Scope
แก้ไข `prototypes/v1/control-plan.html`, `control-plan.js`, `styles.css` ในที่ (ไม่สร้าง v2)

### รายละเอียด
1. **ขยาย `AREAS`** ให้แต่ละพื้นที่มี 2 ตำแหน่งย่อยที่เลือกได้อิสระ: `home` (ที่อยู่/บ้าน) และ `work` (สถานที่ทำงาน/เรียน) แต่ละตำแหน่งมี mock coordinate (สำหรับวาด mini-map) และ `baseHouseholdsAt100m` (ความหนาแน่นฐานที่รัศมี 100 เมตร)
2. **รายการเลือกพื้นที่** — เปลี่ยนจาก checkbox ต่อพื้นที่เป็น checkbox ต่อ (พื้นที่ + ตำแหน่ง) เช่น "ต.หนองบัว หมู่ 4 — ที่อยู่ (บ้าน)" และ "ต.หนองบัว หมู่ 4 — สถานที่ทำงาน/เรียน" แยกกัน เลือกได้ทั้งสอง
3. **ตัวเลือกรัศมี** — dropdown/radio 100/150/200 เมตร ต่อรายการที่เลือก จำนวนหลังคาเรือนคำนวณจาก `baseHouseholdsAt100m × (radius/100)²` (ปัดเป็นจำนวนเต็ม)
4. **Mini-map จำลอง** — SVG แบบเดียวกับ spot map ในหน้าอื่น (case-intake.js/case-analysis.js/field-tracking.js) แสดงตำแหน่งที่เลือก + วงรัศมีที่ปรับขนาดตามค่าที่เลือก (ระบุชัดในหน้าว่า "แผนที่จำลอง — ไม่ใช่พิกัดจริง" ตาม assumption เดิมของ spot map ทุกหน้า)
5. **เวลาเริ่มงาน 24 ชม.** — แทนที่ `<input type="time">` ในตารางกำหนดการ (จากรอบ 8) ด้วย `<select>` ชั่วโมง (00-23) + `<select>` นาที (00/15/30/45) แยกกัน เพื่อการันตี 24-hour format ทุก browser/locale
6. อัปเดต `buildApprovalText()`/`buildWorkplanText()` ให้ใช้จำนวนหลังคาเรือน/รัศมีที่คำนวณใหม่ตามตำแหน่ง+รัศมีที่เลือก แทนค่าคงที่เดิม

### Backlog/Feature ที่ไม่รวมในรอบนี้
Google Maps จริง, การนับหลังคาเรือนจากข้อมูลจริง — ต้องมี API key และข้อมูลทะเบียนบ้านจริงจากเทศบาล (นอก scope ของ static prototype)

### Assumption ที่ตั้งไว้
- Mini-map เป็น SVG จำลองเหมือน spot map หน้าอื่น ไม่ใช่พิกัดภูมิศาสตร์จริง
- สูตรคำนวณหลังคาเรือนเป็น mock scaling (r²) ไม่ใช่ข้อมูลสำรวจจริง
- ตำแหน่ง "สถานที่ทำงาน/เรียน" เป็น mock data ใหม่ที่ตั้งชื่อให้สอดคล้องกับพื้นที่เดิม ไม่ใช่ข้อมูลจริงจากเคสใดเคสหนึ่ง

### Version
แก้ไข `prototypes/v1` เดิมในที่ (ไม่สร้าง v2)

### Design Reference
อ้างอิง `DESIGN.md` เดิมให้เข้าชุดกับหน้าอื่น — mini-map ใช้โทนสีเดียวกับ spot map ที่มีอยู่แล้ว
