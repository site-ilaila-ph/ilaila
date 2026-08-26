import { acquireDb } from "@/lib/live";
import { hash } from "@/app/auth/lib/password";
import 'dotenv/config'; // Loads default .env
import { config } from 'dotenv';
import path from 'path';

// load local .env if not in production.
if (process.env.NODE_ENV !== "production") {
  config({ path: path.join(path.dirname(import.meta.dirname), '.env.development') });
}

async function main() {
  const client = acquireDb();

  const admin = await client.user.create({
    data: {
      userName: "admin",
      email: "admin@example.com",
      passwordHash: await hash("00000000"),
      isAdmin: true,
    },
  });

  const regularUser = await client.user.create({
    data: {
      userName: "juan_dela_cruz",
      email: "juan@example.com",
      passwordHash: await hash("password123"),
    },
  });

  const adobo = await client.food.create({
    data: {
      name: "Adobo",
      description: "A savory Filipino dish braised in vinegar, soy sauce, and garlic.",
      history:
        "Adobo predates Spanish colonization, originally referring to the indigenous cooking method of stewing meat in vinegar for preservation.",
      preparation: "Simmer meat in vinegar, soy sauce, garlic, bay leaves, and peppercorns until tender.",
      recipe:
        "1kg pork or chicken, 1/2 cup soy sauce, 1/4 cup vinegar, 6 cloves garlic (crushed), 3 bay leaves, 1 tsp peppercorns, water as needed.",
      culturalSignificance:
        "Widely considered the unofficial national dish of the Philippines, adobo varies by region and household.",
      isHeritage: true,
      tags: {
        create: [{ value: "savory" }, { value: "vinegar-based" }, { value: "national-dish" }],
      },
      images: {
        create: [{ description: "A plate of chicken adobo with rice" }],
      },
    },
  });

  const sinigang = await client.food.create({
    data: {
      name: "Sinigang",
      description: "A sour Filipino soup typically made with tamarind broth.",
      history:
        "Sinigang's sour-soup tradition reflects pre-colonial Filipino cooking, using native souring agents like tamarind, guava, or kamias.",
      preparation: "Boil meat or seafood with vegetables in a tamarind-based broth until tender.",
      recipe:
        "1kg pork ribs or shrimp, 1 packet tamarind soup base, kangkong, radish, string beans, tomatoes, onions, fish sauce to taste.",
      culturalSignificance:
        "A comfort food closely tied to Filipino family meals, especially during rainy weather.",
      isHeritage: true,
      tags: {
        create: [{ value: "sour" }, { value: "soup" }, { value: "comfort-food" }],
      },
    },
  });

  const business = await client.business.create({
    data: {
      name: "Aling Nena's Kitchen",
      description: "A family-run carinderia serving home-style Filipino dishes since 1985.",
      history: "Started as a small roadside stall by Aling Nena, now run by her children.",
      isPublished: true,
      createdById: admin.id,
      address: "123 Rizal St, Calamba, Laguna",
      latitude: 14.2117,
      longitude: 121.1653,
      hours: "Mon-Sat 7:00 AM - 8:00 PM",
      tags: {
        create: [{ value: "carinderia" }, { value: "family-owned" }, { value: "budget-friendly" }],
      },
      images: {
        create: [{ description: "Storefront of Aling Nena's Kitchen" }],
      },
      menuItems: {
        create: [
          {
            name: "Chicken Adobo",
            description: "Served with steamed rice",
            price: 120.0,
            dietaryTags: ["contains-soy"],
          },
          {
            name: "Sinigang na Baboy",
            description: "Pork sinigang, good for sharing",
            price: 180.0,
            dietaryTags: [],
          },
        ],
      },
      foods: {
        create: [{ foodId: adobo.id }, { foodId: sinigang.id }],
      },
    },
  });

  await client.review.create({
    data: {
      userId: regularUser.id,
      businessId: business.id,
      text: "Tastes just like my lola's cooking. Highly recommend the adobo!",
      foodQuality: 5,
      service: 4,
      ambiance: 3,
      value: 5,
    },
  });

  await client.bookmark.create({
    data: {
      userId: regularUser.id,
      businessId: business.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // adjust/remove if acquireDb() doesn't expose $disconnect
    // await acquireDb().$disconnect();
  });