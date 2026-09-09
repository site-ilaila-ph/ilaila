import { cookies } from "next/headers";
import { acquirePrismaClient, acquireCacheManager } from "@/lib/infra";
import { createSessionReader } from "@/lib/session/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
      const cookieStore = await cookies();
      const session = createSessionReader({
        db: acquirePrismaClient(),
        cache: acquireCacheManager(),
        cookieMap: cookieStore,
      });

      const sessionId = await session.getSessionId();
      const user = sessionId ? await session.getSessionUser() : null;

      if (!user) {
        redirect("/landing");
      }

      else if (user.isAdmin) {
        redirect("/management");
      }

      else {
        redirect("/home");
      }
}