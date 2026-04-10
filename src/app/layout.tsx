import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: "najembezkary.pl — rejestr najmu krótkoterminowego",
  description:
    "Dokumenty, checklista i pomoc przy rejestracji najmu krótkoterminowego.",
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
