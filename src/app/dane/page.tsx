import { DataForm } from "@/components/checkout/data-form";

export default function DanePage() {
  return (
    <main className="page-shell dane-shell">
      <h1 className="page-title">Krok 2 z 3 - Twoje dane</h1>
      <p className="page-intro">Uzupelnij dane wlasciciela i lokalu do dokumentow.</p>
      <DataForm />
    </main>
  );
}
