import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@/app/(unauthenticated-only)/auth/lib/password";

async function main() {
  if (!process.env.DIRECT_URL) {
    throw new Error("DIRECT_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
  const client = new PrismaClient({ adapter });

  // check if we already have admins
  const anyExistingAdmin = await client.user.findFirst({ where: { isAdmin: true } });

  // add a temporary admin if no admin present yet.
  if (!anyExistingAdmin) {
    await client.user.create({
      data: {
        userName: "Bootstrap site admin",
        email: "site-bootstrap-ilaila-ph@gmail.com",
        passwordHash: await hash("00000000"),
        isAdmin: true,
      },
    });
  }

  console.log("Bootstrap complete.");
  await client.$disconnect();
}

main().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exitCode = 1;
});