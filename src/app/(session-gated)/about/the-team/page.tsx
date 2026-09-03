'use client';

import Link from "next/link";
import teamConfig from "@/config/team";

export default function TheTeamPage() {
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
            box-shadow: 0 0 0 rgba(16, 185, 129, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.18);
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

        @keyframes fadeInRotate {
          0% {
            opacity: 0;
            transform: rotate(-5deg) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: rotate(0) scale(1);
          }
        }

        .reveal {
          animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .float-slow {
          animation: float 8s ease-in-out infinite;
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

        .fade-rotate {
          animation: fadeInRotate 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="float-slow absolute -left-5 top-20 h-48 w-48 rounded-full bg-secondary opacity-70 blur-3xl" />
          <div className="float-slow absolute right-0 top-32 h-52 w-52 rounded-full bg-accent/10 opacity-80 blur-3xl" style={{ animationDelay: "1.2s" }} />
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
                href="/about/san-pedro"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                San Pedro
              </Link>
              <Link
                href="/about/the-website"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                The Website
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="reveal max-w-3xl">
            <span className="mb-4 inline-flex rounded-full bg-(--primary-muted) px-3 py-1 text-sm font-medium text-primary">
              Reference concept
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              The people behind the story.
            </h1>
            <p className="mt-6 text-lg leading-8 text-(--text-secondary)">
              This page is a reference layout for introducing the people shaping the brand, the
              local stories, and the experience behind the product.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {/* Frontend Team */}
            <div>
              <div className="mb-8 reveal slide-left">
                <h2 className="text-2xl font-bold text-foreground">Frontend Team</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {teamConfig.frontend.features.join(" • ")}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {teamConfig.frontend.members.map((member, index) => (
                  <div
                    key={member.name}
                    className="card-lift scale-in rounded-[1.5rem] border border-border bg-(--surface) p-6"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    {member.github && (
                      <p className="mt-2 text-sm text-primary">@{member.github}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Team */}
            <div>
              <div className="mb-8 reveal slide-right">
                <h2 className="text-2xl font-bold text-foreground">Backend Team</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {teamConfig.backend.features.join(" • ")}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {teamConfig.backend.members.map((member, index) => (
                  <div
                    key={member.name}
                    className="card-lift fade-rotate rounded-[1.5rem] border border-border bg-(--surface) p-6"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    {member.github && (
                      <p className="mt-2 text-sm text-primary">@{member.github}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
