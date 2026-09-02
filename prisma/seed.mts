import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@/app/auth/lib/password";
import 'dotenv/config'; // Loads default .env
import { config } from 'dotenv';
import path from 'path';

// load local .env if not in production.
if (process.env.NODE_ENV !== "production") {
  config({ path: path.join(path.dirname(import.meta.dirname), '.env.development') });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  console.log("Cleaning existing database records...");
  await client.review.deleteMany();
  await client.bookmark.deleteMany();
  await client.appReview.deleteMany();
  await client.menuItem.deleteMany();
  await client.businessImage.deleteMany();
  await client.businessTag.deleteMany();
  await client.businessFood.deleteMany();
  await client.business.deleteMany();
  await client.foodImage.deleteMany();
  await client.foodTag.deleteMany();
  await client.food.deleteMany();
  await client.session.deleteMany();
  await client.user.deleteMany();

  console.log("Seeding users...");
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

  const maria = await client.user.create({
    data: {
      userName: "maria_santos",
      email: "maria@example.com",
      passwordHash: await hash("password123"),
    },
  });

  const chefMario = await client.user.create({
    data: {
      userName: "chef_mario",
      email: "mario@example.com",
      passwordHash: await hash("password123"),
      isAdmin: true,
    },
  });

  console.log("Seeding heritage foods...");
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
        create: [{ description: "A plate of chicken adobo with garlic rice" }],
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
      images: {
        create: [{ description: "Bowl of steaming hot pork sinigang soup" }],
      },
    },
  });

  const haloHalo = await client.food.create({
    data: {
      name: "Halo-Halo",
      description: "A popular Filipino cold dessert featuring crushed ice, evaporated milk, and various sweet ingredients.",
      history:
        "Evolution of the pre-war Japanese kakigori brought by early immigrants, adapted with local tropical fruits, sweet beans, and leche flan.",
      preparation: "Layer sweetened beans, fruits, and jellies in a tall glass, top with finely shaved ice, milk, ube ice cream, and leche flan.",
      recipe:
        "Shaved ice, evaporated milk, macapuno, sago, gulaman, sweet red beans, jackfruit, lech flan, ube ice cream.",
      culturalSignificance:
        "The ultimate Filipino summer dessert embodying vibrant colors and festive communal sharing.",
      isHeritage: true,
      tags: {
        create: [{ value: "dessert" }, { value: "sweet" }, { value: "cold" }, { value: "summer" }],
      },
      images: {
        create: [{ description: "Tall glass of colorful halo-halo with ube ice cream on top" }],
      },
    },
  });

  const pancitPalabok = await client.food.create({
    data: {
      name: "Pancit Palabok",
      description: "Rice noodles topped with golden shrimp sauce, crushed pork rinds, smoked fish flakes, and hard-boiled eggs.",
      history:
        "Inspired by Chinese noodle trading history, palabok evolved distinctly with rich local seafood gravies and indigenous toppings.",
      preparation: "Boil rice noodles, smother in thick savory shrimp broth, and garnish with finely minced chicharon, tinapa flakes, and shrimp.",
      recipe:
        "Rice noodles, shrimp broth, annatto powder, tinapa flakes, crushed chicharon, hard-boiled eggs, scallions.",
      culturalSignificance:
        "A centerpiece noodle dish traditionally served at birthdays, fiestas, and community gatherings.",
      isHeritage: true,
      tags: {
        create: [{ value: "noodles" }, { value: "seafood" }, { value: "fiesta" }],
      },
      images: {
        create: [{ description: "Platter of pancit palabok garnished with shrimp and eggs" }],
      },
    },
  });

  const lechon = await client.food.create({
    data: {
      name: "Lechon",
      description: "Whole roasted pig with ultra-crispy golden skin and tender, succulent meat.",
      history:
        "Rooted in Hispanic roasting traditions (lechón) introduced during Spanish rule, perfected locally with unique stuffings like lemongrass and star anise.",
      preparation: "Stuff a whole pig with aromatics, skewer on a bamboo pole, and roast slowly over glowing charcoal while basting skin.",
      recipe:
        "Whole pig, lemongrass, garlic, onions, bay leaves, salt, pepper, liver sauce.",
      culturalSignificance:
        "The undisputed star of Filipino fiestas, weddings, and grand celebrations.",
      isHeritage: true,
      tags: {
        create: [{ value: "roasted" }, { value: "pork" }, { value: "celebration" }, { value: "crispy" }],
      },
      images: {
        create: [{ description: "Crispy golden roasted lechon served with liver sauce" }],
      },
    },
  });

  console.log("Seeding businesses...");
  const business1 = await client.business.create({
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
            description: "Served with steamed garlic rice",
            price: 120.0,
            dietaryTags: ["contains-soy"],
          },
          {
            name: "Sinigang na Baboy",
            description: "Pork sinigang soup, good for sharing",
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

  const business2 = await client.business.create({
    data: {
      name: "Manila Heritage Cafe",
      description: "An authentic historic cafe in Intramuros offering classic colonial sweets and local heritage dishes.",
      history: "Located in a restored Spanish-era ancestral house overlooking historic cobblestone streets.",
      isPublished: true,
      createdById: chefMario.id,
      address: "45 General Luna St, Intramuros, Manila",
      latitude: 14.5896,
      longitude: 120.9750,
      hours: "Tue-Sun 10:00 AM - 9:00 PM",
      tags: {
        create: [{ value: "historic" }, { value: "cafe" }, { value: "desserts" }, { value: "ambiance" }],
      },
      images: {
        create: [{ description: "Cozy interior of Manila Heritage Cafe" }],
      },
      menuItems: {
        create: [
          {
            name: "Special Halo-Halo Supreme",
            description: "Loaded with homemade leche flan and ube ice cream",
            price: 160.0,
            dietaryTags: ["dairy"],
          },
          {
            name: "Pancit Palabok Special",
            description: "Rich shrimp gravy with fresh smoked fish flakes",
            price: 210.0,
            dietaryTags: ["seafood"],
          },
        ],
      },
      foods: {
        create: [{ foodId: haloHalo.id }, { foodId: pancitPalabok.id }],
      },
    },
  });

  const business3 = await client.business.create({
    data: {
      name: "Cebu Lechon Haus & Grill",
      description: "World-class crispy Cebu lechon roasted fresh daily with aromatic herbs and spices.",
      history: "Proudly bringing authentic island roasting traditions straight from the Queen City of the South.",
      isPublished: true,
      createdById: chefMario.id,
      address: "88 Mango Avenue, Cebu City",
      latitude: 10.3157,
      longitude: 123.8854,
      hours: "Daily 10:00 AM - 10:00 PM",
      tags: {
        create: [{ value: "lechon" }, { value: "grill" }, { value: "cebu" }, { value: "meat" }],
      },
      images: {
        create: [{ description: "Freshly carved crunchy lechon belly" }],
      },
      menuItems: {
        create: [
          {
            name: "Crispy Lechon Belly (per quarter kilo)",
            description: "Juicy pork belly with shatteringly crisp skin",
            price: 280.0,
            dietaryTags: ["pork"],
          },
        ],
      },
      foods: {
        create: [{ foodId: lechon.id }],
      },
    },
  });

  console.log("Seeding reviews and bookmarks...");
  await client.review.create({
    data: {
      userId: regularUser.id,
      businessId: business1.id,
      text: "Tastes just like my lola's cooking. Highly recommend the adobo!",
      foodQuality: 5,
      service: 4,
      ambiance: 3,
      value: 5,
    },
  });

  await client.review.create({
    data: {
      userId: maria.id,
      businessId: business2.id,
      text: "The halo-halo is out of this world! Perfect ambiance inside Intramuros.",
      foodQuality: 5,
      service: 5,
      ambiance: 5,
      value: 4,
    },
  });

  await client.bookmark.create({
    data: {
      userId: regularUser.id,
      businessId: business1.id,
    },
  });

  await client.bookmark.create({
    data: {
      userId: maria.id,
      businessId: business2.id,
    },
  });

  console.log("Seeding app reviews...");
  await client.appReview.create({
    data: {
      userId: regularUser.id,
      userName: "Juan Dela Cruz",
      email: "juan@example.com",
      rating: 5,
      text: "Ilaila is a fantastic digital museum! Loving the rich historical insights on Filipino food.",
      isApproved: true,
    },
  });

  await client.appReview.create({
    data: {
      userId: maria.id,
      userName: "Maria Santos",
      email: "maria@example.com",
      rating: 5,
      text: "Very user-friendly website. Great tool for finding heritage spots.",
      isApproved: true,
    },
  });

  console.log("Seed complete.");
  await client.$disconnect();
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