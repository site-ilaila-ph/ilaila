import Link from "next/link";

export function HomeLearnMore() {
  return (
    <section className="rounded-lg border border-border bg-card p-8 text-center">
      <h2 className="mb-4 text-2xl font-bold">Gusto mo pa bang matuto?</h2>
      <p className="mb-6 text-muted-foreground">
        Bisitahin ang aming mga pahina upang higit pang makilala ang San Pedro at ang aming layunin
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/about/the-website"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Tungkol sa Ilaila
        </Link>
      </div>
    </section>
  );
}

