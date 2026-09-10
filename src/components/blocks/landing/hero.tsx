import Link from "next/link";

export default function LandingHero() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
      <span className="mb-4 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-primary">
        Tuklasin ang kultura ng pagkain sa San Pedro
      </span>
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
        Hanapin ang mga pagkaing at
        <br />
        taong mahalaga sa atin
      </h1>
      <p className="mb-8 max-w-2xl text-lg leading-8 text-muted-foreground">
        Maghanap ng mga kainan, tradisyon ng pagkain, at resipe mula sa San Pedro. Alamin ang opinyon ng iba at makiisa sa komunidad.
      </p>
      <div className="mb-16 flex flex-wrap justify-center gap-3">
        <Link href="/home" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Maghanap Ngayon
        </Link>
        <Link href="/about/the-website" className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition duration-200 ease-out hover:-translate-y-1 hover:bg-muted hover:shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Alamin Pa
        </Link>
      </div>
    </main>
  );
}
