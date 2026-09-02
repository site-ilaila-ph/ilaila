import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Montserrat } from "next/font/google";
import "@/app/styles/globals.css";
import { cn } from "@/lib/client";
import { createSessionReader } from "@/lib/session/server";
import { ClientReadonlySession, SessionContext } from "@/lib/session/client";
import { acquireCacheManager, acquireDb, acquireNextJSCookieMap } from "@/lib/live";
import { User } from "@/generated/prisma/client";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const manrope = Manrope({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ilaila",
  description: "A website publishing restaurants and cafes in the upper villages of San Pedro City, Laguna",
};

function sanitizeUser(user: User): ClientReadonlySession['user'] {
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
    isAdmin: user.isAdmin
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = createSessionReader({ db: acquireDb(), cache: acquireCacheManager(), cookieMap: await acquireNextJSCookieMap() });
  const sessionId = await session.getSessionId();
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", manrope.variable, montserratHeading.variable)}
    >
      <body className="min-h-full w-full flex flex-col">
        <SessionContext value={sessionId ? { id: sessionId, user: sanitizeUser((await session.getSessionUser())!) } : null}>
          {children}
        </SessionContext>
      </body>
    </html>
  );
}
