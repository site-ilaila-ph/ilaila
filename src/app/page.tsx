import { acquirePrismaClient } from "@/lib/infra";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/landing");
  }

  // safe here. trigger guarantees co-existence.
  const userData = await acquirePrismaClient().userData.findFirstOrThrow({
    select: { id: true, role: true },
    where: { authId: user.id },
  });

  if (userData.role == "admin") {
    redirect("/management");
  } else {
    redirect("/home");
  }
}
