import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const questionColumns = Array.from({ length: 14 }, (_, index) => `q${index + 1}`);

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า DATABASE_URL" }, { status: 500 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    const client = await pool.connect();
    try {
      const rows = await client.query('SELECT * FROM survey_responses ORDER BY created_at DESC');
      const records = rows.rows;
      const first = records[0] ?? {};
      const respondentKey = ["respondent_id", "respondent_code", "student_id", "email"].find((key) => key in first);
      const yearKey = ["year_level", "year", "class_level"].find((key) => key in first);
      const feedbackKey = ["feedback", "comment", "ความคิดเห็น"].find((key) => key in first);
      const createdKey = "created_at" in first ? "created_at" : null;
      const questions = questionColumns
        .filter((key) => records.some((row) => key in row))
        .map((key) => ({ question: key.toUpperCase(), average: records.reduce((sum, row) => sum + Number(row[key] ?? 0), 0) / Math.max(records.filter((row) => row[key] != null).length, 1) }));
      const numeric = questions.map((item) => Number(item.average)).filter(Number.isFinite);
      const feedback = records.filter((row) => feedbackKey && row[feedbackKey]).slice(0, 5).map((row) => ({ id: Number(row.id), year_level: yearKey ? String(row[yearKey] ?? "") : null, feedback: String(row[feedbackKey!]), created_at: String(createdKey ? row[createdKey] : "") }));
      return NextResponse.json({ summary: { total_responses: records.length, unique_respondents: respondentKey ? new Set(records.map((row) => row[respondentKey])).size : records.length, overall_average: numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : 0, latest_response: createdKey && records[0] ? records[0][createdKey] : null }, yearLevels: Object.entries(records.reduce<Record<string, number>>((result, row) => { const label = yearKey ? String(row[yearKey] ?? "ไม่ระบุ") : "ไม่ระบุ"; result[label] = (result[label] ?? 0) + 1; return result; }, {})).map(([label, value]) => ({ label, value })), questions, feedback });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("dashboard api error", error);
    return NextResponse.json({ error: "ไม่สามารถอ่านข้อมูลจากตาราง survey_responses ได้" }, { status: 500 });
  }
}
