export default function LandingFeatures() {
  return (
    <div className="mb-16 grid w-full gap-6 md:grid-cols-3 md:gap-8">
      <div className="landing-reveal flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-md shadow-primary/5 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary/60 hover:bg-secondary hover:shadow-xl hover:shadow-primary/15">
        <div className="mb-4 text-4xl">🏪</div>
        <h3 className="mb-2 text-lg font-semibold">Mga Lokal na Kainan</h3>
        <p className="text-sm text-muted-foreground">Hanapin kung saan masarap kumain sa San Pedro. Tingnan kung ano ang patok at kung saan nagpupunta ang iyong mga kaibigan.</p>
      </div>
      <div className="landing-reveal flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-md shadow-primary/5 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary/60 hover:bg-secondary hover:shadow-xl hover:shadow-primary/15">
        <div className="mb-4 text-4xl">🍲</div>
        <h3 className="mb-2 text-lg font-semibold">Mga Tradisyonal na Lutuin</h3>
        <p className="text-sm text-muted-foreground">Alamin ang mga pagkaing bahagi ng San Pedro, pati ang mga resipe, kuwento, at natatanging katangian ng mga ito.</p>
      </div>
      <div className="landing-reveal flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-md shadow-primary/5 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary/60 hover:bg-secondary hover:shadow-xl hover:shadow-primary/15">
        <div className="mb-4 text-4xl">📍</div>
        <h3 className="mb-2 text-lg font-semibold">Tunay na mga Pagsusuri</h3>
        <p className="text-sm text-muted-foreground">Basahin ang tunay na opinyon ng mga tao. Mag-iwan ng iyong pagsusuri at tulungan ang iba na makahanap ng masarap na pagkain.</p>
      </div>
    </div>
  );
}
