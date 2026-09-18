'use client';

import { AboutShell } from "@/presentation/about-shell";
import { WebsitePoints } from "@/presentation/website-points";

const websitePoints = [
  {
    number: "01",
    title: "Tuklasin",
    text: "Hanapin ang mga lugar, pagkain, palatandaan, at mga nakatagong sulok sa paligid ng San Pedro.",
  },
  {
    number: "02",
    title: "Matuto",
    text: "Unawain ang kasaysayan, kultura, at mga kuwento sa likod ng lungsod.",
  },
  {
    number: "03",
    title: "Gala",
    text: "Tingnan ang mga pamayanan at alamin kung ano ang inaalok ng bawat bahagi ng San Pedro.",
  },
  {
    number: "04",
    title: "Suportahan ang Lokal",
    text: "Tulungan ang mga tao na matuklasan ang mga lokal na negosyo, restawran, tagalikha, at kaganapan.",
  },
  {
    number: "05",
    title: "Makipag-ugnayan",
    text: "Bigyan ang mga residente ng paraan upang magbahagi ng mga karanasan, mungkahi, at kuwento.",
  },
];

export default function TheWebsitePage() {
  return (
    <AboutShell current="the-website">
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="reveal max-w-3xl">
          <span className="mb-4 inline-flex rounded-full bg-(--primary-muted) px-3 py-1 text-sm font-medium text-primary">
            Sangguniang konsepto
          </span>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Ang Website.
          </h1>
          <p className="mt-6 text-lg leading-8 text-(--text-secondary)">
            Isang konseptong website na naglalayong ipakita ang lokal na pagkakakilanlan, gawing
            makatao ang pagtuklas sa mga pamayanan, at gawing simple ang paggalugad ng mga nakatagong
            yaman sa iyong lugar.
          </p>
        </div>

        <WebsitePoints points={websitePoints} />
      </section>
    </AboutShell>
  );
}
