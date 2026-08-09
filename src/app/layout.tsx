import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Montserrat } from "next/font/google";
import "./styles/globals.css";
import cn from "@/lib/client/utilities/cn";
import { SessionContext } from "@/lib/client/session";
import { getSessionId, getSessionUser } from "@/lib/server/session";

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
  description: "A modern Next.js port of the Ilaila Laravel experience",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionId();
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", manrope.variable, montserratHeading.variable)}
    >
      <body className="min-h-full w-full flex flex-col">
        <SessionContext value={sessionId ? { id: sessionId, user: (await getSessionUser())! } : null}>
          {children}
        </SessionContext>
      </body>
    </html>
  );
}
