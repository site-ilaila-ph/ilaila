import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

async function main() {
  if (!process.env.DIRECT_URL) {
    throw new Error("DIRECT_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
  const client = new PrismaClient({ adapter });
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // check if we already have admins
  const anyExistingAdmin = await client.userData.findFirst({ where: { role: 'admin' } });

  // add a temporary admin if no admin present yet.
  if (!anyExistingAdmin) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: "site-bootstrap-ilaila-ph@gmail.com",
      password: "00000000",
      email_confirm: true,
    });
    if (error) throw error;

    await client.userData.update({
      where: { id: data!.user.id },
      data: { role: 'admin' },
    });
  }

  console.log("Bootstrap complete.");
  await client.$disconnect();
}

main().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exitCode = 1;
});