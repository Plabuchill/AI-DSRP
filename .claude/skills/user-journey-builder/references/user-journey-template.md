# Template — USER-JOURNEY-{topic}.md

ใช้เป็นโครงเริ่มต้นเวลาเขียน/แก้ `docs/02-design/01-prototypes/USER-JOURNEY-{topic}.md` — ยึดรูปแบบเดียวกับ `USER-JOURNEY-outbreak-dashboard.md` ที่มีอยู่แล้วในโปรเจกต์ (อ่านไฟล์จริงประกอบเพื่อดูตัวอย่างที่ครบสมบูรณ์)

---

# User Journey — [ชื่อ journey สั้นๆ เชิงเป้าหมาย ไม่ใช่แค่ชื่อโมดูล]

อ้างอิงจาก [[../../01-requirements/01-spec/FEATURE-LIST|FEATURE-LIST.md]] หมวด `FEAT-<โมดูล>` [และ Test Spec ที่เกี่ยวข้องถ้ามี]

## Persona

**[ชื่อ-นามสกุลสมมติ]** — [ตำแหน่ง/บทบาท] [บริบทว่าใช้ระบบตอนไหน/ทำไม]

## Trigger

[อะไรทำให้ persona เริ่ม journey นี้ — เหตุการณ์ที่กระตุ้นให้เปิดใช้ระบบ]

## ขั้นตอน

| # | สิ่งที่ทำ | สิ่งที่เห็น/ระบบตอบสนอง | Feature ที่เกี่ยวข้อง |
|---|---|---|---|
| 1 | ... | ... | FEAT-... |

ใช้ label `Na` (เช่น `7a`/`7b`) เมื่อ journey มีทางแยก (branch) ตามเงื่อนไข — ระบุเงื่อนไขของแต่ละแยกให้ชัดในคอลัมน์ "สิ่งที่ทำ"

**กติกา step ที่ยังทำไม่ได้จริง**: ถ้า step ต้องพึ่ง feature backlog ที่ยังไม่เชื่อมจริง ให้ระบุในคอลัมน์ "Feature ที่เกี่ยวข้อง" ว่า `Backlog: FEAT-... (Phase N — ยังไม่เชื่อมจริง)` แทนการเขียนเหมือนทำได้แล้ว

## Pain point ที่ journey นี้แก้ (และที่ยังแก้ไม่ได้ในรุ่นนี้)

- ✅ แก้แล้ว: [pain point ที่ journey นี้ตอบโจทย์แล้วจริง]
- ⚠️ ยังไม่แก้ (backlog): [ส่วนที่ยังทำไม่ได้ พร้อมอ้าง Phase ใน ROADMAP.md]

## Traceability กับ Test Spec

ระบุว่า step ไหน map ตรงกับ FR- ใดใน `ACCEPTANCE-CRITERIA.md` แบบ 1:1, step ไหนตรงแค่บางส่วน, และ step ไหนยังไม่มี test case รองรับเลย (ถ้ามี Test Spec ของโมดูลนี้อยู่แล้ว — ถ้ายังไม่มี Test Spec ให้ระบุว่า "ยังไม่มี Test Spec ของโมดูลนี้ — ควรเรียก qa-doc-builder ต่อ")

---

## หลักการเขียนที่ต้องยึดเสมอ

- **1 journey ต่อ 1 ไฟล์ ต่อ 1 module/persona** — ไม่รวมหลาย journey ในไฟล์เดียว
- **ยึด mock data/prototype จริงเป็นหลัก** ถ้ามี prototype ของโมดูลนั้นแล้ว — ห้ามคิด behavior ที่ขัดกับสิ่งที่ prototype ทำจริง
- **Traceability กับ Feature ID มาก่อนความสวยงามของเรื่องราว** — ทุก step ต้องโยง Feature ID ได้
- **ระบุ step ที่เป็น backlog ให้ชัดเจน** — ห้ามเขียนกำกวมจนดูเหมือนทำได้จริงแล้ว
