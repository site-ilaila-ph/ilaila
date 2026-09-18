interface SanPedroBarangaysProps {
  barangays: string[];
}

export function SanPedroBarangays({ barangays }: SanPedroBarangaysProps) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 reveal">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Mga Pamayanan
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          28 Barangay ng San Pedro
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Binubuo ang San Pedro ng 28 barangay, bawat isa ay may sariling katangian at diwa ng pamayanan
          na magkasamang bumubuo sa tela ng lungsod.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-5">
        {barangays.map((barangay, index) => (
          <div
            key={barangay}
            className="card-lift scale-in rounded-[1rem] border border-border bg-card p-4 text-center hover:bg-secondary"
            style={{ animationDelay: `${(index % 15) * 40}ms` }}
          >
            <p className="text-sm font-semibold text-foreground">{barangay}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

