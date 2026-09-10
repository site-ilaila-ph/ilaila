import { PrismaClient, UserRole } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
  const prisma = new PrismaClient({ adapter });
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // create an admin, and non admin account.
  for (const role of (["admin", "viewer"] as UserRole[])) {
    // create an admin account.
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${role}@example.com`,
      password: "password123",
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    await prisma.userData.update({
      where: { id: data.user.id },
      data: { role },
    });
  }

  // create a non admin account.
  console.log("Cleaning existing database records...");
  await prisma.review.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.businessImage.deleteMany();
  await prisma.businessTag.deleteMany();
  await prisma.businessFood.deleteMany();
  await prisma.business.deleteMany();
  await prisma.foodImage.deleteMany();
  await prisma.foodTag.deleteMany();
  await prisma.food.deleteMany();
  await prisma.user.deleteMany();

  await console.log("Seed complete.");
  await prisma.$disconnect();
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
