import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const metadata: Metadata = {
  title: "Regulamin — najembezkary.pl",
};

export default async function RegulaminPage() {
  const regulaminPath = path.join(process.cwd(), "regulamin_najembezkary.md");
  const regulaminContent = await readFile(regulaminPath, "utf8");
  const formattedRegulaminContent = regulaminContent
    .replace(/^# .*\n\n/, "")
    .replace(/^\*\*Ostatnia aktualizacja:.*\*\*\n\n?/m, "")
    .replace(/^---\n?/gm, "")
    .replace(/^##\s*\*\*(.*?)\*\*\s*$/gm, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "");
  const regulaminLines = formattedRegulaminContent.split("\n");

  return (
    <main className="page-shell legal legal--regulamin">
      <p className="legal-back-wrap">
        <Link href="/" className="legal-back-link">
          Powrót
        </Link>
      </p>
      <article>
        <h1 className="page-title legal-regulamin-title">Regulamin serwisu</h1>
        <div className="legal-content">
          {regulaminLines.map((line, idx) => {
            const key = `reg-${idx}`;
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
