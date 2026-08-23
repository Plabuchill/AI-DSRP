# High Level Architecture — AI-DSRP

อ้างอิงจาก [[../../../ROADMAP.md|ROADMAP.md]] (เฟสการเชื่อมต่อจริง) และ [[../../01-requirements/01-spec/FEATURE-LIST|FEATURE-LIST.md]] (ฟีเจอร์ต่อโมดูล) — เอกสารนี้อธิบาย 2 สถานะ: **สถานะปัจจุบัน** (prototype) และ **สถานะเป้าหมาย** (หลังเชื่อมต่อจริงตาม Phase 1-8)

## 1. สถานะปัจจุบัน (Prototype)

```mermaid
flowchart LR
  User["ผู้ใช้ (ทุกบทบาท)"] --> Browser["เบราว์เซอร์"]
  Browser --> Static["Static HTML/CSS/JS\n(prototypes/v1/)"]
  Static --> Mock["Mock data\n(ฝังใน .js ของแต่ละหน้า)"]
```

8 หน้า (`index.html`, `case-intake.html`, `case-analysis.html`, `control-plan.html`, `field-tracking.html`, `asm-coordination.html`, `reports.html`, `alerts.html`) เป็นไฟล์อิสระต่อกัน แต่ละหน้ามี mock data ของตัวเอง **ไม่มี backend, ไม่มี database, ไม่มี authentication จริง** — ทุก interaction (ยืนยัน, ส่งอนุมัติ, แจ้งเตือน) เป็น client-side state ที่หายไปเมื่อ reload หน้า

## 2. สถานะเป้าหมาย (หลัง Phase 1-8 ตาม ROADMAP.md)

```mermaid
flowchart TB
  subgraph Users["ผู้ใช้ 6 บทบาท (FEAT-PLATFORM-02)"]
    U1["เจ้าหน้าที่ รพ./เทศบาล"]
    U2["ทีมสอบสวนโรค (เขต 1-5)"]
    U3["ทีมควบคุมโรค/ทีมพ่น (ทีม 1-4)"]
    U4["อสม."]
    U5["ผู้บริหาร"]
  end

  subgraph Frontend["Web App (ต่อยอดจาก prototypes/v1/)"]
    FE["8 โมดูล: Dashboard / Case Intake / Case Analysis /\nControl Plan / Field Tracking / ASM Coordination /\nReports / Alerts"]
  end

  subgraph Backend["Backend / API (FEAT-PLATFORM-01)"]
    API["API Server"]
    AUTH["Login + Role-based Access\n(FEAT-PLATFORM-02)"]
    DB[("Database\nประวัติเคส/ไฟล์ต้นฉบับ\n(FEAT-PLATFORM-03)")]
  end

  subgraph AI["AI / Extraction Services"]
    OCR["OCR / Document AI\n(FEAT-INTAKE-05)"]
    GEO["Geocoding API\n(FEAT-INTAKE-07)"]
    CLUSTER["Case Clustering\n(FEAT-ANALYSIS-04)"]
    VISION["AI Vision QC รูปภาคสนาม\n(FEAT-CONTROL-05)"]
  end

  subgraph External["บริการภายนอก (3rd-party)"]
    SHEET["Google Sheet / Drive\n(FEAT-INTAKE-06)"]
    LINE["LINE OA / Messaging API\n(FEAT-INTAKE-08, FEAT-ASM-04)"]
  end

  U1 -- "อัปโหลด PDF/JPEG" --> FE
  U2 --> FE
  U3 --> FE
  U4 -- "ส่งรูปผ่าน LINE OA" --> LINE
  U5 --> FE

  FE <--> AUTH
  FE <--> API
  API <--> DB
  API --> OCR
  API --> GEO
  API --> CLUSTER
  API --> VISION
  API <--> SHEET
  API <--> LINE

  OCR -. "ข้อมูลที่ดึงได้" .-> API
  GEO -. "พิกัด" .-> API
```

### คำอธิบายแต่ละส่วน

| Layer | องค์ประกอบ | เชื่อมโยง Feature/Phase |
|---|---|---|
| **Users** | 6 บทบาทตาม role-based access | FEAT-PLATFORM-02 (Phase 7) |
| **Frontend** | Web app ต่อยอดจาก 8 หน้า prototype ปัจจุบัน | FEAT-DASH, FEAT-INTAKE, FEAT-ANALYSIS, FEAT-CONTROL, FEAT-TRACK, FEAT-ASM, FEAT-REPORT, FEAT-ALERT |
| **Backend/API** | API Server กลาง + Auth + Database | FEAT-PLATFORM-01/02/03 (Phase 7) |
| **AI Services** | OCR/Document AI, Geocoding, Case Clustering, Vision QC | FEAT-INTAKE-05/07, FEAT-ANALYSIS-04, FEAT-CONTROL-05 (Phase 1-3) |
| **External** | Google Sheet/Drive (เก็บข้อมูล+ไฟล์ต้นฉบับ), LINE OA (แจ้งเตือน/รับรูป) | FEAT-INTAKE-06/08, FEAT-ASM-03/04 (Phase 1, 4) |

## 3. Data Flow หลัก (เคสไข้เลือดออก 1 เคส)

```mermaid
sequenceDiagram
  participant รพ as โรงพยาบาล
  participant Intake as Case Intake
  participant OCR as OCR/Document AI
  participant Sheet as Google Sheet/Drive
  participant Team as ทีมสอบสวนโรค
  participant Analysis as Case Analysis
  participant Control as Control Plan
  participant Spray as ทีมพ่น
  participant ASM as อสม.
  participant Dash as Dashboard/Reports

  รพ->>Intake: อัปโหลด PDF/JPEG รายงานเคส
  Intake->>OCR: ส่งไฟล์ให้ดึงข้อมูล
  OCR-->>Intake: ชื่อ/HN/ที่อยู่/วันป่วย/ผลตรวจ
  Intake->>Intake: เจ้าหน้าที่ตรวจสอบ/แก้ไข (human-in-the-loop)
  Intake->>Sheet: บันทึกแถวข้อมูล + ไฟล์ต้นฉบับ
  Intake->>Team: แจ้งเตือนผ่าน LINE OA ตามพื้นที่
  Team->>Analysis: วิเคราะห์ cluster + ร่างรายงานสอบสวนโรค
  Analysis->>Control: ส่งพื้นที่ที่ยืนยันแล้วต่อ
  Control->>Control: ร่างใบขออนุมัติน้ำมัน/เคมี + แผนปฏิบัติงาน (Day 0/1/7)
  Control->>Spray: มอบหมายทีมพ่นตามเขตบริการ/ชุมชน
  Spray->>ASM: อสม.ส่งรูปยืนยันพ่นผ่าน LINE
  ASM-->>Dash: อัปเดตสถานะควบคุมโรค
  Dash-->>Dash: สรุป KPI/HI-CI ส่งผู้บริหาร
```

## 3B. Data Flow ตาม User Journey — Outbreak Dashboard

Diagram นี้แปลงมาจากขั้นตอนจริงใน [[../01-prototypes/USER-JOURNEY-outbreak-dashboard|USER-JOURNEY-outbreak-dashboard.md]] (persona: สมศักดิ์ สุขวัฒน์ เจ้าหน้าที่เฝ้าระวังโรค) แบบ 1:1 ต่อ step — ใช้คำศัพท์ปัจจุบันที่ตรงกับ `prototypes/v1/index.html` จริง (เช่น "เขตบริการ", "Stat tiles", "แผนที่ความเสี่ยงตามเขตบริการ") แทนคำเดิมในเอกสาร journey ("ภูมิภาค", "KPI Cards") ที่เขียนไว้ก่อนหน้าจะปรับโครงสร้าง 2 รอบหลังสุด

```mermaid
sequenceDiagram
  participant จนท as เจ้าหน้าที่เฝ้าระวังโรค
  participant Dash as Outbreak Dashboard UI
  participant Filter as Filter State (โรค/เขตบริการ/ช่วงวัน)

  Note over จนท,Dash: Journey Step 1 — เปิด index.html (Dashboard)
  จนท->>Dash: เปิดหน้า Dashboard
  Dash-->>จนท: Left rail แสดง wordmark, เมนู Dashboard active, เมนูอื่น placeholder

  Note over จนท,Dash: Journey Step 2 — ดู Stat tiles ภาพรวม
  Dash-->>จนท: แสดง Stat tiles ทุกโรค/ทุกเขตบริการ (ค่าเริ่มต้น)

  Note over จนท,Dash: Journey Step 3 — สังเกตแผนที่ความเสี่ยงตามเขตบริการ
  Dash-->>จนท: แสดงครบทุกเขตบริการ พร้อมสีระดับความเสี่ยง + จำนวนเคสสะสม

  Note over จนท,Filter: Journey Step 4 — กรอง Filter (โรค+เขตบริการ)
  จนท->>Filter: ตั้งค่าตัวกรองให้แคบลง
  Filter-->>Dash: เงื่อนไข AND ใหม่
  Dash-->>จนท: ทุก panel อัปเดตพร้อมกันทันที

  Note over จนท,Dash: Journey Step 5 — ดู Trend Chart
  Dash-->>จนท: กราฟรายวัน + ค่าเฉลี่ยเคลื่อนที่ 3 วัน ตามตัวกรองที่ตั้งไว้

  Note over จนท,Dash: Journey Step 6 — ดู Recent Alerts Panel
  Dash-->>จนท: รายการแจ้งเตือนที่ตรงเงื่อนไข พร้อม severity/พื้นที่/เวลา

  alt Step 7a — เห็นสัญญาณชัดเจน (วิกฤต + แนวโน้มเพิ่ม)
    จนท->>จนท: ตัดสินใจ escalate ผ่านช่องทางนอกระบบ (โทร/LINE)
    Note over จนท: เมนู Cases/Alerts ยังเป็น placeholder — Backlog: FEAT-INTAKE-08, FEAT-ALERT-03
  else Step 7b — ไม่พบสัญญาณผิดปกติ
    จนท->>Filter: กด "ล้างตัวกรอง"
    Filter-->>Dash: คืนค่าเริ่มต้น
    Dash-->>จนท: ทุก panel กลับสู่มุมมองภาพรวม
  end
```

### Journey Step ↔ Diagram interaction ↔ Feature ID

| Journey Step | Interaction ใน Diagram | Feature ID |
|---|---|---|
| 1. เปิด index.html (Dashboard) | จนท->>Dash: เปิดหน้า Dashboard / Dash-->>จนท: left rail + เมนู | FEAT-DASH-01 |
| 2. ดู Stat tiles ภาพรวม | Dash-->>จนท: แสดง Stat tiles ค่าเริ่มต้น | FEAT-DASH-02 |
| 3. สังเกตแผนที่ความเสี่ยงตามเขตบริการ | Dash-->>จนท: แสดงครบทุกเขตบริการ + สีความเสี่ยง | FEAT-DASH-03 |
| 4. กรอง Filter (โรค+เขตบริการ) | จนท->>Filter / Filter-->>Dash / Dash-->>จนท: panel อัปเดตพร้อมกัน | FEAT-DASH-06 |
| 5. ดู Trend Chart | Dash-->>จนท: กราฟรายวัน + ค่าเฉลี่ยเคลื่อนที่ 3 วัน | FEAT-DASH-04 |
| 6. ดู Recent Alerts Panel | Dash-->>จนท: รายการแจ้งเตือนตรงเงื่อนไข | FEAT-DASH-05 |
| 7a. เห็นสัญญาณชัดเจน → escalate นอกระบบ | alt branch: จนท->>จนท ตัดสินใจ escalate | Backlog: FEAT-INTAKE-08, FEAT-ALERT-03 |
| 7b. ไม่พบสัญญาณผิดปกติ → ล้างตัวกรอง | else branch: จนท->>Filter / Filter-->>Dash / Dash-->>จนท | FEAT-DASH-06 |

## 4. ข้อจำกัดทางเทคนิคที่ต้องพิจารณาก่อนสร้างจริง

อ้างอิงจากคำเตือนที่มีอยู่แล้วใน ROADMAP.md:

- **LINE ไม่มี API ติดตามตำแหน่งต่อเนื่อง** (Phase 3) — "location sharing" ของ LINE เป็นครั้งเดียว ต้องใช้แอป LIFF แยกถ้าต้องการ real-time tracking ทีมพ่น
- **รูปที่ส่งผ่าน LINE มักถูกล้าง EXIF/geotag** (Phase 3-4) — ต้องเก็บพิกัด/เวลาแยกตอนถ่ายผ่านแอป (LIFF ขอสิทธิ์ตำแหน่ง) ไม่ใช่ดึงจาก metadata ไฟล์ที่ส่งมา
- **LINE Messaging API มี quota** (free tier จำกัดจำนวนข้อความ/เดือน) — ต้องเช็คก่อน scale การแจ้งเตือนอัตโนมัติ (Phase 4)
- **PDPA** — ข้อมูลสุขภาพที่ส่งผ่าน 3rd-party API (Google/LINE) ต้องทบทวนให้สอดคล้องกฎหมาย โดยเฉพาะ chatbot อสม. (Phase 2) และรูปภาคสนาม (Phase 3-4) — chatbot ต้องจำกัดสิทธิ์แค่นัดหมาย/แจ้งพื้นที่ ห้ามส่งข้อมูลเคสละเอียด
- **Case clustering ต้องมี human-in-the-loop เสมอ** (Phase 2) — AI เสนอ cluster ที่เป็นไปได้เท่านั้น นักระบาดวิทยายืนยันก่อนทุกครั้ง เพราะ cluster ผิดอาจทำให้ทุ่มทรัพยากรผิดพื้นที่

## 5. ลำดับการสร้างจริง (อ้างอิง Phase ใน ROADMAP.md)

Phase 7 (Platform Foundations: Backend/API, Auth, Database) ควรทำคู่ขนานหรือก่อน Phase 1-4 เพราะทุกโมดูลพึ่งพา แต่ Phase 5 (รายงานสรุปอัตโนมัติ) ต้องทำ**หลังสุด**เพราะขึ้นกับคุณภาพข้อมูลจาก Phase 1-4 ทั้งหมด (ระบุไว้ชัดเจนใน ROADMAP.md แล้ว) — Phase 8 (Hardening: performance/security/accessibility) ทำเป็นลำดับสุดท้ายก่อนใช้งานจริง
