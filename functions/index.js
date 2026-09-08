// Cloud Functions — AI-DSRP (FEAT-INTAKE-05)
// extractCaseReport: รับไฟล์รายงานเคส (PDF/JPEG/PNG, base64) จากเจ้าหน้าที่ที่ login แล้ว
// ส่งให้ Claude Vision (Anthropic) อ่าน แล้วคืนข้อมูลโครงสร้าง (JSON) ให้เจ้าหน้าที่ตรวจสอบต่อ
// (human-in-the-loop) — ดู DETAILED-DESIGN.md Flow 1 และ TECH-STACK.md หัวข้อ 4.5

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const Anthropic = require("@anthropic-ai/sdk");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const MAX_FILE_BYTES = 7 * 1024 * 1024; // ~7MB ไฟล์ต้นฉบับ (base64 พองขึ้น ~33% ต้องเหลือขอบใต้ payload limit ของ callable function)
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const EXTRACT_TOOL = {
  name: "extract_case_report",
  description: "บันทึกข้อมูลที่ดึงได้จากเอกสารรายงานผู้ป่วยเฝ้าระวังโรคที่แนบมา",
  input_schema: {
    type: "object",
    properties: {
      patientName: { type: "string", description: "ชื่อ-นามสกุลผู้ป่วย ตามที่ปรากฏในเอกสาร" },
      hn: { type: "string", description: "หมายเลข HN (Hospital Number)" },
      houseNo: { type: "string", description: "บ้านเลขที่" },
      villageNo: { type: "string", description: "หมู่ที่" },
      village: { type: "string", description: "ชื่อหมู่บ้าน" },
      subdistrict: { type: "string", description: "ตำบล" },
      district: { type: "string", description: "อำเภอ" },
      province: { type: "string", description: "จังหวัด" },
      onsetDate: { type: "string", description: "วันที่เริ่มป่วย ตามรูปแบบที่ปรากฏในเอกสาร (ไม่ต้องแปลงรูปแบบ)" },
      labResult: { type: "string", description: "ผลตรวจทางห้องปฏิบัติการ/การวินิจฉัยโรค" }
    },
    required: ["patientName", "hn"]
  }
};

const EXTRACTION_PROMPT =
  "นี่คือเอกสารรายงานผู้ป่วยเฝ้าระวังโรค อาจเป็นแบบฟอร์มพิมพ์หรือเขียนมือภาษาไทยผสมกัน " +
  "ช่วยดึงข้อมูลตาม tool ที่กำหนดให้ครบเท่าที่อ่านได้ " +
  "ถ้าฟิลด์ใดอ่านไม่ออกหรือไม่มีในเอกสารให้เว้นว่างไว้ ห้ามเดา/สร้างข้อมูลที่ไม่มีในเอกสารขึ้นมาเอง";

exports.extractCaseReport = onCall({ secrets: [ANTHROPIC_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ต้องเข้าสู่ระบบก่อนใช้งานฟังก์ชันนี้");
  }

  const { fileBase64, mimeType, fileName } = request.data || {};

  if (!fileBase64 || typeof fileBase64 !== "string") {
    throw new HttpsError("invalid-argument", "ไม่พบไฟล์ที่จะประมวลผล");
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new HttpsError("invalid-argument", "รองรับเฉพาะไฟล์ PDF, JPEG, PNG เท่านั้น");
  }
  const approxBytes = fileBase64.length * 0.75;
  if (approxBytes > MAX_FILE_BYTES) {
    throw new HttpsError("invalid-argument", "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 7MB)");
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

  const documentBlock = mimeType === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: mimeType, data: fileBase64 } }
    : { type: "image", source: { type: "base64", media_type: mimeType, data: fileBase64 } };

  let response;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: "extract_case_report" },
      messages: [
        {
          role: "user",
          content: [documentBlock, { type: "text", text: EXTRACTION_PROMPT }]
        }
      ]
    });
  } catch (err) {
    throw new HttpsError("internal", "เรียก OCR ไม่สำเร็จ: " + err.message);
  }

  const toolUse = response.content.find(function (block) { return block.type === "tool_use"; });
  if (!toolUse) {
    throw new HttpsError("internal", "ไม่สามารถดึงข้อมูลจากเอกสารได้ กรุณาตรวจสอบว่าไฟล์ชัดเจน หรือกรอกข้อมูลด้วยมือแทน");
  }

  return { fields: toolUse.input, fileName: fileName || null };
});
