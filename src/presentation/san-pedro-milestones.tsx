interface MilestoneItem {
  phase: string;
  title: string;
  text: string;
}

interface SanPedroMilestonesProps {
  milestones: MilestoneItem[];
}

export function SanPedroMilestones({ milestones }: SanPedroMilestonesProps) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 max-w-2xl reveal">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          03Maikling Kasaysayan
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Mula sa mga dalampasigan ng tunas hanggang sa mga lansangan ng lungsod
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">1725</p>
      </div>

      <div className="space-y-6">
        {milestones.map((item, index) => (
          <div
            key={item.title}
            className="card-lift reveal grid gap-5 rounded-[1.75rem] border border-border bg-card p-6 md:grid-cols-[140px_1fr]"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start">
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {item.phase}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

