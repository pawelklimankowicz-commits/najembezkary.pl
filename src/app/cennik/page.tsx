import Link from "next/link";

export default function CennikPage() {
  return (
    <main className="page-shell">
      <h1 className="page-title">Cennik pakietu dokumentów</h1>
      <p className="page-intro">
        Cena bazowa dla 1 lokalu to 99 zł. Dla większej liczby lokali naliczamy automatyczne rabaty.
      </p>

      <section className="landing-section">
        <div className="table-wrap">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Liczba lokali</th>
                <th>Cena całkowita</th>
                <th>Cena za lokal</th>
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
                <td>179,00 zł</td>
                <td>89,50 zł</td>
              </tr>
              <tr>
                <td>3 lokale</td>
                <td>249,00 zł</td>
                <td>83,00 zł</td>
              </tr>
              <tr>
                <td>4-5 lokali</td>
                <td>automatycznie wg liczby lokali</td>
                <td>79,00 zł</td>
              </tr>
              <tr>
                <td>6-10 lokali</td>
                <td>automatycznie wg liczby lokali</td>
                <td>69,00 zł</td>
              </tr>
              <tr>
                <td>11+ lokali</td>
                <td>wycena indywidualna</td>
                <td>od 59,00 zł</td>
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
