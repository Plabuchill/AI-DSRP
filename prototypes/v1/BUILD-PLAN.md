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
