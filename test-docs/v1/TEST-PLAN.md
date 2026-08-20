# Test Plan — Outbreak Dashboard (prototypes/v1) — test-docs/v1

## 1. Scope & Objective
- อ้างอิงจาก: `prototypes/v1/BUILD-PLAN.md` (ยังไม่มี Requirement/Backlog/Feature List/User Journey อย่างเป็นทางการ — scope ถูกยืนยันจาก build plan ของ prototype นี้โดยตรง) ประกอบกับการอ่านโค้ดจริงใน `prototypes/v1/index.html` และ `prototypes/v1/script.js`
- สิ่งที่ครอบคลุมในรอบนี้ (หน้า Outbreak Dashboard เดียว, 6 ส่วนของ UI):
  1. Navigation — left rail (wordmark "ai-dsrp", active state ของ Dashboard, เมนู Cases/Alerts/Reports เป็น placeholder disabled)
  2. KPI Cards — Total Active Cases, New Cases Today, Active Outbreak Zones, Overall Risk Level
  3. Region Risk Grid — 6 ภาค (เหนือ/กลาง/อีสาน/ใต้/ตะวันออก/ตะวันตก) ระบายสีตามระดับความเสี่ยง (ปกติ/เฝ้าระวัง/วิกฤต)
  4. Trend Chart — แนวโน้มเคสรายวัน (SVG) พร้อมเส้นค่าเฉลี่ยเคลื่อนที่ 3 วัน
  5. Recent Alerts Panel — รายการแจ้งเตือน (mock data 8 รายการ) พร้อม severity badge, โรค, พื้นที่, เวลา
  6. Filter — dropdown โรค/ภูมิภาค/ช่วงวันที่ และปุ่มล้างตัวกรอง ทำงาน client-side จริง กรองทั้ง 4 ส่วนข้างต้นให้สอดคล้องกัน
- สิ่งที่ไม่ครอบคลุมในรอบนี้ (ตามที่ BUILD-PLAN ระบุไว้ชัดเจนว่ายังไม่อยู่ใน scope):
  - หน้า Case Reporting Flow, Alert & Response Management แบบเต็ม, ระบบ login/สิทธิ์ผู้ใช้, การเชื่อมต่อ backend จริง (เมนู Cases/Alerts/Reports เป็นเพียง placeholder)
  - Performance testing และ Security testing — ไม่รวมในรอบนี้ เนื่องจากเป็น static prototype ที่ไม่มี backend/ข้อมูลจริง ไม่มีความเสี่ยงด้านโหลด/สิทธิ์การเข้าถึงที่ต้องทดสอบ

## 2. Test Strategy
- ประเภทการทดสอบ: Functional testing (พฤติกรรมของ filter, การคำนวณ/แสดงผล KPI, การกรองข้อมูลข้ามส่วน), UI testing (การแสดงผล, สี, badge, responsive layout), Data validation (ความสอดคล้องของตัวเลข/สถานะที่แสดงระหว่าง KPI/Region Grid/Chart/Alerts เมื่อ filter เปลี่ยน)
- ความลึกที่ตกลงไว้: **Happy path + negative/edge case ที่สำคัญเท่านั้น** — ไม่รวม performance test และ security test เพราะเป็น static prototype ไม่มี backend จริง ห้ามขยายขอบเขตเกินนี้
- Negative/edge case ที่รวมไว้ในรอบนี้ เน้นเฉพาะกรณีที่กระทบความถูกต้องของข้อมูลที่แสดงผล เช่น: การเลือก filter ชุดที่ไม่มีข้อมูลตรงเงื่อนไข (empty state, ค่าศูนย์), การข้าม focus ของเมนู disabled, และ responsive layout ที่ขนาดหน้าจอเล็ก

## 3. Test Environment
- Prototype ที่ใช้ทดสอบ: `prototypes/v1/index.html` (เปิดเป็น static HTML/CSS/JS ผ่านเบราว์เซอร์โดยตรง หรือผ่าน local static server — ไม่มี backend/API จริง ข้อมูลทั้งหมดเป็น mock data ที่ฝังอยู่ใน `script.js`)
- เบราว์เซอร์: Chrome, Edge, Firefox เวอร์ชันล่าสุด (เดสก์ท็อป)
- ความละเอียดหน้าจอที่ทดสอบ:
  - Desktop: ≥ 1280px
  - Tablet: ~820px (จุดที่ left rail ยุบเป็น icon-only ตาม CSS breakpoint ≤960px)
  - Mobile: ~375–622px (จุดที่ KPI grid/Region grid ปรับเป็น 1–2 คอลัมน์ตาม CSS breakpoint ≤720px และ ≤480px)

## 4. Entry & Exit Criteria
- Entry Criteria:
  - Prototype v1 build เสร็จสมบูรณ์และเข้าถึงได้ (เปิดจาก local file หรือ local static server ได้ปกติ ไม่มี error บล็อกการโหลดหน้า)
  - มีรายการ Test Case ที่ผ่านการตรวจสอบ/ยืนยันแล้ว (เอกสารนี้ + `ACCEPTANCE-CRITERIA.md` + ตาราง Test Case)
- Exit Criteria:
  - Test case ที่มี Priority **High** ต้องผ่านทั้งหมด (100%)
  - Test case ที่มี Priority **Medium** ต้องผ่านอย่างน้อย 90%
  - ข้อบกพร่องที่พบใน Priority Low สามารถบันทึกเป็น known issue เพื่อพิจารณาแก้ไขในเวอร์ชันถัดไปได้ โดยไม่บล็อกการปิดรอบทดสอบ

## 5. Roles & Responsibilities
- ผู้ออกแบบ Test Plan/Acceptance Criteria/Test Case: QA (เอกสารชุดนี้)
- ผู้ทดสอบจริง (execute test case, กรอก Actual Result/Status): ทีม QA/ผู้ที่ได้รับมอบหมายทดสอบ prototype v1
- ผู้ตรวจสอบผลและ sign-off ปิดรอบทดสอบ: เจ้าของโปรเจกต์/ผู้ยืนยัน scope (ผู้ที่อนุมัติ BUILD-PLAN.md ของ prototypes/v1)

## 6. Risks & Assumptions
- Assumption: เนื่องจากยังไม่มี Requirement/Backlog/Feature List/User Journey อย่างเป็นทางการ เอกสารชุดนี้ตั้ง Feature ID เอง (FR-DASH-01 ถึง FR-DASH-06) โดยอ้างอิงจาก 6 ส่วนของ UI ที่ระบุใน BUILD-PLAN.md เพื่อรักษา traceability
- Assumption: ข้อมูลทั้งหมดในหน้าเป็น mock data คงที่ (deterministic pseudo-random ที่ seed ตายตัว) จึงสามารถระบุค่าคาดหวัง (expected result) แบบเจาะจงได้ในหลาย test case โดยไม่ต้องพึ่งข้อมูล real-time
- ความเสี่ยง: Region Risk Grid ไม่ได้ "ซ่อน" region ที่ไม่ตรงกับ filter ภูมิภาคที่เลือก แต่ใช้วิธี "ลด opacity" (dim) แทน — พฤติกรรมนี้อาจถูกเข้าใจผิดว่าเป็นบั๊กหากไม่ได้อ่านโค้ดหรือเอกสารนี้ก่อน จึงระบุไว้ชัดเจนใน Acceptance Criteria และ Test Case ที่เกี่ยวข้อง (FR-DASH-03)
- ความเสี่ยง: การทดสอบ responsive layout อาศัยการปรับขนาดหน้าต่างเบราว์เซอร์/DevTools device toolbar เป็นหลัก ไม่ได้ทดสอบบนอุปกรณ์จริงทุกรุ่น ผลอาจแตกต่างเล็กน้อยบนอุปกรณ์จริง
- ความเสี่ยง: ไม่มีการทดสอบ cross-browser แบบละเอียด (เช่น Safari, เบราว์เซอร์เก่า) เนื่องจากอยู่นอกขอบเขตความลึกที่ตกลงไว้
