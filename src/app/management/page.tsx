"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  MessageSquareText,
  Store,
  Utensils,
  Users,
} from "lucide-react";
import { getManagementStats } from "@/app/management/services";

export default function ManagementDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    businesses: 0,
    foods: 0,
    reviews: 0,
    appReviews: 0,
    pendingAppReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getManagementStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-400">Mga Pahina / Dashboard</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs text-slate-400 shadow-sm">
                <CircleUserRound size={15} /> Admin
              </div>
            </div>
          </div>

        {isLoading ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <p className="text-sm text-slate-400">Ikinakarga ang mga istatistika...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Mga Gumagamit" value={stats.users} icon={<Users size={18} />} tone="blue" />
            <StatCard label="Mga Negosyo" value={stats.businesses} icon={<Store size={18} />} tone="violet" />
            <StatCard label="Mga Pagkain" value={stats.foods} icon={<Utensils size={18} />} tone="orange" />
            <StatCard label="Mga Review" value={stats.reviews} icon={<MessageSquareText size={18} />} tone="green" />
            <StatCard label="Mga Review ng App" value={stats.appReviews} icon={<ClipboardList size={18} />} tone="pink" />
            {stats.pendingAppReviews > 0 && (
              <StatCard label="Mga Nakabinbing Review" value={stats.pendingAppReviews} icon={<CheckCircle2 size={18} />} tone="yellow" />
            )}
          </div>
        )}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(65,93,145,0.08)]">
            <div className="mb-6 flex items-start justify-between">
              <div><h2 className="font-bold text-slate-800">Buod ng Nilalaman</h2><p className="mt-1 text-xs text-slate-400">Kabuuang datos sa iyong platform</p></div>
              <BarChart3 className="text-blue-500" size={19} />
            </div>
            <div className="flex h-72 gap-3 sm:h-80 sm:gap-4">
              {(() => {
                const values = [stats.users, stats.businesses, stats.foods, stats.reviews, stats.appReviews];
                const chartMax = 100;
                const axisLabels = [100, 75, 50, 25, 0];

                return <>
                  <div className="flex h-full w-9 shrink-0 flex-col justify-between pb-7 text-right text-[10px] text-slate-400">
                    {axisLabels.map((label) => <span key={label}>{label.toLocaleString()}</span>)}
                  </div>
                  <div className="relative flex min-w-0 flex-1 items-end gap-3 border-b border-slate-100 bg-[linear-gradient(to_bottom,transparent_24.8%,#f1f5f9_25%,transparent_25.2%,transparent_49.8%,#f1f5f9_50%,transparent_50.2%,transparent_74.8%,#f1f5f9_75%,transparent_75.2%)] px-2 pb-2 sm:gap-6">
                    {values.map((value, index) => (
                      <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <div
                          className="w-full max-w-14 rounded-t-md bg-gradient-to-t from-blue-500 to-violet-400 transition-all"
                          style={{ height: value === 0 ? "0px" : `${(Math.min(value, chartMax) / chartMax) * 260}px` }}
                        />
                        <span className="text-[10px] text-slate-400">{["Gumagamit", "Negosyo", "Pagkain", "Review", "Review ng App"][index]}</span>
                      </div>
                    ))}
                  </div>
                </>;
              })()}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
              <SummaryStat value={stats.users} label="Gumagamit" />
              <SummaryStat value={stats.businesses} label="Negosyo" />
              <SummaryStat value={stats.foods} label="Pagkain" />
              <SummaryStat value={stats.reviews} label="Review" />
              <SummaryStat value={stats.appReviews} label="Review ng App" />
              {stats.pendingAppReviews > 0 && <SummaryStat value={stats.pendingAppReviews} label="Nakabinbin" />}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(65,93,145,0.08)]">
            <div className="mb-5 flex items-start justify-between"><div><h2 className="font-bold text-slate-800">Mabilis na Aksyon</h2><p className="mt-1 text-xs text-slate-400">Pumunta sa isang seksyon</p></div><ClipboardList className="text-violet-500" size={19} /></div>
            <div className="space-y-2">
          <ManagementCard
            title="Mga Negosyo"
            description="Gumawa, mag-edit, at magtanggal ng mga negosyo"
            href="/management/businesses"
          />
          <ManagementCard
            title="Mga Pagkain"
            description="Pamahalaan ang mga pagkaing pamanang-kultura"
            href="/management/foods"
          />
          <ManagementCard
            title="Mga Review"
            description="Suriin at pamahalaan ang mga review"
            href="/management/reviews"
          />
          <ManagementCard
            title="Mga Gumagamit"
            description="Pamahalaan ang mga account at tungkulin ng gumagamit"
            href="/management/users"
          />
          <ManagementCard
            title="Mga Review ng App"
            description="Pamahalaan ang feedback ng gumagamit tungkol sa aplikasyon"
            href="/management/app-reviews"
            badge={stats.pendingAppReviews > 0 ? `${stats.pendingAppReviews} nakabinbin` : undefined}
          />
            </div>
          </section>
        </div>
    </div>
  );
}

function SummaryStat({ value, label }: { value: number; label: string }) {
  return <div><p className="text-lg font-bold text-slate-800">{value.toLocaleString()}</p><p className="text-[10px] text-slate-400">{label}</p></div>;
}

function StatCard({ 
  label, 
  value, 
  icon,
  tone,
}: { 
  label: string; 
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "violet" | "orange" | "green" | "pink" | "yellow";
}) {
  const tones = { blue: "bg-blue-50 text-blue-500", violet: "bg-violet-50 text-violet-500", orange: "bg-orange-50 text-orange-500", green: "bg-emerald-50 text-emerald-500", pink: "bg-pink-50 text-pink-500", yellow: "bg-yellow-50 text-yellow-600" };
  const progress = Math.max(0, Math.min(100, value));
  
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(65,93,145,0.08)]">
      <div className="flex items-center justify-between"><p className="text-xs text-slate-400">{label}</p><div className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</div></div>
      <p className="mt-3 text-2xl font-bold text-slate-800">{value.toLocaleString()}</p>
      <div className="mt-3 h-1 rounded-full bg-slate-100"><div className={`h-1 rounded-full ${tone === "yellow" ? "bg-yellow-400" : "bg-blue-400"}`} style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

function ManagementCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <p className="mt-1 truncate text-xs text-slate-400">{description}</p>
        </div>
        <ChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" size={18} />
        {badge && (
          <div className="ml-2 inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
            {badge}
          </div>
        )}
      </div>
    </Link>
  );
}
