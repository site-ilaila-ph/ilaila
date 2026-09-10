export default function LandingWhy() {
  return (
    <section className="landing-reveal mb-16 w-full rounded-xl border border-border bg-card/80 p-8 shadow-xl shadow-primary/10 md:p-10">
      <h2 className="mb-6 text-3xl font-bold">Bakit Ilaila?</h2>
      <div className="grid gap-x-16 gap-y-10 text-left md:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
          <h3 className="mb-2 font-semibold text-primary">Para talaga sa San Pedro</h3>
          <p className="text-sm text-muted-foreground">Nakatuon kami sa iisang lugar. Makakakuha ka ng totoong impormasyon tungkol sa mga pagkain at kainan dito, hindi pangkalahatang nilalaman.</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
          <h3 className="mb-2 font-semibold text-primary">Suportahan ang mga Lokal</h3>
          <p className="text-sm text-muted-foreground">Kapag nagsuri ka ng kainan o nagbahagi tungkol sa pagkain, direktang nakatutulong ka sa mga taong nagpapatakbo ng mga ito.</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
          <h3 className="mb-2 font-semibold text-primary">Buhayin ang mga Kuwento</h3>
          <p className="text-sm text-muted-foreground">Mahalaga ang mga tradisyonal na lutuin at resipe ng pamilya. Itinatala namin ang mga ito upang hindi malimutan.</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
          <h3 className="mb-2 font-semibold text-primary">Hanapin ang Masarap</h3>
          <p className="text-sm text-muted-foreground">Tingnan ang tapat na pagsusuri mula sa tunay na mga tao. Tuklasin ang mga lugar at pagkaing tunay mong masisiyahan.</p>
        </div>
      </div>
    </section>
  );
}
