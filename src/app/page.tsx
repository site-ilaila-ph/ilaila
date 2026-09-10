import { acquireDb, acquireCacheManager, acquireNextJSCookieMap } from "@/lib/infra";
import { createSessionReader } from "@/lib/session/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
      const session = createSessionReader({
        db: acquireDb(),
        cache: acquireCacheManager(),
        cookieMap: await acquireNextJSCookieMap(),
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