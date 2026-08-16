'use client';

import Link from "next/link";
import { useEffect } from "react";

const stats = [
  { label: "Land area", value: "24.05 km²" },
  { label: "Founded (Jan 18)", value: "1725" },
  { label: "Barangays", value: "28" },
  { label: "Population (2020)", value: "~325k" },
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
    phase: "Colonial",
    title: "Founded as San Pedro de Tunasan",
    text: "Established January 18, 1725 after separating from Cabuyao, named after the medicinal tunas plants on its shores.",
  },
  {
    phase: "Geography",
    title: "Agrarian friar-land hacienda",
    text: "An agrarian estate under Spanish religious orders, with sampaguita farming shaping early local life.",
  },
  {
    phase: "Modern",
    title: "Laguna's northernmost gateway",
    text: "Bordered by Muntinlupa to the north via the Tunasan River and Biñan to the south.",
  },
  {
    phase: "Today",
    title: "A suburban dormitory town",
    text: "Evolved into a bustling urbanized city — a residential hub for Metro Manila commuters.",
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

      <main className="relative min-h-screen overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="float-slow absolute -left-10 top-16 h-56 w-56 rounded-full bg-[color:var(--primary-muted)] opacity-70 blur-3xl" />
          <div className="float-slow absolute right-0 top-32 h-64 w-64 rounded-full bg-[color:var(--accent)]/10 opacity-80 blur-3xl" style={{ animationDelay: "1s" }} />
        </div>

        <nav className="relative z-10 border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[color:var(--primary)]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-white">
                I
              </span>
              Ilaila
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/about/the-team"
                className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--muted)]"
              >
                The Team
              </Link>
              <Link
                href="/about/the-website"
                className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--muted)]"
              >
                The Website
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="reveal">
              <span className="mb-4 inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-sm font-medium text-[color:var(--primary)]">
                Reference concept
              </span>
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-[color:var(--foreground)] sm:text-5xl">
                San Pedro, Laguna.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--text-secondary)]">
                A place known for its rooted community spirit, welcoming neighborhoods, and a
                blend of heritage and everyday life. This is a concept page inspired by the town’s
                identity rather than an official profile.
              </p>
            </div>

            <div className="reveal float-slow" style={{ animationDelay: "180ms" }}>
              <div className="pulse-glow rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                <div className="shimmer-card rounded-[1.5rem] bg-gradient-to-br from-[color:var(--primary-muted)] via-white to-[color:var(--muted)] p-6">
                  <div className="mb-5 flex items-center justify-between text-sm">
                    <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 font-medium uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                      Local
                    </span>
                    <span className="font-medium text-[color:var(--primary)]">Laguna</span>
                  </div>

                  <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                    <img
                      src="https://www.lionunion.com/wp-content/uploads/2023/11/San-Pedro-Banner.jpg"
                      alt="San Pedro Banner"
                      className="mb-4 h-44 w-full rounded-[1.1rem] object-cover scroll-fade"
                    />
                    <h2 className="text-xl font-bold text-[color:var(--foreground)]">San Pedro</h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                      A community rooted in hospitality, neighborhood life, and the everyday rhythm
                      of local culture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 border-y border-[color:var(--border)] bg-[color:var(--surface)]">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="card-lift reveal rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5 text-left"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="text-3xl font-black tracking-tight text-[color:var(--foreground)]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-[color:var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-2xl reveal">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
              03Brief History
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
              From tunas shores to city streets
            </h2>
            <p className="mt-4 text-lg text-[color:var(--text-secondary)]">1725</p>
          </div>

          <div className="space-y-6">
            {milestones.map((item, index) => (
              <div
                key={item.title}
                className="card-lift reveal grid gap-5 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 md:grid-cols-[140px_1fr]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start">
                  <span className="inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
                    {item.phase}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[color:var(--foreground)]">{item.title}</h3>
                  <p className="mt-3 text-base leading-7 text-[color:var(--text-secondary)]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sampaguita Section */}
        <section className="relative z-10 border-t border-[color:var(--border)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="reveal">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
                  The Sampaguita City
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
                  A flower woven into identity
                </h2>
                <p className="mt-6 text-lg leading-8 text-[color:var(--text-secondary)]">
                  Sampaguita has long been part of San Pedro's cultural and economic story—from garlands sold along the streets to locally made products and the city's annual Sampaguita Festival. Known as the "Sampaguita Capital of the Philippines," the flower continues to shape the city's heritage and community pride.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary-muted)] text-sm font-semibold text-[color:var(--primary)]">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-semibold text-[color:var(--foreground)]">Garlands & Street Culture</h4>
                      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Traditional sampaguita garlands remain iconic along San Pedro's streets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary-muted)] text-sm font-semibold text-[color:var(--primary)]">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-semibold text-[color:var(--foreground)]">Local Products</h4>
                      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Sampaguita oil and soap crafted by local artisans</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary-muted)] text-sm font-semibold text-[color:var(--primary)]">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-semibold text-[color:var(--foreground)]">Annual Festival</h4>
                      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Celebration and revival of sampaguita heritage every May</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reveal float-slow" style={{ animationDelay: "200ms" }}>
                <div className="pulse-glow rounded-[2rem] border border-[color:var(--border)] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                  <img
                    src="https://media.philstar.com/photos/2024/02/15/sampaguita2023-07-2517-10-23_2024-02-15_11-04-37.jpg"
                    alt="Sampaguita flowers"
                    className="w-full h-auto rounded-[1.5rem] object-cover scroll-fade"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Food Section */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 reveal">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
              Local Flavors
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
              A taste of San Pedro
            </h2>
            <p className="mt-6 text-lg leading-8 text-[color:var(--text-secondary)]">
              From old neighborhood panciterias to everyday merienda, San Pedro's food culture reflects its history as a close-knit community where tradition and flavor are passed down through generations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Pancit Maciang */}
            <div className="card-lift reveal rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden" style={{ animationDelay: "100ms" }}>
              <img
                src="https://www.angsarap.net/wp-content/uploads/2024/02/Pancit-Maciang-Wide.jpg"
                alt="Pancit Maciang"
                className="w-full h-64 object-cover scroll-fade"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Pancit Maciang</h3>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)] leading-6">
                  A San Pedro institution dating back to the 1950s. Known for its distinctive noodles, egg, and ketchup/lechon-style toppings, Pancit Maciang represents the city's culinary heritage and neighborhood dining tradition.
                </p>
                <span className="mt-4 inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
                  Since 1950s
                </span>
              </div>
            </div>

            {/* Street Panciterias */}
            <div className="card-lift reveal rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden" style={{ animationDelay: "200ms" }}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZlKvOm8feRZzpupRdbN0_Qd-TnegTy0uL-ZS7BpZsh24XjZlYVKTk-BRm&s=10"
                alt="Neighborhood Panciterias"
                className="w-full h-64 object-cover scroll-fade"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Neighborhood Panciterias</h3>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)] leading-6">
                  Small, local noodle shops where families gather for quick meals and conversation. These humble establishments are the backbone of San Pedro's everyday food culture and community gathering spaces.
                </p>
                <span className="mt-4 inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
                  Community Staple
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Festivals Section */}
        <section className="relative z-10 border-t border-[color:var(--border)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-12 reveal">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
                Celebrations
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
                Festivals & Traditions
              </h2>
              <p className="mt-6 text-lg leading-8 text-[color:var(--text-secondary)]">
                Throughout the year, San Pedro celebrates its heritage and community spirit through vibrant festivals that bring neighborhoods together.
              </p>
            </div>

            <div className="space-y-6">
              {/* Sampaguita Festival */}
              <div className="card-lift reveal grid gap-6 rounded-[1.75rem] border border-[color:var(--border)] bg-white p-6 md:grid-cols-[300px_1fr]" style={{ animationDelay: "100ms" }}>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjWQg9CnLWXJltm4rrW9bOAMqJ7V3XGOvBi0b6QpYElYCmfRcF9g--F1kX&s=10"
                  alt="Sampaguita Festival"
                  className="w-full h-full object-cover rounded-[1.25rem] scroll-fade"
                />
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-[color:var(--foreground)]">Sampaguita Festival</h3>
                  <p className="mt-3 text-sm text-[color:var(--primary)] font-semibold">May 22–30 (Annual)</p>
                  <p className="mt-4 text-base leading-7 text-[color:var(--text-secondary)]">
                    The city's most significant celebration, dedicated to reviving and honoring San Pedro's sampaguita heritage. The festival features parades, cultural performances, local product showcases, and community gatherings that celebrate the flower that defines the city's identity.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
                      🌸 Cultural
                    </span>
                    <span className="inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
                      🎉 Community
                    </span>
                    <span className="inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
                      🏛️ Heritage
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
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
              Communities
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
              28 Barangays of San Pedro
            </h2>
            <p className="mt-6 text-lg leading-8 text-[color:var(--text-secondary)]">
              San Pedro is composed of 28 barangays, each with its own character and community spirit that together form the fabric of the city.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-5">
            {barangays.map((barangay, index) => (
              <div
                key={barangay}
                className="card-lift scale-in rounded-[1rem] border border-[color:var(--border)] bg-white p-4 text-center hover:bg-[color:var(--primary-muted)]"
                style={{ animationDelay: `${(index % 15) * 40}ms` }}
              >
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{barangay}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
