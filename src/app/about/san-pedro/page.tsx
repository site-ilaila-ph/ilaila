'use client';

import Link from "next/link";
import Image from "next/image";
import { Flower2, Landmark, PartyPopper } from "lucide-react";
import { useEffect } from "react";

const stats = [
  { label: "Lawak ng lupa", value: "24.05 km²" },
  { label: "Itinatag (Ene 18)", value: "1725" },
  { label: "Mga Barangay", value: "28" },
  { label: "Populasyon (2020)", value: "~325k" },
];

const barangays = [
  "Bagong Silang", "Calendola", "Chrysanthemum", "Cuyab", "Estrella", "Fatima",
  "G.S.I.S.", "Landayan", "Langgam", "Laram", "Magsaysay", "Maharika",
  "Narra", "Nueva", "Pacita I", "Pacita II", "Poblacion", "Riverside",
  "Rosario", "Sampaguita Village", "San Antonio", "San Lorenzo", "San Lorenzo Ruiz",
  "San Roque", "San Vicente", "Santo Niño", "United Bayanihan", "United Better Living",
];

const milestones = [
  {
    phase: "Kolonyal",
    title: "Itinatag bilang San Pedro de Tunasan",
    text: "Itinatag noong Enero 18, 1725 pagkatapos humiwalay sa Cabuyao, pinangalanan sa mga gamot na tunas na halaman sa mga dalampasigan nito.",
  },
  {
    phase: "Heograpiya",
    title: "Hacienda ng mga prayle",
    text: "Isang agraryong ari-arian sa ilalim ng mga Kastilang relihiyosong samahan, kung saan humubog ang pagtatanim ng sampaguita sa maagang buhay ng pamayanan.",
  },
  {
    phase: "Makabago",
    title: "Pinakahilagang tarangkahan ng Laguna",
    text: "Hangganan ang Muntinlupa sa hilaga sa pamamagitan ng Ilog Tunasan at ang Biñan sa timog.",
  },
  {
    phase: "Ngayon",
    title: "Isang suburban dormitoryong lungsod",
    text: "Umunlad bilang mausisang urbanisadong lungsod — isang pabahay-hub para sa mga taga-Metro Manila na manlalakbay araw-araw.",
  },
];

export default function SanPedroPage() {
  useEffect(() => {
    const images = document.querySelectorAll('.scroll-fade');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    images.forEach((img) => observer.observe(img));

    return () => {
      images.forEach((img) => observer.unobserve(img));
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(16, 185, 129, 0.18);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.18);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(16, 185, 129, 0), 0 0 20px rgba(16, 185, 129, 0);
          }
          50% {
            text-shadow: 0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.3);
          }
        }

        .reveal {
          animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .float-slow {
          animation: float 7s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .shimmer-card {
          background: linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.15), rgba(255,255,255,0.6));
          background-size: 200% 100%;
          animation: shimmer 5s linear infinite;
        }

        .card-lift {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .card-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }

        .scale-in {
          animation: scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .slide-left {
          animation: slideInLeft 0.6s ease-out both;
        }

        .slide-right {
          animation: slideInRight 0.6s ease-out both;
        }

        .glow-text {
          animation: glow 3s ease-in-out infinite;
        }

        .scroll-fade {
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
        }

        .scroll-fade.visible {
          opacity: 1;
        }
      `}</style>

      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="float-slow absolute -left-10 top-16 h-56 w-56 rounded-full bg-secondary opacity-70 blur-3xl" />
          <div className="float-slow absolute right-0 top-32 h-64 w-64 rounded-full bg-accent/10 opacity-80 blur-3xl" style={{ animationDelay: "1s" }} />
        </div>

        <nav className="relative z-10 border-b border-border bg-(--surface)/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                I
              </span>
              Ilaila
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/about/the-team"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-(--text-secondary) transition hover:bg-muted"
              >
                Ang Koponan
              </Link>
              <Link
                href="/about/the-website"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-(--text-secondary) transition hover:bg-muted"
              >
                Ang Website
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="reveal">
              <span className="mb-4 inline-flex rounded-full bg-(--primary-muted) px-3 py-1 text-sm font-medium text-primary">
                Sangguniang konsepto
              </span>
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                San Pedro, Laguna.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-(--text-secondary)">
                Isang lugar na kilala sa malalim na diwa ng pamayanan, mga mapagpatuluyang
                pamayanan, at tambalan ng pamanang kultura at pang-araw-araw na buhay. Ito ay isang
                konseptong pahina na inspirasyon ng pagkakakilanlan ng bayan at hindi isang opisyal na
                profile.
              </p>
            </div>

            <div className="reveal float-slow" style={{ animationDelay: "180ms" }}>
              <div className="pulse-glow rounded-[2rem] border border-border bg-(--surface) p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                <div className="shimmer-card rounded-[1.5rem] bg-linear-to-br from-secondary via-card to-muted p-6">
                  <div className="mb-5 flex items-center justify-between text-sm">
                    <span className="rounded-full border border-border bg-card px-3 py-1 font-medium uppercase tracking-[0.2em] text-(--text-secondary)">
                      Lokal
                    </span>
                    <span className="font-medium text-primary">Laguna</span>
                  </div>

                  <div className="rounded-[1.5rem] bg-card p-4 shadow-sm">
                    <Image
                      src="https://www.lionunion.com/wp-content/uploads/2023/11/San-Pedro-Banner.jpg"
                      alt="San Pedro Banner"
                      className="mb-4 h-44 w-full rounded-[1.1rem] object-cover scroll-fade"
                      width={400}
                      height={176}
                    />
                    <h2 className="text-xl font-bold text-foreground">San Pedro</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Isang pamayanang nakaugat sa kabaitan, buhay ng pamayanan, at sa pang-araw-araw
                      na daloy ng lokal na kultura.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {/* Sampaguita Section */}
        <section className="relative z-10 border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="reveal">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                  Ang Lungsod ng Sampaguita
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Isang bulaklak na hinabi sa pagkakakilanlan
                </h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Matagal nang bahagi ng kultural at ekonomikong kuwento ng San Pedro ang sampaguita—mula sa mga
                  lei na ibinebenta sa mga lansangan hanggang sa mga produktong gawa locally at sa taunang
                  Sampaguita Festival ng lungsod. Kilala bilang Sampaguita Capital ng Pilipinas, ang bulaklak ay
                  patuloy na humuhubog sa pamana at pride ng lungsod.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground">Mga Lei at Kultura ng Lansangan</h4>
                      <p className="mt-1 text-sm text-muted-foreground">Patuloy na tanyag ang tradisyonal na sampaguita lei sa mga lansangan ng San Pedro</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground">Mga Lokal na Produkto</h4>
                      <p className="mt-1 text-sm text-muted-foreground">Langis at sabon ng sampaguita na ginawa ng mga lokal na artesano</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground">Taunang Pagdiriwang</h4>
                      <p className="mt-1 text-sm text-muted-foreground">Pagdiriwang at muling pagbabangon ng pamana ng sampaguita tuwing Mayo</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reveal float-slow" style={{ animationDelay: "200ms" }}>
                <div className="pulse-glow rounded-[2rem] border border-border bg-card p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                  <Image
                    src="https://media.philstar.com/photos/2024/02/15/sampaguita2023-07-2517-10-23_2024-02-15_11-04-37.jpg"
                    alt="Sampaguita flowers"
                    className="w-full h-auto rounded-[1.5rem] object-cover scroll-fade"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Food Section */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 reveal">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Mga Lokal na Lasang
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Lasang San Pedro
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Mula sa mga lumang panciteria ng pamayanan hanggang sa pang-araw-araw na merienda, ipinapakita ng
              kulturang pagkain ng San Pedro ang kasaysayan nito bilang isang malapit na pamayanan kung saan
              ipinamamana ang tradisyon at lasa sa mga susunod na henerasyon.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Pancit Maciang */}
            <div className="card-lift reveal rounded-[1.75rem] border border-border bg-card overflow-hidden" style={{ animationDelay: "100ms" }}>
              <Image
                src="https://www.angsarap.net/wp-content/uploads/2024/02/Pancit-Maciang-Wide.jpg"
                alt="Pancit Maciang"
                className="w-full h-64 object-cover scroll-fade"
                width={600}
                height={256}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground">Pancit Maciang</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-6">
                  Isang institusyon sa San Pedro mula pa noong dekada 1950. Kilala sa natatanging noodles,
                  itlog, at ketchup/lechon-style toppings, kinakatawan ng Pancit Maciang ang pamanang
                  pagkain ng lungsod at tradisyon ng pagkain kasama ng kapitbahayan.
                </p>
                <span className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  Mula pa noong dekada 1950
                </span>
              </div>
            </div>

            {/* Street Panciterias */}
            <div className="card-lift reveal rounded-[1.75rem] border border-border bg-card overflow-hidden" style={{ animationDelay: "200ms" }}>
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZlKvOm8feRZzpupRdbN0_Qd-TnegTy0uL-ZS7BpZsh24XjZlYVKTk-BRm&s=10"
                alt="Neighborhood Panciterias"
                className="w-full h-64 object-cover scroll-fade"
                width={600}
                height={256}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground">Mga Panciteria ng Pamayanan</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-6">
                  Maliliit na lokal na noodle shop kung saan nagtitipon ang mga pamilya para sa mabilisang
                  kainan at kwentuhan. Ang mga payak na negosyong ito ang gulugod ng pang-araw-araw na
                  kulturang pagkain at mga titigang tipunan ng San Pedro.
                </p>
                <span className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  Bahagi ng Bawat Araw ng Pamayanan
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Festivals Section */}
        <section className="relative z-10 border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-12 reveal">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                Mga Pagdiriwang
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Mga Pagdiriwang at Tradisyon
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Sa buong taon, ipinagdiriwang ng San Pedro ang pamana at diwa ng pamayanan sa pamamagitan ng
                makukulay na pagdiriwang na nagpapagitaw sa mga pamayanan.
              </p>
            </div>

            <div className="space-y-6">
              {/* Sampaguita Festival */}
              <div className="card-lift reveal grid gap-6 rounded-[1.75rem] border border-border bg-card p-6 md:grid-cols-[300px_1fr]" style={{ animationDelay: "100ms" }}>
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjWQg9CnLWXJltm4rrW9bOAMqJ7V3XGOvBi0b6QpYElYCmfRcF9g--F1kX&s=10"
                  alt="Sampaguita Festival"
                  className="w-full h-full object-cover rounded-[1.25rem] scroll-fade"
                  width={300}
                  height={300}
                />
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-foreground">Sampaguita Festival</h3>
                  <p className="mt-3 text-sm text-primary font-semibold">Mayo 22–30 (Taun-taon)</p>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">
                    Ang pinakamahalagang pagdiriwang ng lungsod, nakatuon sa muling pagbabangon at pagpaparangal
                    sa pamana ng sampaguita ng San Pedro. Tampok sa festival ang mga parada, kultural na
                    pagtatanghal, pagpapakita ng mga lokal na produkto, at mga tipunan ng pamayanan na
                    nagdiriwang sa bulaklak na nagbibigay-hulog sa pagkakakilanlan ng lungsod.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                      <Flower2 aria-hidden="true" className="size-3.5" />
                      Kultural
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                      <PartyPopper aria-hidden="true" className="size-3.5" />
                      Pamayanan
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                      <Landmark aria-hidden="true" className="size-3.5" />
                      Pamana
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Barangays Section */}
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
      </main>
    </>
  );
}
