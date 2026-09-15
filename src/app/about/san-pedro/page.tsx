'use client';

import Image from "next/image";
import { useEffect } from "react";
import { AboutShell } from "@/components/about-shell";
import { SanPedroStats } from "@/components/san-pedro-stats";
import { SanPedroMilestones } from "@/components/san-pedro-milestones";
import { SanPedroCulture } from "@/components/san-pedro-culture";
import { SanPedroBarangays } from "@/components/san-pedro-barangays";

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
    <AboutShell current="san-pedro">
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

      <SanPedroStats stats={stats} />
      <SanPedroMilestones milestones={milestones} />
      <SanPedroCulture />
      <SanPedroBarangays barangays={barangays} />
    </AboutShell>
  );
}
