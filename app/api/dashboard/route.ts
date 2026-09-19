import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: "ไม่พบ DATABASE_URL" },
        { status: 500 },
      );
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

    return NextResponse.json(
      { error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
