/**
 * Generuje na Pulpicie paczkę ZIP z tymi samymi 6 PDF-ami co po opłacie.
 *
 *   npm run generate:sample-zip
 *
 * Plik: ~/Desktop/pakiet_najembezkary_przyklad.zip
 */
import fs from "fs";
import path from "path";

import {
  buildDocumentsZipBuffer,
  SAMPLE_DOCUMENTS_ORDER,
} from "../src/lib/build-documents-zip";

async function main() {
  const buf = await buildDocumentsZipBuffer(SAMPLE_DOCUMENTS_ORDER);
  const desktop = path.join(
    process.env.HOME ?? process.cwd(),
    "Desktop",
    "pakiet_najembezkary_przyklad.zip"
  );
  fs.writeFileSync(desktop, Buffer.from(buf));
  console.log(`Zapisano: ${desktop}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
