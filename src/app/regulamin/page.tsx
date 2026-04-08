import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin — najembezkary.pl",
};

export default function RegulaminPage() {
  return (
    <main className="page-shell legal">
      <h1 className="page-title">Regulamin świadczenia usług</h1>
      <p>
        Niniejszy regulamin ma charakter informacyjny i powinien zostać dostosowany do
        faktycznego modelu świadczenia usług (np. odpłatność, przetwarzanie danych,
        reklamacje). Treść poniżej stanowi szkic roboczy.
      </p>
      <h2>§1 Postanowienia ogólne</h2>
      <p>
        Serwis najembezkary.pl umożliwia przygotowanie zestawu dokumentów pomocniczych
        związanych z rejestrem najmu krótkoterminowego.
      </p>
      <h2>§2 Dokumenty</h2>
      <p>
        Wygenerowane pliki mają charakter pomocniczy i nie zastępują indywidualnej
        porady prawnej. Użytkownik odpowiada za poprawność i kompletność danych we
        wprowadzonym formularzu.
      </p>
      <h2>§3 Kontakt</h2>
      <p>
        W sprawach związanych z serwisem można skorzystać z danych kontaktowych
        podanych na stronie głównej.
      </p>
    </main>
  );
}
