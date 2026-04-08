import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const metadata: Metadata = {
  title: "Polityka prywatności — najembezkary.pl",
};

export default async function PolitykaPage() {
  const policyPath = path.join(process.cwd(), "polityka_prywatnosci_najembezkary.md");
  const policyContent = await readFile(policyPath, "utf8");
  const formattedPolicyContent = policyContent
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^---\n?/gm, "")
    .replace(/^Polityka prywatności serwisu najembezkary\.pl\s*\n?/m, "")
    .replace(/^Data wejścia w życie:.*\n?/m, "");
  const policyLines = formattedPolicyContent.split("\n");

  return (
    <main className="page-shell legal">
      <p className="legal-back-wrap">
        <Link href="/" className="legal-back-link">
          Powrót
        </Link>
      </p>
      <article>
        <h1 className="page-title">Polityka prywatności serwisu</h1>
        <div className="legal-content">
          {policyLines.map((line, idx) => {
            const key = `pol-${idx}`;
            const isParagraphHeading = /^§\s*\d+/.test(line.trim());

            if (!line.trim()) {
              return <div key={key} className="legal-line-gap" aria-hidden="true" />;
            }

            if (isParagraphHeading) {
              return (
                <div key={key}>
                  <p className="legal-paragraph-heading">{line}</p>
                  <div className="legal-paragraph-gap" aria-hidden="true" />
                </div>
              );
            }

            return <p className="legal-line">{line}</p>;
          })}
        </div>
      </article>
    </main>
  );
}
