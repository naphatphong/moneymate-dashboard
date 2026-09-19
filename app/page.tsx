"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  demo?: boolean;
  summary: {
    total_responses: number;
    unique_respondents: number;
    overall_average: number | string | null;
    latest_response: string | null;
  };
  yearLevels: { label: string; value: number }[];
  questions: { question: string; average: number | string }[];
  feedback: { id: number; year_level: string | null; feedback: string; created_at: string }[];
};

const asNumber = (value: number | string | null | undefined) => Number(value ?? 0);

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "ไม่สามารถโหลดข้อมูลได้");
        setData(result);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "ไม่สามารถโหลดข้อมูลได้"));
  }, []);

  if (error) {
    return <main className="grid min-h-screen place-items-center bg-[#090d18] p-6 text-slate-100"><div className="rounded-2xl border border-rose-400/30 bg-[#121827] p-8 text-center"><h1 className="text-xl font-bold text-rose-300">โหลดข้อมูลไม่สำเร็จ</h1><p className="mt-3 text-slate-400">{error}</p></div></main>;
  }

  if (!data) {
    return <main className="grid min-h-screen place-items-center bg-[#090d18] text-slate-300"><p>กำลังโหลดข้อมูลแบบสอบถาม...</p></main>;
  }

  const average = asNumber(data.summary.overall_average);

  return (
    <main className="min-h-screen bg-[#090d18] p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm text-blue-400">SurveyDash / Overview</p><h1 className="mt-1 text-3xl font-bold">ภาพรวมแบบสอบถาม</h1><p className="mt-2 text-sm text-slate-500">ข้อมูลจากฐานข้อมูล survey_responses</p></div>
          {data.demo && <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">Demo Mode</span>}
        </header>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card label="แบบสอบถามทั้งหมด" value={data.summary.total_responses.toLocaleString()} />
          <Card label="ผู้ตอบแบบสอบถาม" value={data.summary.unique_respondents.toLocaleString()} />
          <Card label="คะแนนเฉลี่ยรวม" value={`${average.toFixed(2)} / 5`} />
          <Card label="คำถามที่วิเคราะห์" value={`${data.questions.length} ข้อ`} />
        </section>
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="คะแนนเฉลี่ยรายคำถาม"><div className="space-y-4">{data.questions.map((item) => { const score = asNumber(item.average); return <div key={item.question} className="flex items-center gap-3"><span className="w-10 text-sm font-semibold text-blue-300">{item.question}</span><div className="h-3 flex-1 rounded-full bg-slate-700"><div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-violet-400" style={{ width: `${Math.min(100, score / 5 * 100)}%` }} /></div><span className="w-12 text-right text-sm">{score.toFixed(2)}</span></div>; })}</div></Panel>
          <Panel title="ระดับชั้นของผู้ตอบ"><div className="space-y-4">{data.yearLevels.map((item) => <div key={item.label} className="flex justify-between rounded-xl bg-white/[0.03] p-3"><span>{item.label}</span><b>{item.value.toLocaleString()} คน</b></div>)}</div></Panel>
        </section>
        <Panel title="ความคิดเห็นล่าสุด" className="mt-6"><div className="grid gap-3 md:grid-cols-2">{data.feedback.length ? data.feedback.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-slate-300">“{item.feedback}”</p><p className="mt-2 text-xs text-slate-500">{item.year_level || "ไม่ระบุระดับชั้น"}</p></article>) : <p className="text-slate-500">ยังไม่มีความคิดเห็น</p>}</div></Panel>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/5 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>; }
function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-white/10 bg-[#111827] p-5 ${className}`}><h2 className="mb-5 font-bold">{title}</h2>{children}</section>; }
