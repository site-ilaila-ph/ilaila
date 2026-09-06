import { redirect } from "next/navigation";
import { acquireCacheManager, acquirePrismaClient, acquireNextJSCookieMap } from "@/lib/infra";
import { ClientReadonlySession, SessionContext } from "@/lib/session/client";
import { createSessionReader } from "@/lib/session/server";

function sanitizeUser(user: any): ClientReadonlySession["user"] {
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
    isAdmin: user.isAdmin,
  };
}

export default async function SessionGatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = createSessionReader({
    db: acquirePrismaClient(),
    cache: acquireCacheManager(),
    cookieMap: await acquireNextJSCookieMap(),
  });
  const sessionId = await session.getSessionId();
  const user = sessionId ? await session.getSessionUser() : null;

  if (!sessionId || !user) redirect("/landing");

  return (
    <SessionContext value={{ id: sessionId, user: sanitizeUser(user) }}>
      {children}
    </SessionContext>
  );
}
