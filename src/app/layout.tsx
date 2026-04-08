import type { Metadata } from "next";

import { SiteNav } from "@/components/SiteNav";
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
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
