import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: "Najembezkary.pl – Generator Dokumentów | Rejestracja Najmu Krótkoterminowego",
  description:
    "Wynajmujesz krótkoterminowo przez Airbnb lub Booking.com? Sprawdź obowiązek rejestracji i pobierz komplet dokumentów online w 3 minuty. Jednorazowa opłata 99 zł. Uniknij kary do 50 000 zł.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Najembezkary.pl – Rejestracja Najmu Krótkoterminowego",
    description:
      "Sprawdź obowiązek rejestracji i pobierz komplet dokumentów do urzędu w 3 minuty. Jednorazowo 99 zł. Uniknij kary do 50 000 zł.",
    url: SITE_URL,
    siteName: "najembezkary.pl",
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Najembezkary.pl – Rejestracja Najmu Krótkoterminowego",
    description:
      "Sprawdź obowiązek rejestracji i pobierz komplet dokumentów do urzędu w 3 minuty. Jednorazowo 99 zł.",
  },
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
