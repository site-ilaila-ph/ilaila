import { redirect } from "next/navigation";
import { acquireCacheManager, acquireDb, acquireNextJSCookieMap } from "@/lib/infra";
import { createSessionReader } from "@/lib/session/server";

export default async function AdminOnlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = createSessionReader({
    db: acquireDb(),
    cache: acquireCacheManager(),
    cookieMap: await acquireNextJSCookieMap(),
  });
  const user = await session.getSessionUser();

  if (!user) redirect("/landing");
  if (!user.isAdmin) redirect("/home");

  return children;
}