import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

type Row = {
  WOJ: string;
  POW: string;
  GMI: string;
  RODZ: string;
  NAZWA: string;
  NAZDOD: string;
};

function reqEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Brakuje zmiennej ${name}`);
  return value;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/[źż]/g, "z")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function mapVoivodeship(code: string): string {
  const map: Record<string, string> = {
    "02": "dolnoslaskie",
    "04": "kujawsko-pomorskie",
    "06": "lubelskie",
    "08": "lubuskie",
    "10": "lodzkie",
    "12": "malopolskie",
    "14": "mazowieckie",
    "16": "opolskie",
    "18": "podkarpackie",
    "20": "podlaskie",
    "22": "pomorskie",
    "24": "slaskie",
    "26": "swietokrzyskie",
    "28": "warminsko-mazurskie",
    "30": "wielkopolskie",
    "32": "zachodniopomorskie",
  };
  return map[code] ?? "";
}

function mapType(rodz: string, nazwdod: string): string {
  if (nazwdod.toLowerCase().includes("na prawach powiatu")) {
    return "miasto_na_prawach_powiatu";
  }
  if (rodz === "1") return "miejska";
  if (rodz === "2") return "wiejska";
  return "miejsko-wiejska";
}

function getOfficeName(name: string, type: string): string {
  const bigCities = new Set([
    "Warszawa",
    "Krakow",
    "Lodz",
    "Wroclaw",
    "Poznan",
    "Gdansk",
    "Szczecin",
    "Bydgoszcz",
    "Lublin",
    "Bialystok",
  ]);
  if (type === "miasto_na_prawach_powiatu" || bigCities.has(name)) {
    return `Urzad Miasta ${name}`;
  }
  if (type === "miejska" || type === "miejsko-wiejska") {
    return `Urzad Miejski w ${name}`;
  }
  return `Urzad Gminy ${name}`;
}

async function run() {
  const csvPath =
    process.argv[2] ?? path.join(process.cwd(), "data", "TERC.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Brak pliku CSV: ${csvPath}`);
  }

  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parse(csv, {
    columns: true,
    delimiter: ";",
    bom: true,
    skip_empty_lines: true,
  }) as Row[];

  const url = reqEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = reqEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const municipalities = rows
    .filter((r) => ["1", "2", "3"].includes(r.RODZ))
    .map((r) => {
      const type = mapType(r.RODZ, r.NAZDOD ?? "");
      const slug = slugify(r.NAZWA);
      return {
        teryt_code: `${r.WOJ}${r.POW}${r.GMI}${r.RODZ}`,
        name: r.NAZWA,
        full_name: `${r.NAZDOD} ${r.NAZWA}`.trim(),
        type,
        county: r.POW,
        voivodeship: mapVoivodeship(r.WOJ),
        office_name: getOfficeName(r.NAZWA, type),
        office_bip_url: `https://bip.${slug}.pl`,
        accepts_epuap: true,
        accepts_mail: true,
        accepts_in_person: true,
      };
    });

  for (let i = 0; i < municipalities.length; i += 100) {
    const batch = municipalities.slice(i, i + 100);
    const { error } = await supabase
      .from("municipalities")
      .upsert(batch, { onConflict: "teryt_code" });
    if (error) throw new Error(`Batch ${i} failed: ${error.message}`);
    console.log(`Batch ${i}-${i + batch.length} OK`);
  }

  console.log(`Seeded ${municipalities.length} municipalities`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
