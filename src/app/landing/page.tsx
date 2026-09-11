"use client";

import { useEffect } from "react";
import {
  LandingNav,
  LandingHero,
  LandingFeatures,
  LandingWhy,
  LandingCta,
} from "@/components/blocks/landing";

const revealSelector = ".landing-reveal";

export default function LandingPage() {
  useEffect(() => {
    const revealItems = document.querySelectorAll(revealSelector);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -72px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-(--primary-muted) text-foreground">
      <style>{`
        @keyframes landingFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .landing-reveal { opacity: 0; transform: translateY(28px); }
        .landing-reveal.is-visible {
          animation: landingFadeUp 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .landing-reveal:nth-child(2) {
          animation-delay: 100ms;
        }

        .landing-reveal:nth-child(3) {
          animation-delay: 200ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-reveal,
          .landing-reveal.is-visible {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <LandingNav />
      <LandingHero />
      <div className="px-4 py-2 w-screen">
        <LandingFeatures />
      </div>
      <LandingWhy />
      <LandingCta />
    </div>
  );
}
