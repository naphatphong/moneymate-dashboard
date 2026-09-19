"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Data = {
  demo?: boolean;
  summary: { total_responses: number; unique_respondents: number; overall_average: number | string | null; latest_response: string | null };
  yearLevels: { label: string; value: number }[];
  questions: { question: string; average: number | string }[];
  feedback: { id: number; year_level: string | null; feedback: string; created_at: string }[];
};

const colors = ["#5b8cff", "#9b7bff", "#36d6b0", "#ffbd68", "#f477a8", "#8190ad"];
const num = (value: number | string | null | undefined) => Number(value ?? 0);
const date = (value: string | null) => value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";

export default function Home() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState("ภาพรวม");

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (res) => { const body = await res.json(); if (!res.ok) throw new Error(body.error || "โหลดข้อมูลไม่สำเร็จ"); setData(body); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ"));
  }, []);

  const insight = useMemo(() => {
    if (!data || !data.questions.length) return { average: 0, best: "-", lowest: "-" };
    const ordered = [...data.questions].sort((a, b) => num(b.average) - num(a.average));
    return { average: num(data.summary.overall_average), best: ordered[0].question, lowest: ordered[ordered.length - 1].question };
  }, [data]);

  if (!data && !error) return <main className="loading-screen"><div className="loader" /><p>กำลังเตรียมรายงานของคุณ...</p></main>;
  if (!data || error) return <main className="loading-screen"><div className="error-box"><b>โหลดข้อมูลไม่สำเร็จ</b><span>{error}</span><small>ตรวจสอบ DATABASE_URL และตาราง survey_responses</small></div></main>;

  const levels = data.yearLevels.map((item, index) => ({ ...item, fill: colors[index % colors.length] }));
  const menu = ["ภาพรวม", "ผลการประเมิน", "ผู้ตอบแบบสอบถาม", "ความคิดเห็น"];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><div><strong>SurveyDash</strong><small>ANALYTICS CENTER</small></div></div>
        <div className="search">⌕ <span>ค้นหาเมนู...</span><kbd>⌘ K</kbd></div>
        <p className="eyebrow">เมนูหลัก</p>
        <nav>{menu.map((item, index) => <button key={item} className={active === item ? "nav-item active" : "nav-item"} onClick={() => setActive(item)}><i>{["⌂", "▥", "◌", "≡"][index]}</i>{item}{active === item && <em>›</em>}</button>)}</nav>
        <p className="eyebrow manage">จัดการ</p>
        <nav><button className="nav-item"><i>⚙</i>ตั้งค่า</button><button className="nav-item"><i>?</i>ช่วยเหลือ</button></nav>
        <div className="sidebar-foot"><div className="status-dot" /><div><b>ฐานข้อมูลเชื่อมต่อแล้ว</b><small>{data.demo ? "Demo mode" : "Live · อัปเดตอัตโนมัติ"}</small></div></div>
      </aside>

      <section className="workspace">
        <header className="topbar"><div><p className="crumb">Dashboard <span>/</span> {active}</p><h1>ภาพรวมแดชบอร์ด</h1><p className="muted">รายงานภาพรวมข้อมูลแบบสอบถามทั้งหมด · อัปเดต {date(data.summary.latest_response)}</p></div><div className="top-actions"><button className="period">2024 — 2025 <span>⌄</span></button><button className="refresh" onClick={() => window.location.reload()}>↻ <span>รีเฟรชข้อมูล</span></button><div className="avatar">NP</div></div></header>

        <div className="content">
          <section className="metrics"><Metric label="แบบสอบถามทั้งหมด" value={data.summary.total_responses.toLocaleString()} note="รายการที่บันทึกในระบบ" tone="blue" icon="↗" /><Metric label="ผู้ตอบแบบสอบถาม" value={data.summary.unique_respondents.toLocaleString()} note="เชื่อมกับข้อมูลแบบสอบถาม" tone="purple" icon="◉" /><Metric label="คะแนนเฉลี่ยรวม" value={`${insight.average.toFixed(2)} / 5`} note={`คำถามเด่น ${insight.best}`} tone="green" icon="✦" /><Metric label="คำถามที่วิเคราะห์" value={`${data.questions.length} ข้อ`} note={`ควรดูแล ${insight.lowest}`} tone="orange" icon="▥" /></section>

          <section className="grid-main"><Panel title="แนวโน้มคะแนนเฉลี่ย" subtitle="ค่าเฉลี่ยของคำถาม Q1 — Q14" action="6 เดือนล่าสุด"><div className="chart-large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.questions}><defs><linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#5b8cff" stopOpacity=".38" /><stop offset="1" stopColor="#5b8cff" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#fff" strokeOpacity={.06} /><XAxis dataKey="question" axisLine={false} tickLine={false} tick={{ fill: "#71809d", fontSize: 11 }} /><YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: "#71809d", fontSize: 11 }} /><Tooltip contentStyle={{ background: "#151c2b", border: "1px solid #2a3851", borderRadius: 10, color: "#fff" }} /><Area type="monotone" dataKey="average" stroke="#5b8cff" strokeWidth={2.5} fill="url(#scoreGradient)" /></AreaChart></ResponsiveContainer></div></Panel><Panel title="ผู้ตอบตามระดับชั้น" subtitle="สัดส่วนจากผู้ตอบทั้งหมด"><div className="chart-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={levels} dataKey="value" nameKey="label" innerRadius={61} outerRadius={89} paddingAngle={3}>{levels.map((item) => <Cell key={item.label} fill={item.fill} stroke="none" />)}</Pie><Tooltip contentStyle={{ background: "#151c2b", border: "1px solid #2a3851", borderRadius: 10 }} /></PieChart></ResponsiveContainer><div className="donut-total"><b>{data.summary.unique_respondents.toLocaleString()}</b><span>ผู้ตอบทั้งหมด</span></div></div><div className="legend">{levels.slice(0, 6).map((item) => <div key={item.label}><span><i style={{ background: item.fill }} />{item.label}</span><b>{item.value.toLocaleString()}</b></div>)}</div></Panel></section>

          <section className="grid-bottom"><Panel title="คะแนนเฉลี่ยรายข้อ" subtitle="เปรียบเทียบผลลัพธ์ทั้งหมด Q1 — Q14" action="ดูรายละเอียด"><div className="chart-bar"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.questions} barSize={17}><CartesianGrid vertical={false} stroke="#fff" strokeOpacity={.06} /><XAxis dataKey="question" axisLine={false} tickLine={false} tick={{ fill: "#71809d", fontSize: 10 }} /><YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: "#71809d", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#151c2b", border: "1px solid #2a3851", borderRadius: 10 }} /><Bar dataKey="average" fill="#8975ee" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Panel><Panel title="สรุปผลการประเมิน" subtitle="จุดเด่นและโอกาสในการพัฒนา"><div className="insights"><Insight label="คะแนนสูงสุด" value={insight.best} description="คำถามที่ได้คะแนนดีที่สุด" color="green" /><Insight label="คะแนนต่ำสุด" value={insight.lowest} description="หัวข้อที่ควรติดตาม" color="orange" /><Insight label="ค่าเฉลี่ยรวม" value={`${insight.average.toFixed(2)} / 5`} description="จากทุกคำถามที่มีข้อมูล" color="blue" /></div></Panel><Panel title="ความคิดเห็นล่าสุด" subtitle="เสียงจากผู้ตอบแบบสอบถาม"><div className="comments">{data.feedback.slice(0, 4).map((item) => <article key={item.id}><p>“{item.feedback}”</p><small>{item.year_level || "ไม่ระบุระดับชั้น"} · {date(item.created_at)}</small></article>)}{!data.feedback.length && <span className="muted">ยังไม่มีความคิดเห็น</span>}</div></Panel></section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, note, tone, icon }: { label: string; value: string; note: string; tone: string; icon: string }) { return <div className={`metric ${tone}`}><div className="metric-head"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>; }
function Panel({ title, subtitle, action, children }: { title: string; subtitle: string; action?: string; children: ReactNode }) { return <section className="panel"><header><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button>{action}⌄</button>}</header>{children}</section>; }
function Insight({ label, value, description, color }: { label: string; value: string; description: string; color: string }) { return <div className="insight"><div><span>{label}</span><small>{description}</small></div><b className={color}>{value}</b></div>; }
