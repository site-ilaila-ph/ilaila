import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Montserrat } from "next/font/google";
import "./styles/globals.css";
import cn from "@/lib/client/utilities/cn";
import { SessionContext } from "@/lib/client/session";
import { getSessionId, getSessionUser } from "@/app/authentication/services/session";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionId();
  const user = await getSessionUser();

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", manrope.variable, montserratHeading.variable)}
    >
      <body className="min-h-full w-full flex flex-col">
        <SessionContext value={sessionId && user ? { id: sessionId, user } : null}>
          {children}
        </SessionContext>
      </body>
    </html>
  );
}
