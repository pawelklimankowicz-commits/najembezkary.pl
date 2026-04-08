import type { Metadata } from "next";

import { DocumentWizard } from "@/components/DocumentWizard";

export const metadata: Metadata = {
  title: "Przygotuj dokumenty — najembezkary.pl",
  description:
    "Kreator: dane właściciela, obiekt, platformy, krótka ankieta — pobierz paczkę PDF.",
};

export default function PrzygotujPage() {
  return (
    <main className="page-shell">
      <h1 className="page-title">Przygotuj dokumenty do rejestru</h1>
      <p className="page-intro">
        Uzupełnij kroki poniżej. Na końcu pobierzesz paczkę z sześcioma plikami PDF
        dopasowanymi do Twoich danych.
      </p>
      <DocumentWizard />
    </main>
  );
}
