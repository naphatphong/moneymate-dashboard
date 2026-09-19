import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const emptyData = {
  demo: true,
  summary: { total_responses: 0, unique_respondents: 0, overall_average: 0, latest_response: null },
  yearLevels: [] as { label: string; value: number }[],
  questions: Array.from({ length: 14 }, (_, index) => ({ question: `Q${index + 1}`, average: 0 })),
  feedback: [] as { id: number; year_level: string | null; feedback: string; created_at: string }[],
};

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json(emptyData);

  try {
    const sql = neon(databaseUrl);
    const [summaryRows, levels, questionRows, feedback] = await Promise.all([
      sql`
        SELECT
          COUNT(*)::int AS total_responses,
          COUNT(DISTINCT id)::int AS unique_respondents,
          ROUND((
            SELECT AVG(value::numeric)
            FROM survey_responses r
            CROSS JOIN LATERAL (VALUES
              (r.q1),(r.q2),(r.q3),(r.q4),(r.q5),(r.q6),(r.q7),
              (r.q8),(r.q9),(r.q10),(r.q11),(r.q12),(r.q13),(r.q14)
            ) AS answers(value)
            WHERE value IS NOT NULL
          ), 2) AS overall_average,
          MAX(created_at) AS latest_response
        FROM survey_responses
      `,
      sql`
        SELECT COALESCE(NULLIF(TRIM(year_level), ''), 'ไม่ระบุ') AS label,
               COUNT(*)::int AS value
        FROM survey_responses
        GROUP BY 1
        ORDER BY 1
      `,
      sql`
        SELECT question, ROUND(AVG(score::numeric), 2) AS average
        FROM survey_responses r
        CROSS JOIN LATERAL (VALUES
          (1,'Q1',r.q1),(2,'Q2',r.q2),(3,'Q3',r.q3),(4,'Q4',r.q4),
          (5,'Q5',r.q5),(6,'Q6',r.q6),(7,'Q7',r.q7),(8,'Q8',r.q8),
          (9,'Q9',r.q9),(10,'Q10',r.q10),(11,'Q11',r.q11),(12,'Q12',r.q12),
          (13,'Q13',r.q13),(14,'Q14',r.q14)
        ) AS answers(question_no, question, score)
        WHERE score IS NOT NULL
        GROUP BY question_no, question
        ORDER BY question_no
      `,
      sql`
        SELECT id, year_level, feedback, created_at
        FROM survey_responses
        WHERE NULLIF(TRIM(feedback), '') IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 6
      `,
    ]);

    const questionMap = new Map(questionRows.map((row) => [row.question, row.average]));
    return NextResponse.json({
      summary: summaryRows[0] ?? emptyData.summary,
      yearLevels: levels,
      questions: Array.from({ length: 14 }, (_, index) => ({ question: `Q${index + 1}`, average: questionMap.get(`Q${index + 1}`) ?? 0 })),
      feedback,
    });
  } catch (error) {
    console.error("dashboard api error", error);
    return NextResponse.json({ ...emptyData, demo: true });
  }
}
