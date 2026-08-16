'use client';

import Link from "next/link";

const websitePoints = [
  {
    number: "01",
    title: "Discover",
    text: "Find places, food, landmarks, and hidden spots around San Pedro.",
  },
  {
    number: "02",
    title: "Learn",
    text: "Understand the history, culture, and stories behind the city.",
  },
  {
    number: "03",
    title: "Explore",
    text: "Browse neighborhoods and see what each part of San Pedro has to offer.",
  },
  {
    number: "04",
    title: "Support Local",
    text: "Help people discover local businesses, restaurants, creators, and events.",
  },
  {
    number: "05",
    title: "Connect",
    text: "Give residents a way to share experiences, recommendations, and stories.",
  },
];

export default function TheWebsitePage() {
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
            transform: translateY(-12px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(16, 185, 129, 0.08);
          }
          50% {
            box-shadow: 0 0 28px rgba(16, 185, 129, 0.15);
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

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
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

        .card-lift {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .card-lift:hover {
          transform: translateY(-8px) scale(1.01);
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

        .bounce-in {
          animation: bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <main className="relative min-h-screen overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="float-slow absolute left-8 top-20 h-48 w-48 rounded-full bg-[color:var(--primary-muted)] opacity-70 blur-3xl" />
          <div className="float-slow absolute right-0 top-28 h-52 w-52 rounded-full bg-[color:var(--accent)]/10 opacity-80 blur-3xl" style={{ animationDelay: "1.1s" }} />
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
                href="/about/san-pedro"
                className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--muted)]"
              >
                San Pedro
              </Link>
              <Link
                href="/about/the-team"
                className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--muted)]"
              >
                The Team
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="reveal max-w-3xl">
            <span className="mb-4 inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-sm font-medium text-[color:var(--primary)]">
              Reference concept
            </span>
            <h1 className="text-4xl font-black tracking-tight text-[color:var(--foreground)] sm:text-5xl">
              The Website.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[color:var(--text-secondary)]">
              A concept site meant to highlight local identity, make neighborhood discovery feel
              human, and simplify the way people explore hidden gems in their area.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {websitePoints.map((point, index) => {
              const animations = ["slide-left", "bounce-in", "scale-in", "bounce-in", "slide-right"];
              return (
              <article
                key={point.title}
                className={`card-lift ${animations[index]} rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="pulse-glow mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--primary-muted)] text-sm font-bold text-[color:var(--primary)]">
                  {point.number}
                </div>
                <h2 className="mb-3 text-lg font-semibold text-[color:var(--foreground)]">{point.title}</h2>
                <p className="text-sm leading-6 text-[color:var(--text-secondary)]">{point.text}</p>
              </article>
            );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
