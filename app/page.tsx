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

const colors = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f59e0b", "#ec4899", "#64748b"];
const numberValue = (value: number | string | null | undefined) => Number(value ?? 0);
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";

function Icon({ children }: { children: ReactNode }) {
  return <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-slate-400">{children}</span>;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState("ภาพรวม");

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "ไม่สามารถโหลดข้อมูลได้");
        setData(result);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "ไม่สามารถโหลดข้อมูลได้"));
  }, []);

  const stats = useMemo(() => {
    if (!data) return { average: 0, best: "-", lowest: "-" };
    const sorted = [...data.questions].sort((a, b) => numberValue(b.average) - numberValue(a.average));
    return {
      average: numberValue(data.summary.overall_average),
      best: sorted[0]?.question ?? "-",
      lowest: sorted.at(-1)?.question ?? "-",
    };
  }, [data]);

  if (!data && !error) return <main className="grid min-h-screen place-items-center bg-[#080b14] text-slate-300"><div className="text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /><p>กำลังโหลดแดชบอร์ด...</p></div></main>;
  if (error || !data) return <main className="grid min-h-screen place-items-center bg-[#080b14] p-6 text-slate-200"><div className="rounded-2xl border border-red-400/20 bg-[#111827] p-8 text-center"><h1 className="text-xl font-bold text-red-300">โหลดข้อมูลไม่สำเร็จ</h1><p className="mt-3 text-sm text-slate-400">{error}</p></div></main>;

  const yearData = data.yearLevels.map((item, index) => ({ ...item, fill: colors[index % colors.length] }));

  return (
    <main className="min-h-screen bg-[#080b14] p-3 text-slate-100 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1600px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f1a] shadow-2xl shadow-black/40 md:min-h-[calc(100vh-48px)]">
        <aside className="hidden w-[230px] shrink-0 border-r border-white/[0.07] bg-[#0a0e18] p-4 lg:block">
          <div className="mb-7 flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 font-black">S</div><div><p className="font-bold tracking-tight">SurveyDash</p><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Analytics center</p></div></div>
          <div className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-slate-500">⌕ ค้นหาเมนู...</div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">เมนูหลัก</p>
          <nav className="space-y-1 text-sm">{["ภาพรวม", "ผลการประเมิน", "ผู้ตอบแบบสอบถาม", "ความคิดเห็น"].map((item, index) => <button key={item} type="button" onClick={() => setActive(item)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${active === item ? "bg-blue-500/15 font-semibold text-blue-300" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"}`}><span className="text-base">{["⌂", "▥", "◌", "≡"][index]}</span>{item}</button>)}</nav>
          <p className="mb-2 mt-8 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">จัดการ</p>
          <nav className="space-y-1 text-sm"><button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 hover:bg-white/[0.04]"><span>⚙</span>ตั้งค่า</button><button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 hover:bg-white/[0.04]"><span>?</span>ช่วยเหลือ</button></nav>
          <div className="mt-auto hidden rounded-xl border border-blue-400/10 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-3 lg:mt-28 lg:block"><p className="text-xs font-semibold">ฐานข้อมูลแบบสอบถาม</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{data.demo ? "Demo Mode" : "เชื่อมต่อข้อมูลจริงแล้ว"}</p></div>
        </aside>

        <section className="min-w-0 flex-1 p-4 md:p-7">
          <header className="mb-6 flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-slate-500">Dashboard / {active}</p><h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">ภาพรวมแดชบอร์ด</h1><p className="mt-1 text-xs text-slate-500">ข้อมูลแบบสอบถามทั้งหมด · อัปเดต {formatDate(data.summary.latest_response)}</p></div><div className="flex items-center gap-2"><button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">2024 - 2025⌄</button><button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400">↻ รีเฟรชข้อมูล</button><div className="ml-2 h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-600" /></div></header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon="↗" label="แบบสอบถามทั้งหมด" value={data.summary.total_responses.toLocaleString()} change="ข้อมูลจากฐานข้อมูลจริง" tone="blue" /><Metric icon="◉" label="ผู้ตอบแบบสอบถาม" value={data.summary.unique_respondents.toLocaleString()} change="เชื่อมกับจำนวนแบบสอบถาม" tone="violet" /><Metric icon="★" label="คะแนนเฉลี่ยรวม" value={`${stats.average.toFixed(2)} / 5`} change={`คำถามสูงสุด ${stats.best}`} tone="green" /><Metric icon="▥" label="คำถามที่วิเคราะห์" value={`${data.questions.length} ข้อ`} change={`คะแนนต่ำสุด ${stats.lowest}`} tone="orange" /></section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]"><Panel title="แนวโน้มคะแนนแบบสอบถาม" subtitle="ค่าเฉลี่ยของ Q1 ถึง Q14"><div className="h-[270px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.questions}><defs><linearGradient id="blueArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#ffffff" strokeOpacity={0.06} /><XAxis dataKey="question" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", borderRadius: 10 }} /><Area type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={3} fill="url(#blueArea)" /></AreaChart></ResponsiveContainer></div></Panel><Panel title="ผู้ตอบตามระดับชั้น" subtitle="สัดส่วนผู้ตอบทั้งหมด"><div className="h-[270px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={yearData} dataKey="value" nameKey="label" innerRadius={65} outerRadius={92} paddingAngle={3}>{yearData.map((item) => <Cell key={item.label} fill={item.fill} />)}</Pie><Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", borderRadius: 10 }} /></PieChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-2">{yearData.slice(0, 6).map((item) => <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 rounded-full" style={{ background: item.fill }} /> <span className="truncate">{item.label}</span><b className="ml-auto text-slate-200">{item.value}</b></div>)}</div></Panel></section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr_0.9fr]"><Panel title="คะแนนเฉลี่ยรายข้อ" subtitle="เปรียบเทียบผลลัพธ์ Q1 - Q14"><div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.questions} barSize={18}><CartesianGrid vertical={false} stroke="#ffffff" strokeOpacity={0.06} /><XAxis dataKey="question" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", borderRadius: 10 }} /><Bar dataKey="average" fill="#8b5cf6" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Panel><Panel title="สรุปผลการประเมิน" subtitle="ประเด็นสำคัญจากข้อมูล"><div className="space-y-4 pt-2"><Insight label="คะแนนสูงสุด" value={stats.best} color="text-emerald-400" detail="คำถามที่ได้คะแนนเฉลี่ยสูงสุด" /><Insight label="คะแนนต่ำสุด" value={stats.lowest} color="text-amber-400" detail="ควรนำไปปรับปรุงเพิ่มเติม" /><Insight label="ค่าเฉลี่ยรวม" value={`${stats.average.toFixed(2)} / 5`} color="text-blue-400" detail="จากทุกคำถามที่มีข้อมูล" /></div></Panel><Panel title="ความคิดเห็นล่าสุด" subtitle="จากผู้ตอบแบบสอบถาม"><div className="space-y-3">{data.feedback.slice(0, 3).map((item) => <article key={item.id} className="border-b border-white/[0.06] pb-3 last:border-0"><p className="line-clamp-2 text-xs leading-5 text-slate-300">“{item.feedback}”</p><p className="mt-1 text-[10px] text-slate-600">{item.year_level || "ไม่ระบุระดับชั้น"}</p></article>)}{!data.feedback.length && <p className="text-xs text-slate-500">ยังไม่มีความคิดเห็น</p>}</div></Panel></section>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, change, tone }: { icon: string; label: string; value: string; change: string; tone: "blue" | "violet" | "green" | "orange" }) { const styles = { blue: "text-blue-300 from-blue-500/20", violet: "text-violet-300 from-violet-500/20", green: "text-emerald-300 from-emerald-500/20", orange: "text-orange-300 from-orange-500/20" }; return <div className={`rounded-xl border border-white/[0.07] bg-gradient-to-br ${styles[tone]} to-transparent p-4`}><div className="flex items-center justify-between"><span className="text-xs text-slate-400">{label}</span><Icon>{icon}</Icon></div><p className="mt-3 text-2xl font-bold text-white">{value}</p><p className="mt-2 text-[10px] text-slate-500">{change}</p></div>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <section className="rounded-xl border border-white/[0.07] bg-[#101622] p-4 shadow-xl shadow-black/10"><div className="mb-3 flex items-start justify-between"><div><h2 className="text-sm font-semibold text-slate-100">{title}</h2><p className="mt-1 text-[11px] text-slate-500">{subtitle}</p></div><button type="button" className="text-xs text-slate-600 hover:text-slate-300">•••</button></div>{children}</section>; }
function Insight({ label, value, detail, color }: { label: string; value: string; detail: string; color: string }) { return <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0"><div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-[10px] text-slate-600">{detail}</p></div><b className={`text-xl ${color}`}>{value}</b></div>; }
