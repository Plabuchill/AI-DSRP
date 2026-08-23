# API Spec — Case Intake (`FEAT-INTAKE-*`)

เอกสารนี้เป็น**conceptual API spec เท่านั้น** — ระบุ *operation* (การกระทำที่ระบบต้องรองรับ) ไม่ใช่ endpoint จริง ยังไม่ตัดสินว่าเป็น REST/GraphQL/RPC และไม่ระบุ auth mechanism เจาะจง เพราะยังไม่มีการยืนยันเทคโนโลยีมาในรอบนี้ อ้างอิงโครงจาก skill `data-contract-builder` (`references/data-contract-templates.md`) และ entity ตาม [[./DATA-MODEL|DATA-MODEL.md]]

ขอบเขตที่ยืนยันแล้ว: Operation list + payload ตัวอย่างระดับ field (conceptual type) — **ไม่รวม** error/validation case แบบละเอียดในรอบนี้

## 1. หลักการ Conceptual API

ทุก operation ระบุแบบ "actor ทำอะไรกับอะไร" — ยังไม่ผูกกับ HTTP verb, path, หรือ transport protocol ใดๆ

## 2. Operation List — Module: Case Intake (`FEAT-INTAKE-*`)

| Operation | Actor | วัตถุประสงค์ | Input (conceptual) | Output (conceptual) |
|---|---|---|---|---|
| 1. อัปโหลดไฟล์รายงานเคส | เจ้าหน้าที่ รพ./เทศบาล | สร้างเคสใหม่จากไฟล์รายงาน + ให้ OCR ดึงข้อมูลเติมเป็นค่าเริ่มต้น | ไฟล์ (PDF/JPEG), file_name, file_type | `CASE` ใหม่ (status = รอตรวจสอบ) + `CASE_ATTACHMENT` + `CASE_OCR_SNAPSHOT` |
| 2. ดึงรายการเคส (filter ตามสถานะ) | เจ้าหน้าที่ | แสดงตาราง OCR Review | filter: status (รอตรวจสอบ/ยืนยันแล้ว/ทั้งหมด), ช่วงวันที่ (optional) | list ของ `CASE` ที่ตรงตาม filter พร้อมข้อมูล `responsible_team`/`CASE_ATTACHMENT` แบบสรุป |
| 3. แก้ไขข้อมูลเคสก่อนยืนยัน | เจ้าหน้าที่ | แก้ค่าที่ OCR ดึงผิด ก่อนยืนยันเข้าระบบ | case_id, field ที่แก้ + ค่าใหม่ (จำกัดเฉพาะ patient_name, hn, house_no, village_no, village, subdistrict, onset_date, lab_result) | `CASE` ที่อัปเดตแล้ว — `responsible_team` reassign อัตโนมัติถ้า subdistrict ที่แก้ตรงกับ `SUBDISTRICT_ROUTING_RULE` (ถ้าไม่ตรง ทีมเดิมไม่เปลี่ยน) |
| 4. ปรับพิกัดด้วยมือ | เจ้าหน้าที่ | fallback ปรับพิกัดเมื่อความแม่นยำต่ำ | case_id | `CASE.geo_adjusted` toggle (มีผลเฉพาะเคสที่ geo_accuracy = low) |
| 5. ยืนยันเคส | เจ้าหน้าที่ | ปิดขั้นตอนตรวจสอบ + แจ้งเตือนทีมสอบสวนโรค | case_id | `CASE.status` → ยืนยันแล้ว + สร้าง `CASE_NOTIFICATION_LOG` ใหม่ (team = responsible_team ปัจจุบัน) |
| 6. ดึงประวัติการแจ้งเตือน | เจ้าหน้าที่ / ทีมสอบสวนโรค | ตรวจสอบว่าแจ้งเตือนไปแล้วหรือยัง/ไปที่ทีมไหน | filter: case_id (optional), team (optional) | list ของ `CASE_NOTIFICATION_LOG` |
| 7. ดึงข้อมูลสำหรับ Spot Map | เจ้าหน้าที่ / ทีมสอบสวนโรค | แสดงหมุด + วงรัศมี 100 เมตรของเคสที่ยืนยันแล้ว | filter: team (optional) | list ของ `CASE` ที่ status = ยืนยันแล้ว พร้อม map_position, geo_accuracy, geo_adjusted, responsible_team |

Traceability: operation 1 → `FEAT-INTAKE-01` (+ ฐานรองรับ `FEAT-INTAKE-05`/`06` ในอนาคต) · operation 2-3 → `FEAT-INTAKE-02` · operation 4 → `FEAT-INTAKE-04` (+ ฐานรองรับ `FEAT-INTAKE-07`) · operation 5-6 → `FEAT-INTAKE-03` (+ ฐานรองรับ `FEAT-INTAKE-08`) · operation 7 → `FEAT-INTAKE-04`

## 3. Payload ตัวอย่าง (pseudo-schema)

### Operation 1 — อัปโหลดไฟล์รายงานเคส

```
UploadCaseFileRequest {
  file: binary
  file_name: string
  file_type: enum(PDF, JPEG)
}

UploadCaseFileResponse {
  case: {
    case_id: string
    patient_name: string
    hn: string
    house_no: string
    village_no: string
    village: string
    subdistrict: string
    district: string
    province: string
    onset_date: date
    lab_result: string
    status: enum        // = "รอตรวจสอบ"
    geo_accuracy: enum
    geo_adjusted: boolean
    map_position: string
    responsible_team: reference<INVESTIGATION_TEAM>
  }
  attachment: {
    attachment_id: string
    file_name: string
    file_type: enum
    file_size: string
    uploaded_at: date
    storage_reference: string
  }
  ocr_snapshot: {
    snapshot_id: string
    patient_name: string
    hn: string
    house_no: string
    village_no: string
    village: string
    subdistrict: string
    onset_date: date
    lab_result: string
    captured_at: date
  }
}
```

### Operation 2 — ดึงรายการเคส

```
ListCasesRequest {
  status?: enum(รอตรวจสอบ, ยืนยันแล้ว, ทั้งหมด)
  date_from?: date
  date_to?: date
}

ListCasesResponse {
  cases: list<CASE>   // ดูโครง CASE เต็มใน DATA-MODEL.md
}
```

### Operation 3 — แก้ไขข้อมูลเคสก่อนยืนยัน

```
UpdateCaseRequest {
  case_id: string
  fields: {
    patient_name?: string
    hn?: string
    house_no?: string
    village_no?: string
    village?: string
    subdistrict?: string
    onset_date?: date
    lab_result?: string
  }
}

UpdateCaseResponse {
  case_id: string
  updated_fields: list<string>
  responsible_team: reference<INVESTIGATION_TEAM>   // อาจเปลี่ยนถ้า subdistrict ตรงกับ SUBDISTRICT_ROUTING_RULE
  status: enum   // ยังคงเป็น "รอตรวจสอบ"
}
```

### Operation 4 — ปรับพิกัดด้วยมือ

```
ToggleGeoAdjustRequest {
  case_id: string
}

ToggleGeoAdjustResponse {
  case_id: string
  geo_adjusted: boolean
}
```

### Operation 5 — ยืนยันเคส

```
ConfirmCaseRequest {
  case_id: string
}

ConfirmCaseResponse {
  case_id: string
  status: enum   // = "ยืนยันแล้ว"
  notification_log: {
    log_id: string
    team: reference<INVESTIGATION_TEAM>
    notified_at: date
  }
}
```

### Operation 6 — ดึงประวัติการแจ้งเตือน

```
ListNotificationLogRequest {
  case_id?: string
  team?: reference<INVESTIGATION_TEAM>
}

ListNotificationLogResponse {
  logs: list<{
    log_id: string
    case_id: reference<CASE>
    team: reference<INVESTIGATION_TEAM>
    notified_at: date
  }>
}
```

### Operation 7 — ดึงข้อมูลสำหรับ Spot Map

```
ListConfirmedCasesForMapRequest {
  team?: reference<INVESTIGATION_TEAM>
}

ListConfirmedCasesForMapResponse {
  cases: list<{
    case_id: string
    patient_name: string
    subdistrict: string
    district: string
    province: string
    map_position: string
    geo_accuracy: enum
    geo_adjusted: boolean
    responsible_team: reference<INVESTIGATION_TEAM>
  }>
}
```

## 4. Error / Validation case

ไม่รวมในรอบนี้ตามที่ยืนยันไว้ในขอบเขตของ Build Plan
