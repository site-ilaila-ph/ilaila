// app/foods/[foodName]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  history: string;
  preparation: string;
  recipe: string;
  culturalSignificance: string;
  isHeritage: boolean;
  businesses?: { id: string; name: string }[];
  images?: { id: string; url: string; altText?: string }[];
  tags?: { id: string; name: string }[];
}

const MOCK_FOODS: Record<string, FoodItem> = {
  "adobong-baboy-at-manok": {
    id: "food-1",
    name: "Adobong Baboy at Manok",
    description: "Tender pork belly and chicken braised in cane vinegar, soy sauce, garlic, and black peppercorns.",
    history: "An indigenous Filipino cooking process using vinegar and salt to preserve meat in tropical climates prior to refrigeration.",
    preparation: "Marinate meat in soy sauce and crushed garlic. Sear in a skillet, then simmer with cane vinegar, bay leaves, and peppercorns until tender.",
    recipe: "Pork belly, chicken quarters, cane vinegar, soy sauce, garlic, bay leaves, whole black peppercorns.",
    culturalSignificance: "Widely regarded as the unofficial national dish, symbolizing Filipino culinary adaptability and preservation methods.",
    isHeritage: true,
    businesses: [
      { id: "b1", name: "Aling Nena's Carinderia" },
      { id: "b2", name: "Manila Heritage Restaurant" },
    ],
    tags: [
      { id: "t1", name: "Savory" },
      { id: "t2", name: "Stew" },
      { id: "t3", name: "Heritage" },
    ],
  },
  "sinigang-sa-sampalok": {
    id: "food-2",
    name: "Sinigang sa Sampalok",
    description: "A comforting sour soup made with pork ribs, tamarind broth, and fresh regional garden vegetable s.",
    history: "Traditional sour stew adapted across various islands utilizing native souring agents like tamarind, batuan, and kamias.",
    preparation: "Boil pork until tender, create the sour broth using fresh tamarind pulp, and add vegetables based on cooking time.",
    recipe: "Pork ribs, tamarind broth base, radish, kangkong, string beans, eggplant, tomatoes, green chili.",
    culturalSignificance: "Represents the fundamental Filipino flavor preference for appetite-stimulating sour broths in warm weather.",
    isHeritage: true,
    businesses: [{ id: "b3", name: "Kainan sa Bario" }],
    tags: [
      { id: "t4", name: "Soup" },
      { id: "t5", name: "Sour" },
      { id: "t3", name: "Heritage" },
    ],
  },
  "sisig-kapampangan": {
    id: "food-3",
    name: "Sisig Kapampangan",
    description: "Crispy diced pork face and chicken liver seasoned with calamansi, onions, and chili peppers.",
    history: "Created in Angeles City, Pampanga, evolving from a sour salad into the iconic sizzling dish enjoyed across the country.",
    preparation: "Boil pork face, grill over charcoal to crisp, finely dice, and mix with onions, chili, calamansi, and seasoning.",
    recipe: "Pork face/jowl, chicken liver, calamansi, red onions, chili peppers, salt, pepper.",
    culturalSignificance: "Culinary pride of Pampanga and a centerpiece of Filipino social gatherings and street food culture.",
    isHeritage: true,
    businesses: [{ id: "b4", name: "Lucing's Sisig House" }],
    tags: [
      { id: "t6", name: "Sizzling" },
      { id: "t7", name: "Spicy" },
      { id: "t3", name: "Heritage" },
    ],
  },
  "special-halo-halo": {
    id: "food-4",
    name: "Special Halo-Halo",
    description: "Layered shaved ice dessert with sweetened beans, native jellies, leche flan, and ube halaya.",
    history: "Evolved from the pre-war Japanese 'kakigori' brought to the islands and localized by Filipinos.",
    preparation: "Layer preserved fruits and sweet beans at the bottom, pack finely shaved ice on top, pour evaporated milk, and crown with leche flan and ube.",
    recipe: "Shaved ice, evaporated milk, sweetened mongo beans, nata de coco, sago, ube halaya, leche flan.",
    culturalSignificance: "The ultimate tropical summer treat symbolizing rich Filipino flavor layering and communal enjoyment.",
    isHeritage: false,
    businesses: [{ id: "b5", name: "Razon's halo-halo" }],
    tags: [
      { id: "t8", name: "Dessert" },
      { id: "t9", name: "Cold" },
    ],
  },
};

export default function SingleFoodWikiPage({
  params,
}: {
  params: Promise<{ foodName: string }>;
}) {
  const resolvedParams = use(params);
  const currentSlug = resolvedParams.foodName;

  const food = MOCK_FOODS[currentSlug] || MOCK_FOODS["adobong-baboy-at-manok"];

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Ilaila Header (Clean Version) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:bg-teal-700 transition-colors">
              I
            </div>
            <span className="font-medium text-slate-900 text-lg tracking-tight">
              Ilaila
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <article className="mx-auto max-w-3xl px-6 py-12">
        {/* Category Pill */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200/60 shadow-xs">
            {food.isHeritage ? "Heritage Food Item" : "Featured Food Item"}
          </span>
        </div>

        {/* Dish Title & Description */}
        <header className="text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            {food.name}
          </h1>

          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            {food.description}
          </p>
        </header>

        {/* Content Cards */}
        <div className="space-y-6">
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm transition-shadow">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              History & Origins
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              {food.history}
            </p>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm transition-shadow">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Cultural Significance
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              {food.culturalSignificance}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Recipe Ingredients
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {food.recipe}
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Preparation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {food.preparation}
              </p>
            </section>
          </div>

          {food.businesses && food.businesses.length > 0 && (
            <section className="bg-slate-100/60 p-6 rounded-2xl border border-slate-200/60">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Where to find this in Ilaila
              </h2>
              <div className="flex flex-wrap gap-2">
                {food.businesses.map((biz) => (
                  <span
                    key={biz.id}
                    className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-xs font-medium text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    <span className="text-teal-600">📍</span> {biz.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer info & tags */}
        <footer className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <span>
            Database Record: <code className="text-slate-600">{food.id}</code>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {food.tags?.map((tag) => (
              <span
                key={tag.id}
                className="bg-slate-200/50 text-slate-600 px-2.5 py-1 rounded-full text-[11px] font-medium"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </footer>
      </article>
    </main>
  );
}