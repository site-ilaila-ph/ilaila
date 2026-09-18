interface StatItem {
  label: string;
  value: string;
}

interface SanPedroStatsProps {
  stats: StatItem[];
}

export function SanPedroStats({ stats }: SanPedroStatsProps) {
  return (
    <section className="relative z-10 border-y border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="card-lift reveal rounded-[1.5rem] border border-border bg-card p-5 text-left"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="text-3xl font-black tracking-tight text-foreground">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

