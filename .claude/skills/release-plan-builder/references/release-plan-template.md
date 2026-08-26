# Template — TASK-LIST.md และแนวทางปรับ ROADMAP.md

ใช้เป็นโครงเริ่มต้นเวลาเขียน/แก้ `docs/01-requirements/03-task/TASK-LIST.md` และแนวทางแก้ `ROADMAP.md` ที่ root — ตัดหัวข้อที่ Build Plan ไม่รวมได้ตามจริง

---

# ส่วนที่ 1 — แนวทางแก้ ROADMAP.md (Plan/Phase/Release)

`ROADMAP.md` เป็นไฟล์ root canonical เดี่ยว — **แก้ในที่เสมอ ไม่สร้างไฟล์ใหม่** โครงสร้างปัจจุบันจัดเป็น Phase ตาม pain point/ทีมงาน (Phase 0-8) พร้อม checkbox `[x]`/`[ ]` ต่อรายการ

ถ้า Build Plan ยืนยันให้เพิ่มชั้น **Release** ทับ Phase เดิม (Ambiguity Protocol ตัวเลือก b) ให้เพิ่มเป็นหัวข้อย่อยหรือตารางแบบนี้ต่อ Phase ที่เกี่ยวข้อง ไม่ต้องรื้อโครง Phase เดิมทั้งหมด:

```markdown
### Release ที่เกี่ยวข้อง

| Release | Phase ที่ครอบ | เป้าหมายเมื่อ release |
|---|---|---|
| v1.1 | Phase 1 (บางส่วน) | Case Intake เชื่อม OCR จริง |
```

ถ้า Build Plan ยืนยันวิธี prioritize ใหม่ (MoSCoW/Weighted scoring) ให้เพิ่มคอลัมน์/ตารางประกอบต่อ Phase โดยไม่ลบรายการ checkbox เดิมที่มีอยู่ — เพิ่มเสริม ไม่ใช่แทนที่

**กติกา**: ห้ามลบ/แก้ประวัติ pain point เดิมที่ ROADMAP.md บันทึกไว้ (บรรทัดเปิดของแต่ละ Phase ที่อธิบาย pain point ต้นทาง) เพราะเป็น traceability ไปยัง requirement ดั้งเดิม — เพิ่ม/ปรับเฉพาะส่วนโครง phase/priority ตามที่ Build Plan ยืนยัน

---

# ส่วนที่ 2 — TASK-LIST.md

## 1. ภาพรวม

ระบุ scope (ทั้ง ROADMAP หรือเฉพาะ Phase ไหน), granularity ที่ใช้ (epic-level/granular/ผสม), วิธี prioritize ที่ใช้ — อ้างจาก Build Plan ที่ยืนยันแล้ว

## 2. Task Table ต่อ Phase

จัดกลุ่มตาม Phase ของ `ROADMAP.md` (ใช้ wikilink ชี้กลับ `[[../../../../ROADMAP.md|ROADMAP.md]]` ตาม convention เดิม) — ต่อ 1 Phase:

### Phase N — [ชื่อ Phase ตาม ROADMAP.md]

| Task | Feature ID | สถานะ | ผู้รับผิดชอบ | Deadline | หมายเหตุ |
|---|---|---|---|---|---|
| ... | FEAT-... | ยังไม่เริ่ม / กำลังทำ / เสร็จแล้ว | (ว่างถ้าไม่มีข้อมูล — ห้ามเดา) | (ว่างถ้าไม่มีข้อมูล — ห้ามเดา) | ... |

**กติกาคอลัมน์**:
- **สถานะ**: ค่าเริ่มต้น "ยังไม่เริ่ม" เสมอสำหรับ task ใหม่ที่เพิ่งแตก เว้นแต่มีข้อมูลจริงว่าเริ่มไปแล้ว
- **ผู้รับผิดชอบ/Deadline**: ใส่เฉพาะเมื่อ Build Plan ยืนยันมาจริง (จาก Ambiguity Protocol ข้อ "ขอบเขต Task List") — ถ้าไม่มีข้อมูล ให้เว้นเป็น `—` **ห้ามเดาชื่อคน/วันที่เอง**
- **Feature ID**: ต้องตรงกับ `FEATURE-LIST.md` เสมอ ถ้า task ไม่มี Feature ID ตรง (เช่น task เชิง infra ล้วน) ให้ตั้งชื่ออ้างอิงที่สื่อความหมาย (เช่น "FEAT-PLATFORM-01 (ส่วน setup CI/CD)")

## 3. Estimation (ถ้า Build Plan รวมหัวข้อนี้)

| Task | Estimation (story point/man-day) | ที่มาของตัวเลข |
|---|---|---|

**ห้ามเดา estimation เอง** — ถ้าทีมยังไม่ประเมิน ให้เว้นคอลัมน์นี้ทั้งตารางไว้ หรือไม่รวมหัวข้อนี้เลยถ้า Build Plan ไม่ได้ยืนยันขอบเขตนี้

## 4. Dependency ระหว่าง Task/Phase

ระบุ dependency ที่กระทบลำดับการทำงานจริง (อ้างจาก `ROADMAP.md`/`HIGH-LEVEL-ARCHITECTURE.md` ถ้ามี เช่น "Phase 7 ต้องทำคู่ขนาน/ก่อน Phase 1-4")

| Task/Phase | ขึ้นกับ | เหตุผล |
|---|---|---|

## 5. Traceability

| Phase | Feature ID ที่ครอบ | จำนวน Task |
|---|---|---|

---

## หลักการเขียนที่ต้องยึดเสมอ

- **ห้ามเดาข้อมูลที่ไม่มี** — ผู้รับผิดชอบ, deadline, estimation ถ้าไม่มีข้อมูลจริงมา ต้องเว้นว่างหรือถามก่อนเขียน ไม่ใส่ค่าสมมติ
- **Traceability มาก่อนความสมบูรณ์แบบ** — ทุก task ต้องโยง Feature ID ได้ ถ้าไม่มี ID ตรงให้ตั้งชื่ออ้างอิงที่สื่อความหมาย
- **ROADMAP.md ต้องอยู่ที่ root เสมอ** — ห้ามย้ายเข้า `docs/` ไม่ว่ากรณีใด (ดูเหตุผลใน CLAUDE.md ข้อ 1)
- **ไม่ลบประวัติ pain point เดิมใน ROADMAP.md** — เพิ่ม/ปรับเฉพาะส่วนที่ Build Plan ยืนยัน
