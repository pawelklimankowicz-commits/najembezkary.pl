import Link from "next/link";

type ConsentState = {
  termsAccepted: boolean;
  digitalContentConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
};

export default function OrderFormConsents({
  onChange,
}: {
  onChange: (consents: ConsentState) => void;
}) {
  function update<K extends keyof ConsentState>(key: K, value: boolean) {
    onChange((prev) => ({ ...prev, [key]: value } as ConsentState));
  }

  return (
    <div className="legal-consents">
      <div className="legal-consents-info">
        <strong>Klauzula informacyjna RODO</strong>
        <p>
          Administratorem Pani/Pana danych osobowych jest właściciel serwisu najembezkary.pl
          (kontakt:{" "}
          <a href="mailto:kontakt@najembezkary.pl" className="underline">
            kontakt@najembezkary.pl
          </a>
          ). Dane podane w formularzu będą przetwarzane w celu realizacji zamówienia i
          dostarczenia Pakietu dokumentów (art. 6 ust. 1 lit. b RODO), wypełnienia obowiązków
          prawnych (art. 6 ust. 1 lit. c RODO) oraz w celach wynikających z prawnie
          uzasadnionych interesów Administratora (art. 6 ust. 1 lit. f RODO). Szczegółowe
          informacje zawarte są w{" "}
          <Link href="/polityka-prywatnosci" className="underline">
            Polityce prywatności
          </Link>
          .
        </p>
      </div>
      <label className="consent-row">
        <input
          type="checkbox"
          onChange={(e) => update("termsAccepted", e.target.checked)}
        />
        <span>
          Zapoznałem/am się z{" "}
          <Link href="/regulamin" className="underline">
            Regulaminem serwisu najembezkary.pl
          </Link>{" "}
          oraz{" "}
          <Link href="/polityka-prywatnosci" className="underline">
            Polityką prywatności
          </Link>{" "}
          i akceptuję ich treść. Wyrażam zgodę na przetwarzanie moich danych osobowych w
          celu realizacji zamówienia, na zasadach opisanych w §4 Polityki prywatności
          (art. 6 ust. 1 lit. b RODO). <span className="required">*</span>
        </span>
      </label>
      <label className="consent-row">
        <input
          type="checkbox"
          onChange={(e) => update("digitalContentConsent", e.target.checked)}
        />
        <span>
          Wyrażam wyraźną zgodę na natychmiastowe przystąpienie do realizacji umowy o
          dostarczenie treści cyfrowych przed upływem 14-dniowego terminu do odstąpienia od
          umowy. Przyjmuję do wiadomości, że z chwilą udostępnienia mi Pakietu do pobrania{" "}
          <strong>utracę prawo do odstąpienia od umowy</strong>, zgodnie z art. 38 pkt 13
          ustawy o prawach konsumenta. <span className="required">*</span>
        </span>
      </label>
      <label className="consent-row">
        <input
          type="checkbox"
          onChange={(e) => update("analyticsConsent", e.target.checked)}
        />
        <span>
          Wyrażam zgodę na stosowanie przez serwis najembezkary.pl plików cookies
          analitycznych i marketingowych (szczegóły w §10 Polityki prywatności). Zgodę mogę
          wycofać w każdym czasie. <span className="optional">(opcjonalne)</span>
        </span>
      </label>
      <label className="consent-row">
        <input
          type="checkbox"
          onChange={(e) => update("marketingConsent", e.target.checked)}
        />
        <span>
          Wyrażam zgodę na przesyłanie mi przez Administratora informacji handlowych drogą
          elektroniczną (newsletter, aktualizacje dotyczące przepisów o najmie
          krótkoterminowym). Zgodę mogę wycofać w każdym czasie.
          <span className="optional">(opcjonalne)</span>
        </span>
      </label>
    </div>
  );
}

