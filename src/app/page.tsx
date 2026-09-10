import { acquirePrismaClient } from "@/lib/infra";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();

      if (!data.user) redirect("/landing");
      
      const userData = await acquirePrismaClient().userData.findFirstOrThrow({
            where: { id: data.user.id }
      });

      if (userData.role == "admin") redirect("/management");
      else redirect("/home");
}