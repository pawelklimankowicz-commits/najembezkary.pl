import { DataForm } from "@/components/checkout/data-form";

export default function DanePage() {
  return (
    <main className="page-shell dane-shell">
      <h1 className="page-title">Krok 1 z 2 - Twoje dane</h1>
      <p className="page-intro">Uzupełnij dane właściciela i lokalu do dokumentów.</p>
      <DataForm />
    </main>
  );
}
