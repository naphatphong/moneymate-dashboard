"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const chartColors = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#94a3b8"];
const asNumber = (value: number | string | null | undefined) => Number(value ?? 0);
const thaiDate = (value: string | null) => value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";

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

  const metrics = useMemo(() => {
    if (!data) return { avg: 0, best: "Q1", low: "Q7" };

    const average = data.questions.reduce((sum, item) => sum + asNumber(item.average), 0) / data.questions.length;
    const best = [...data.questions].sort((a, b) => asNumber(b.average) - asNumber(a.average))[0]?.question ?? "Q1";
    const low = [...data.questions].sort((a, b) => asNumber(a.average) - asNumber(b.average))[0]?.question ?? "Q7";

    return {
      avg: average,
      best,
      low,
    };
  }, [data]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090d18] p-6 text-slate-100">
        <div className="rounded-2xl border border-rose-400/30 bg-[#121827] p-8 text-center">
          <h1 className="text-xl font-bold text-rose-300">โหลดข้อมูลไม่สำเร็จ</h1>
          <p className="mt-3 text-slate-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090d18] text-slate-300">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
          <p>กำลังโหลดข้อมูลแบบสอบถาม...</p>
        </div>
      </main>
    );
  }

  const average = asNumber(data.summary.overall_average);
  const pieData = data.yearLevels.map((item, index) => ({ ...item, color: chartColors[index % chartColors.length] }));

  return (
    <main className="min-h-screen bg-[#070b14] p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 p-5 shadow-2xl shadow-blue-950/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-300">Dashboard / Survey Analytics</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">ภาพรวมแบบสอบถาม</h1>
            <p className="mt-2 text-sm text-slate-400">อัปเดตล่าสุด: {thaiDate(data.summary.latest_response)}</p>
          </div>
          <div className="flex items-center gap-3">
            {data.demo && <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">Demo Mode</span>}
            <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">↻ รีเฟรช</button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="แบบสอบถามทั้งหมด" value={data.summary.total_responses.toLocaleString()} accent="blue" detail="จำนวนรายการที่บันทึก" />
          <StatCard label="ผู้ตอบแบบสอบถาม" value={data.summary.unique_respondents.toLocaleString()} accent="violet" detail="นับจากผู้ตอบไม่ซ้ำ" />
          <StatCard label="คะแนนเฉลี่ยรวม" value={`${average.toFixed(2)} / 5`} accent="emerald" detail={`อันดับสูงสุด: ${metrics.best}`} />
          <StatCard label="คำถามที่วิเคราะห์" value={`${data.questions.length} ข้อ`} accent="amber" detail={`ต่ำสุด: ${metrics.low}`} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <Panel className="xl:col-span-2" title="แนวโน้มคะแนนเฉลี่ยรายข้อ">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.questions}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="question" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number | string) => [`${Number(value).toFixed(2)} / 5`, "คะแนนเฉลี่ย"]} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="average" stroke="#60a5fa" strokeWidth={3} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="ระดับชั้นผู้ตอบแบบสอบถาม">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | string) => [`${Number(value).toLocaleString()} คน`, "จำนวน"]} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {pieData.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} /> {item.label}</span>
                  <span className="font-semibold text-slate-200">{item.value.toLocaleString()} คน</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-5">
          <Panel className="xl:col-span-3" title="ผลคะแนนรายข้อ (Q1-Q14)">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.questions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="question" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number | string) => [`${Number(value).toFixed(2)} / 5`, "คะแนนเฉลี่ย"]} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Bar dataKey="average" radius={[10, 10, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel className="xl:col-span-2" title="ความคิดเห็นล่าสุด">
            <div className="space-y-3">
              {data.feedback.length ? data.feedback.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm leading-6 text-slate-300">“{item.feedback}”</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.year_level || "ไม่ระบุระดับชั้น"}</span>
                    <span>{thaiDate(item.created_at)}</span>
                  </div>
                </article>
              )) : <p className="text-slate-500">ยังไม่มีความคิดเห็น</p>}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, accent, detail }: { label: string; value: string; accent: "blue" | "violet" | "emerald" | "amber"; detail: string }) {
  const palette = {
    blue: "from-blue-500/20 via-blue-500/10 to-transparent text-blue-200",
    violet: "from-violet-500/20 via-violet-500/10 to-transparent text-violet-200",
    emerald: "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-200",
    amber: "from-amber-500/20 via-amber-500/10 to-transparent text-amber-200",
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${palette[accent]} p-5 backdrop-blur`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-3 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-lg shadow-black/10 ${className}`}>
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}



















































































































	
																																																																																																																																																																																																																																																																																						
