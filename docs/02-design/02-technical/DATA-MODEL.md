# Data Model — AI-DSRP (ทั้งระบบ 8 โมดูล)

เอกสารนี้เป็น**conceptual data model เท่านั้น** — ยังไม่ผูกกับ database engine, ภาษาโปรแกรม หรือ framework ใดๆ (ยังไม่มีการยืนยันเทคโนโลยีมาในรอบนี้) ตามโครงจาก skill `data-contract-builder` (`references/data-contract-templates.md`)

ขอบเขต: ครอบคลุมทั้ง 8 โมดูลของระบบตาม [[../../01-requirements/01-spec/FEATURE-LIST|FEATURE-LIST.md]] — **Case Intake** (`FEAT-INTAKE-*`, เขียนไว้ก่อนหน้ารอบนี้ ไม่แก้เนื้อหาเดิม ยกเว้น 2 จุดที่ระบุไว้ชัดเจน: เพิ่ม `community_id`/`cluster_id` ใน `CASE` และเปลี่ยน `INVESTIGATION_TEAM` เป็น `TEAM` + `team_type`), **Dashboard** (`FEAT-DASH-*`), **Case Analysis** (`FEAT-ANALYSIS-*`), **Control Plan** (`FEAT-CONTROL-*`), **Field Tracking** (`FEAT-TRACK-*`), **ASM Coordination** (`FEAT-ASM-*`), **Reports** (`FEAT-REPORT-*`), **Alerts** (`FEAT-ALERT-*`) — อ้างอิง mock data จริงใน `prototypes/v1/*.js` ของแต่ละโมดูลเป็นฐาน — feature ที่ยังเป็น backlog ออกแบบ schema ให้พอ "รองรับได้" แต่ไม่ลงรายละเอียดการเชื่อมต่อ 3rd-party API จริง

## 1. ER Diagram

### 1.1 Case Intake (`FEAT-INTAKE-*`)

> เพิ่มเข้ามาในรอบนี้ (ดูหมายเหตุด้านล่างไดอะแกรม): field `community_id`/`cluster_id` ใน `CASE`, และเปลี่ยนชื่อ `INVESTIGATION_TEAM` เป็น `TEAM` (เพิ่ม `team_type`) — ไม่มีการแก้ไขอื่นใดต่อเนื้อหา Case Intake เดิม

```mermaid
erDiagram
  CASE ||--|| CASE_OCR_SNAPSHOT : "มีค่าดั้งเดิมจาก OCR"
  CASE ||--|| CASE_ATTACHMENT : "มีไฟล์ต้นฉบับแนบ"
  CASE }o--|| TEAM : "มีทีมรับผิดชอบหลัก"
  CASE ||--o{ CASE_NOTIFICATION_LOG : "มีประวัติการแจ้งเตือน"
  CASE_NOTIFICATION_LOG }o--|| TEAM : "แจ้งเตือนไปยังทีม"
  SUBDISTRICT_ROUTING_RULE }o--|| TEAM : "กำหนดทีมเริ่มต้นของตำบล"
  CASE }o--o| COMMUNITY : "เกิดขึ้นในชุมชน (nullable — เพิ่มใหม่ ดูนิยามเต็มใน ER Diagram 1.2 Dashboard)"
  CASE }o--o| CASE_CLUSTER : "อาจถูกจัดเข้ากลุ่มเคสที่ AI เสนอ (nullable — เพิ่มใหม่ ดูนิยามเต็มใน ER Diagram 1.3 Case Analysis)"

  CASE {
    string case_id PK
    string patient_name
    string hn
    string house_no
    string village_no
    string village
    string subdistrict
    string district
    string province
    date onset_date
    string lab_result
    enum status
    enum geo_accuracy
    boolean geo_adjusted
    string map_position
    string responsible_team FK
    string community_id FK
    string cluster_id FK
    date deleted_at
  }
  CASE_OCR_SNAPSHOT {
    string snapshot_id PK
    string case_id FK
    string patient_name
    string hn
    string house_no
    string village_no
    string village
    string subdistrict
    date onset_date
    string lab_result
    date captured_at
  }
  CASE_ATTACHMENT {
    string attachment_id PK
    string case_id FK
    string file_name
    enum file_type
    string file_size
    date uploaded_at
    string storage_reference
  }
  TEAM {
    number team_id PK
    string team_name
    enum team_type
  }
  SUBDISTRICT_ROUTING_RULE {
    string subdistrict_name PK
    string default_team FK
  }
  CASE_NOTIFICATION_LOG {
    string log_id PK
    string case_id FK
    string team FK
    date notified_at
  }
```

**หมายเหตุ cardinality ที่ยืนยันแล้วกับผู้ใช้ (Ambiguity Protocol):**

- `CASE` ↔ `CASE_ATTACHMENT` = **1:1** — 1 เคสมีไฟล์ต้นฉบับแนบได้ 1 ไฟล์เท่านั้นในรอบนี้ ตรงกับ mock ปัจจุบันที่มี field ไฟล์ฝังอยู่ระดับเคสเดียว (ไม่ใช่ list)
- `CASE` ↔ `CASE_OCR_SNAPSHOT` = **1:1** — capture ค่า OCR ดั้งเดิมครั้งเดียวตอน OCR เสร็จ, immutable, ใช้ diff กับค่าปัจจุบันใน `CASE`
- `CASE` ↔ `TEAM` (ผ่าน `responsible_team`) = **N:1** — 1 เคสมีทีมรับผิดชอบหลักทีมเดียว ณ เวลาใดเวลาหนึ่ง (ไม่ผูกหลายทีมพร้อมกัน) — entity นี้เปลี่ยนชื่อจาก `INVESTIGATION_TEAM` เป็น `TEAM` ในรอบนี้ (ยืนยันแล้ว) เพื่อรวมทีมสอบสวนโรค (5 ทีมเดิม) กับทีมพ่น (4 ทีมใหม่) ไว้ที่ entity เดียวกัน แยกด้วย `team_type`
- `CASE` ↔ `CASE_NOTIFICATION_LOG` = **1:N** — แยก concept "ประวัติการแจ้งเตือน" ออกจาก "ทีมรับผิดชอบปัจจุบัน" เพื่อรองรับกรณีแจ้งเตือนซ้ำในอนาคต (ปัจจุบัน prototype ยืนยันได้ครั้งเดียวต่อเคส จึงมี log ไม่เกิน 1 รายการต่อเคสในทางปฏิบัติ แต่ schema ไม่ได้ล็อกไว้แค่ 1 รายการ)
- `CASE` ↔ `COMMUNITY` = **N:1 (optional/nullable)** — เพิ่มใหม่ในรอบนี้ (ยืนยันแล้ว) คู่กับ field string เดิม (subdistrict/district/village/house_no) ไม่ลบของเดิม เพื่อให้ Dashboard join ได้จริงแทนการพึ่ง string match — nullable เพราะยังมีเคสเก่าที่ยังไม่ได้ผูก community
- `CASE` ↔ `CASE_CLUSTER` = **N:1 (optional/nullable)** — เพิ่มใหม่ในรอบนี้ (ยืนยันแล้ว) — nullable เพราะไม่ใช่ทุกเคสจะถูก AI จัดกลุ่ม

### 1.2 Dashboard (`FEAT-DASH-*`)

> Dashboard ไม่มี entity ของตัวเองที่เป็น CRUD — เป็น read-only/aggregation จาก `CASE`/`ALERT`/`TEAM` ที่มีอยู่แล้ว entity ใหม่ในโมดูลนี้เป็น**ข้อมูลอ้างอิง (lookup)** ล้วนๆ: `DISEASE`, `SERVICE_ZONE`, `COMMUNITY`

```mermaid
erDiagram
  COMMUNITY }o--|| SERVICE_ZONE : "อยู่ในเขตบริการ"
  COMMUNITY }o--|| TEAM : "มีทีมสอบสวนโรครับผิดชอบเป็นค่าเริ่มต้น"
  CASE }o--o| COMMUNITY : "เกิดขึ้นในชุมชน (nullable — นิยามเต็มของ CASE อยู่ใน ER Diagram 1.1)"

  DISEASE {
    string disease_id PK
    string name
  }
  SERVICE_ZONE {
    string zone_id PK
    string name
    number population
  }
  COMMUNITY {
    string community_id PK
    string name
    string zone_id FK
    number team_id FK
  }
```

**หมายเหตุ**: `DISEASE`/`SERVICE_ZONE`/`COMMUNITY` เป็น master data ที่ทุกโมดูลอ้างอิงร่วมกัน (`ALERT`, `CASE_CLUSTER` อ้าง `DISEASE`; `ALERT` อ้าง `SERVICE_ZONE`; `CASE`/`COMMUNITY` อ้าง `SERVICE_ZONE`/`TEAM`) — ตัวเลือก "ทุกโรค" ในตัวกรอง UI เป็นค่าระดับ UI เท่านั้น ไม่ใช่แถวข้อมูลจริงใน `DISEASE`

### 1.3 Case Analysis (`FEAT-ANALYSIS-*`)

```mermaid
erDiagram
  CASE }o--o| CASE_CLUSTER : "อาจถูกจัดเข้ากลุ่มเคสที่ AI เสนอ (nullable — นิยามเต็มของ CASE อยู่ใน ER Diagram 1.1)"
  CASE_CLUSTER }o--|| DISEASE : "เป็นกลุ่มของโรค (นิยามเต็มของ DISEASE อยู่ใน ER Diagram 1.2)"
  CASE_CLUSTER ||--o| INVESTIGATION_REPORT : "อาจมีรายงานสอบสวนโรค (สร้างได้เมื่อ confirmed แล้วเท่านั้น)"
  CASE ||--o| SURVEILLANCE_REPORT_506 : "อาจมี รง.506 ที่สร้างจากเคสนี้ (nullable — นิยามเต็มของ CASE อยู่ใน ER Diagram 1.1)"
  SURVEILLANCE_REPORT_506 }o--|| DISEASE : "ระบุโรคติดต่อ (นิยามเต็มของ DISEASE อยู่ใน ER Diagram 1.2)"
  SURVEILLANCE_REPORT_506 }o--|| TEAM : "สร้างโดยทีมสอบสวนโรค (นิยามเต็มของ TEAM อยู่ใน ER Diagram 1.1)"

  CASE_CLUSTER {
    string cluster_id PK
    string name
    string disease_id FK
    number confidence_pct
    number close_contacts_estimate
    enum status
    date confirmed_at
  }
  INVESTIGATION_REPORT {
    string report_id PK
    string cluster_id FK
    string content
    enum status
    date sent_at
  }
  SURVEILLANCE_REPORT_506 {
    string report_506_id PK
    string case_id FK
    string disease_id FK
    enum status
    number created_by_team_id FK
    number decided_by_team_id FK
    date created_at
    date decided_at
  }
```

**หมายเหตุ cardinality ที่ยืนยันแล้ว**: `CASE_CLUSTER` ↔ `INVESTIGATION_REPORT` = **1:1 (optional)** — 1 กลุ่มเคสมีรายงานได้อย่างมาก 1 ฉบับ และสร้างได้เฉพาะกลุ่มที่ `status = confirmed` เท่านั้น (business rule) — chatbot ประสานงาน อสม. (`FEAT-ANALYSIS-03`) เป็น scripted demo แบบ fixed script ในรอบนี้ ไม่มี entity ข้อมูลของตัวเอง (ยังไม่ persist บทสนทนา) จนกว่า `FEAT-ANALYSIS-06` (chatbot จริง) จะถูกทำ — `CASE` ↔ `SURVEILLANCE_REPORT_506` = **1:1 (optional/nullable)** — ไม่ใช่ทุกเคสจะมี รง.506 ที่สร้างขึ้น (`FEAT-ANALYSIS-07`)

### 1.4 Control Plan (`FEAT-CONTROL-*`)

```mermaid
erDiagram
  CASE ||--|{ CONTROL_LOCATION : "มีตำแหน่งควบคุมโรค (บ้าน/ที่ทำงาน, นิยามเต็มของ CASE อยู่ใน ER Diagram 1.1)"
  CONTROL_LOCATION ||--o| SPRAY_ASSIGNMENT : "มีแผนปฏิบัติงานพ่น (เมื่อ location active)"
  SPRAY_ASSIGNMENT }o--|| TEAM : "มอบหมายให้ทีมพ่น (นิยามเต็มของ TEAM อยู่ใน ER Diagram 1.1)"
  APPROVAL_REQUEST ||--|{ APPROVAL_REQUEST_CASE : "รวมเคสไว้ในคำขอรอบนี้"
  CASE ||--o{ APPROVAL_REQUEST_CASE : "ถูกรวมอยู่ในคำขออนุมัติ (ปรากฏได้หลายรอบ/หลายคำขอ)"
  APPROVAL_REQUEST }o--|| TEAM : "สร้างโดยทีมพ่น (นิยามเต็มของ TEAM อยู่ใน ER Diagram 1.1)"

  CONTROL_LOCATION {
    string location_id PK
    string case_id FK
    enum type
    string address
    string house_no
    string workplace_name
    string map_position
    enum default_radius
    boolean active
  }
  SPRAY_ASSIGNMENT {
    string assignment_id PK
    string location_id FK
    number assigned_team_id FK
    enum day_offset
    string scheduled_time
    number household_count
    boolean day0_done
    boolean day1_done
    boolean day7_done
  }
  APPROVAL_REQUEST {
    string request_id PK
    date created_at
    enum status "เพิ่มค่า rejected"
    date sent_at
    date approved_at
    date rejected_at
    number created_by_team_id FK
    string decided_by_name
  }
  APPROVAL_REQUEST_CASE {
    string request_id FK
    string case_id FK
    enum fuel_type
  }
```

**หมายเหตุ cardinality ที่ยืนยันแล้ว**:
- `CASE` ↔ `CONTROL_LOCATION` = **1:N (1 หรือ 2 ตำแหน่งต่อเคส — บ้าน/ที่ทำงาน)** — ต้องมี `active = true` อย่างน้อย 1 ตำแหน่งเสมอ (business rule)
- `CONTROL_LOCATION` ↔ `SPRAY_ASSIGNMENT` = **1:1 (optional)** — สร้างแผนปฏิบัติงานเมื่อตำแหน่งนั้น active เท่านั้น
- `APPROVAL_REQUEST` ↔ `CASE` = **N:M ผ่าน junction `APPROVAL_REQUEST_CASE`** — **1 คำขอต่อ 1 รอบ (batch ของเคส active ขณะนั้น) เก็บเป็น log ประวัติ** (ยืนยันแล้ว ไม่ใช่ single global draft แบบที่ mock ปัจจุบันทำ) — เคสเดียวกันปรากฏในหลายคำขอ (หลายรอบ) ได้ตามกาลเวลา
- `APPROVAL_REQUEST` ↔ `TEAM` = **N:1** — 1 ทีมสร้างได้หลายคำขอ, 1 คำขอมีทีมผู้สร้างทีมเดียว

### 1.5 Field Tracking (`FEAT-TRACK-*`)

```mermaid
erDiagram
  FIELD_PHOTO }o--|| TEAM : "ทีมที่ถ่ายภาพนี้ (นิยามพื้นฐานของ TEAM อยู่ใน ER Diagram 1.1)"

  TEAM {
    number team_id PK
    string team_name
    enum team_type
    enum status
    date last_update_at
  }
  FIELD_PHOTO {
    string photo_id PK
    number team_id FK
    date captured_at
    string area
    boolean location_match
    string location_note
    boolean time_match
    string time_note
    boolean manual_checked
    string storage_reference
  }
```

**หมายเหตุ**: `status`/`last_update_at` ใน `TEAM` ใช้เฉพาะทีมประเภท `control` (ทีมพ่น) — ทีมประเภท `investigation` ไม่มีค่าใน 2 field นี้ในรอบนี้ (nullable) เก็บแค่**สถานะปัจจุบัน** ไม่เก็บประวัติการเคลื่อนที่ (ยืนยันแล้ว) — โซนที่วางแผนไว้ (depot/zoneCenter/รัศมี) สำหรับวาดแผนที่ติดตามเป็นค่าที่**คำนวณ/join จาก `CONTROL_LOCATION` + `SPRAY_ASSIGNMENT`** ของทีมนั้นในวันนั้น ไม่ persist ซ้ำเป็น field แยกใน `TEAM` (ดู assumption ท้ายผลลัพธ์)

### 1.6 ASM Coordination (`FEAT-ASM-*`)

```mermaid
erDiagram
  ASM_PHOTO_INTAKE {
    string photo_id PK
    string asm_name
    string area
    date captured_at
    enum status
    string storage_reference
  }
  ADVANCE_NOTICE_QUEUE {
    string queue_id PK
    string area
    date day0_date
    date reminder1_date
    enum reminder1_status
    date reminder2_date
    enum reminder2_status
  }
```

**หมายเหตุ**: ทั้ง 2 entity เป็น standalone ในรอบนี้ — `area` เป็น string อธิบายพื้นที่ ยังไม่ผูกเป็น `reference → COMMUNITY`/`CONTROL_LOCATION` ตามที่ยืนยันในแผน (ไม่ normalize เพิ่ม, เก็บแบบ embedded 2 reminder ต่อแถวตาม mock)

### 1.7 Reports (`FEAT-REPORT-*`)

```mermaid
erDiagram
  REPORT_SEND_LOG {
    string log_id PK
    date generated_at
    enum period_type
    string snapshot_values
    date sent_at
    enum channel
    enum status
  }
```

**หมายเหตุ**: KPI ที่แสดงในหน้า Reports (จำนวนเคส, HI/CI, % พ่นแล้ว, % QC ผ่าน) เป็นค่า**คำนวณสด**จาก `CASE`/`SPRAY_ASSIGNMENT`/`FIELD_PHOTO` ฯลฯ ไม่ persist เป็น entity แยก (ยืนยันแล้ว) — `REPORT_SEND_LOG` เก็บเฉพาะ snapshot ค่าที่คำนวณได้ ณ ตอนส่ง เป็น audit log ว่าส่งอะไรไปเมื่อไหร่

### 1.8 Alerts (`FEAT-ALERT-*`)

```mermaid
erDiagram
  ALERT }o--|| DISEASE : "เกี่ยวข้องกับโรค (นิยามเต็มของ DISEASE อยู่ใน ER Diagram 1.2)"
  ALERT }o--|| SERVICE_ZONE : "เกิดขึ้นในเขตบริการ (นิยามเต็มของ SERVICE_ZONE อยู่ใน ER Diagram 1.2, แทนที่ region model เก่าใน mock)"
  ALERT }o--o| TEAM : "มอบหมายให้ทีม (nullable จนกว่าจะมอบหมาย, นิยามเต็มของ TEAM อยู่ใน ER Diagram 1.1)"

  ALERT {
    string alert_id PK
    string disease_id FK
    string zone_id FK
    string community
    enum severity
    string message
    enum status
    number assigned_team_id FK
    date assigned_at
    string close_note
    date closed_at
  }
```

**หมายเหตุ**: mock ปัจจุบันใน `alerts.js` ใช้ `regionId` แบบ 6-ภาคทั่วประเทศ (north/central/...) ซึ่งไม่ตรงกับโครงสร้างเทศบาลเดียว/4 เขตบริการจริงของระบบ — schema นี้ใช้ `zone_id → SERVICE_ZONE` แทนตามที่ยืนยันแล้ว ถือเป็น gap ระหว่าง mock เดิมกับ data model จริงที่ flag ไว้ท้ายผลลัพธ์ — `community` เป็น string เสริม (nullable) ยังไม่ผูกเป็น `reference → COMMUNITY` ในรอบนี้ (ไม่ได้ระบุไว้ชัดว่าต้องเป็น FK ในแผนที่ยืนยัน)

## 2. Entity Dictionary

### `CASE` — เคสผู้ป่วยที่รายงานเข้าระบบ (ข้อมูลปัจจุบัน/effective)

รองรับ Feature: `FEAT-INTAKE-01`, `FEAT-INTAKE-02`, `FEAT-INTAKE-03`, `FEAT-INTAKE-04`, `FEAT-INTAKE-07` (backlog — geo field), `FEAT-INTAKE-09` (backlog — unlock, ยังไม่รองรับในรอบนี้), `FEAT-DASH-*` (ผ่าน `community_id` — เพิ่มใหม่), `FEAT-ANALYSIS-01` (ผ่าน `cluster_id` — เพิ่มใหม่), `FEAT-CONTROL-01`/`02` (ผ่าน `CONTROL_LOCATION.case_id`)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| case_id | string (PK) | ใช่ | รหัสอ้างอิงเคสหลัก ไม่ซ้ำกันในระบบ |
| patient_name | string | ใช่ | ชื่อ-สกุลผู้ป่วย — แก้ไขได้ก่อนยืนยัน |
| hn | string | ใช่ | Hospital Number — แก้ไขได้ก่อนยืนยัน |
| house_no | string | ใช่ | บ้านเลขที่ — แก้ไขได้ก่อนยืนยัน |
| village_no | string | ใช่ | หมู่ที่ — แก้ไขได้ก่อนยืนยัน |
| village | string | ใช่ | ชื่อหมู่บ้าน — แก้ไขได้ก่อนยืนยัน |
| subdistrict | string | ใช่ | ตำบล — แก้ไขได้ก่อนยืนยัน, การแก้ไขค่านี้ trigger auto-route `responsible_team` (ดู `SUBDISTRICT_ROUTING_RULE`) |
| district | string | ใช่ | อำเภอ — **ไม่อยู่ในรายการฟิลด์ที่แก้ไขได้ผ่าน OCR Review ในรอบนี้** (ตรงกับ `saveEdit()` ของ prototype ปัจจุบันที่ไม่รวม `district`) |
| province | string | ใช่ | จังหวัด — เช่นเดียวกับ `district`, ไม่อยู่ในรายการฟิลด์ที่แก้ไขได้รอบนี้ |
| onset_date | date | ใช่ | วันที่เริ่มป่วยตามที่รายงาน — แก้ไขได้ก่อนยืนยัน |
| lab_result | string | ใช่ | ผลตรวจทางห้องปฏิบัติการ/คลินิก — แก้ไขได้ก่อนยืนยัน |
| status | enum(รอตรวจสอบ, ยืนยันแล้ว) | ใช่ | สถานะ human-in-the-loop — เปลี่ยนได้ทางเดียวจาก "รอตรวจสอบ" → "ยืนยันแล้ว" เท่านั้นในรอบนี้ (ไม่มี state สำหรับ unlock แก้ไขซ้ำ ตาม `FEAT-INTAKE-09` ที่ยังเป็น backlog) |
| geo_accuracy | enum(high, low) | ใช่ | ระดับความแม่นยำของพิกัดที่ได้มา (mock ปัจจุบันสุ่มค่า, ของจริงจะมาจาก Geocoding API ตาม `FEAT-INTAKE-07`) |
| geo_adjusted | boolean | ใช่ | ปรับพิกัดด้วยมือแล้วหรือยัง — มีผลเฉพาะกรณี `geo_accuracy = low` เป็น fallback ตามที่ ROADMAP.md ระบุ |
| map_position | string (conceptual) | ใช่ | ตำแหน่งสำหรับวาดหมุดบน Spot Map — เป็นค่าจำลองสำหรับ layout ในรอบนี้ ไม่ใช่พิกัดภูมิศาสตร์จริง (lat/long) จนกว่า `FEAT-INTAKE-07` จะเชื่อมต่อจริง |
| responsible_team | reference → `TEAM` | ใช่ | ทีมสอบสวนโรคที่รับผิดชอบเคสนี้ ณ ปัจจุบัน — auto-reassign ได้ตอนแก้ `subdistrict` (entity เปลี่ยนชื่อจาก `INVESTIGATION_TEAM` เป็น `TEAM` ในรอบนี้ — ดู Entity Dictionary ของ `TEAM` ด้านล่าง) |
| community_id | reference → `COMMUNITY` (nullable) | ไม่บังคับ (null = ยังไม่ได้ผูกชุมชน) | **เพิ่มใหม่ในรอบนี้** — ชุมชนที่เคสนี้เกิดขึ้น คู่กับ field string เดิม (subdistrict/district/village/house_no) เพื่อให้ Dashboard (`FEAT-DASH-*`) join ได้จริงแทนพึ่ง string match — ไม่ลบ field string เดิม |
| cluster_id | reference → `CASE_CLUSTER` (nullable) | ไม่บังคับ (null = ยังไม่ถูกจัดกลุ่ม) | **เพิ่มใหม่ในรอบนี้** — กลุ่มเคสที่ AI เสนอและอาจยืนยันแล้ว (`FEAT-ANALYSIS-01`) — เคสหนึ่งอยู่ในกลุ่มได้อย่างมาก 1 กลุ่ม ณ เวลาหนึ่ง |
| deleted_at | date (nullable) | ไม่บังคับ (null = ยังไม่ถูกลบ) | soft delete marker — ดูหัวข้อ Cross-cutting concerns |

**Business rule เพิ่มเติม**: แก้ไขข้อมูลได้เฉพาะเคสที่ `status = รอตรวจสอบ` เท่านั้น (ตรงกับ `startEdit()` ใน prototype ที่ปฏิเสธแถวที่ `confirmed`) — เคสที่ยืนยันแล้วต้องรอ `FEAT-INTAKE-09` (unlock flow, ยังไม่ทำ) ก่อนจะแก้ไขซ้ำได้

### `CASE_OCR_SNAPSHOT` — ค่าที่ OCR ดึงได้ตอนแรก (immutable audit baseline)

รองรับ Feature: `FEAT-INTAKE-02` (ฐานสำหรับ diff ตอน human-in-the-loop), `FEAT-INTAKE-05` (backlog — วัดความแม่นยำ OCR จริงในอนาคต)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| snapshot_id | string (PK) | ใช่ | รหัสอ้างอิง snapshot |
| case_id | reference → `CASE` (unique) | ใช่ | เคสที่ snapshot นี้เป็นของ — 1:1 กับ CASE |
| patient_name | string | ใช่ | ค่าดั้งเดิมจาก OCR (ก่อนแก้ไขใดๆ) |
| hn | string | ใช่ | ค่าดั้งเดิมจาก OCR |
| house_no | string | ใช่ | ค่าดั้งเดิมจาก OCR |
| village_no | string | ใช่ | ค่าดั้งเดิมจาก OCR |
| village | string | ใช่ | ค่าดั้งเดิมจาก OCR |
| subdistrict | string | ใช่ | ค่าดั้งเดิมจาก OCR |
| onset_date | date | ใช่ | ค่าดั้งเดิมจาก OCR |
| lab_result | string | ใช่ | ค่าดั้งเดิมจาก OCR |
| captured_at | date | ใช่ | เวลาที่ OCR extraction เสร็จ (ครั้งเดียว, immutable) |

**หมายเหตุ**: mirror เฉพาะ field ที่แก้ไขได้ใน `CASE` เท่านั้น (ไม่รวม `district`/`province` เพราะไม่อยู่ในรายการฟิลด์ที่แก้ไขได้ — จึงไม่จำเป็นต้องเก็บค่าดั้งเดิมไว้ diff) — เป็น audit trail แบบ "ต้นฉบับคู่กับค่าที่แก้แล้ว" ตามที่ยืนยันในแผน ไม่ใช่ full version history ทุกครั้งที่แก้

### `CASE_ATTACHMENT` — ไฟล์ต้นฉบับที่แนบมากับเคส

รองรับ Feature: `FEAT-INTAKE-01`, `FEAT-INTAKE-06` (backlog — เก็บจริงใน Google Drive)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| attachment_id | string (PK) | ใช่ | รหัสอ้างอิงไฟล์แนบ |
| case_id | reference → `CASE` (unique) | ใช่ | เคสที่ไฟล์นี้เป็นของ — 1:1 กับ CASE ในรอบนี้ |
| file_name | string | ใช่ | ชื่อไฟล์ต้นฉบับ |
| file_type | enum(PDF, JPEG) | ใช่ | ประเภทไฟล์ที่อัปโหลด |
| file_size | string | ใช่ | ขนาดไฟล์แบบแสดงผล (เช่น "842 KB") |
| uploaded_at | date | ใช่ | เวลาที่อัปโหลด |
| storage_reference | string (conceptual) | ใช่ | ที่อยู่อ้างอิงของไฟล์ในระบบจัดเก็บ — รอบนี้เป็น concept กลางๆ เท่านั้น ไม่ได้ออกแบบผูกกับ Google Drive API จริงตาม `FEAT-INTAKE-06` |

### `TEAM` — ทีมสอบสวนโรค/ทีมพ่น ตามเขตพื้นที่ (lookup)

รองรับ Feature: `FEAT-INTAKE-03`, `FEAT-TRACK-01`, `FEAT-CONTROL-01`, `FEAT-ALERT-01` (**entity นี้เปลี่ยนชื่อจาก `INVESTIGATION_TEAM` ในรอบนี้ — ยืนยันแล้ว** เพื่อรวมทีมสอบสวนโรค 5 ทีมเดิมกับทีมพ่น 4 ทีมใหม่ไว้ที่ entity เดียวกัน แยกด้วย `team_type`)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| team_id | number (PK) | ใช่ | รหัสทีม — 5 รายการทีมสอบสวนโรค (`team_type = investigation`) + 4 รายการทีมพ่น (`team_type = control`) ตาม mock |
| team_name | string | ใช่ | ชื่อทีม เช่น "ทีมสอบสวนโรค เขต 1", "ทีมพ่น 1" |
| team_type | enum(investigation, control) | ใช่ | **เพิ่มใหม่ในรอบนี้** — ประเภททีม แยกทีมสอบสวนโรคออกจากทีมพ่น |
| status | enum(not_arrived, spraying, done) (nullable) | ไม่บังคับ (ใช้เฉพาะ `team_type = control`) | **เพิ่มใหม่ในรอบนี้** (`FEAT-TRACK-01`) — สถานะปฏิบัติงานภาคสนามปัจจุบันของทีมพ่น เก็บแค่สถานะปัจจุบัน ไม่เก็บประวัติ (ยืนยันแล้ว) |
| last_update_at | date (nullable) | ไม่บังคับ (ใช้เฉพาะ `team_type = control`) | **เพิ่มใหม่ในรอบนี้** (`FEAT-TRACK-01`) — เวลาที่อัปเดตสถานะล่าสุด |

### `SUBDISTRICT_ROUTING_RULE` — กฎ auto-route ตำบล → ทีมเริ่มต้น (lookup)

รองรับ Feature: `FEAT-INTAKE-02` (ใช้ตอนแก้ไขและบันทึก), `FEAT-INTAKE-03`

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| subdistrict_name | string (PK) | ใช่ | ชื่อตำบลที่ระบบรู้จักล่วงหน้า (mock ปัจจุบันมี 6 รายการ) |
| default_team | reference → `TEAM` | ใช่ | ทีมที่ควรรับผิดชอบตำบลนี้เป็นค่าเริ่มต้น (`team_type = investigation` เสมอในบริบทนี้) |

**Business rule สำคัญ**: กฎนี้ครอบคลุมเฉพาะตำบลที่มีอยู่ใน rule set เท่านั้น — ถ้าผู้ใช้แก้ไข `subdistrict` ของเคสเป็นชื่อตำบลที่**ไม่ตรง**กับ `subdistrict_name` ใดใน entity นี้ ระบบจะ**ไม่เปลี่ยน** `responsible_team` เดิมของเคสนั้น (คงค่าก่อนแก้ไขไว้) — ตรงกับ behavior ของ `SUBDISTRICT_TEAM_MAP` ใน `prototypes/v1/case-intake.js` ทุกประการ

### `CASE_NOTIFICATION_LOG` — ประวัติการแจ้งเตือนทีมสอบสวนโรค

รองรับ Feature: `FEAT-INTAKE-03`, `FEAT-INTAKE-08` (backlog — ช่องทางแจ้งเตือนจริงผ่าน LINE OA)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| log_id | string (PK) | ใช่ | รหัสอ้างอิง log entry |
| case_id | reference → `CASE` | ใช่ | เคสที่ถูกแจ้งเตือน |
| team | reference → `TEAM` | ใช่ | ทีมที่ได้รับแจ้งเตือน ณ เวลานั้น |
| notified_at | date | ใช่ | เวลาที่ส่งแจ้งเตือน |

**หมายเหตุ**: entity นี้เก็บเฉพาะ reference ไปยัง `CASE`/`TEAM` + เวลา ไม่ denormalize ชื่อผู้ป่วย/ตำบลไว้ในตัวเอง (ต่างจาก mock `NOTIFICATIONS[]` ที่เก็บ `patientName`/`subdistrict` แบบ snapshot ไว้ตรงๆ เพื่อความสะดวกในการ render) — ข้อมูลแสดงผลเหล่านั้นต้องดึงผ่าน `case_id` ตอน query แทน ดู "Assumption" ท้ายผลลัพธ์

### Module: Dashboard (`FEAT-DASH-*`)

### `DISEASE` — โรค/ภาวะที่เฝ้าระวัง (lookup)

รองรับ Feature: `FEAT-DASH-06`, `FEAT-ANALYSIS-01`, `FEAT-ALERT-01`

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| disease_id | string (PK) | ใช่ | รหัสโรค (dengue/influenza/covid19/hfmd/foodpoison ตาม mock) |
| name | string | ใช่ | ชื่อโรคแสดงผล |

**หมายเหตุ**: ตัวเลือก "ทุกโรค (All Diseases)" ในตัวกรอง UI ของ Dashboard เป็นค่าระดับ UI ที่แปลว่า "ไม่กรอง" เท่านั้น ไม่ใช่แถวข้อมูลจริงใน entity นี้

### `SERVICE_ZONE` — เขตบริการของเทศบาล (lookup)

รองรับ Feature: `FEAT-DASH-03`, `FEAT-DASH-07`, `FEAT-DASH-14`, `FEAT-ALERT-01`

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| zone_id | string (PK) | ใช่ | รหัสเขตบริการ (zone1-4 ตาม mock) |
| name | string | ใช่ | ชื่อเขตบริการ เช่น "เขตบริการ 1" |
| population | number | ใช่ | จำนวนประชากรในเขต — ใช้คำนวณอัตราป่วยต่อแสนประชากร (`FEAT-DASH-07`) |

### `COMMUNITY` — ชุมชนย่อยในเขตบริการ (lookup)

รองรับ Feature: `FEAT-DASH-03`, `FEAT-DASH-13`

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| community_id | string (PK) | ใช่ | รหัสชุมชน |
| name | string | ใช่ | ชื่อชุมชน (63 รายการรวมทุกเขตตาม mock) |
| zone_id | reference → `SERVICE_ZONE` | ใช่ | เขตบริการที่ชุมชนนี้สังกัด |
| team_id | reference → `TEAM` | ใช่ | ทีมสอบสวนโรค (`team_type = investigation`) ที่รับผิดชอบชุมชนนี้เป็นค่าเริ่มต้น |

**หมายเหตุ**: Dashboard ไม่มี entity ของตัวเองนอกจาก 3 lookup ข้างต้น — Stat tiles/กราฟ/ตารางวิเคราะห์เชิงลึกทั้งหมด (`FEAT-DASH-02`, `04`, `05`, `07` ถึง `15`) เป็นค่าคำนวณ/aggregate สดจาก `CASE`/`ALERT` ที่มีอยู่แล้ว — **gap ที่พบ**: `CASE` ในรอบนี้ยังไม่มี field ระดับ demographic (เพศ/อายุ/อาชีพ) หรือ `disease_id`/การวินิจฉัย DF-DHF ที่ Dashboard ต้องใช้จริงสำหรับ `FEAT-DASH-08` ถึง `11` — เนื่องจากไม่อยู่ในจุดที่ Build Plan อนุมัติให้แก้ไข `CASE` (อนุมัติเฉพาะ `community_id`/`cluster_id`) จึงไม่เพิ่มเองในรอบนี้ ถือเป็น gap ที่ flag ไว้ท้ายผลลัพธ์ ไม่ใช่ scope ที่ทำเงียบๆ

### Module: Case Analysis (`FEAT-ANALYSIS-*`)

### `CASE_CLUSTER` — กลุ่มเคสที่ AI เสนอเชื่อมโยงกัน

รองรับ Feature: `FEAT-ANALYSIS-01`, `FEAT-ANALYSIS-02`, `FEAT-ANALYSIS-04` (backlog — clustering algorithm จริง)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| cluster_id | string (PK) | ใช่ | รหัสกลุ่มเคส |
| name | string | ใช่ | ชื่อกลุ่ม เช่น "กลุ่มไข้เลือดออก ต.หนองบัว" |
| disease_id | reference → `DISEASE` | ใช่ | โรค/ภาวะของกลุ่มนี้ |
| confidence_pct | number | ใช่ | ระดับความมั่นใจของ AI ในการจัดกลุ่ม (0-100) |
| close_contacts_estimate | number | ใช่ | จำนวนผู้สัมผัสใกล้ชิดโดยประมาณ |
| status | enum(pending, confirmed) | ใช่ | สถานะยืนยัน — เปลี่ยนได้ทางเดียวจาก `pending` → `confirmed` เท่านั้น (human-in-the-loop, ตรงกับ `confirmCluster()` ของ prototype) |
| confirmed_at | date (nullable) | ไม่บังคับ (null จนกว่าจะยืนยัน) | เวลาที่ยืนยัน cluster |

**Business rule**: ไม่มี reopen กลับเป็น `pending` หลังยืนยันแล้ว (one-way transition ตามที่ยืนยันในแผน)

### `INVESTIGATION_REPORT` — ร่างรายงานสอบสวนโรคต่อกลุ่มเคส

รองรับ Feature: `FEAT-ANALYSIS-02`, `FEAT-ANALYSIS-05` (backlog — AI ร่างจากข้อมูลดิบจริง)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| report_id | string (PK) | ใช่ | รหัสรายงาน |
| cluster_id | reference → `CASE_CLUSTER` (unique) | ใช่ | กลุ่มเคสที่รายงานนี้เป็นของ — 1:1 กับ `CASE_CLUSTER` |
| content | string | ใช่ | เนื้อหารายงาน (ร่างจาก template/AI, แก้ไขต่อได้ก่อนส่ง) |
| status | enum(draft, sent) | ใช่ | สถานะรายงาน |
| sent_at | date (nullable) | ไม่บังคับ (null จนกว่าจะส่ง) | เวลาที่ส่งรายงาน |

**Business rule**: สร้างรายงานได้เฉพาะ `CASE_CLUSTER.status = confirmed` เท่านั้น (ตรงกับ `renderReportControls()`/`generateReport()` ของ prototype ที่ปิดตัวเลือกกลุ่มที่ยังไม่ยืนยัน); ส่งรายงานได้ต่อเมื่อ `content` ไม่ว่าง (ตรงกับ `sendReport()`)

**หมายเหตุ**: chatbot ประสานงาน อสม. (`FEAT-ANALYSIS-03`) เป็น scripted demo แบบข้อความคงที่ (fixed script) ในรอบนี้ — ยังไม่มี entity เก็บบทสนทนา จนกว่า `FEAT-ANALYSIS-06` (chatbot จริง, จำกัดสิทธิ์ตาม PDPA) จะถูกทำ

### `SURVEILLANCE_REPORT_506` — บันทึกและยืนยันรายงานผู้ป่วยเฝ้าระวังโรค (รง.506)

รองรับ Feature: `FEAT-ANALYSIS-07`

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| report_506_id | string (PK) | ใช่ | รหัส รง.506 |
| case_id | reference → `CASE` (unique, nullable) | ไม่บังคับ (null = ยังไม่ผูกกับเคสใด) | เคสที่ รง.506 นี้เป็นของ — 1:1 optional เพราะไม่ใช่ทุกเคสจะมี รง.506 |
| disease_id | reference → `DISEASE` | ใช่ | โรคติดต่อที่เลือกสำหรับรายการนี้ |
| status | enum(รอพิจารณา, ยืนยัน, ไม่ยืนยัน) | ใช่ | สถานะ human-in-the-loop — เปลี่ยนได้ทางเดียวจาก "รอพิจารณา" → "ยืนยัน" หรือ "ไม่ยืนยัน" เท่านั้น (one-way, ไม่มี reopen กลับ "รอพิจารณา") |
| created_by_team_id | reference → `TEAM` (team_type=investigation) | ใช่ | ทีมสอบสวนโรคผู้สร้างรายการนี้ |
| decided_by_team_id | reference → `TEAM` (nullable) | ไม่บังคับ (null จนกว่าจะตัดสินใจ) | ทีมที่กดเปลี่ยนสถานะเป็นยืนยัน/ไม่ยืนยัน (มักเป็นทีมเดียวกับผู้สร้าง แต่ schema ไม่ได้ล็อกไว้ว่าต้องเป็นทีมเดียวกัน) |
| created_at | date | ใช่ | เวลาที่สร้างรายการ |
| decided_at | date (nullable) | ไม่บังคับ (null จนกว่าจะตัดสินใจ) | เวลาที่กดยืนยัน/ไม่ยืนยัน |

**Business rule**: ไม่มี reopen กลับเป็น "รอพิจารณา" หลังตัดสินใจแล้ว (one-way transition ตามที่ยืนยันในแผน เช่นเดียวกับ `CASE_CLUSTER.status`)

### Module: Control Plan (`FEAT-CONTROL-*`)

### `CONTROL_LOCATION` — ตำแหน่งที่ต้องควบคุมโรค (บ้าน/ที่ทำงาน) ต่อเคส

รองรับ Feature: `FEAT-CONTROL-01`, `FEAT-CONTROL-02`

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| location_id | string (PK) | ใช่ | รหัสตำแหน่งควบคุมโรค |
| case_id | reference → `CASE` | ใช่ | เคสที่ตำแหน่งนี้เป็นของ |
| type | enum(home, work) | ใช่ | ประเภทตำแหน่ง — ที่อยู่ (บ้าน) หรือสถานที่ทำงาน/สถานศึกษา |
| address | string (nullable) | ไม่บังคับ (ใช้เมื่อ `type = home`) | ที่อยู่ — แก้ไขได้ |
| house_no | string (nullable) | ไม่บังคับ (ใช้เมื่อ `type = home`) | บ้านเลขที่ — แก้ไขได้ |
| workplace_name | string (nullable) | ไม่บังคับ (ใช้เมื่อ `type = work`) | ชื่อสถานที่ทำงาน/สถานศึกษา — แก้ไขได้ |
| map_position | string (conceptual) | ใช่ | ตำแหน่งสำหรับวาดหมุดบน mini-map (mock, ไม่ใช่พิกัดจริง) |
| default_radius | enum(100, 150, 200) | ใช่ | รัศมีที่เลือกพ่นสารเคมี (เมตร) — ใช้คำนวณจำนวนหลังคาเรือนโดยประมาณด้วย |
| active | boolean | ใช่ | ตำแหน่งนี้ active อยู่ในแผนปัจจุบันหรือไม่ — เลือกได้มากกว่า 1 ตำแหน่งต่อเคสพร้อมกัน |

**Business rule**: ต้องมี `active = true` อย่างน้อย 1 ตำแหน่งต่อเคสเสมอ (ตรงกับ `activeLocTypesByAreaId` ของ prototype ที่ไม่มี state ว่างเปล่า)

### `SPRAY_ASSIGNMENT` — แผนปฏิบัติงานพ่นสารเคมีต่อตำแหน่ง

รองรับ Feature: `FEAT-CONTROL-01`, `FEAT-CONTROL-04` (backlog — real-time tracking จริง), `FEAT-CONTROL-05` (backlog — AI vision QC จริง)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| assignment_id | string (PK) | ใช่ | รหัสรายการมอบหมาย |
| location_id | reference → `CONTROL_LOCATION` (unique) | ใช่ | ตำแหน่งที่มอบหมายนี้เป็นของ — 1:1 |
| assigned_team_id | reference → `TEAM` | ใช่ | ทีมพ่น (`team_type = control`) ที่รับผิดชอบ — แก้ไขได้ (ทีมใดรับผิดชอบกี่แถวก็ได้) |
| day_offset | enum(0, 1, 7) | ใช่ | วันปฏิบัติงานนับจากวันพบเคส (Day 0/1/7 ตามมาตรฐานควบคุมพาหะไข้เลือดออก) |
| scheduled_time | string (conceptual, เวลา 24 ชม.) | ใช่ | เวลาที่กำหนดปฏิบัติงาน |
| household_count | number | ใช่ | จำนวนหลังคาเรือนโดยประมาณในรัศมีที่เลือก (คำนวณจาก `CONTROL_LOCATION.default_radius`) |
| day0_done | boolean | ใช่ | สถานะพ่นแล้ว Day 0 |
| day1_done | boolean | ใช่ | สถานะพ่นแล้ว Day 1 |
| day7_done | boolean | ใช่ | สถานะพ่นแล้ว Day 7 |

**หมายเหตุ**: แถวที่ Day 0/1/7 ครบทุกวันแล้วจะถูกซ่อนจากตารางแผนปฏิบัติงาน (ตรงกับ `isSprayFullyDone()` ของ prototype) แต่ยังคงอยู่ใน entity ไม่ถูกลบ

### `APPROVAL_REQUEST` — คำขออนุมัติเบิกน้ำมัน/น้ำยาเคมี (1 รายการต่อ 1 รอบ)

รองรับ Feature: `FEAT-CONTROL-02`, `FEAT-CONTROL-03` (backlog — workflow อนุมัติจริง)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| request_id | string (PK) | ใช่ | รหัสคำขออนุมัติ |
| created_at | date | ใช่ | เวลาที่สร้างคำขอ (ร่างเริ่มต้น) |
| status | enum(draft, sent, approved, rejected) | ใช่ | สถานะคำขอ — `rejected` เป็น terminal state เหมือน `approved` |
| sent_at | date (nullable) | ไม่บังคับ | เวลาที่ส่งคำขอ |
| approved_at | date (nullable) | ไม่บังคับ | เวลาที่อนุมัติ |
| rejected_at | date (nullable) | ไม่บังคับ | เวลาที่ไม่อนุมัติ |
| created_by_team_id | reference → `TEAM` (team_type=control) | ใช่ | ทีมพ่นผู้สร้างคำขอนี้ |
| decided_by_name | string (nullable) | ไม่บังคับ (มีค่าเมื่อ status = approved/rejected) | ชื่อผู้อนุมัติ/ไม่อนุมัติ (free-text ชั่วคราว — ดู gap note ด้านล่าง) |

**Business rule**: `draft` → `sent` ต้องมีเนื้อหา (รายการเคส) ไม่ว่าง; `sent` → `approved` เท่านั้น (ไม่มี fast-path จาก draft); ไม่มี reopen กลับ `draft` — **1 คำขอ = 1 รอบ (snapshot ของเคส active ขณะนั้น)** เก็บเป็น log ประวัติทุกรอบ (ยืนยันแล้ว ต่างจาก mock ปัจจุบันที่มี draft เดี่ยว global เพียงชุดเดียว) `sent` → `rejected` เป็น terminal state เช่นเดียวกับ `sent` → `approved` (ไม่มี reopen กลับ `draft` เช่นกัน — ถ้าต้องการยื่นใหม่ต้องสร้างคำขอรอบใหม่)

**Gap**: `decided_by_name` เก็บเป็น free-text ชั่วคราวเพราะระบบยังไม่มี USER/role entity (backlog "ระบบ login และสิทธิ์ผู้ใช้" ใน `ROADMAP.md` บรรทัด 70 ยังไม่ถูกทำ) — เมื่อ backlog นั้นถูกทำ ควรเปลี่ยนเป็น reference → USER แทน

### `APPROVAL_REQUEST_CASE` — เคสที่ถูกรวมอยู่ในคำขอแต่ละรอบ (junction)

รองรับ Feature: `FEAT-CONTROL-02`

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| request_id | reference → `APPROVAL_REQUEST` | ใช่ | คำขอที่แถวนี้เป็นของ (ส่วนหนึ่งของ primary key ร่วม) |
| case_id | reference → `CASE` | ใช่ | เคสที่ถูกรวมอยู่ในคำขอรอบนี้ (ส่วนหนึ่งของ primary key ร่วม) |
| fuel_type | enum(gasoline, diesel, lubricant, chemical, other) | ใช่ | ชนิดน้ำมัน/น้ำยาเคมีที่เลือกสำหรับเคสนี้ในคำขอรอบนี้ |

**หมายเหตุ**: primary key ร่วมคือ `(request_id, case_id)` — เป็น snapshot ประวัติว่าคำขอรอบไหนรวมเคสอะไรบ้าง ไม่ใช่ current state (เคสเดียวกันปรากฏในหลายคำขอ/หลายรอบตามกาลเวลาได้)

### Module: Field Tracking (`FEAT-TRACK-*`)

### `FIELD_PHOTO` — รูปภาคสนามที่ผ่าน AI Vision QC

รองรับ Feature: `FEAT-TRACK-02`, `FEAT-CONTROL-05` (backlog — AI vision QC จริงจากพิกัด/เวลาที่เก็บผ่านแอปตอนถ่าย)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| photo_id | string (PK) | ใช่ | รหัสรูปภาพ |
| team_id | reference → `TEAM` | ใช่ | ทีมที่ถ่ายภาพนี้ (`team_type = control`) |
| captured_at | date | ใช่ | เวลาที่ถ่ายภาพ |
| area | string | ใช่ | พื้นที่ที่ควรพ่น (ข้อความอธิบาย) |
| location_match | boolean | ใช่ | ผลตรวจ AI ว่าพิกัดภาพตรงกับพื้นที่ที่วางแผนหรือไม่ |
| location_note | string (nullable) | ไม่บังคับ (ใช้เมื่อ `location_match = false`) | หมายเหตุเมื่อพิกัดไม่ตรง |
| time_match | boolean | ใช่ | ผลตรวจ AI ว่าเวลาถ่ายตรงกับแผนปฏิบัติงานหรือไม่ |
| time_note | string (nullable) | ไม่บังคับ (ใช้เมื่อ `time_match = false`) | หมายเหตุเมื่อเวลาไม่ตรง |
| manual_checked | boolean | ใช่ | ตรวจสอบด้วยมือแล้วหรือไม่ — เปลี่ยนได้ทางเดียวจาก `false` → `true` |
| storage_reference | string (conceptual) | ใช่ | ที่อยู่อ้างอิงของไฟล์รูปในระบบจัดเก็บ |

**Business rule**: ตรวจสอบด้วยมือทำได้เฉพาะรูปที่ `location_match = false` หรือ `time_match = false` เท่านั้น (ตรงกับเงื่อนไข `needsCheck` ของ prototype)

### Module: ASM Coordination (`FEAT-ASM-*`)

### `ASM_PHOTO_INTAKE` — รูปยืนยันพ่นที่ อสม. ส่งผ่าน LINE OA

รองรับ Feature: `FEAT-ASM-01`, `FEAT-ASM-03` (backlog — รับรูปจาก LINE OA จริง)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| photo_id | string (PK) | ใช่ | รหัสรูปภาพ |
| asm_name | string | ใช่ | ชื่อ อสม. ผู้ส่งรูป |
| area | string | ใช่ | พื้นที่ที่เกี่ยวข้อง (ยังไม่ผูกเป็น reference ในรอบนี้) |
| captured_at | date | ใช่ | วันที่ส่งรูป |
| status | enum(done, not_done) | ใช่ | สถานะสรุปโดย AI vision (พ่นแล้ว/ยังไม่พ่น) — เป็น read-only ผลจาก AI ในรอบนี้ |
| storage_reference | string (conceptual) | ใช่ | ที่อยู่อ้างอิงของไฟล์รูปในระบบจัดเก็บ |

### `ADVANCE_NOTICE_QUEUE` — คิวแจ้งเตือนล่วงหน้าก่อนพ่น (2 รอบต่อพื้นที่)

รองรับ Feature: `FEAT-ASM-02`, `FEAT-ASM-04` (backlog — ส่งแจ้งเตือน LINE จริง)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| queue_id | string (PK) | ใช่ | รหัสคิวแจ้งเตือน |
| area | string | ใช่ | พื้นที่ที่จะแจ้งเตือน (ยังไม่ผูกเป็น reference ในรอบนี้) |
| day0_date | date | ใช่ | วันที่พ่นรอบแรก (Day 0) |
| reminder1_date | date | ใช่ | วันที่กำหนดส่งแจ้งเตือนล่วงหน้ารอบ 1 (ก่อน Day 0) |
| reminder1_status | enum(sent, pending) | ใช่ | สถานะการส่งแจ้งเตือนรอบ 1 |
| reminder2_date | date | ใช่ | วันที่กำหนดส่งแจ้งเตือนล่วงหน้ารอบ 2 (ก่อน Day 0+7) |
| reminder2_status | enum(sent, pending) | ใช่ | สถานะการส่งแจ้งเตือนรอบ 2 |

**หมายเหตุ**: เก็บแบบ embedded 2 reminder ต่อแถว (ไม่ normalize แยกเป็นตารางย่อย) ตามที่ยืนยันในแผน ตรงกับโครงสร้าง `QUEUE[]` ของ prototype

### Module: Reports (`FEAT-REPORT-*`)

### `REPORT_SEND_LOG` — ประวัติการส่งรายงานสรุปสถานการณ์

รองรับ Feature: `FEAT-REPORT-01`, `FEAT-REPORT-02`, `FEAT-REPORT-03` (backlog — รวมข้อมูล real-time จริงจากทุกทีม)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| log_id | string (PK) | ใช่ | รหัส log |
| generated_at | date | ใช่ | เวลาที่สร้างรายงานสรุป |
| period_type | enum(daily, weekly) | ใช่ | ประเภทช่วงเวลาของรายงาน |
| snapshot_values | string (conceptual) | ใช่ | ค่า KPI ที่คำนวณได้ ณ ตอนสร้าง/ส่งรายงาน (จำนวนเคส, HI/CI, % พ่นแล้ว, % QC ผ่าน ฯลฯ) — เป็น snapshot ครั้งเดียว ไม่ใช่ reference สดไปยังค่าปัจจุบัน |
| sent_at | date | ใช่ | เวลาที่ส่งรายงาน |
| channel | enum(LINE, PDF) | ใช่ | ช่องทางที่ส่ง |
| status | enum(sent) | ใช่ | สถานะ — รอบนี้มีค่าเดียว (`sent`) เพราะยังไม่มี draft state ที่ persist ก่อนส่ง |

**หมายเหตุ**: KPI ที่แสดงบนหน้า Reports (จำนวนเคส, สถานะควบคุมโรค, HI/CI, รายงานสอบสวนที่ส่งแล้ว) เป็นค่า**คำนวณสด**จาก `CASE`/`SPRAY_ASSIGNMENT`/`FIELD_PHOTO`/`INVESTIGATION_REPORT` ที่มีอยู่แล้ว ไม่ persist เป็น entity แยก — `REPORT_SEND_LOG` มีไว้เพื่อเป็น audit log ว่าส่งอะไรไปเมื่อไหร่เท่านั้น

### Module: Alerts (`FEAT-ALERT-*`)

### `ALERT` — การแจ้งเตือนสถานการณ์ผิดปกติ

รองรับ Feature: `FEAT-ALERT-01`, `FEAT-ALERT-02`, `FEAT-ALERT-03` (backlog — เชื่อมข้อมูล real-time กับ Dashboard)

| Attribute | Conceptual Type | จำเป็นต้องมี | คำอธิบาย |
|---|---|---|---|
| alert_id | string (PK) | ใช่ | รหัสการแจ้งเตือน |
| disease_id | reference → `DISEASE` | ใช่ | โรคที่เกี่ยวข้อง |
| zone_id | reference → `SERVICE_ZONE` | ใช่ | เขตบริการที่เกิดเหตุ — **แทนที่ `regionId` แบบ 6-ภาคทั่วประเทศใน mock เดิมด้วย `SERVICE_ZONE` ปัจจุบัน (4 เขต) ตามที่ยืนยันแล้ว** |
| community | string (nullable) | ไม่บังคับ | ชุมชน/พื้นที่เจาะจงเพิ่มเติมแบบ freeform — ยังไม่ผูกเป็น `reference → COMMUNITY` ในรอบนี้ |
| severity | enum(warning, danger) | ใช่ | ระดับความรุนแรง |
| message | string | ใช่ | ข้อความแจ้งเตือน |
| status | enum(new, in_progress, closed) | ใช่ | สถานะ — one-way, ไม่มี reopen/unassign |
| assigned_team_id | reference → `TEAM` (nullable) | ไม่บังคับ (null จนกว่าจะมอบหมาย) | ทีมที่ได้รับมอบหมาย — เป็นได้ทั้ง `team_type = investigation` หรือ `control` (9 ตัวเลือกตาม mock) |
| assigned_at | date (nullable) | ไม่บังคับ | เวลาที่มอบหมาย |
| close_note | string (nullable) | ไม่บังคับ (**บังคับกรอกก่อนเปลี่ยนเป็น `closed`**) | บันทึกสรุปก่อนปิดเคส |
| closed_at | date (nullable) | ไม่บังคับ | เวลาที่ปิดเคส |

**Business rule**: มอบหมายทีมต้องเลือกทีมก่อนเปลี่ยนสถานะเป็น `in_progress`; ปิดเคสต้องมี `close_note` ไม่ว่างก่อนเปลี่ยนเป็น `closed`; ไม่มี reopen/unassign ในรอบนี้ (ตรงกับ prototype ทุกประการ)

## 3. Cross-cutting concerns

- **Audit trail**: เก็บค่า OCR ดั้งเดิมคู่กับค่าปัจจุบันแบบ "ต้นฉบับ 1 ครั้ง vs ค่าที่แก้ไขแล้ว" ผ่าน `CASE_OCR_SNAPSHOT` (immutable, capture ครั้งเดียวตอน OCR เสร็จ) — ไม่ใช่ full version history ทุกครั้งที่แก้ไข ตามที่ยืนยันใน Ambiguity Protocol สำหรับ Case Intake — ในโมดูลใหม่ 7 โมดูล audit trail ที่ยืนยันชัดเจนมีเฉพาะ `CASE_CLUSTER.confirmed_at`/`APPROVAL_REQUEST` (เก็บเป็น log ทุกรอบผ่าน `APPROVAL_REQUEST_CASE` แทนการเขียนทับ draft เดิม) และ `REPORT_SEND_LOG` (audit ว่าส่งอะไรไปเมื่อไหร่) — entity อื่นที่เหลือ (เช่น `FIELD_PHOTO`, `ALERT`, `ASM_PHOTO_INTAKE`) เก็บแค่สถานะปัจจุบันตามที่ยืนยันในแผน ไม่มี version history เพิ่มเติม
- **Soft delete policy**: Soft delete เสมอ ไม่มี hard delete operation ในเอกสารนี้ — `CASE`, `CASE_OCR_SNAPSHOT`, `CASE_ATTACHMENT`, `CASE_NOTIFICATION_LOG` (ข้อมูลที่ผูกกับ lifecycle ของเคสสุขภาพโดยตรง) ต้องมี field แบบ `deleted_at` เพื่อทำเครื่องหมายว่าถูกลบแทนการลบถาวร entity lookup (`TEAM`, `SUBDISTRICT_ROUTING_RULE`, `DISEASE`, `SERVICE_ZONE`, `COMMUNITY`) เป็น master data ที่มี lifecycle ของตัวเอง ไม่ได้ระบุ soft delete ไว้ในตารางด้านบนเพื่อไม่ scope creep — ถือเป็น assumption ที่ระบุไว้ท้ายผลลัพธ์ **entity ใหม่ทั้ง 7 โมดูลไม่ได้ถูกระบุ soft delete policy อย่างชัดเจนใน Build Plan รอบนี้** จึงไม่เพิ่ม `deleted_at` ให้เองเพื่อไม่ scope creep — ถือเป็น gap ที่ flag ไว้ท้ายผลลัพธ์ (ต้องยืนยันเพิ่มเติมภายหลังโดยเฉพาะ entity ที่เกี่ยวกับข้อมูลสุขภาพ เช่น `CASE_CLUSTER`, `INVESTIGATION_REPORT`, `CONTROL_LOCATION`)
- **Multi-tenancy**: ไม่อยู่ใน scope ของ Build Plan รอบนี้ ไม่ได้ระบุไว้ในเอกสารนี้ (ครอบคลุมทั้ง Case Intake เดิมและ 7 โมดูลใหม่)
