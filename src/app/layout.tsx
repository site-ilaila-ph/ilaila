import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Montserrat } from "next/font/google";
import "@/app/styles/globals.css";
import { cn } from "@/lib/client";
import { createSessionReader } from "@/lib/session/server";
import { ClientReadonlySession, SessionContext } from "@/lib/session/client";
<<<<<<< HEAD
import { acquireCacheManager, acquireDb, acquireNextJSCookieMap } from "@/lib/infra";
import type { User } from "@/generated/prisma/client";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const manrope = Manrope({subsets:['latin'],variable:'--font-sans'});
=======
import {
  acquireCacheManager,
  acquireDb,
  acquireNextJSCookieMap,
} from "@/lib/live";
import { User } from "@/generated/prisma/client";

const montserratHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8

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
<<<<<<< HEAD
  description: "Isang website para sa mga restawran at cafe sa mga pamayanan ng San Pedro City, Laguna",
};

function sanitizeUser(user: User): ClientReadonlySession['user'] {
=======
  description:
    "A website publishing restaurants and cafes in the upper villages of San Pedro City, Laguna",
};

function sanitizeUser(user: User): ClientReadonlySession["user"] {
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
<<<<<<< HEAD
    isAdmin: user.isAdmin
  }
=======
    isAdmin: user.isAdmin,
  };
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
<<<<<<< HEAD
  const session = createSessionReader({ db: acquireDb(), cache: acquireCacheManager(), cookieMap: await acquireNextJSCookieMap() });
  const sessionId = await session.getSessionId();
  const sessionUser = sessionId ? await session.getSessionUser() : null;
  const clientSession = sessionId && sessionUser
    ? { id: sessionId, user: sanitizeUser(sessionUser) }
    : null;
  return (
    <html
      lang="tl"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", manrope.variable, montserratHeading.variable)}
    >
      <body className="min-h-full w-full flex flex-col">
        <SessionContext value={clientSession}>
=======
  const session = createSessionReader({
    db: acquireDb(),
    cache: acquireCacheManager(),
    cookieMap: await acquireNextJSCookieMap(),
  });
  const sessionId = await session.getSessionId();
  return (
    <html
      lang="fil"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        manrope.variable,
        montserratHeading.variable,
      )}
    >
      <body className="min-h-full w-full flex flex-col">
        <SessionContext
          value={
            sessionId
              ? {
                  id: sessionId,
                  user: sanitizeUser((await session.getSessionUser())!),
                }
              : null
          }
        >
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
          {children}
        </SessionContext>
      </body>
    </html>
  );
}
