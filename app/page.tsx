import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const demoData = {
  demo: true,
  summary: {
    total_responses: 142,
    unique_respondents: 98,
    overall_average: 4.32,
    latest_response: new Date().toISOString(),
  },
  yearLevels: [
    { label: "มัธยมศึกษาปี 1", value: 18 },
    { label: "มัธยมศึกษาปี 2", value: 22 },
    { label: "มัธยมศึกษาปี 3", value: 26 },
    { label: "มัธยมศึกษาปี 4", value: 19 },
    { label: "มัธยมศึกษาปี 5", value: 13 },
  ],
  questions: [
    { question: "Q1", average: 4.4 },
    { question: "Q2", average: 4.1 },
    { question: "Q3", average: 4.6 },
    { question: "Q4", average: 4.2 },
    { question: "Q5", average: 4.5 },
    { question: "Q6", average: 4.3 },
    { question: "Q7", average: 4.0 },
    { question: "Q8", average: 4.4 },
    { question: "Q9", average: 4.7 },
    { question: "Q10", average: 4.2 },
    { question: "Q11", average: 4.6 },
    { question: "Q12", average: 4.1 },
    { question: "Q13", average: 4.3 },
    { question: "Q14", average: 4.5 },
  ],
  feedback: [
    { id: 1, year_level: "มัธยมศึกษาปี 3", feedback: "ระบบใช้งานง่ายและสวยงามมาก", created_at: new Date().toISOString() },
    { id: 2, year_level: "มัธยมศึกษาปี 4", feedback: "ข้อมูลน่าเชื่อถือและเข้าใจง่าย", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, year_level: "มัธยมศึกษาปี 2", feedback: "อยากให้มีฟีเจอร์สำหรับแสดงกราฟเพิ่มเติม", created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 4, year_level: "มัธยมศึกษาปี 5", feedback: "ดีมาก ควรมีการแจ้งเตือนเมื่อมีข้อมูลใหม่", created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: 5, year_level: "มัธยมศึกษาปี 1", feedback: "หน้าจัดการข้อมูลอ่านง่าย", created_at: new Date(Date.now() - 345600000).toISOString() },
  ],
};

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(demoData, { status: 200 });
    }

    const sql = neon(databaseUrl);

    const [summaryRows, yearLevelRows, questionRows, feedbackRows] =
      await Promise.all([
        sql`
          SELECT
            COUNT(DISTINCT s.id)::int AS total_responses,
            COUNT(DISTINCT s.user_id)::int AS unique_respondents,
            ROUND(AVG(scores.score)::numeric, 2) AS overall_average,
            MAX(s.created_at) AS latest_response
          FROM survey_responses s
          CROSS JOIN LATERAL (
            VALUES
              (s.q1), (s.q2), (s.q3), (s.q4), (s.q5), (s.q6), (s.q7),
              (s.q8), (s.q9), (s.q10), (s.q11), (s.q12), (s.q13), (s.q14)
          ) AS scores(score)
        `,
        sql`
          SELECT
            COALESCE(NULLIF(TRIM(year_level), ''), 'ไม่ระบุ') AS label,
            COUNT(*)::int AS value
          FROM survey_responses
          GROUP BY label
          ORDER BY label
        `,
        sql`
          SELECT
            question,
            ROUND(AVG(score)::numeric, 2) AS average
          FROM survey_responses s
          CROSS JOIN LATERAL (
            VALUES
              (1, 'Q1', s.q1), (2, 'Q2', s.q2), (3, 'Q3', s.q3),
              (4, 'Q4', s.q4), (5, 'Q5', s.q5), (6, 'Q6', s.q6),
              (7, 'Q7', s.q7), (8, 'Q8', s.q8), (9, 'Q9', s.q9),
              (10, 'Q10', s.q10), (11, 'Q11', s.q11), (12, 'Q12', s.q12),
              (13, 'Q13', s.q13), (14, 'Q14', s.q14)
          ) AS scores(question_no, question, score)
          WHERE score IS NOT NULL
          GROUP BY question_no, question
          ORDER BY question_no
        `,
        sql`
          SELECT id, year_level, feedback, created_at
          FROM survey_responses
          WHERE NULLIF(TRIM(feedback), '') IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 5
        `,
      ]);

    return NextResponse.json({
      summary: summaryRows[0],
      yearLevels: yearLevelRows,
      questions: questionRows,
      feedback: feedbackRows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(demoData, { status: 200 });
  }
}
