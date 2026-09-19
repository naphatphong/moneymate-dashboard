"use client";

import { useState } from "react";

type IconName = "grid" | "wallet" | "chart" | "target" | "settings" | "bell" | "plus" | "arrow" | "trend" | "more";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z" /><path d="M4 8h14a3 3 0 0 1 3 3v1h-5a2 2 0 0 0 0 4h5" /><circle cx="16" cy="14" r=".5" fill="currentColor" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.4 1.4-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L9 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H7.7v-2h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L9 9l1.4-1.4.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 9l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    trend: <><path d="m4 16 5-5 3 3 7-8" /><path d="M15 6h4v4" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const transactions = [
  { title: "เงินเดือน", category: "รายรับ", date: "วันนี้, 09:00 น.", amount: "+ ฿35,000", type: "income", emoji: "💼" },
  { title: "ค่าอาหารกลางวัน", category: "อาหารและเครื่องดื่ม", date: "วันนี้, 12:30 น.", amount: "- ฿120", type: "expense", emoji: "🍜" },
  { title: "ค่าสมาชิกฟิตเนส", category: "สุขภาพ", date: "เมื่อวาน, 18:45 น.", amount: "- ฿1,200", type: "expense", emoji: "🏋️" },
  { title: "เติมน้ำมันรถ", category: "การเดินทาง", date: "18 มี.ค. 2024", amount: "- ฿800", type: "expense", emoji: "⛽" },
];

const budgets = [
  { name: "อาหารและเครื่องดื่ม", used: "฿4,250", total: "฿6,000", percent: 71, color: "#f59e0b", emoji: "🍜" },
  { name: "การเดินทาง", used: "฿2,100", total: "฿4,000", percent: 52, color: "#8b5cf6", emoji: "🚗" },
  { name: "ช้อปปิ้ง", used: "฿1,850", total: "฿3,000", percent: 61, color: "#ec4899", emoji: "🛍️" },
];

export default function Home() {
  const [active, setActive] = useState("ภาพรวม");
  const [showBalance, setShowBalance] = useState(true);
  const menu = [{ label: "ภาพรวม", icon: "grid" as IconName }, { label: "รายการธุรกรรม", icon: "wallet" as IconName }, { label: "รายงาน", icon: "chart" as IconName }, { label: "เป้าหมายการเงิน", icon: "target" as IconName }];

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r border-slate-100 bg-white px-5 py-7 lg:flex">
        <div className="mb-12 flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#125c52] text-xl text-white">₿</div><span className="text-xl font-bold tracking-tight text-[#125c52]">Money<span className="text-[#f59e0b]">Mate</span></span></div>
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">เมนูหลัก</p>
        <nav className="space-y-1">{menu.map((item) => <button key={item.label} onClick={() => setActive(item.label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active === item.label ? "bg-[#e6f3f0] text-[#125c52]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><Icon name={item.icon} size={19} />{item.label}</button>)}</nav>
        <div className="mt-auto space-y-1"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"><Icon name="settings" size={19} />ตั้งค่า</button><div className="mt-5 flex items-center gap-3 border-t border-slate-100 px-2 pt-5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">NP</div><div className="min-w-0"><p className="truncate text-sm font-semibold">Naphatphong</p><p className="text-xs text-slate-400">บัญชีส่วนตัว</p></div><Icon name="more" size={18} /></div></div>
      </aside>

      <main className="lg:ml-[248px]">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-10"><div><p className="text-sm text-slate-400">วันอังคาร, 19 มีนาคม 2024</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">สวัสดีครับ, Naphatphong <span>👋</span></h1></div><div className="flex items-center gap-3"><button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-50"><Icon name="bell" size={21} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /></button><button onClick={() => alert("ฟีเจอร์เพิ่มรายการจะเปิดให้ใช้งานเร็ว ๆ นี้")} className="hidden items-center gap-2 rounded-xl bg-[#125c52] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d4b43] sm:flex"><Icon name="plus" size={18} />เพิ่มรายการ</button></div></header>
        <div className="mx-auto max-w-[1400px] space-y-7 p-5 sm:p-10">
          <section className="grid gap-5 md:grid-cols-3"><div className="rounded-2xl bg-[#125c52] p-6 text-white shadow-lg shadow-emerald-900/10 md:col-span-2"><div className="flex items-start justify-between"><div><p className="text-sm text-emerald-100">ยอดคงเหลือทั้งหมด</p><div className="mt-2 flex items-center gap-3"><h2 className="text-3xl font-bold tracking-tight">{showBalance ? "฿48,250.00" : "••••••••"}</h2><button onClick={() => setShowBalance(!showBalance)} className="text-emerald-200 hover:text-white">{showBalance ? "ซ่อน" : "แสดง"}</button></div></div><div className="rounded-xl bg-white/10 px-3 py-2 text-xs">มี.ค. 2024⌄</div></div><div className="mt-8 flex items-end justify-between"><div><p className="text-xs text-emerald-200">เพิ่มขึ้นจากเดือนที่แล้ว</p><p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#b7f171]"><Icon name="trend" size={16} /> 12.5%</p></div><div className="flex h-12 items-end gap-1 opacity-80">{[18, 26, 20, 33, 28, 40, 36, 48, 43, 56, 50, 62].map((h, i) => <span key={i} style={{ height: `${h}%` }} className="w-2 rounded-t bg-emerald-200/60" />)}</div></div></div><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">รายรับเดือนนี้</p><span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Icon name="arrow" size={17} /></span></div><p className="mt-4 text-2xl font-bold">฿35,000</p><p className="mt-2 text-xs text-slate-400"><span className="font-semibold text-emerald-500">+8.2%</span> จากเดือนที่แล้ว</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[76%] rounded-full bg-emerald-500" /></div></div></section>
          <section className="grid gap-7 xl:grid-cols-[1.45fr_1fr]"><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold">ภาพรวมค่าใช้จ่าย</h2><p className="mt-1 text-sm text-slate-400">ดูแนวโน้มการใช้จ่ายของคุณ</p></div><select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 outline-none"><option>6 เดือนล่าสุด</option><option>ปีนี้</option></select></div><div className="mt-8 flex h-48 items-end gap-3 border-b border-slate-100 px-2 sm:gap-6">{[{m:"ต.ค.",v:42},{m:"พ.ย.",v:62},{m:"ธ.ค.",v:49},{m:"ม.ค.",v:75},{m:"ก.พ.",v:58},{m:"มี.ค.",v:88}].map((bar) => <div key={bar.m} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div style={{height:`${bar.v}%`}} className={`w-full max-w-10 rounded-t-lg ${bar.m === "มี.ค." ? "bg-[#125c52]" : "bg-[#d9eeeb]"}`} /><span className="mb-[-26px] text-xs text-slate-400">{bar.m}</span></div>)}</div><div className="mt-8 flex gap-6 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#125c52]" />ค่าใช้จ่าย</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#d9eeeb]" />ค่าเฉลี่ย</span></div></div><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold">งบประมาณของฉัน</h2><p className="mt-1 text-sm text-slate-400">ประจำเดือน มี.ค. 2024</p></div><button className="text-xs font-semibold text-[#125c52] hover:underline">ดูทั้งหมด</button></div><div className="mt-6 space-y-5">{budgets.map((b) => <div key={b.name}><div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="text-lg">{b.emoji}</span>{b.name}</span><span className="text-xs text-slate-400">{b.used} / {b.total}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div style={{width:`${b.percent}%`, backgroundColor:b.color}} className="h-full rounded-full" /></div></div>)}</div></div></section>
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">รายการล่าสุด</h2><p className="mt-1 text-sm text-slate-400">ธุรกรรมที่เกิดขึ้นล่าสุด</p></div><button onClick={() => setActive("รายการธุรกรรม")} className="flex items-center gap-1 text-xs font-semibold text-[#125c52] hover:underline">ดูรายการทั้งหมด <Icon name="arrow" size={14} /></button></div><div className="divide-y divide-slate-100">{transactions.map((t) => <div key={t.title} className="flex items-center justify-between py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg">{t.emoji}</div><div><p className="text-sm font-semibold">{t.title}</p><p className="mt-1 text-xs text-slate-400">{t.category} • {t.date}</p></div></div><p className={`text-sm font-bold ${t.type === "income" ? "text-emerald-600" : "text-slate-800"}`}>{t.amount}</p></div>)}</div></section>
        </div>
      </main>
    </div>
  );
}
