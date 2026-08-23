# 01 - Test Plan

เก็บ **แผนการทดสอบ (Test Plan)** ที่เตรียมไว้ก่อนลงมือทดสอบจริง เช่น

- Test case / test scenario ของแต่ละฟีเจอร์
- เงื่อนไขและข้อมูลที่ใช้ในการทดสอบ (test data)
- ขอบเขตของการทดสอบ (in scope / out of scope)

อ้างอิงจากข้อกำหนดใน [[../../01-requirements/01-spec/index|01-spec]] และการออกแบบใน [[../../02-design/index|02-design]] ผลของการทดสอบตาม test case เหล่านี้ให้บันทึกใน [[../02-test-result/index|02-test-result]]

## เอกสารที่มีอยู่

- [`v1/`](./v1/) — ชุดแรก อ้างอิงจาก [`prototypes/v1`](../../../prototypes/v1/) (ย้ายมาจาก `test-docs/v1/` เดิมที่ root)
  - [`TEST-PLAN.md`](./v1/TEST-PLAN.md) — แผนการทดสอบ
  - [`ACCEPTANCE-CRITERIA.md`](./v1/ACCEPTANCE-CRITERIA.md) — เกณฑ์การยอมรับ (Given-When-Then)
  - [`TEST-CASES.xlsx`](./v1/TEST-CASES.xlsx) — test case matrix
  - [`BUILD-PLAN.md`](./v1/BUILD-PLAN.md) — แผนที่ยืนยันแล้วสำหรับการสร้างเอกสารชุดนี้
