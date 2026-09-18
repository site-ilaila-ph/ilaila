import Image from "next/image";
import { Flower2, Landmark, PartyPopper } from "lucide-react";

export function SanPedroCulture() {
  return (
    <>
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
    </>
  );
}

