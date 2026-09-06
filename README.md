# AI-DSRP — AI Disease Surveillance & Response Platform

ระบบเฝ้าระวังและตอบสนองต่อการระบาดของโรค ที่ช่วยให้เจ้าหน้าที่สาธารณสุข (โรงพยาบาล → เทศบาล → ทีมสอบสวนโรค) รับ ตรวจสอบ และติดตามเคสรายงานโรคได้เร็วขึ้น โดยลดขั้นตอนคีย์ข้อมูลมือด้วย OCR/AI extraction และ auto-route การแจ้งเตือนไปยังทีมที่รับผิดชอบพื้นที่

> **สถานะ**: อยู่ในขั้นตอน Prototype — เป็น static HTML/CSS/JS ที่ใช้ mock data ทั้งหมด ยังไม่มีการเชื่อมต่อ backend/API จริง

## โครงสร้างโปรเจกต์

```
├── DESIGN.md              # Design system หลัก (Earth Tone + Minimalist + Muji) ทุก prototype ต้องอ้างอิงไฟล์นี้
├── ROADMAP.md             # แผนงานเต็มแบ่งเป็นเฟส
├── prototypes/
│   └── v1/                # Prototype ปัจจุบัน — 8 หน้า (index/case-intake/case-analysis/control-plan/
│                          #   field-tracking/asm-coordination/reports/alerts) + BUILD-PLAN.md ประวัติการตัดสินใจ
└── docs/                  # Index vault (Obsidian) — สารบัญ/เอกสารที่ไม่ได้อยู่ที่ root โดยตรง
    ├── 01-requirements/01-spec/FEATURE-LIST.md      # Feature List ทั้งระบบ
    ├── 02-design/01-prototypes/USER-JOURNEY-*.md    # User Journey แต่ละโมดูล
    └── 03-testing/01-test-plan/v1/                  # TEST-PLAN.md, ACCEPTANCE-CRITERIA.md, TEST-CASES.xlsx
```

`docs/` เป็นแค่สารบัญที่ชี้กลับมาที่ root — `DESIGN.md`, `ROADMAP.md`, `prototypes/` ที่ root คือของจริงชุดเดียว (ไม่มีสำเนาซ้ำใน `docs/`) เพื่อไม่ให้ 2 ชุดไม่ตรงกัน

## ฟีเจอร์หลักใน Prototype v1

ดูรายละเอียดครบทุกฟีเจอร์/สถานะได้ที่ [Feature List](./docs/01-requirements/01-spec/FEATURE-LIST.md) — สรุปสั้นๆ 8 หน้า:

- **Outbreak Dashboard** — ภาพรวมสถานการณ์การระบาด: จำนวนเคส, พื้นที่เสี่ยง, แนวโน้ม, การแจ้งเตือนล่าสุด พร้อมตัวกรองตามโรค/ภูมิภาค/ช่วงวันที่
- **Case Intake** — รับเคสจากโรงพยาบาล (PDF/JPEG) → จำลองผล OCR/AI extraction เป็นตาราง → ตรวจสอบและแก้ไขข้อมูลที่ผิดพลาดได้ก่อนยืนยัน (human-in-the-loop) → เมื่อยืนยันแล้วระบบ auto-route แจ้งเตือนไปยังทีมสอบสวนโรคตามพื้นที่ พร้อมปักหมุด + วงรัศมี 100 เมตรบน spot map
- **Case Analysis**, **Control Plan**, **Field Tracking**, **ASM Coordination**, **Reports**, **Alerts** — ดูรายละเอียดใน Feature List ด้านบน

ทุกหน้าใช้ mock data บริบทประเทศไทย และออกแบบให้เปิดใช้งานแบบออฟไลน์ได้ (ไม่พึ่งพา CDN หรือ map tile ภายนอก)

## วิธีเปิดดู Prototype

เปิดไฟล์ `prototypes/v1/index.html` ในเบราว์เซอร์ได้โดยตรง หรือรันผ่าน static server เช่น:

```bash
npx http-server prototypes/v1 -p 8743 -c-1
```

แล้วเข้า `http://localhost:8743`

## เอกสารประกอบ

- [DESIGN.md](./DESIGN.md) — Design system (สี, typography, spacing, component guideline)
- [prototypes/v1/BUILD-PLAN.md](./prototypes/v1/BUILD-PLAN.md) — แผนและ requirement ต้นทางของแต่ละฟีเจอร์
- [docs/01-requirements/01-spec/FEATURE-LIST.md](./docs/01-requirements/01-spec/FEATURE-LIST.md) — Feature List ทั้งระบบ
- [docs/02-design/01-prototypes/USER-JOURNEY-outbreak-dashboard.md](./docs/02-design/01-prototypes/USER-JOURNEY-outbreak-dashboard.md) — User Journey ตัวอย่าง
- [docs/03-testing/01-test-plan/v1/](./docs/03-testing/01-test-plan/v1/) — TEST-PLAN.md, ACCEPTANCE-CRITERIA.md, TEST-CASES.xlsx (แผนทดสอบและเกณฑ์การยอมรับของ prototype v1)

## Roadmap

ดู [ROADMAP.md](./ROADMAP.md) สำหรับแผนงานเต็ม แบ่งเป็นเฟส — ตั้งแต่การเชื่อมต่อ Google Sheet/Drive/LINE OA/Geocoding จริง, Alert & Response Management แบบเต็ม, ไปจนถึง backend/authentication และ hardening ก่อนใช้งานจริง

## ผู้จัดทำ

Suchavadee Chaiwanna
