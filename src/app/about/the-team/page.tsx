'use client';

import teamConfig from "@/config/attribution";
import { AboutShell } from "@/components/about-shell";
import { TeamSection } from "@/components/team-member-card";

export default function TheTeamPage() {
  return (
    <AboutShell current="the-team">
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="reveal max-w-3xl">
          <span className="mb-4 inline-flex rounded-full bg-(--primary-muted) px-3 py-1 text-sm font-medium text-primary">
            Sangguniang konsepto
          </span>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Ang mga taong nasa likod ng kuwento.
          </h1>
          <p className="mt-6 text-lg leading-8 text-(--text-secondary)">
            Ang pahinang ito ay isang sangguniang disenyo para sa pagpapakilala sa mga taong humuhubog sa
            brand, sa mga lokal na kuwento, at sa karanasan sa likod ng produkto.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          <TeamSection
            title="Koponan ng Frontend"
            features={teamConfig.frontend.features}
            members={teamConfig.frontend.members}
            slideDirection="left"
            cardAnimationClass="scale-in"
          />

          <TeamSection
            title="Koponan ng Backend"
            features={teamConfig.backend.features}
            members={teamConfig.backend.members}
            slideDirection="right"
            cardAnimationClass="fade-rotate"
          />
        </div>
      </section>
    </AboutShell>
  );
}
