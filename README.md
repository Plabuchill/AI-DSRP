# AI-DSRP — AI Disease Surveillance & Response Platform

ระบบเฝ้าระวังและตอบสนองต่อการระบาดของโรค ที่ช่วยให้เจ้าหน้าที่สาธารณสุข (โรงพยาบาล → เทศบาล → ทีมสอบสวนโรค) รับ ตรวจสอบ และติดตามเคสรายงานโรคได้เร็วขึ้น โดยลดขั้นตอนคีย์ข้อมูลมือด้วย OCR/AI extraction และ auto-route การแจ้งเตือนไปยังทีมที่รับผิดชอบพื้นที่

> **สถานะ**: อยู่ในขั้นตอน Prototype — เป็น static HTML/CSS/JS ที่ใช้ mock data ทั้งหมด ยังไม่มีการเชื่อมต่อ backend/API จริง

## โครงสร้างโปรเจกต์

```
├── DESIGN.md              # Design system หลัก (Earth Tone + Minimalist + Muji) ทุก prototype ต้องอ้างอิงไฟล์นี้
├── prototypes/
│   └── v1/                # Prototype ปัจจุบัน
│       ├── index.html         # หน้า Outbreak Dashboard — KPI, แผนที่ความเสี่ยงตามภูมิภาค, กราฟแนวโน้มเคส, การแจ้งเตือนล่าสุด, ตัวกรอง
│       ├── case-intake.html   # หน้า Case Intake — รับข้อมูลผู้ป่วยจากโรงพยาบาล (อัปโหลดเอกสาร, ตรวจสอบ/แก้ไขผล OCR, แจ้งเตือนทีมสอบสวนโรค, spot map)
│       ├── script.js / case-intake.js
│       ├── styles.css
│       └── BUILD-PLAN.md      # แผนที่ยืนยันแล้วของแต่ละฟีเจอร์ใน v1 (scope, assumption, ประวัติการแก้ไข)
└── test-docs/
    └── v1/                # เอกสาร QA ของ prototype v1
        ├── TEST-PLAN.md
        ├── ACCEPTANCE-CRITERIA.md
        ├── TEST-CASES.xlsx
        └── BUILD-PLAN.md
```

## ฟีเจอร์หลักใน Prototype v1

- **Outbreak Dashboard** — ภาพรวมสถานการณ์การระบาด: จำนวนเคส, พื้นที่เสี่ยง, แนวโน้ม, การแจ้งเตือนล่าสุด พร้อมตัวกรองตามโรค/ภูมิภาค/ช่วงวันที่
- **Case Intake** — รับเคสจากโรงพยาบาล (PDF/JPEG) → จำลองผล OCR/AI extraction เป็นตาราง → ตรวจสอบและแก้ไขข้อมูลที่ผิดพลาดได้ก่อนยืนยัน (human-in-the-loop) → เมื่อยืนยันแล้วระบบ auto-route แจ้งเตือนไปยังทีมสอบสวนโรคตามพื้นที่ พร้อมปักหมุด + วงรัศมี 100 เมตรบน spot map

ทั้งสองหน้าใช้ mock data บริบทประเทศไทย และออกแบบให้เปิดใช้งานแบบออฟไลน์ได้ (ไม่พึ่งพา CDN หรือ map tile ภายนอก)

## วิธีเปิดดู Prototype

เปิดไฟล์ `prototypes/v1/index.html` ในเบราว์เซอร์ได้โดยตรง หรือรันผ่าน static server เช่น:

```bash
npx http-server prototypes/v1 -p 8743 -c-1
```

แล้วเข้า `http://localhost:8743`

## เอกสารประกอบ

- [DESIGN.md](./DESIGN.md) — Design system (สี, typography, spacing, component guideline)
- [prototypes/v1/BUILD-PLAN.md](./prototypes/v1/BUILD-PLAN.md) — แผนและ requirement ต้นทางของแต่ละฟีเจอร์
- [test-docs/v1/TEST-PLAN.md](./test-docs/v1/TEST-PLAN.md), [ACCEPTANCE-CRITERIA.md](./test-docs/v1/ACCEPTANCE-CRITERIA.md), [TEST-CASES.xlsx](./test-docs/v1/TEST-CASES.xlsx) — แผนทดสอบและเกณฑ์การยอมรับของ prototype v1

## Roadmap (นอก scope ปัจจุบัน)

- การเชื่อมต่อ Google Sheet/Google Drive/LINE OA จริง
- OCR/Geocoding API จริง (ปัจจุบันเป็น mock)
- หน้า Alert & Response Management แบบเต็ม, ระบบ login/สิทธิ์ผู้ใช้, backend จริง
