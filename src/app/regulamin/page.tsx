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
    .replace(/^##\s*\*\*(.*?)\*\*\s*$/gm, "$1");

  return (
    <main className="page-shell legal legal--regulamin">
      <p className="legal-back-wrap">
        <Link href="/" className="legal-back-link">
          Powrót
        </Link>
      </p>
      <article>
        <h1 className="page-title legal-regulamin-title">Regulamin serwisu internetowego najembezkary.pl</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{formattedRegulaminContent}</pre>
      </article>
    </main>
  );
}
