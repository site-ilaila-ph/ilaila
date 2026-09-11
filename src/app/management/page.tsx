"use client";
import { ManagementCard } from "@/components/blocks/management/management-card";
import { StatCard } from "@/components/blocks/management/stat-card";
import { SummaryStat } from "@/components/blocks/management/summary-stat";
import { CircleUserRound, Users, Store, Utensils, MessageSquareText, ClipboardList, CheckCircle2, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";

export default function Page() {
  const [stats, setStats] = useState({
    users: 0,
    businesses: 0,
    foods: 0,
    reviews: 0,
    appReviews: 0,
    pendingAppReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/management/stats");
        if (!response.ok) {
          throw new Error(await readProblemMessage(response, `Failed to load stats: ${response.status}`));
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    }
    void loadStats();
  }, []);

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Mga Pahina / Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm border border-border">
            <CircleUserRound size={15} /> Admin
          </div>
        </div>
      </div>

      <ErrorAlert message={loadError} className="mb-4" onDismiss={() => setLoadError(null)} />

      {isLoading ? (
        <div className="rounded-2xl bg-card py-16 text-center shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">Ikinakarga ang mga istatistika...</p>
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
        <section className="rounded-2xl bg-card p-5 sm:p-6 shadow-sm border border-border">
          <div className="mb-6 flex items-start justify-between">
            <div><h2 className="font-bold text-foreground">Buod ng Nilalaman</h2><p className="mt-1 text-xs text-muted-foreground">Kabuuang datos sa iyong platform</p></div>
            <BarChart3 className="text-primary" size={19} />
          </div>
          <div className="flex h-72 gap-3 sm:h-80 sm:gap-4">
            {(() => {
              const values = [stats.users, stats.businesses, stats.foods, stats.reviews, stats.appReviews];
              const chartMax = 100;
              const axisLabels = [100, 75, 50, 25, 0];

              return <>
                <div className="flex h-full w-9 shrink-0 flex-col justify-between pb-7 text-right text-[10px] text-muted-foreground">
                  {axisLabels.map((label) => <span key={label}>{label.toLocaleString()}</span>)}
                </div>
                <div className="relative flex min-w-0 flex-1 items-end gap-3 border-b border-border bg-[linear-gradient(to_bottom,transparent_24.8%,var(--border)_25%,transparent_25.2%,transparent_49.8%,var(--border)_50%,transparent_50.2%,transparent_74.8%,var(--border)_75%,transparent_75.2%)] px-2 pb-2 sm:gap-6">
                  {values.map((value, index) => (
                    <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div
                        className="w-full max-w-14 rounded-t-md bg-linear-to-t from-primary to-accent transition-all"
                        style={{ height: value === 0 ? "0px" : `${(Math.min(value, chartMax) / chartMax) * 260}px` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{["Gumagamit", "Negosyo", "Pagkain", "Review", "Review ng App"][index]}</span>
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
        <section className="rounded-2xl bg-card p-5 shadow-sm border border-border">
          <div className="mb-5 flex items-start justify-between"><div><h2 className="font-bold text-foreground">Mabilis na Aksyon</h2><p className="mt-1 text-xs text-muted-foreground">Pumunta sa isang seksyon</p></div><ClipboardList className="text-secondary-foreground" size={19} /></div>
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