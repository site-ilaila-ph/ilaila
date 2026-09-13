import Link from "next/link";

export default function LandingCta() {
  return (
    <section className="landing-reveal w-full rounded-xl border border-primary/20 bg-linear-to-br from-primary/20 via-secondary to-background p-8 text-center shadow-xl shadow-primary/15 md:p-10">
      <h2 className="mb-4 text-2xl font-bold">Handa ka na bang tumuklas?</h2>
      <p className="mb-6 text-muted-foreground">Mag-sign up upang mag-save ng mga kainan, mag-iwan ng pagsusuri, at makita ang mga rekomendasyon ng iba</p>
      <Link href="/auth/sign-up-or-login?mode=sign-up" className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        Magsimula
      </Link>
    </section>
  );
}
