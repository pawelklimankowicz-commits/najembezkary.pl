import Link from "next/link";

export default function CennikPage() {
  return (
    <main className="page-shell">
      <h1 className="page-title">Cennik</h1>
      <p className="page-intro">
        <strong>Cena bazowa to 99 złotych. Dla większej liczby lokali naliczamy automatyczne rabaty.</strong>
      </p>

      <section className="landing-section">
        <div className="table-wrap">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Liczba lokali</th>
                <th>Cena za lokal</th>
                <th>Cena całkowita</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1 lokal</td>
                <td>99,00 zł</td>
                <td>99,00 zł</td>
              </tr>
              <tr>
                <td>2 lokale</td>
                <td>89,50 zł</td>
                <td>179,00 zł</td>
              </tr>
              <tr>
                <td>3 lokale</td>
                <td>83,00 zł</td>
                <td>249,00 zł</td>
              </tr>
              <tr>
                <td>4-5 lokali</td>
                <td>79,00 zł</td>
                <td>automatycznie wg liczby lokali</td>
              </tr>
              <tr>
                <td>6-10 lokali</td>
                <td>69,00 zł</td>
                <td>automatycznie wg liczby lokali</td>
              </tr>
              <tr>
                <td>11+ lokali</td>
                <td>od 59,00 zł</td>
                <td>wycena indywidualna</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="landing-section">
        <p>
          Kalkulacja ceny jest wykonywana automatycznie w kroku płatności na podstawie liczby lokali
          podanej w ankiecie.
        </p>
        <p>
          <Link href="/quiz" className="btn-primary">
            Przejdź do ankiety
          </Link>
        </p>
      </section>
    </main>
  );
}
