import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const metadata: Metadata = {
  title: "Polityka prywatności — najembezkary.pl",
};

export default async function PolitykaPage() {
  const policyPath = path.join(process.cwd(), "polityka_prywatnosci_najembezkary.md");
  const policyContent = await readFile(policyPath, "utf8");

  return (
    <main className="page-shell legal">
      <article>
        <h1 className="page-title">Polityka prywatności serwisu najembezkary.pl</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{policyContent}</pre>
      </article>
    </main>
  );
}
