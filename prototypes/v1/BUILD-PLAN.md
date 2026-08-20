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
