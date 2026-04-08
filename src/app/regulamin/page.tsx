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

  return (
    <main className="page-shell legal">
      <p className="legal-back-wrap">
        <Link href="/" className="legal-back-link">
          Powrót
        </Link>
      </p>
      <article>
        <h1 className="page-title">Regulamin serwisu internetowego najembezkary.pl</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{regulaminContent}</pre>
      </article>
    </main>
  );
}
